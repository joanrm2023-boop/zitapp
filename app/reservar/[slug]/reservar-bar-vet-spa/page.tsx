'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import "react-datepicker/dist/react-datepicker.css";

const DatePicker = dynamic(() => import('react-datepicker'), { ssr: false });
import 'react-datepicker/dist/react-datepicker.css';


// Component wrapper para evitar hidratación
function ReservarSlugContent() {
  const { slug } = useParams();

  const [cliente, setCliente] = useState<any>(null);
  const [barberos, setBarberos] = useState([]);
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
  // NUEVO: Estado para error de identificación duplicada
  const [errorIdentificacionDuplicada, setErrorIdentificacionDuplicada] = useState('');

  const [errorCorreoDuplicado, setErrorCorreoDuplicado] = useState('');

  const [telefono, setTelefono] = useState('');
  const [errorTelefono, setErrorTelefono] = useState('');

  const [nota, setNota] = useState('');
  const [fecha, setFecha] = useState<string>('');
  const [errorFecha, setErrorFecha] = useState('');
  const [hoy, setHoy] = useState<string>('');

  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [barberoSeleccionado, setBarberoSeleccionado] = useState('');

  const [mensaje, setMensaje] = useState('');
  const [esError, setEsError] = useState(false);

  const mensajeRef = useRef(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);

  const [mostrarToast, setMostrarToast] = useState(false);
  const [textoToast, setTextoToast] = useState('');

  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const [datosReserva, setDatosReserva] = useState(null);

  // NUEVO: Estado para rastrear si el usuario ha interactuado
  const [usuarioInteractuo, setUsuarioInteractuo] = useState(false);

  const lanzarToast = (mensaje: string) => {
    setTextoToast(mensaje);
    setMostrarToast(true);
    setTimeout(() => setMostrarToast(false), 2500);
  };

  // Función para marcar interacción del usuario
  const marcarInteraccion = () => {
    if (!usuarioInteractuo) {
      setUsuarioInteractuo(true);
    }
  };

  


  // Función para validar identificación duplicada
  const validarIdentificacionDuplicada = async (identificacionValue: string) => {
    if (!identificacionValue.trim() || identificacionValue.length < 6) {
      setErrorIdentificacionDuplicada('');
      return;
    }

    try {
      const fechaHoy = new Date().toISOString().split('T')[0];
      
      const { data: reservasPendientes, error: errorPendiente } = await supabase
        .from('reservas')
        .select('id, fecha, hora')
        .eq('identificacion', identificacionValue)
        .eq('id_cliente', cliente.id_cliente)
        .eq('estado', 'pendiente')
        .gte('fecha', fechaHoy);

      if (errorPendiente) {
        console.error('Error validando reservas:', errorPendiente);
        setErrorIdentificacionDuplicada('');
        return;
      }

      if (reservasPendientes && reservasPendientes.length > 0) {
        const reserva = reservasPendientes[0];
        setErrorIdentificacionDuplicada(`❌ Ya existe una cita con esta identificación para el ${reserva.fecha} a las ${reserva.hora}`);
      } else {
        setErrorIdentificacionDuplicada('');
      }
    } catch (err) {
      console.error('Error en validación de identificación:', err);
      setErrorIdentificacionDuplicada('');
    }
  };




  // Configurar fecha mínima solo en el cliente
  useEffect(() => {
    setHoy(new Date().toISOString().split('T')[0]);
  }, []);

  // Cargar cliente por slug
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const { data, error } = await supabase.from('clientes').select('*').eq('slug', slug).single();
        if (error || !data) {
          setCliente(null);
        } else {
          setCliente(data);
        }
      } catch (err) {
        console.error('Error cargando cliente:', err);
        setCliente(null);
      } finally {
        setCargando(false);
      }
    })();
  }, [slug]);


  // Cargar profesionales
  useEffect(() => {
      if (!cliente?.id_cliente) return;
      (async () => {
        try {
          const { data } = await supabase
            .from('barberos')
            .select('*')
            .eq('id_cliente', cliente.id_cliente)
            .eq('activo', true)
            .neq('estado', 'eliminado');
          setBarberos(data || []);
        } catch (err) {
          console.error('Error cargando barberos:', err);
          setBarberos([]);
        }
      })();
    }, [cliente]);

  // Cargar días bloqueados específicos
  useEffect(() => {
    if (!cliente?.id_cliente) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('dias_bloqueados')
          .select('fecha')
          .eq('id_cliente', cliente.id_cliente);
        
        if (error) {
          console.error('Error cargando días bloqueados:', error);
          setDiasBloqueados([]);
        } else {
          const fechasBloqueadas = data?.map(d => d.fecha) || [];
          setDiasBloqueados(fechasBloqueadas);
        }
      } catch (err) {
        console.error('Error consultando días bloqueados:', err);
        setDiasBloqueados([]);
      }
    })();
  }, [cliente]);



  // Cargar horas disponibles según rango y día
  useEffect(() => {
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

    try {
      const fechaSeleccionada = new Date(fecha + 'T00:00:00');
      const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      
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

      if (!rangoDia || !rangoDia.inicio || !rangoDia.fin) {
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

      const horasGeneradas: string[] = [];
      for (let mins = start; mins < end; mins += intervalo) {
        const h = String(Math.floor(mins / 60)).padStart(2, '0');
        const m = String(mins % 60).padStart(2, '0');
        horasGeneradas.push(`${h}:${m}`);
      }

      console.log('🕐 Horas generadas inicialmente:', horasGeneradas);

      // Filtrar horas no disponibles del cliente
      const horasNoDisponiblesDia = cliente.horas_no_disponibles?.[claveReal] || [];
      console.log('🚫 Horas NO disponibles configuradas:', horasNoDisponiblesDia);
      
      let horasFiltradas = horasGeneradas.filter(hora => !horasNoDisponiblesDia.includes(hora));
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
      
    } catch (err) {
      console.error('❌ Error generando horas:', err);
      setHoras([]);
    }
  }, [cliente, fecha, diasBloqueados]);

  // Consultar horas ocupadas para barbero y fecha
  useEffect(() => {
    if (!barberoSeleccionado || !fecha) {
      setHorasOcupadas([]);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from('reservas')
          .select('hora')
          .eq('id_barbero', barberoSeleccionado)
          .eq('fecha', fecha)
          .eq('estado', 'pendiente'); // ✅ Solo considerar citas pendientes como ocupadas
        if (error) {
          console.error('Error cargando reservas:', error);
          setHorasOcupadas([]);
          return;
        }
        const ocupadas = (data || []).map(res => res.hora);
        setHorasOcupadas(ocupadas);
      } catch (err) {
        console.error('Error consultando horas ocupadas:', err);
        setHorasOcupadas([]);
      }
    })();
  }, [barberoSeleccionado, fecha]);

  // NUEVA VALIDACIÓN: Validar hora seleccionada en tiempo real
  useEffect(() => {
    if (horaSeleccionada && horasOcupadas.includes(horaSeleccionada)) {
      setHoraSeleccionada('');
      lanzarToast('La hora seleccionada ya no está disponible con este profesional');
    }
  }, [horasOcupadas, horaSeleccionada]);

  // Validaciones formulario
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    marcarInteraccion(); // Marcar que el usuario interactuó
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
    marcarInteraccion(); // Marcar que el usuario interactuó
    setCorreo(e.target.value);
  };

  const handleCorreoBlur = async () => {
    if (!correo.trim()) {
      setErrorCorreo('');
      return;
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const dominiosValidos = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"];

    // 1. Validar formato
    if (!emailRegex.test(correo)) {
      setErrorCorreo("❌ Ingresa un correo electrónico válido");
      return;
    }

    // 2. Validar dominio
    const dominio = correo.split("@")[1];
    if (dominio && !dominiosValidos.includes(dominio.toLowerCase())) {
      setErrorCorreo(
        `⚠️ El dominio "${dominio}" no es reconocido. Usa un correo válido como Gmail, Hotmail, Outlook, etc.`
      );
      return;
    }

    try {
      const fechaHoy = new Date().toISOString().split('T')[0];

      // 3. Verificar si ya existe reserva pendiente con ese correo
      const { data: reservasPendientes, error } = await supabase
        .from('reservas')
        .select('fecha, hora')
        .eq('correo', correo)
        .eq('id_cliente', cliente.id_cliente) // 🆕 AGREGADO
        .eq('estado', 'pendiente')
        .gte('fecha', fechaHoy);

      if (error) {
        console.error("Error validando correo:", error.message);
        setErrorCorreo('');
        return;
      }

      if (reservasPendientes && reservasPendientes.length > 0) {
        const reserva = reservasPendientes[0];
        setErrorCorreo(
          `❌ Ya existe una cita con este correo para el ${reserva.fecha} a las ${reserva.hora}`
        );
        return;
      }
    } catch (err) {
      console.error("Error en validación de correo:", err);
      setErrorCorreo('');
      return;
    }

    // Si pasó todas las validaciones:
    setErrorCorreo('');
  };

  // MODIFICADO: handleIdentificacionChange con validación de duplicados
  const handleIdentificacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    marcarInteraccion(); // Marcar que el usuario interactuó
    const valor = e.target.value;
        
    // 1. Verificar que solo sean números
    if (/^\d*$/.test(valor)) {
      setIdentificacion(valor);
      
      // 2. Verificar longitud mínima y máxima
      if (valor.length > 0 && (valor.length < 6 || valor.length > 15)) {
        setErrorIdentificacion('❌ La identificación debe tener entre 6 y 15 dígitos');
        setErrorIdentificacionDuplicada(''); // Limpiar error de duplicado
      } else {
        setErrorIdentificacion('');
        // 3. NUEVO: Validar duplicados cuando la identificación es válida
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
    
    // Solo permitir números
    if (/^\d*$/.test(valor)) {
      setTelefono(valor);
      
      // Validar longitud
      if (valor.length > 0 && valor.length !== 10) {
        setErrorTelefono('❌ El teléfono debe tener 10 dígitos');
      } else {
        setErrorTelefono('');
      }
    }
  };

  const handleNotaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    marcarInteraccion();
    setNota(e.target.value);
  };

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    marcarInteraccion(); // Marcar que el usuario interactuó
    setFecha(e.target.value);
  };

  const handleBarberoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    marcarInteraccion(); // Marcar que el usuario interactuó
    setBarberoSeleccionado(e.target.value);
  };

  const handleHoraClick = (hora: string, estaOcupada: boolean) => {
    marcarInteraccion(); // Marcar que el usuario interactuó
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
        
        // VALIDACIÓN 1: Fecha pasada
        if (fechaSeleccionada < hoyDate) {
          setErrorFecha('❌ No puedes agendar citas en fechas pasadas.');
          return;
        }
        
        // VALIDACIÓN 2: Día bloqueado específico
        if (diasBloqueados.includes(fecha)) {
          setErrorFecha('❌ Este día no está disponible para reservas.');
          return;
        }
        
        // VALIDACIÓN 3: Límite de días hacia adelante
        const maxDiasAnticipacion = 30;
        const fechaMaxima = new Date(hoyDate.getTime() + maxDiasAnticipacion * 24 * 60 * 60 * 1000);
        
        if (fechaSeleccionada > fechaMaxima) {
          setErrorFecha(`❌ No puedes reservar con más de ${maxDiasAnticipacion} días de anticipación.`);
          return;
        }
        
        // Si llegamos aquí, la fecha es válida
        setErrorFecha('');
      }
    }, [fecha, hoy, diasBloqueados]);

  
  // MODIFICADO: handleSubmit con envío de emailcd do
  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      marcarInteraccion();

      // Limpiar mensajes anteriores
      setMensaje('');
      setEsError(false);

      // Crear lista de campos faltantes
      const camposVacios = [];
      if (!nombre.trim()) camposVacios.push('Nombre');
      if (!correo.trim()) camposVacios.push('Correo');
      if (!identificacion.trim()) camposVacios.push('Identificación');
      if (!telefono.trim()) camposVacios.push('Teléfono'); // AGREGADO
      if (!fecha) camposVacios.push('Fecha');
      if (!horaSeleccionada) camposVacios.push('Hora');
      if (!barberoSeleccionado) camposVacios.push('Profesional');

      if (camposVacios.length > 0) {
        setMensaje(`❌ Faltan: ${camposVacios.join(', ')}`);
        setEsError(true);
        return;
      }

      // Verificar errores de validación (INCLUYENDO el nuevo error de duplicado)
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
        // VALIDACIÓN ADICIONAL: Verificar nuevamente en el submit por seguridad
        const fechaHoy = new Date().toISOString().split('T')[0];

        const { data: reservasPendientes, error: errorPendiente } = await supabase
          .from('reservas')
          .select('id, fecha, hora')
          .eq('identificacion', identificacion)
          .eq('id_cliente', cliente.id_cliente) // 🆕 AGREGADO
          .eq('estado', 'pendiente')
          .gte('fecha', fechaHoy);

        if (errorPendiente) {
          setMensaje('❌ Error validando reservas pendientes.');
          setEsError(true);
          return;
        }

        if (reservasPendientes && reservasPendientes.length > 0) {
          const reserva = reservasPendientes[0];
          setMensaje(`❌ Ya tienes una cita pendiente para el ${reserva.fecha} a las ${reserva.hora}. No puedes agendar otra hasta cumplirla.`);
          setEsError(true);
          return;
        }

        // Verificar si la hora específica ya está ocupada
        const { data: reservasExistentes } = await supabase
          .from('reservas')
          .select('id')
          .eq('id_barbero', barberoSeleccionado)
          .eq('fecha', fecha)
          .eq('hora', horaSeleccionada)
          .eq('estado', 'pendiente'); // ✅ Solo validar citas pendientes

        if (reservasExistentes && reservasExistentes.length > 0) {
          setMensaje('❌ Esta hora ya está reservada con este profesional.');
          setEsError(true);
          return;
        }

        // Insertar la reserva
        const { error } = await supabase.from('reservas').insert([
          {
            nombre,
            correo,
            identificacion,
            telefono, 
            fecha,
            hora: horaSeleccionada,
            nota,
            id_cliente: cliente.id_cliente,
            id_barbero: barberoSeleccionado,
            estado: 'pendiente',
          },
        ]);

        if (error) {
          console.error('Error insertando reserva:', error.message);
          setMensaje(`❌ Error al guardar la reserva: ${error.message}`);
          setEsError(true);
        } else {
          // 🆕 NUEVO: Obtener datos del barbero para el email
          const barberoSeleccionadoData = barberos.find(b => b.id_barbero === barberoSeleccionado);
          
          // 🆕 NUEVO: Enviar email de confirmación
          try {
            console.log('🔵 Enviando email de confirmación...');
            const emailResponse = await fetch('/api/send-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                tipo: 'confirmacion',
                reserva: {
                  nombre,
                  correo,
                  fecha,
                  hora: horaSeleccionada,
                  nota,
                  barbero_nombre: barberoSeleccionadoData?.nombre_barbero || 'Por asignar'
                },
                cliente: {
                  id_cliente: cliente.id_cliente,  // 🆕 AGREGAR ESTA LÍNEA
                  nombre: cliente.nombre,
                  direccion: cliente.direccion || null
                }
              }),
            });

            const emailResult = await emailResponse.json();
            
            if (emailResult.success) {
              console.log('✅ Email de confirmación enviado:', emailResult.messageId);
            } else if (emailResult.notificacionesActivas === false) {
              console.log('ℹ️ Cliente no tiene notificaciones activas:', emailResult.message);
              // No mostrar error al usuario, es comportamiento normal
            } else {
              console.error('⚠️ Error enviando email:', emailResult.error || emailResult.message);
              // No mostrar error al usuario, la reserva ya se guardó exitosamente
            }
          } catch (emailError) {
            console.error('⚠️ Error en envío de email:', emailError);
            // No mostrar error al usuario, la reserva ya se guardó exitosamente
          }

          // Guardar los datos de la reserva para mostrar en el modal
          setDatosReserva({
            nombre,
            fecha,
            hora: horaSeleccionada,
            barbero: barberoSeleccionadoData?.nombre_barbero || 'N/A',
            cliente: cliente.nombre
          });
          
          setMostrarModalExito(true);
          
          // Auto-cerrar modal y limpiar después de 10 segundos
          setTimeout(() => {
            setMostrarModalExito(false);
            setDatosReserva(null);
            setUsuarioInteractuo(false);
          }, 10000);
          
          // Limpiar formulario
          setNombre('');
          setCorreo('');
          setIdentificacion('');
          setTelefono('');
          setHoraSeleccionada('');
          setBarberoSeleccionado('');
          setNota('');
          setFecha('');
          setErrorIdentificacionDuplicada('');
        }
      } catch (err) {
        console.error('Error en submit:', err);
        setMensaje('❌ Error inesperado al procesar la reserva.');
        setEsError(true);
      }
    };

  // MODIFICADO: obtenerCamposFaltantes para incluir el nuevo error
  const obtenerCamposFaltantes = () => {
    const faltantes = [];
    
    if (!nombre.trim()) faltantes.push('Nombre');
    if (!correo.trim()) faltantes.push('Correo');
    if (!identificacion.trim()) faltantes.push('Identificación');
    if (!telefono.trim()) faltantes.push('Teléfono'); // AGREGADO
    if (!fecha) faltantes.push('Fecha');
    if (!horaSeleccionada) faltantes.push('Hora');
    if (!barberoSeleccionado) faltantes.push('Profesional');
    
    return faltantes;
  };

  const camposFaltantes = obtenerCamposFaltantes();
  const hayErrores = !!(errorNombre || errorCorreo || errorIdentificacion || errorTelefono || errorFecha || errorIdentificacionDuplicada);
  const formularioIncompleto = camposFaltantes.length > 0 || hayErrores;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <p className="text-center text-red-600 font-semibold">Barbería no encontrada.</p>
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
            placeholder="Nombre"
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

          {/* Mensaje de error */}
          {errorCorreo && (
            <p className="text-red-500 text-sm mt-1">{errorCorreo}</p>
          )}
 

          <input
            type="text"
            placeholder="Identificación"
            value={identificacion}
            onChange={handleIdentificacionChange}
            className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errorIdentificacion && <p className="text-red-500 text-sm mt-1">{errorIdentificacion}</p>}
          {errorIdentificacionDuplicada && <p className="text-red-500 text-sm mt-1 font-medium">{errorIdentificacionDuplicada}</p>}

          {/* NUEVO CAMPO DE TELÉFONO */}
            <input
              type="tel"
              placeholder="Teléfono (10 dígitos)"
              value={telefono}
              onChange={handleTelefonoChange}
              className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errorTelefono && <p className="text-red-500 text-sm mt-1">{errorTelefono}</p>}

            <textarea
              placeholder="Nota adicional (opcional)"
              value={nota}
              onChange={handleNotaChange}
              rows={3}
              className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />

          
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de tu cita
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
              Profesional que te atenderá
            </label>
            <div ref={dropdownRef} className="relative">
              {/* Botón trigger */}
              <button
                type="button"
                onClick={() => setDropdownAbierto(!dropdownAbierto)}
                className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white w-full text-sm flex items-center gap-2 pr-10"
              >
                {barberoSeleccionado ? (() => {
                  const b = barberos.find((b: any) => b.id_barbero === barberoSeleccionado);
                  return (
                    <>
                      {b?.foto_url
                        ? <img src={b.foto_url} alt={b.nombre_barbero} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </div>
                      }
                      <span>{b?.nombre_barbero}</span>
                    </>
                  );
                })() : <span className="text-gray-400">Selecciona un Profesional</span>}
                <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Lista desplegable */}
              {dropdownAbierto && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {barberos.map((barbero: any) => (
                    <button
                      key={barbero.id_barbero}
                      type="button"
                      onClick={() => {
                        marcarInteraccion();
                        setBarberoSeleccionado(barbero.id_barbero);
                        setDropdownAbierto(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-blue-50 transition-colors text-left ${barberoSeleccionado === barbero.id_barbero ? 'bg-blue-50' : ''}`}
                    >
                      {barbero.foto_url
                        ? <img src={barbero.foto_url} alt={barbero.nombre_barbero} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </div>
                      }
                      <span className="text-gray-800 text-sm font-medium">{barbero.nombre_barbero}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

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
            Reservar cita
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
                ¡Cita Agendada con Éxito! ✅
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Cliente:</span>
                    <span className="text-gray-800">{datosReserva.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Barbería:</span>
                    <span className="text-gray-800">{datosReserva.cliente}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Profesional:</span>
                    <span className="text-gray-800">{datosReserva.barbero}</span>
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
    </div>
  );
}

// Exportar con dynamic import para evitar hidratación
const ReservarSlug = dynamic(() => Promise.resolve(ReservarSlugContent), {
  ssr: false,
  loading: () => (
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
  )
});

export default ReservarSlug;
