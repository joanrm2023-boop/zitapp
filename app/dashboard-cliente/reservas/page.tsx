'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Calendar, ChevronDown, Users, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, RefreshCw } from 'lucide-react';

import toast from 'react-hot-toast'
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';

registerLocale('es', es);

export default function ReservasPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [barberos, setBarberos] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [actualizando, setActualizando] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [expandedBarberoIds, setExpandedBarberoIds] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'pendiente' | 'cumplida' | 'incumplida'>('todas');
  const [servicios, setServicios] = useState<any[]>([]);
  const [cliente, setCliente] = useState<any>(null);
  
  // Estados para confirmación y justificación
  const [mostrandoConfirmacion, setMostrandoConfirmacion] = useState<{
    idReserva: string;
    nuevoEstado: string;
    nombreCliente: string;
    hora: string;
  } | null>(null);
  const [justificacionIncumplida, setJustificacionIncumplida] = useState('');
  const [razonSeleccionada, setRazonSeleccionada] = useState('');
  const [servicioModal, setServicioModal] = useState('');

  const [mostrandoReprogramacion, setMostrandoReprogramacion] = useState<{
    reserva: any;
  } | null>(null);
  const [nuevaFechaReserva, setNuevaFechaReserva] = useState<Date>(new Date());
  const [nuevaHoraReserva, setNuevaHoraReserva] = useState('');
  const [motivoReprogramacion, setMotivoReprogramacion] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  // Razones predefinidas para citas incumplidas
  const razonesIncumplidas = [
    "Cliente no se presentó",
    "Cliente llegó muy tarde",
    "Cliente canceló último momento",
    "Problema técnico/equipo",
    "Emergencia del barbero",
    "Otros motivos"
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const obtenerDatos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // PRIMERO obtener el id_cliente del usuario autenticado
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('id_cliente, modo_demo')
        .eq('user_id', user.id)
        .single();

      if (!clienteData) {
        console.error('No se encontró el cliente');
        setLoading(false);
        return;
      }

      setCliente(clienteData); // 
      const idCliente = clienteData.id_cliente;

      // Cargar barberos activos del cliente específico
      const { data: barberosData } = await supabase
        .from('barberos')
        .select('id_barbero, nombre_barbero')
        .eq('id_cliente', clienteData.id_cliente)
        .eq('activo', true)
        .neq('estado', 'eliminado');

      setBarberos(barberosData || []);

      // Cargar reservas del cliente específico
      const { data: reservasData } = await supabase
        .from('reservas')
        .select('*')
        .eq('id_cliente', idCliente);

      // Actualizar reservas vencidas
      const ahora = new Date();
      const reservasVencidas = reservasData?.filter((r) => {
        if (r.estado !== 'pendiente') return false;
        const fechaHora = new Date(`${r.fecha}T${r.hora}`);
        const fechaHoraMas3Horas = new Date(fechaHora.getTime() + 3 * 60 * 60 * 1000);
        return fechaHoraMas3Horas < ahora;
      }) || [];

      for (const reserva of reservasVencidas) {
        await supabase
          .from('reservas')
          .update({ estado: 'incumplida' })
          .eq('id', reserva.id);
      }

      // Cargar servicios activos del cliente
      const { data: serviciosData, error: serviciosError } = await supabase
        .from('servicios')
        .select('id_ser, ser_nombre')
        .eq('id_cliente', idCliente)
        .eq('ser_estado', 'activo');

      if (serviciosError) {
        console.error('Error cargando servicios:', serviciosError.message);
      } else {
        setServicios(serviciosData || []);
      }

      // Recargar reservas después de actualizar las vencidas
      const { data: reservasActualizadas } = await supabase
        .from('reservas')
        .select('*')
        .eq('id_cliente', idCliente);

      setReservas(reservasActualizadas || []);
      setLoading(false);
    };

    obtenerDatos();
  }, []);

  // Función para mostrar confirmación
  const solicitarConfirmacion = (idReserva: string, nuevoEstado: string, reserva: any) => {
    setMostrandoConfirmacion({
      idReserva,
      nuevoEstado,
      nombreCliente: reserva.nombre,
      hora: reserva.hora
    });
    
    // Limpiar campos de justificación
    setJustificacionIncumplida('');
    setRazonSeleccionada('');
    setServicioModal('');
  };

  // Función actualizada de actualizar estado
  const confirmarActualizacion = async () => {
    if (!mostrandoConfirmacion) return;
    
    const { idReserva, nuevoEstado } = mostrandoConfirmacion;
    
    // Validar servicio usando el estado del modal
    if (nuevoEstado === 'cumplida' && !servicioModal) {
      toast.error('❌ Debes seleccionar un servicio antes de marcar como cumplida');
      return;
    }
    
    // Validar justificación para incumplidas
    if (nuevoEstado === 'incumplida') {
      if (!razonSeleccionada) {
        toast.error('❌ Debes seleccionar una razón para marcar como incumplida');
        return;
      }
      if (razonSeleccionada === 'Otros motivos' && !justificacionIncumplida.trim()) {
        toast.error('❌ Debes especificar el motivo en el campo de comentarios');
        return;
      }
    }

    setActualizando(true);
    const toastId = toast.loading('Actualizando reserva...');

    // Preparar datos para actualizar
    const datosActualizacion: any = { estado: nuevoEstado };
    
    if (nuevoEstado === 'cumplida') {
      datosActualizacion.id_ser = servicioModal;
    } else if (nuevoEstado === 'incumplida') {
      datosActualizacion.razon_incumplida = razonSeleccionada;
      datosActualizacion.comentario_incumplida = razonSeleccionada === 'Otros motivos' 
        ? justificacionIncumplida.trim() 
        : razonSeleccionada;
    }

    const { error } = await supabase
      .from('reservas')
      .update(datosActualizacion)
      .eq('id', idReserva);

    toast.dismiss(toastId);

    if (error) {
      console.error("❌ Error al actualizar el estado:", error);
      toast.error("Error al actualizar: " + error.message);
    } else {
      const mensajeExito = nuevoEstado === 'cumplida' 
        ? 'Reserva marcada como cumplida ✅' 
        : 'Reserva marcada como incumplida con justificación 📝';
      
      toast.success(mensajeExito);
      
      setReservas((prev) =>
        prev.map((r) =>
          r.id === idReserva 
            ? { ...r, estado: nuevoEstado, id_ser: servicioModal, razon_incumplida: razonSeleccionada } 
            : r
        )
      );
    }

    // Cerrar modal y limpiar estados
    setMostrandoConfirmacion(null);
    setJustificacionIncumplida('');
    setRazonSeleccionada('');
    setServicioModal('');
    setActualizando(false);
  };

  // Después de la función confirmarActualizacion, agregar:

