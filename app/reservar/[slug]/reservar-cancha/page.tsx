'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';

export default function ReservarCancha() {
  const { slug } = useParams();

  const [cliente, setCliente] = useState<any>(null);
  const [canchas, setCanchas] = useState([]);
  const [horas, setHoras] = useState<string[]>([]);
  const [horasOcupadas, setHorasOcupadas] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [diasBloqueados, setDiasBloqueados] = useState<string[]>([]);

  const [nombre, setNombre] = useState('');
  const [errorNombre, setErrorNombre] = useState('');
  
  const [correo, setCorreo] = useState('');
  const [errorCorreo, setErrorCorreo] = useState('');
  
  const [identificacion, setIdentificacion] = useState('');
  const [errorIdentificacion, setErrorIdentificacion] = useState('');
  const [errorIdentificacionDuplicada, setErrorIdentificacionDuplicada] = useState('');
  
  const [telefono, setTelefono] = useState('');
  const [errorTelefono, setErrorTelefono] = useState('');

  const [fecha, setFecha] = useState<string>('');
  const [errorFecha, setErrorFecha] = useState('');
  const [hoy, setHoy] = useState<string>('');

  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [canchaSeleccionada, setCanchaSeleccionada] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);
  const mensajeRef = useRef(null);

  const [mostrarToast, setMostrarToast] = useState(false);
  const [textoToast, setTextoToast] = useState('');
  
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [datosReserva, setDatosReserva] = useState<any>(null);

  const [usuarioInteractuo, setUsuarioInteractuo] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);
  const [porcentajeComision, setPorcentajeComision] = useState<number>(15);
  const [precioHora, setPrecioHora] = useState<number>(0);
  const [montoAnticipo, setMontoAnticipo] = useState<number>(0);
  const [montoPendiente, setMontoPendiente] = useState<number>(0);


  const lanzarToast = (mensaje: string) => {
    setTextoToast(mensaje);
    setMostrarToast(true);
    setTimeout(() => setMostrarToast(false), 2500);
  };

  const marcarInteraccion = () => {
    if (!usuarioInteractuo) {
      setUsuarioInteractuo(true);
    }
  };

  // Configurar fecha mínima solo en el cliente
  useEffect(() => {
    setHoy(new Date().toISOString().split('T')[0]);
  }, []);

  // Función para validar identificación duplicada
  const validarIdentificacionDuplicada = async (identificacionValue: string) => {
    if (!identificacionValue.trim() || identificacionValue.length < 6) {
      setErrorIdentificacionDuplicada('');
      return;
    }

    try {
      const fechaHoy = new Date().toISOString().split('T')[0];
      
      const { data: reservasPendientes, error: errorPendiente } = await supabase
        .from('reservas_cancha')
        .select('id, fecha, hora')
        .eq('identificacion', identificacionValue)
        .eq('id_cliente', cliente.id_cliente)
        .gte('fecha', fechaHoy);

      if (errorPendiente) {
        console.error('Error validando reservas:', errorPendiente);
        setErrorIdentificacionDuplicada('');
        return;
      }

      if (reservasPendientes && reservasPendientes.length > 0) {
        const reserva = reservasPendientes[0];
        setErrorIdentificacionDuplicada(`❌ Ya existe una reserva con esta identificación para el ${reserva.fecha} a las ${reserva.hora}`);
      } else {
        setErrorIdentificacionDuplicada('');
      }
    } catch (err) {
      console.error('Error en validación de identificación:', err);
      setErrorIdentificacionDuplicada('');
    }
  };

  useEffect(() => {
    if (mensajeRef.current) {
      (mensajeRef.current as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [mensaje]);

  useEffect(() => {
    const obtenerCliente = async () => {
      if (!slug) return;

      console.log('🔍 Cargando cliente con slug:', slug);

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        console.error('❌ Error cargando cliente:', error);
        setCliente(null);
      } else {
        console.log('✅ Cliente cargado:', data);
        setCliente(data);
      }

      setCargando(false);
    };

    obtenerCliente();
  }, [slug]);

  useEffect(() => {
    const obtenerCanchas = async () => {
      if (!cliente?.id_cliente) return;

      console.log('🏟️ Cargando canchas para cliente:', cliente.id_cliente);

      const { data } = await supabase
        .from('canchas')
        .select('*')
        .eq('id_cliente', cliente.id_cliente)
        .eq('activo', true);

      console.log('✅ Canchas cargadas:', data);
      setCanchas(data || []);
    };

    obtenerCanchas();
  }, [cliente]);

  // Cargar porcentaje de comisión del dueño
  useEffect(() => {
    const cargarPorcentajeComision = async () => {
      if (!cliente?.id_cliente) return;

      const { data, error } = await supabase
        .from('datos_pago_clientes')
        .select('porcentaje_comision')
        .eq('id_cliente', cliente.id_cliente)
        .single();

      if (!error && data) {
        console.log('💰 Porcentaje de comisión cargado:', data.porcentaje_comision);
        setPorcentajeComision(data.porcentaje_comision);
      } else {
        console.log('⚠️ No se encontró porcentaje, usando default 15%');
        setPorcentajeComision(15);
      }
    };

    cargarPorcentajeComision();
  }, [cliente]);

  // Calcular anticipo y monto pendiente cuando cambie la cancha
  useEffect(() => {
    if (!canchaSeleccionada) {
      setPrecioHora(0);
      setMontoAnticipo(0);
      setMontoPendiente(0);
      return;
    }

    const canchaData = canchas.find((c: any) => c.id_cancha === canchaSeleccionada);
    if (canchaData && canchaData.precio_hora) {
      const precio = Number(canchaData.precio_hora);
      const anticipo = (precio * porcentajeComision) / 100;
      const pendiente = precio - anticipo;

      console.log('💵 Cálculos:', {
        precio_hora: precio,
        porcentaje: porcentajeComision,
        anticipo,
        pendiente
      });

      setPrecioHora(precio);
      setMontoAnticipo(anticipo);
      setMontoPendiente(pendiente);
    }
  }, [canchaSeleccionada, canchas, porcentajeComision]);

  // Cargar días bloqueados específicos
  useEffect(() => {
    if (!cliente?.id_cliente) return;
    (async () => {
      try {
        console.log('🚫 Consultando días bloqueados...');
        const { data, error } = await supabase
          .from('dias_bloqueados')
          .select('fecha')
          .eq('id_cliente', cliente.id_cliente);
        
        if (error) {
          console.error('❌ Error cargando días bloqueados:', error);
          setDiasBloqueados([]);
        } else {
          const fechasBloqueadas = data?.map(d => d.fecha) || [];
          console.log('✅ Días bloqueados:', fechasBloqueadas);
          setDiasBloqueados(fechasBloqueadas);
        }
      } catch (err) {
        console.error('❌ Error consultando días bloqueados:', err);
        setDiasBloqueados([]);
      }
    })();
  }, [cliente]);

  useEffect(() => {
    const cargarHoras = async () => {
      if (!cliente || !cliente.rango_horarios || !cliente.intervalo_citas || !fecha) {
        console.log('🛑 No se generan horas - Faltan datos:', { 
          tieneCliente: !!cliente, 
          tieneRango: !!cliente?.rango_horarios,
          tieneIntervalo: !!cliente?.intervalo_citas,
          fecha 
        });
        setHoras([]);
        return;
      }

      console.log('📅 === GENERANDO HORAS PARA:', fecha, '===');
      console.log('🚫 Días bloqueados específicos:', diasBloqueados);
      console.log('❌ ¿Incluye esta fecha?:', diasBloqueados.includes(fecha));

      // Si el día está bloqueado específicamente, no mostrar horas
      if (diasBloqueados.includes(fecha)) {
        console.log('🛑 DÍA BLOQUEADO ESPECÍFICAMENTE');
        setHoras([]);
        return;
      }

      const fechaSeleccionada = new Date(fecha + 'T00:00:00');
      const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
      const diaActual = diasSemana[fechaSeleccionada.getDay()];
      
      console.log('📆 Día de la semana detectado:', diaActual);
      console.log('📆 Índice getDay():', fechaSeleccionada.getDay());
      console.log('⚙️ Configuración rango_horarios:', cliente.rango_horarios);

      const claveNormalizada = diaActual.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const claves = Object.keys(cliente.rango_horarios || {});
      const claveReal = claves.find(k => k.normalize('NFD').replace(/[\u0300-\u036f]/g, '') === claveNormalizada);
      
      console.log('🔑 Clave buscada (normalizada):', claveNormalizada);
      console.log('🔑 Claves disponibles en BD:', claves);
      console.log('🔑 Clave encontrada:', claveReal);

      const rangoDia = cliente.rango_horarios?.[claveReal];

      console.log('⏰ Rango del día encontrado:', rangoDia);

      if (!rangoDia?.inicio || !rangoDia?.fin) {
        console.log('🛑 NO HAY RANGO CONFIGURADO PARA ESTE DÍA');
        setHoras([]);
        return;
      }

      const [inicioH, inicioM] = rangoDia.inicio.split(':').map(Number);
      const [finH, finM] = rangoDia.fin.split(':').map(Number);
      const intervalo = cliente.intervalo_citas;

      console.log('⏰ Hora inicio:', `${inicioH}:${inicioM}`);
      console.log('⏰ Hora fin:', `${finH}:${finM}`);
      console.log('⏰ Intervalo:', intervalo);

      const start = inicioH * 60 + inicioM;
      const end = finH * 60 + finM;

      const horasGeneradas = [];
      for (let mins = start; mins < end; mins += intervalo) {
        const h = String(Math.floor(mins / 60)).padStart(2, '0');
        const m = String(mins % 60).padStart(2, '0');
        horasGeneradas.push(`${h}:${m}`);
      }

      console.log('🕐 Horas generadas inicialmente:', horasGeneradas);

      const horasNoDisponiblesDia = cliente.horas_no_disponibles?.[claveReal] || [];
      console.log('🚫 Horas NO disponibles configuradas:', horasNoDisponiblesDia);
      
      let horasFiltradas = horasGeneradas.filter((hora) => !horasNoDisponiblesDia.includes(hora));
      console.log('✅ Después de filtrar horas no disponibles:', horasFiltradas);

      // NUEVA LÓGICA: Si la fecha seleccionada es HOY, filtrar horas que ya pasaron
      // 🎭 EXCEPTO si el cliente está en modo demo
      const ahora = new Date();
      const año = ahora.getFullYear();
      const mes = String(ahora.getMonth() + 1).padStart(2, '0');
      const dia = String(ahora.getDate()).padStart(2, '0');
      const fechaHoy = `${año}-${mes}-${dia}`;

      console.log('📅 Fecha de HOY (local):', fechaHoy);
      console.log('📅 Fecha seleccionada:', fecha);
      console.log('📅 ¿Es hoy?:', fecha === fechaHoy);
      console.log('🎭 ¿Modo demo?:', cliente?.modo_demo);

      // 🎭 Si está en modo demo, NO filtrar horas pasadas
      if (fecha === fechaHoy && !cliente?.modo_demo) {
        const horaActual = ahora.getHours();
        const minutoActual = ahora.getMinutes();
        const minutosActuales = horaActual * 60 + minutoActual;
      
        console.log('🕐 Hora actual:', `${horaActual}:${minutoActual} (${minutosActuales} minutos)`);
        
        // Agregar margen de tiempo (15 minutos de anticipación mínima)
        const margenMinutos = 15;
        const minutosConMargen = minutosActuales + margenMinutos;
        
        console.log('⏰ Minutos con margen (+15min):', minutosConMargen);
        
        horasFiltradas = horasFiltradas.filter(hora => {
          const [h, m] = hora.split(':').map(Number);
          const minutosHora = h * 60 + m;
          const pasaFiltro = minutosHora > minutosConMargen;
          if (!pasaFiltro) {
            console.log(`❌ Hora ${hora} filtrada (${minutosHora} <= ${minutosConMargen})`);
          }
          return pasaFiltro;
        });
        
        console.log('✅ Después de filtrar horas pasadas:', horasFiltradas);
      }

      console.log('🎯 HORAS FINALES A MOSTRAR:', horasFiltradas);
      setHoras(horasFiltradas);
    };

    cargarHoras();
  }, [cliente, fecha, diasBloqueados]);

  useEffect(() => {
    const verificarHorasOcupadas = async () => {
      if (!canchaSeleccionada || !fecha) return setHorasOcupadas([]);

      console.log('🔍 Verificando horas ocupadas para cancha:', canchaSeleccionada, 'fecha:', fecha);

      const { data, error } = await supabase
        .from('reservas_cancha')
        .select('hora')
        .eq('id_cancha', canchaSeleccionada)
        .eq('fecha', fecha);

      if (error) {
        console.error('❌ Error cargando reservas:', error);
        return;
      }
      
      const ocupadas = (data || []).map((res) => res.hora);
      console.log('✅ Horas ocupadas:', ocupadas);
      setHorasOcupadas(ocupadas);
    };

    verificarHorasOcupadas();
  }, [canchaSeleccionada, fecha]);

  // Validaciones formulario
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    marcarInteraccion();
    const value = e.target.value;
    const trimmedValue = value.trim();
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]*$/;
    
    if (!regex.test(value)) {
      setErrorNombre('❌ El nombre solo puede contener letras y espacios.');
    } else if (trimmedValue.length < 2) {
      setErrorNombre('❌ El nombre debe tener al menos 2 caracteres.');
    } else if (trimmedValue.length > 50) {
      setErrorNombre('❌ El nombre no puede exceder 50 caracteres.');
    } else if (trimmedValue.split(' ').length < 2) {
      setErrorNombre('❌ Ingresa al menos nombre y apellido.');
    } else {
      setErrorNombre('');
    }
    setNombre(value);
  };

  const handleCorreoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    marcarInteraccion();
    setCorreo(e.target.value);
  };

  const handleCorreoBlur = async () => {
    if (!correo.trim()) {
      setErrorCorreo('');
      return;
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const dominiosValidos = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"];

    if (!emailRegex.test(correo)) {
      setErrorCorreo("❌ Ingresa un correo electrónico válido");
      return;
    }

    const dominio = correo.split("@")[1];
    if (dominio && !dominiosValidos.includes(dominio.toLowerCase())) {
      setErrorCorreo(
        `⚠️ El dominio "${dominio}" no es reconocido. Usa un correo válido como Gmail, Hotmail, Outlook, etc.`
      );
      return;
    }

    try {
      const fechaHoy = new Date().toISOString().split('T')[0];

      const { data: reservasPendientes, error } = await supabase
        .from('reservas_cancha')
        .select('fecha, hora')
        .eq('correo', correo)
        .eq('id_cliente', cliente.id_cliente)
        .gte('fecha', fechaHoy);

      if (error) {
        console.error("Error validando correo:", error.message);
        setErrorCorreo('');
        return;
      }

      if (reservasPendientes && reservasPendientes.length > 0) {
        const reserva = reservasPendientes[0];
        setErrorCorreo(
          `❌ Ya existe una reserva con este correo para el ${reserva.fecha} a las ${reserva.hora}`
        );
        return;
      }
    } catch (err) {
      console.error("Error en validación de correo:", err);
      setErrorCorreo('');
      return;
    }

    setErrorCorreo('');
  };

  const handleIdentificacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    marcarInteraccion();
    const valor = e.target.value;
        
    if (/^\d*$/.test(valor)) {
      setIdentificacion(valor);
      
      if (valor.length > 0 && (valor.length < 6 || valor.length > 15)) {
        setErrorIdentificacion('❌ La identificación debe tener entre 6 y 15 dígitos');
        setErrorIdentificacionDuplicada('');
      } else {
        setErrorIdentificacion('');
        if (valor.length >= 6) {
          validarIdentificacionDuplicada(valor);
        } else {
          setErrorIdentificacionDuplicada('');
        }
      }
    } else {
      setErrorIdentificacion('❌ La identificación solo puede contener números');
      setErrorIdentificacionDuplicada('');
    }
  };

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    marcarInteraccion();
    const valor = e.target.value;
    
    if (/^\d*$/.test(valor)) {
      setTelefono(valor);
      
      if (valor.length > 0 && valor.length !== 10) {
        setErrorTelefono('❌ El teléfono debe tener 10 dígitos');
      } else {
        setErrorTelefono('');
      }
    }
  };

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    marcarInteraccion();
    setFecha(e.target.value);
  };

  const handleCanchaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    marcarInteraccion();
    setCanchaSeleccionada(e.target.value);
  };

  const handleHoraClick = (hora: string, estaOcupada: boolean) => {
    marcarInteraccion();
    if (estaOcupada) {
      lanzarToast('Hora ya reservada');
    } else {
      setHoraSeleccionada(hora);
    }
  };

  // Validación de fecha
  useEffect(() => {
    if (fecha && hoy) {
      const hoyDate = new Date(hoy + 'T00:00:00');
      const fechaSeleccionada = new Date(fecha + 'T00:00:00');
      
      if (fechaSeleccionada < hoyDate) {
        setErrorFecha('❌ No puedes agendar reservas en fechas pasadas.');
        return;
      }
      
      if (diasBloqueados.includes(fecha)) {
        setErrorFecha('❌ Este día no está disponible para reservas.');
        return;
      }
      
      const maxDiasAnticipacion = 30;
      const fechaMaxima = new Date(hoyDate.getTime() + maxDiasAnticipacion * 24 * 60 * 60 * 1000);
      
      if (fechaSeleccionada > fechaMaxima) {
        setErrorFecha(`❌ No puedes reservar con más de ${maxDiasAnticipacion} días de anticipación.`);
        return;
      }
      
      setErrorFecha('');
    }
  }, [fecha, hoy, diasBloqueados]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    marcarInteraccion();

    setMensaje('');
    setEsError(false);

    // Validar campos vacíos
    const camposVacios = [];
    if (!nombre.trim()) camposVacios.push('Nombre');
    if (!correo.trim()) camposVacios.push('Correo');
    if (!identificacion.trim()) camposVacios.push('Identificación');
    if (!telefono.trim()) camposVacios.push('Teléfono');
    if (!fecha) camposVacios.push('Fecha');
    if (!horaSeleccionada) camposVacios.push('Hora');
    if (!canchaSeleccionada) camposVacios.push('Cancha');

    if (camposVacios.length > 0) {
      setMensaje(`❌ Faltan: ${camposVacios.join(', ')}`);
      setEsError(true);
      return;
    }

    // Validar errores del formulario
    if (errorNombre || errorCorreo || errorIdentificacion || errorTelefono || errorFecha || errorIdentificacionDuplicada) {
      if (errorIdentificacionDuplicada) {
        setMensaje(errorIdentificacionDuplicada);
      } else {
        setMensaje('❌ Por favor corrige los errores del formulario.');
      }
      setEsError(true);
      return;
    }

    try {
      // 🆕 NUEVO FLUJO: Llamar API para crear pago
      setMensaje('⏳ Preparando pago...');
      
      const response = await fetch('/api/create-payment-cancha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancha_id: canchaSeleccionada,
          cliente_id: cliente.id_cliente,
          fecha_reserva: fecha,
          hora_inicio: horaSeleccionada,
          hora_fin: horaSeleccionada, // Puedes ajustar esto si tienes hora de fin
          nombre_cliente: nombre,
          telefono_cliente: telefono,
          email_cliente: correo,
          precio_hora: precioHora,
          porcentaje_anticipo: porcentajeComision,
          monto_anticipo: montoAnticipo,
          monto_pendiente: montoPendiente
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear pago');
      }

      console.log('✅ Payment Link creado:', result);

      // 🔗 Redirigir a Wompi
      if (result.payment_link) {
        window.location.href = result.payment_link;
      } else {
        throw new Error('No se recibió link de pago');
      }

    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      setMensaje(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setEsError(true);
    }
  };

  const obtenerCamposFaltantes = () => {
    const faltantes = [];
    
    if (!nombre.trim()) faltantes.push('Nombre');
    if (!correo.trim()) faltantes.push('Correo');
    if (!identificacion.trim()) faltantes.push('Identificación');
    if (!telefono.trim()) faltantes.push('Teléfono');
    if (!fecha) faltantes.push('Fecha');
    if (!horaSeleccionada) faltantes.push('Hora');
    if (!canchaSeleccionada) faltantes.push('Cancha');
    
    return faltantes;
  };

  const camposFaltantes = obtenerCamposFaltantes();
  const hayErrores = !!(errorNombre || errorCorreo || errorIdentificacion || errorTelefono || errorFecha || errorIdentificacionDuplicada);
  const formularioIncompleto = camposFaltantes.length > 0 || hayErrores;

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-100 flex justify-center items-center py-8 px-4">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl px-6 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-24 bg-gray-200 rounded-lg"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-100 flex justify-center items-center py-8 px-4">
        <p className="text-center text-red-600 font-semibold">Negocio no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-100 flex justify-center items-center py-8 px-4">
      <motion.div
        className="w-full max-w-md bg-white shadow-lg rounded-2xl px-6 py-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo o nombre del cliente */}
        <div className="text-center mb-4">
          {cliente.logo_url ? (
            <div>
              <img 
                src={cliente.logo_url} 
                alt={`Logo de ${cliente.nombre}`}
                className="w-24 h-24 mx-auto mb-2 object-contain rounded-lg"
              />
              <h1 className="text-xl font-bold text-gray-800 capitalize">
                {cliente.nombre}
              </h1>
            </div>
          ) : (
            <h1 className="text-2xl font-bold text-gray-800 capitalize">
              Reserva en {cliente.nombre}
            </h1>
          )}
          {/* 🎭 Indicador de modo demo */}
          {cliente?.modo_demo && (
            <div className="mt-3 p-2 bg-orange-100 border border-orange-300 rounded-lg">
              <p className="text-xs text-orange-800 text-center font-medium">
                🎭 Modo demostración - Todas las horas disponibles
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={handleNombreChange}
            className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errorNombre && <p className="text-red-500 text-sm mt-1">{errorNombre}</p>}

          <input
            type="email"
            value={correo}
            onChange={handleCorreoChange}
            onBlur={handleCorreoBlur}
            placeholder="Ingresa tu correo electrónico"
            className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errorCorreo && <p className="text-red-500 text-sm mt-1">{errorCorreo}</p>}

          <input
            type="text"
            placeholder="Identificación"
            value={identificacion}
            onChange={handleIdentificacionChange}
            className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errorIdentificacion && <p className="text-red-500 text-sm mt-1">{errorIdentificacion}</p>}
          {errorIdentificacionDuplicada && <p className="text-red-500 text-sm mt-1 font-medium">{errorIdentificacionDuplicada}</p>}

          <input
            type="tel"
            placeholder="Teléfono (10 dígitos)"
            value={telefono}
            onChange={handleTelefonoChange}
            className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errorTelefono && <p className="text-red-500 text-sm mt-1">{errorTelefono}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de tu reserva
            </label>
            <div className="relative">
              <input
                type="date"
                value={fecha}
                onChange={handleFechaChange}
                min={hoy}
                className="w-full max-w-full appearance-none text-gray-800 border border-gray-300 rounded-lg h-[44px] px-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-sm"
                style={{ colorScheme: 'light' }}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 pointer-events-none">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            {errorFecha && (
              <p className="text-red-500 text-sm mt-1">{errorFecha}</p>
            )}
            {!fecha && (
              <p className="text-sm text-gray-500 mt-1">
                Por favor selecciona una fecha
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona una cancha
            </label>
            <div className="relative">
              <select
                value={canchaSeleccionada}
                onChange={handleCanchaChange}
                className="text-gray-800 border border-gray-300 rounded-lg p-3 pr-10 pl-11 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-full appearance-none text-sm"
              >
                <option value="">Selecciona una cancha</option>
                {canchas.map((cancha: any) => (
                  <option key={cancha.id_cancha} value={cancha.id_cancha}>
                    {cancha.nombre_cancha}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Mostrar imagen, descripción y precios de cancha */}
            {canchaSeleccionada && (() => {
              const canchaData = canchas.find((c: any) => c.id_cancha === canchaSeleccionada);
              return (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  {canchaData?.imagen_url && (
                    <div className="mb-3">
                      <img 
                        src={canchaData.imagen_url} 
                        alt={canchaData.nombre_cancha}
                        onClick={() => setImagenAmpliada(canchaData.imagen_url)}
                        className="w-full h-48 object-cover rounded-lg border-2 border-blue-300 cursor-pointer hover:opacity-90 transition-opacity"
                        title="Click para ampliar"
                      />
                      <p className="text-xs text-gray-600 text-center mt-1">
                        👆 Click en la imagen para ampliar
                      </p>
                    </div>
                  )}
                  
                  {/* Descripción */}
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">📍 Descripción:</span>{' '}
                      {canchaData?.descripcion_cancha || 'Sin descripción disponible'}
                    </p>
                  </div>

                  {/* Información de precios */}
                  <div className="p-3 bg-white rounded-lg border border-blue-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">💵 Precio por hora:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${precioHora.toLocaleString('es-CO')}
                      </span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">Anticipo a pagar ({porcentajeComision}%):</span>
                        <span className="text-sm font-semibold text-orange-600">
                          ${montoAnticipo.toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Pendiente en sitio:</span>
                        <span className="text-sm font-medium text-gray-700">
                          ${montoPendiente.toLocaleString('es-CO')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-800 text-center">
                        💡 Pagas el anticipo ahora, el resto lo pagas cuando llegues
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

          <div>
            <label className="block text-sm text-gray-700 mb-1">Selecciona una hora:</label>
            {horas.length === 0 ? (
              <p className="text-sm text-red-500">
                Este negocio no tiene horarios configurados para este día.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {horas.map((hora) => {
                  const estaOcupada = horasOcupadas.includes(hora);
                  return (
                    <button
                      key={hora}
                      type="button"
                      disabled={estaOcupada}
                      onClick={() => handleHoraClick(hora, estaOcupada)}
                      className={`w-full p-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm focus:outline-none ${
                        estaOcupada
                          ? 'bg-red-200 text-red-800 cursor-not-allowed'
                          : horaSeleccionada === hora
                          ? 'bg-black text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {hora}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            disabled={formularioIncompleto}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              formularioIncompleto
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            🔒 Proceder al pago
          </motion.button>

          {/* Mostrar ayudas y errores solo si el usuario ha interactuado */}
          {usuarioInteractuo && formularioIncompleto && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              {hayErrores ? (
                <p className="text-yellow-800 text-sm text-center">
                  ⚠️ Por favor corrige los errores marcados en rojo
                </p>
              ) : camposFaltantes.length > 0 ? (
                <p className="text-yellow-800 text-sm text-center">
                  📝 Faltan: <span className="font-medium">{camposFaltantes.join(', ')}</span>
                </p>
              ) : null}
            </div>
          )}

          {/* Mostrar mensajes de error específicos */}
          {mensaje && (
            <div className={`mt-2 p-3 rounded-lg ${
              esError 
                ? 'bg-red-50 border border-red-200 text-red-800' 
                : 'bg-green-50 border border-green-200 text-green-800'
            }`}>
              <p className="text-sm text-center font-medium">{mensaje}</p>
            </div>
          )}
        </form>
      </motion.div>

        {/* Toast notifications */}
        {mostrarToast && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {textoToast}
          </div>
        )}

        {/* Modal de éxito */}
        {mostrarModalExito && datosReserva && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  ¡Reserva Exitosa! ✅
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Cliente:</span>
                      <span className="text-gray-800">{datosReserva.nombre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Negocio:</span>
                      <span className="text-gray-800">{datosReserva.cliente}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Cancha:</span>
                      <span className="text-gray-800">{datosReserva.cancha}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Fecha:</span>
                      <span className="text-gray-800">{datosReserva.fecha}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Hora:</span>
                      <span className="text-gray-800 font-semibold">{datosReserva.hora}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">
                  Te esperamos en la fecha y hora programada. ¡Gracias por confiar en nosotros!
                </p>
                
                <button
                  onClick={() => {
                    setMostrarModalExito(false);
                    setDatosReserva(null);
                    setUsuarioInteractuo(false);
                  }}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de imagen ampliada */}
        {imagenAmpliada && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
            onClick={() => setImagenAmpliada(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setImagenAmpliada(null)}
                className="absolute -top-10 right-0 text-white bg-red-600 hover:bg-red-700 rounded-full p-2 transition-colors"
                title="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img 
                src={imagenAmpliada} 
                alt="Imagen ampliada"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
              <p className="text-white text-center mt-3 text-sm">
                Click fuera de la imagen o en la ✕ para cerrar
              </p>
            </motion.div>
          </div>
        )}
      </div>
  );
}