// Función para obtener horarios disponibles del barbero
  const obtenerHorariosDisponibles = async (idBarbero: string, fecha: Date) => {
    setCargandoHorarios(true);
    
    try {
      // Obtener el cliente para sus configuraciones
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clienteData } = await supabase
        .from('clientes')
        .select('rango_horarios, intervalo_citas, horas_no_disponibles')
        .eq('user_id', user.id)
        .single();

      if (!clienteData) return;

      const fechaStr = fecha.toLocaleDateString('sv-SE');
      const diaSemana = fecha.toLocaleDateString('es-CO', { weekday: 'long' });

      // 🆕 Obtener reservas existentes del barbero para esa fecha (EXCLUYENDO la reserva actual)
      const { data: reservasExistentes } = await supabase
        .from('reservas')
        .select('hora')
        .eq('id_barbero', idBarbero)
        .eq('fecha', fechaStr)
        .eq('estado', 'pendiente')
        .neq('id', mostrandoReprogramacion?.reserva?.id || 0); // 🔥 EXCLUIR reserva actual

      const horasOcupadas = reservasExistentes?.map(r => r.hora) || [];

      // Generar horarios según configuración del cliente
      const rangoHorarios = clienteData.rango_horarios || {};
      const horarioDelDia = rangoHorarios[diaSemana] || { inicio: '08:00', fin: '18:00' };
      const intervalo = clienteData.intervalo_citas || 45;

      const horarios: string[] = [];
      let horaActual = horarioDelDia.inicio;

      while (horaActual < horarioDelDia.fin) {
        if (!horasOcupadas.includes(horaActual)) {
          horarios.push(horaActual);
        }
        
        // Sumar intervalo
        const [h, m] = horaActual.split(':').map(Number);
        const minutosTotales = h * 60 + m + intervalo;
        const nuevaHora = Math.floor(minutosTotales / 60);
        const nuevosMinutos = minutosTotales % 60;
        horaActual = `${String(nuevaHora).padStart(2, '0')}:${String(nuevosMinutos).padStart(2, '0')}`;
      }



      const horasNoDisponiblesDia = clienteData.horas_no_disponibles?.[diaSemana] || [];
        let horasFiltradas = horarios.filter(hora => !horasNoDisponiblesDia.includes(hora));

        // 🆕 FILTRO ADICIONAL: Si la fecha seleccionada es HOY, filtrar horas que ya pasaron
        const ahora = new Date();
        const año = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const dia = String(ahora.getDate()).padStart(2, '0');
        const fechaHoy = `${año}-${mes}-${dia}`;

        // 🎭 Si está en modo demo, NO filtrar horas pasadas
        if (fechaStr === fechaHoy && !cliente?.modo_demo) {
          const horaActualNum = ahora.getHours();
          const minutoActualNum = ahora.getMinutes();
          const minutosActuales = horaActualNum * 60 + minutoActualNum;
          
          // Agregar margen de tiempo (15 minutos de anticipación mínima)
          const margenMinutos = 15;
          const minutosConMargen = minutosActuales + margenMinutos;
          
          horasFiltradas = horasFiltradas.filter(hora => {
            const [h, m] = hora.split(':').map(Number);
            const minutosHora = h * 60 + m;
            return minutosHora > minutosConMargen;
          });
        }

        setHorariosDisponibles(horasFiltradas);


    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      toast.error('Error al cargar horarios disponibles');
    } finally {
      setCargandoHorarios(false);
    }
  };

  // Función para abrir modal de reprogramación
    const abrirModalReprogramacion = (reserva: any) => {
      setMostrandoReprogramacion({ reserva });
      
      // Inicializar con el día siguiente como mínimo
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      manana.setHours(0, 0, 0, 0); // Resetear hora a medianoche
      
      setNuevaFechaReserva(manana);
      setNuevaHoraReserva('');
      setMotivoReprogramacion('');
      setHorariosDisponibles([]);
      
      // Cargar horarios del día siguiente
      obtenerHorariosDisponibles(reserva.id_barbero, manana);
    };

    // Función para confirmar reprogramación
    const confirmarReprogramacion = async () => {
      if (!mostrandoReprogramacion) return;
      
      const { reserva } = mostrandoReprogramacion;
      
      // Validaciones
      if (!nuevaHoraReserva) {
        toast.error('❌ Debes seleccionar una nueva hora');
        return;
      }
      
      if (!motivoReprogramacion.trim()) {
        toast.error('❌ Debes especificar el motivo de la reprogramación');
        return;
      }

      setActualizando(true);
      const toastId = toast.loading('Reprogramando cita...');

      try {
        const nuevaFechaStr = nuevaFechaReserva.toLocaleDateString('sv-SE');
        
        // 1. Crear nueva reserva con los datos copiados
        const { data: nuevaReserva, error: errorNueva } = await supabase
          .from('reservas')
          .insert({
            nombre: reserva.nombre,
            correo: reserva.correo,
            telefono: reserva.telefono,
            fecha: nuevaFechaStr,
            hora: nuevaHoraReserva,
            id_cliente: reserva.id_cliente,
            id_barbero: reserva.id_barbero,
            id_ser: reserva.id_ser,
            nota: reserva.nota,
            estado: 'pendiente',
            id_reserva_original: reserva.id
          })
          .select()
          .single();

        if (errorNueva) throw errorNueva;

        // 2. Actualizar reserva original como reprogramada
        const { error: errorOriginal } = await supabase
          .from('reservas')
          .update({
            estado: 'reprogramada',
            id_reserva_nueva: nuevaReserva.id,
            fecha_reprogramacion: new Date().toISOString(),
            motivo_reprogramacion: motivoReprogramacion.trim()
          })
          .eq('id', reserva.id);

        if (errorOriginal) throw errorOriginal;

        toast.dismiss(toastId);
        toast.success('✅ Cita reprogramada exitosamente');

        // Actualizar lista de reservas
        setReservas((prev) => [
          ...prev.map(r => 
            r.id === reserva.id 
              ? { ...r, estado: 'reprogramada', id_reserva_nueva: nuevaReserva.id, motivo_reprogramacion: motivoReprogramacion }
              : r
          ),
          nuevaReserva
        ]);

        // Cerrar modal
        setMostrandoReprogramacion(null);
        setNuevaHoraReserva('');
        setMotivoReprogramacion('');
        
      } catch (error: any) {
        toast.dismiss(toastId);
        console.error('Error reprogramando:', error);
        toast.error('❌ Error al reprogramar: ' + error.message);
      } finally {
        setActualizando(false);
      }
    };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'cumplida': return 'bg-green-100 text-green-800';
      case 'incumplida': return 'bg-red-100 text-red-800';
      case 'reprogramada': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  const obtenerNombreServicio = (idServicio: string) => {
      const servicio = servicios.find(s => s.id_ser === idServicio);
      return servicio ? servicio.ser_nombre : 'Servicio no encontrado';
    };

  const puedeMarcarse = (fecha: string, hora: string) => {
    console.log('🔍 DEBUG puedeMarcarse:');
    console.log('   - cliente:', cliente);
    console.log('   - cliente?.modo_demo:', cliente?.modo_demo);
    
    // 🎭 Si está en modo demo, siempre puede marcarse
    if (cliente?.modo_demo) {
      console.log('✅ MODO DEMO - Puede marcarse');
      return true;
    }
    
    const ahora = new Date()
    const fechaHoraReserva = new Date(`${fecha}T${hora}`)
    const resultado = ahora >= fechaHoraReserva;
    console.log('   - Resultado normal:', resultado);
    return resultado;
  }

  const toggleBarbero = (id: string) => {
    setExpandedBarberoIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const fechaSeleccionadaStr = fechaSeleccionada.toLocaleDateString('sv-SE');

  const resumen = (() => {
    const delDia = reservas.filter(r => r.fecha === fechaSeleccionadaStr);
    return {
      total: delDia.length,
      cumplidas: delDia.filter(r => r.estado === 'cumplida').length,
      pendientes: delDia.filter(r => r.estado === 'pendiente').length,
      incumplidas: delDia.filter(r => r.estado === 'incumplida').length,
    };
  })();

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto p-4"
    >
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900">
        Reservas
      </h1>

      {/* 🎭 Indicador de modo demo */}
        {cliente?.modo_demo && (
          <div className="mb-4 p-3 bg-orange-50 border-l-4 border-orange-400 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎭</span>
              <div>
                <p className="text-sm font-semibold text-orange-800">
                  Modo Demostración Activo
                </p>
                <p className="text-xs text-orange-600">
                  Las restricciones de tiempo están deshabilitadas para demostraciones
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total del Día</p>
              <p className="text-2xl font-bold">{resumen.total}</p>
            </div>
            <Calendar className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Cumplidas</p>
              <p className="text-2xl font-bold">{resumen.cumplidas}</p>
            </div>
            <CheckCircle className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pendientes</p>
              <p className="text-2xl font-bold">{resumen.pendientes}</p>
            </div>
            <Clock className="text-white opacity-80" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Incumplidas</p>
              <p className="text-2xl font-bold">{resumen.incumplidas}</p>
            </div>
            <XCircle className="text-white opacity-80" size={24} />
          </div>
        </div>
      </div>

      {/* Selector de fecha y controles */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Seleccionar fecha:</label>
            <div className="relative">
              <Calendar
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10"
                size={18}
              />
              <DatePicker
                selected={fechaSeleccionada}
                onChange={(date: Date) => setFechaSeleccionada(date)}
                dateFormat="yyyy-MM-dd"
                locale="es"
                className="pl-8 pr-2 py-2 border border-gray-300 rounded-md w-full text-sm text-gray-800 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setFechaSeleccionada(new Date(fechaSeleccionada.getTime() - 86400000))}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 hover:bg-gray-200 transition text-blue-600 font-medium"
            >
              ⇦ <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="text-center">
              <p className="font-semibold text-gray-800">
                {fechaSeleccionada.toLocaleDateString('es-CO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>

            <button
              onClick={() => setFechaSeleccionada(new Date(fechaSeleccionada.getTime() + 86400000))}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 hover:bg-gray-200 transition text-blue-600 font-medium"
            >
              <span className="hidden sm:inline">Siguiente</span> ⇨
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
              <div className="relative">
                <Filter className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={16} />
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value as 'todas' | 'pendiente' | 'cumplida' | 'incumplida')}
                  className="pl-7 pr-8 py-2 border border-gray-300 rounded-md w-full text-xs sm:text-sm text-gray-800 bg-white appearance-none"
                >
                  <option value="todas">Todas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="cumplida">Cumplidas</option>
                  <option value="incumplida">Incumplidas</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-gray-700">Buscar cliente:</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10" size={16} />
                <input
                  type="text"
                  placeholder="Nombre, apellido o teléfono"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-7 pr-2 py-2 border border-gray-300 rounded-md w-full text-xs sm:text-sm text-gray-800 bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando reservas...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {barberos.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <Users className="mx-auto mb-4 text-gray-400" size={48} />
              <p>No hay profesionales registrados.</p>
            </div>
          ) : (
            barberos.map((barbero) => {
              const reservasDelBarbero = reservas
                .filter(
                  (r) =>
                    r.id_barbero === barbero.id_barbero &&
                    r.fecha === fechaSeleccionadaStr &&
                    (filtroEstado === 'todas' || r.estado === filtroEstado) &&
                    (`${r.nombre} ${r.apellido} ${r.telefono}`.toLowerCase().includes(busqueda.toLowerCase()))
                )
                .sort((a, b) => {
                  const horaA = a.hora ?? ''
                  const horaB = b.hora ?? ''
                  return horaA.localeCompare(horaB)
                })

              const estaExpandido = expandedBarberoIds.includes(barbero.id_barbero);

              return (
                <motion.div 
                  key={barbero.id_barbero} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-2 border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleBarbero(barbero.id_barbero)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-full">
                          <Users className="text-white" size={18} />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-gray-800">
                            {barbero.nombre_barbero}
                          </h2>
                          <p className="text-sm text-gray-600">
                            {reservasDelBarbero.length} reserva{reservasDelBarbero.length !== 1 ? 's' : ''} para este día
                          </p>
                        </div>
                      </div>
                      <motion.span
                        animate={{ rotate: estaExpandido ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-gray-500"
                      >
                        <ChevronDown size={20} />
                      </motion.span>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {estaExpandido && (
                      <motion.div
                        key="contenido"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-gray-200"
                      >
                        {reservasDelBarbero.length === 0 ? (
                          <div className="p-6 text-center text-gray-600">
                            <Calendar className="mx-auto mb-3 text-gray-400" size={32} />
                            <p>No hay reservas para este día.</p>
                          </div>
                        ) : (
                          <div className="p-4 space-y-3">
                            {reservasDelBarbero.map((reserva) => (
                              <div
                                key={reserva.id}
                                className="border border-gray-200 p-4 rounded-lg bg-gray-50 hover:bg-white transition-colors"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 text-base">
                                      {reserva.nombre}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                      <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {reserva.hora}
                                      </span>
                                      {reserva.telefono && (
                                        <span className="flex items-center gap-1">
                                          📱 {reserva.telefono}
                                        </span>
                                      )}
                                    </div>
                                    {reserva.nota && (
                                      <p className="text-gray-600 text-sm mt-2 bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                                        📝 {reserva.nota}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col gap-1">
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-semibold ${obtenerColorEstado(reserva.estado)} w-fit`}
                                    >
                                      {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                                    </span>
                                    
                                    {/* Mostrar motivo para citas incumplidas */}
                                    {reserva.estado === 'incumplida' && reserva.razon_incumplida && (
                                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border-l-2 border-red-400">
                                        📝 {reserva.razon_incumplida}
                                      </span>
                                    )}
                                    
                                    {/* Mostrar servicio para citas cumplidas */}
                                    {reserva.estado === 'cumplida' && reserva.id_ser && (
                                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border-l-2 border-green-400">
                                        ✅ {obtenerNombreServicio(reserva.id_ser)}
                                      </span>
                                    )}

                                    {/* Mostrar info para citas reprogramadas */}
                                      {reserva.estado === 'reprogramada' && reserva.motivo_reprogramacion && (
                                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border-l-2 border-blue-400">
                                          🔄 {reserva.motivo_reprogramacion}
                                        </span>
                                      )}

                                  </div>
                                  
                                    

                                  {/* Botones para reservas pendientes */}
                                  {reserva.estado === 'pendiente' && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => abrirModalReprogramacion(reserva)}
                                      disabled={actualizando}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                      title="Reprogramar cita"
                                    >
                                      <RefreshCw size={18} />
                                    </button>

                                    <button
                                      onClick={() => {
                                        if (!puedeMarcarse(reserva.fecha, reserva.hora)) {
                                          toast.error('❌ No puedes marcar esta reserva como cumplida antes de la hora programada');
                                          return;
                                        }
                                        solicitarConfirmacion(reserva.id, 'cumplida', reserva);
                                      }}
                                      disabled={actualizando}
                                      className={`p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors ${
                                        !puedeMarcarse(reserva.fecha, reserva.hora) ? 'opacity-50' : ''
                                      }`}
                                      title="Marcar como cumplida"
                                    >
                                      <Check size={18} />
                                    </button>

                                    <button
                                      onClick={() => {
                                        if (!puedeMarcarse(reserva.fecha, reserva.hora)) {
                                          toast.error('❌ No puedes marcar esta reserva como incumplida antes de la hora programada');
                                          return;
                                        }
                                        solicitarConfirmacion(reserva.id, 'incumplida', reserva);
                                      }}
                                      disabled={actualizando}
                                      className={`p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors ${
                                        !puedeMarcarse(reserva.fecha, reserva.hora) ? 'opacity-50' : ''
                                      }`}
                                      title="Marcar como incumplida"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>
                                )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Modal de confirmación con selector de servicio */}
      {mostrandoConfirmacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              {mostrandoConfirmacion.nuevoEstado === 'cumplida' ? (
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              ) : (
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900">
                {mostrandoConfirmacion.nuevoEstado === 'cumplida' 
                  ? 'Confirmar Cita Cumplida' 
                  : 'Confirmar Cita Incumplida'
                }
              </h3>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Cliente:</strong> {mostrandoConfirmacion.nombreCliente}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Hora:</strong> {mostrandoConfirmacion.hora}
              </p>
            </div>

            {/* Selector de servicio para citas cumplidas */}
            {mostrandoConfirmacion.nuevoEstado === 'cumplida' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servicio realizado: <span className="text-red-500">*</span>
                </label>
                <select
                  value={servicioModal}
                  onChange={(e) => setServicioModal(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  required
                >
                  <option value="">Selecciona el servicio realizado</option>
                  {servicios.map((serv) => (
                    <option key={serv.id_ser} value={serv.id_ser}>
                      {serv.ser_nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <p className="text-sm text-gray-800 mb-4">
              ¿Estás seguro de marcar esta cita como <strong>
                {mostrandoConfirmacion.nuevoEstado === 'cumplida' ? 'CUMPLIDA' : 'INCUMPLIDA'}
              </strong>?
            </p>

            {/* Campos adicionales para citas incumplidas */}
            {mostrandoConfirmacion.nuevoEstado === 'incumplida' && (
              <div className="mb-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Razón: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={razonSeleccionada}
                    onChange={(e) => setRazonSeleccionada(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Selecciona una razón</option>
                    {razonesIncumplidas.map((razon) => (
                      <option key={razon} value={razon}>{razon}</option>
                    ))}
                  </select>
                </div>

                {razonSeleccionada === 'Otros motivos' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Especificar motivo: <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={justificacionIncumplida}
                      onChange={(e) => setJustificacionIncumplida(e.target.value)}
                      placeholder="Describe el motivo específico..."
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows={3}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setMostrandoConfirmacion(null);
                  setServicioModal('');
                }}
                disabled={actualizando}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
             </button>
             <button
               onClick={confirmarActualizacion}
               disabled={actualizando}
               className={`px-4 py-2 text-sm text-white rounded-md transition-colors ${
                 mostrandoConfirmacion.nuevoEstado === 'cumplida'
                   ? 'bg-green-600 hover:bg-green-700'
                   : 'bg-red-600 hover:bg-red-700'
               } ${actualizando ? 'opacity-50' : ''}`}
             >
               {actualizando ? 'Procesando...' : 'Confirmar'}
             </button>
           </div>
         </motion.div>
       </div>
     )}

    {/* Modal de Reprogramación */}
      {mostrandoReprogramacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <RefreshCw className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Reprogramar Cita
              </h3>
            </div>
            
            {/* Info de la cita original */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Cliente:</strong> {mostrandoReprogramacion.reserva.nombre}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Fecha actual:</strong> {new Date(mostrandoReprogramacion.reserva.fecha + 'T00:00:00').toLocaleDateString('es-CO', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Hora actual:</strong> {mostrandoReprogramacion.reserva.hora}
              </p>
            </div>

            {/* Vista previa del cambio */}
              {nuevaHoraReserva && (
                <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-sm font-semibold text-blue-900">
                    📅 Vista previa del cambio:
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    <strong>De:</strong> {new Date(mostrandoReprogramacion.reserva.fecha + 'T00:00:00').toLocaleDateString('es-CO', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })} {mostrandoReprogramacion.reserva.hora}
                    {' → '}
                    <strong>A:</strong> {nuevaFechaReserva.toLocaleDateString('es-CO', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })} {nuevaHoraReserva}
                  </p>
                </div>
              )}

            {/* Selector de fecha */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva fecha: <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={nuevaFechaReserva}
                onChange={(date: Date) => {
                  setNuevaFechaReserva(date);
                  setNuevaHoraReserva('');
                  obtenerHorariosDisponibles(mostrandoReprogramacion.reserva.id_barbero, date);
                }}
                dateFormat="yyyy-MM-dd"
                locale="es"
                minDate={new Date()}
                maxDate={(() => {
                  const maxDate = new Date();
                  maxDate.setDate(maxDate.getDate() + 30); // 🔥 Máximo 30 días de anticipación
                  return maxDate;
                })()}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Grid de horas disponibles */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva hora: <span className="text-red-500">*</span>
              </label>
              
              {cargandoHorarios ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Cargando horarios...</p>
                </div>
              ) : horariosDisponibles.length === 0 ? (
                <div className="text-center py-4 text-gray-600 bg-gray-50 rounded-lg">
                  <Clock className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm">No hay horarios disponibles para esta fecha</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {horariosDisponibles.map((hora) => (
                    <button
                      key={hora}
                      onClick={() => setNuevaHoraReserva(hora)}
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        nuevaHoraReserva === hora
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Motivo de reprogramación */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo de la reprogramación: <span className="text-red-500">*</span>
              </label>
              <textarea
                value={motivoReprogramacion}
                onChange={(e) => setMotivoReprogramacion(e.target.value)}
                placeholder="Ej: Cliente solicitó cambio de fecha, Disponibilidad del barbero, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                required
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setMostrandoReprogramacion(null);
                  setNuevaHoraReserva('');
                  setMotivoReprogramacion('');
                }}
                disabled={actualizando}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarReprogramacion}
                disabled={actualizando || !nuevaHoraReserva || !motivoReprogramacion.trim()}
                className={`px-4 py-2 text-sm text-white rounded-md transition-colors bg-blue-600 hover:bg-blue-700 ${
                  (actualizando || !nuevaHoraReserva || !motivoReprogramacion.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {actualizando ? 'Reprogramando...' : 'Confirmar Reprogramación'}
              </button>
            </div>
          </motion.div>
        </div>
      )} 

   </motion.div>
 );
}