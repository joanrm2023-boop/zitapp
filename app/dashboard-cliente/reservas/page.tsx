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

  const [mostrandoConfirmacion, setMostrandoConfirmacion] = useState<{
    idReserva: string;
    nuevoEstado: string;
    nombreCliente: string;
    hora: string;
  } | null>(null);
  const [justificacionIncumplida, setJustificacionIncumplida] = useState('');
  const [razonSeleccionada, setRazonSeleccionada] = useState('');
  const [servicioModal, setServicioModal] = useState('');

  const [mostrandoReprogramacion, setMostrandoReprogramacion] = useState<{ reserva: any; } | null>(null);
  const [nuevaFechaReserva, setNuevaFechaReserva] = useState<Date>(new Date());
  const [nuevaHoraReserva, setNuevaHoraReserva] = useState('');
  const [motivoReprogramacion, setMotivoReprogramacion] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string>('');

  const razonesIncumplidas = [
    "Cliente no se presentó",
    "Cliente llegó muy tarde",
    "Cliente canceló último momento",
    "Problema técnico/equipo",
    "Emergencia del barbero",
    "Otros motivos"
  ];

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const obtenerDatos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clienteData } = await supabase
        .from('clientes')
        .select('id_cliente, modo_demo')
        .eq('user_id', user.id)
        .single();

      if (!clienteData) { console.error('No se encontró el cliente'); setLoading(false); return; }

      setCliente(clienteData);
      const idCliente = clienteData.id_cliente;

      const { data: barberosData } = await supabase
        .from('barberos')
        .select('id_barbero, nombre_barbero')
        .eq('id_cliente', clienteData.id_cliente)
        .eq('activo', true)
        .neq('estado', 'eliminado');

      setBarberos(barberosData || []);

      const { data: reservasData } = await supabase
        .from('reservas')
        .select('*')
        .eq('id_cliente', idCliente);

      const ahora = new Date();
      const reservasVencidas = reservasData?.filter((r) => {
        if (r.estado !== 'pendiente') return false;
        const fechaHora = new Date(`${r.fecha}T${r.hora}`);
        const fechaHoraMas3Horas = new Date(fechaHora.getTime() + 3 * 60 * 60 * 1000);
        return fechaHoraMas3Horas < ahora;
      }) || [];

      for (const reserva of reservasVencidas) {
        await supabase.from('reservas').update({ estado: 'incumplida' }).eq('id', reserva.id);
      }

      const { data: serviciosData, error: serviciosError } = await supabase
        .from('servicios')
        .select('id_ser, ser_nombre')
        .eq('id_cliente', idCliente)
        .eq('ser_estado', 'activo');

      if (serviciosError) { console.error('Error cargando servicios:', serviciosError.message); }
      else { setServicios(serviciosData || []); }

      const { data: reservasActualizadas } = await supabase
        .from('reservas')
        .select('*')
        .eq('id_cliente', idCliente);

      setReservas(reservasActualizadas || []);
      setLoading(false);
    };

    obtenerDatos();
  }, []);

  const solicitarConfirmacion = (idReserva: string, nuevoEstado: string, reserva: any) => {
    setMostrandoConfirmacion({ idReserva, nuevoEstado, nombreCliente: reserva.nombre, hora: reserva.hora });
    setJustificacionIncumplida('');
    setRazonSeleccionada('');
    setServicioModal('');
  };

  const confirmarActualizacion = async () => {
    if (!mostrandoConfirmacion) return;
    const { idReserva, nuevoEstado } = mostrandoConfirmacion;
    if (nuevoEstado === 'cumplida' && !servicioModal) { toast.error('❌ Debes seleccionar un servicio antes de marcar como cumplida'); return; }
    if (nuevoEstado === 'incumplida') {
      if (!razonSeleccionada) { toast.error('❌ Debes seleccionar una razón para marcar como incumplida'); return; }
      if (razonSeleccionada === 'Otros motivos' && !justificacionIncumplida.trim()) { toast.error('❌ Debes especificar el motivo en el campo de comentarios'); return; }
    }
    setActualizando(true);
    const toastId = toast.loading('Actualizando reserva...');
    const datosActualizacion: any = { estado: nuevoEstado };
    if (nuevoEstado === 'cumplida') { datosActualizacion.id_ser = servicioModal; }
    else if (nuevoEstado === 'incumplida') {
      datosActualizacion.razon_incumplida = razonSeleccionada;
      datosActualizacion.comentario_incumplida = razonSeleccionada === 'Otros motivos' ? justificacionIncumplida.trim() : razonSeleccionada;
    }
    const { error } = await supabase.from('reservas').update(datosActualizacion).eq('id', idReserva);
    toast.dismiss(toastId);
    if (error) { console.error("❌ Error al actualizar el estado:", error); toast.error("Error al actualizar: " + error.message); }
    else {
      const mensajeExito = nuevoEstado === 'cumplida' ? 'Reserva marcada como cumplida ✅' : 'Reserva marcada como incumplida con justificación 📝';
      toast.success(mensajeExito);
      setReservas((prev) => prev.map((r) => r.id === idReserva ? { ...r, estado: nuevoEstado, id_ser: servicioModal, razon_incumplida: razonSeleccionada } : r));
    }
    setMostrandoConfirmacion(null);
    setJustificacionIncumplida('');
    setRazonSeleccionada('');
    setServicioModal('');
    setActualizando(false);
  };

  const obtenerHorariosDisponibles = async (idBarbero: string, fecha: Date) => {
    setCargandoHorarios(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // ✅ FIX: incluir id_cliente en el select para usarlo directamente
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('id_cliente, rango_horarios, intervalo_citas, horas_no_disponibles, dias_no_disponibles, modo_demo')
        .eq('user_id', user.id)
        .single();

      if (!clienteData) return;
      console.log('🔑 id_cliente usado para consulta:', clienteData.id_cliente); // ← agrega esto
      const fechaStr = fecha.toLocaleDateString('sv-SE');
      const diaSemana = fecha.toLocaleDateString('es-CO', { weekday: 'long' });
      const diasNoDisponibles = clienteData.dias_no_disponibles || [];
        if (diasNoDisponibles.includes(diaSemana)) {
          console.log('🛑 Día de semana no disponible:', diaSemana);
          setHorariosDisponibles([]);
          setCargandoHorarios(false);
          return;
        }
      // ✅ FIX: usar clienteData.id_cliente en vez de cliente.id_cliente
      const { data: diasBloqueadosData } = await supabase
        .from('dias_bloqueados')
        .select('fecha')
        .eq('id_cliente', clienteData.id_cliente);

      const fechasBloqueadas = diasBloqueadosData?.map(d => String(d.fecha).substring(0, 10)) || [];

      console.log("🚫 Fechas bloqueadas:", fechasBloqueadas);
      console.log("📅 Fecha a verificar:", fechaStr);
      console.log("❌ ¿Está bloqueada?:", fechasBloqueadas.includes(fechaStr));

      if (fechasBloqueadas.includes(fechaStr)) {
        setHorariosDisponibles([]);
        setCargandoHorarios(false);
        return;
      }

      const { data: reservasExistentes } = await supabase
        .from('reservas')
        .select('hora')
        .eq('id_barbero', idBarbero)
        .eq('fecha', fechaStr)
        .eq('estado', 'pendiente')
        .neq('id', mostrandoReprogramacion?.reserva?.id || 0);

      const horasOcupadas = reservasExistentes?.map(r => r.hora) || [];
      const rangoHorarios = clienteData.rango_horarios || {};
      const horarioDelDia = rangoHorarios[diaSemana] || { inicio: '08:00', fin: '18:00' };
      const intervalo = clienteData.intervalo_citas || 45;
      const horarios: string[] = [];
      let horaActual = horarioDelDia.inicio;

      while (horaActual < horarioDelDia.fin) {
        if (!horasOcupadas.includes(horaActual)) horarios.push(horaActual);
        const [h, m] = horaActual.split(':').map(Number);
        const minutosTotales = h * 60 + m + intervalo;
        const nuevaHora = Math.floor(minutosTotales / 60);
        const nuevosMinutos = minutosTotales % 60;
        horaActual = `${String(nuevaHora).padStart(2, '0')}:${String(nuevosMinutos).padStart(2, '0')}`;
      }

      const horasNoDisponiblesDia = clienteData.horas_no_disponibles?.[diaSemana] || [];
      let horasFiltradas = horarios.filter(hora => !horasNoDisponiblesDia.includes(hora));

      const ahora = new Date();
      const año = ahora.getFullYear();
      const mes = String(ahora.getMonth() + 1).padStart(2, '0');
      const dia = String(ahora.getDate()).padStart(2, '0');
      const fechaHoy = `${año}-${mes}-${dia}`;

      // ✅ FIX: usar clienteData.modo_demo en vez de cliente?.modo_demo
      if (fechaStr === fechaHoy && !clienteData.modo_demo) {
        const horaActualNum = ahora.getHours();
        const minutoActualNum = ahora.getMinutes();
        const minutosActuales = horaActualNum * 60 + minutoActualNum;
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

  const abrirModalReprogramacion = (reserva: any) => {
    setMostrandoReprogramacion({ reserva });
    setBarberoSeleccionado(reserva.id_barbero);
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(0, 0, 0, 0);
    setNuevaFechaReserva(manana);
    setNuevaHoraReserva('');
    setMotivoReprogramacion('');
    setHorariosDisponibles([]);
    obtenerHorariosDisponibles(reserva.id_barbero, manana);
  };

  const confirmarReprogramacion = async () => {
    if (!mostrandoReprogramacion) return;
    const { reserva } = mostrandoReprogramacion;
    if (!nuevaHoraReserva) { toast.error('❌ Debes seleccionar una nueva hora'); return; }
    if (!motivoReprogramacion.trim()) { toast.error('❌ Debes especificar el motivo de la reprogramación'); return; }
    setActualizando(true);
    const toastId = toast.loading('Reprogramando cita...');
    try {
      const nuevaFechaStr = nuevaFechaReserva.toLocaleDateString('sv-SE');
      const { data: nuevaReserva, error: errorNueva } = await supabase.from('reservas').insert({ nombre: reserva.nombre, correo: reserva.correo, telefono: reserva.telefono, fecha: nuevaFechaStr, hora: nuevaHoraReserva, id_cliente: reserva.id_cliente, id_barbero: barberoSeleccionado, id_ser: reserva.id_ser, nota: reserva.nota, estado: 'pendiente', id_reserva_original: reserva.id }).select().single();
      if (errorNueva) throw errorNueva;
      const { error: errorOriginal } = await supabase.from('reservas').update({ estado: 'reprogramada', id_reserva_nueva: nuevaReserva.id, fecha_reprogramacion: new Date().toISOString(), motivo_reprogramacion: motivoReprogramacion.trim() }).eq('id', reserva.id);
      if (errorOriginal) throw errorOriginal;
      toast.dismiss(toastId);
      toast.success('✅ Cita reprogramada exitosamente');
      setReservas((prev) => [...prev.map(r => r.id === reserva.id ? { ...r, estado: 'reprogramada', id_reserva_nueva: nuevaReserva.id, motivo_reprogramacion: motivoReprogramacion } : r), nuevaReserva]);
      setMostrandoReprogramacion(null);
      setNuevaHoraReserva('');
      setMotivoReprogramacion('');
    } catch (error: any) {
      toast.dismiss(toastId);
      console.error('Error reprogramando:', error);
      toast.error('❌ Error al reprogramar: ' + error.message);
    } finally { setActualizando(false); }
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'cumplida': return { bg: 'rgba(16,185,129,0.15)', color: '#6EE7B7', border: 'rgba(16,185,129,0.25)' };
      case 'incumplida': return { bg: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: 'rgba(239,68,68,0.25)' };
      case 'reprogramada': return { bg: 'rgba(37,99,235,0.15)', color: '#93C5FD', border: 'rgba(37,99,235,0.25)' };
      default: return { bg: 'rgba(251,191,36,0.15)', color: '#FDE68A', border: 'rgba(251,191,36,0.25)' };
    }
  };

  const obtenerNombreServicio = (idServicio: string) => {
    const servicio = servicios.find(s => s.id_ser === idServicio);
    return servicio ? servicio.ser_nombre : 'Servicio no encontrado';
  };

  const puedeMarcarse = (fecha: string, hora: string) => {
    if (cliente?.modo_demo) { console.log('🎭 Modo demo activo - Permitiendo marcar cita'); return true; }
    const ahora = new Date();
    const fechaHoraReserva = new Date(`${fecha}T${hora}`);
    return ahora >= fechaHoraReserva;
  };

  const toggleBarbero = (id: string) => {
    setExpandedBarberoIds((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
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
      style={{ maxWidth: 900, margin: '0 auto' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }

        .rs-card {
          background: #1E3A5C;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .rs-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #94A3B8;
          margin-bottom: 6px;
          display: block;
        }
        .rs-input {
          width: 100%;
          background: #0F2438;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 14px 10px 36px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .rs-input:focus { border-color: rgba(37,99,235,0.6); box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .rs-input::placeholder { color: #475569; }
        .rs-input-plain {
          width: 100%;
          background: #0F2438;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 14px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .rs-input-plain:focus { border-color: rgba(37,99,235,0.6); box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .rs-input-plain::placeholder { color: #475569; }
        .rs-textarea {
          width: 100%;
          background: #0F2438;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 14px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
          resize: vertical;
        }
        .rs-textarea:focus { border-color: rgba(37,99,235,0.6); box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .rs-textarea::placeholder { color: #475569; }
        .rs-select {
          width: 100%;
          background: #0F2438;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 32px 10px 36px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          appearance: none;
          cursor: pointer;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .rs-select:focus { border-color: rgba(37,99,235,0.6); box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .rs-select option { background: #0F2438; color: white; }
        .rs-select-plain {
          width: 100%;
          background: #0F2438;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 32px 10px 14px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          appearance: none;
          cursor: pointer;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .rs-select-plain:focus { border-color: rgba(37,99,235,0.6); }
        .rs-select-plain option { background: #0F2438; color: white; }
        .rs-input-wrap { position: relative; }
        .rs-input-wrap > svg:first-child { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #475569; pointer-events: none; z-index: 1; }
        .rs-chevron { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #475569; pointer-events: none; }
        .rs-btn-primary {
          background: #2563EB;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(37,99,235,0.3);
        }
        .rs-btn-primary:hover:not(:disabled) { background: #1D4ED8; transform: translateY(-1px); }
        .rs-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .rs-btn-neutral {
          background: rgba(255,255,255,0.06);
          color: #94A3B8;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 20px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .rs-btn-neutral:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: white; }
        .rs-btn-neutral:disabled { opacity: 0.5; cursor: not-allowed; }
        .rs-btn-nav {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 8px 16px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #60A5FA;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .rs-btn-nav:hover { background: rgba(37,99,235,0.15); border-color: rgba(37,99,235,0.3); }
        .rs-btn-icon {
          background: none;
          border: none;
          border-radius: 8px;
          padding: 7px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rs-btn-check { color: #34D399; }
        .rs-btn-check:hover { background: rgba(16,185,129,0.15); }
        .rs-btn-check:disabled { opacity: 0.4; cursor: not-allowed; }
        .rs-btn-x { color: #FCA5A5; }
        .rs-btn-x:hover { background: rgba(239,68,68,0.15); }
        .rs-btn-x:disabled { opacity: 0.4; cursor: not-allowed; }
        .rs-btn-refresh { color: #60A5FA; }
        .rs-btn-refresh:hover { background: rgba(37,99,235,0.15); }
        .rs-btn-refresh:disabled { opacity: 0.4; cursor: not-allowed; }
        .rs-barbero-card {
          background: #1E3A5C;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: border-color 0.2s;
        }
        .rs-barbero-card:hover { border-color: rgba(37,99,235,0.25); }
        .rs-barbero-header {
          width: 100%;
          padding: 16px 20px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
          text-align: left;
        }
        .rs-barbero-header:hover { background: rgba(255,255,255,0.03); }
        .rs-reserva-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 14px;
          transition: background 0.2s, border-color 0.2s;
        }
        .rs-reserva-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(37,99,235,0.2); }
        .rs-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          border: 1px solid;
        }
        .rs-nota {
          background: rgba(37,99,235,0.08);
          border-left: 3px solid #2563EB;
          border-radius: 6px;
          padding: 8px 12px;
          margin-top: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #94A3B8;
        }
        .rs-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 16px;
        }
        .rs-modal {
          background: #1E3A5C;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 28px;
          width: 100%;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
          max-height: 90vh;
          overflow-y: auto;
        }
        .rs-modal-title {
          font-family: 'Syne', sans-serif;
          font-size: 19px;
          font-weight: 800;
          color: white;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .rs-modal-info {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 16px;
        }
        .rs-modal-info p { font-family: 'DM Sans', sans-serif; font-size: 13px; color: #94A3B8; margin: 2px 0; }
        .rs-modal-info strong { color: white; }
        .rs-hora-btn {
          padding: 8px 6px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(255,255,255,0.04);
          color: #CBD5E1;
        }
        .rs-hora-btn:hover { background: rgba(37,99,235,0.15); border-color: rgba(37,99,235,0.3); color: white; }
        .rs-hora-btn-active { background: #2563EB !important; color: white !important; border-color: #2563EB !important; box-shadow: 0 4px 12px rgba(37,99,235,0.4); }
        .rs-preview {
          background: rgba(37,99,235,0.08);
          border-left: 3px solid #2563EB;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 16px;
        }
        .rs-demo-banner {
          background: rgba(249,115,22,0.1);
          border-left: 3px solid #F97316;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        /* DatePicker overrides */
        .react-datepicker { background: #0F2438 !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 12px !important; font-family: 'DM Sans', sans-serif !important; }
        .react-datepicker__header { background: #162033 !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; }
        .react-datepicker__current-month, .react-datepicker__day-name { color: white !important; }
        .react-datepicker__day { color: #CBD5E1 !important; }
        .react-datepicker__day:hover { background: rgba(37,99,235,0.2) !important; border-radius: 6px !important; }
        .react-datepicker__day--selected { background: #2563EB !important; color: white !important; border-radius: 6px !important; }
        .react-datepicker__day--disabled { color: #334155 !important; }
        .react-datepicker__navigation-icon::before { border-color: #94A3B8 !important; }
        @media (max-width: 640px) {
          .rs-grid-4 { grid-template-columns: 1fr 1fr !important; }
          .rs-grid-2 { grid-template-columns: 1fr !important; }
          .rs-hora-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>

      {/* ── Título ── */}
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: 'white', textAlign: 'center', marginBottom: 20 }}>
        Reservas
      </h1>

      {/* ── Banner modo demo ── */}
      {cliente?.modo_demo && (
        <div className="rs-demo-banner">
          <span style={{ fontSize: 24 }}>🎭</span>
          <div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#FB923C' }}>Modo Demostración Activo</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#94A3B8' }}>Las restricciones de tiempo están deshabilitadas para demostraciones</p>
          </div>
        </div>
      )}

      {/* ── Estadísticas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }} className="rs-grid-4">
        {[
          { label: 'Total del Día', value: resumen.total, icon: Calendar, grad: 'linear-gradient(135deg, #1D4ED8, #2563EB)' },
          { label: 'Cumplidas', value: resumen.cumplidas, icon: CheckCircle, grad: 'linear-gradient(135deg, #059669, #10B981)' },
          { label: 'Pendientes', value: resumen.pendientes, icon: Clock, grad: 'linear-gradient(135deg, #D97706, #F59E0B)' },
          { label: 'Incumplidas', value: resumen.incumplidas, icon: XCircle, grad: 'linear-gradient(135deg, #DC2626, #EF4444)' },
        ].map((s) => (
          <div key={s.label} style={{ background: s.grad, padding: 14, borderRadius: 14, color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, opacity: 0.85, marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
              </div>
              <s.icon size={20} style={{ opacity: 0.8 }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Controles fecha y filtros ── */}
      <div className="rs-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <label className="rs-label">Seleccionar fecha:</label>
            <div className="rs-input-wrap">
              <Calendar size={16} />
              <DatePicker selected={fechaSeleccionada} onChange={(date: Date) => setFechaSeleccionada(date)} dateFormat="yyyy-MM-dd" locale="es" className="rs-input" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setFechaSeleccionada(new Date(fechaSeleccionada.getTime() - 86400000))} className="rs-btn-nav">⇦ <span>Anterior</span></button>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'white', fontSize: 15 }}>
                {fechaSeleccionada.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <button onClick={() => setFechaSeleccionada(new Date(fechaSeleccionada.getTime() + 86400000))} className="rs-btn-nav"><span>Siguiente</span> ⇨</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: '100%' }} className="rs-grid-2">
            <div>
              <label className="rs-label">Filtrar por estado:</label>
              <div className="rs-input-wrap">
                <Filter size={15} />
                <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as 'todas' | 'pendiente' | 'cumplida' | 'incumplida')} className="rs-select">
                  <option value="todas">Todas</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="cumplida">Cumplidas</option>
                  <option value="incumplida">Incumplidas</option>
                </select>
                <svg className="rs-chevron" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
            <div>
              <label className="rs-label">Buscar cliente:</label>
              <div className="rs-input-wrap">
                <Search size={15} />
                <input type="text" placeholder="Nombre, apellido o teléfono" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="rs-input" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lista barberos y reservas ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(37,99,235,0.2)', borderTop: '3px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748B', fontSize: 14 }}>Cargando reservas...</p>
        </div>
      ) : (
        <div>
          {barberos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#475569' }}>
              <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15 }}>No hay profesionales registrados.</p>
            </div>
          ) : (
            barberos.map((barbero) => {
              const reservasDelBarbero = reservas
                .filter((r) =>
                  r.id_barbero === barbero.id_barbero &&
                  r.fecha === fechaSeleccionadaStr &&
                  (filtroEstado === 'todas' || r.estado === filtroEstado) &&
                  (`${r.nombre} ${r.apellido} ${r.telefono}`.toLowerCase().includes(busqueda.toLowerCase()))
                )
                .sort((a, b) => { const horaA = a.hora ?? ''; const horaB = b.hora ?? ''; return horaA.localeCompare(horaB); });

              const estaExpandido = expandedBarberoIds.includes(barbero.id_barbero);

              return (
                <motion.div key={barbero.id_barbero} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rs-barbero-card">
                  <button onClick={() => toggleBarbero(barbero.id_barbero)} className="rs-barbero-header" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #38BDF8)', padding: 8, borderRadius: '50%' }}>
                          <Users size={16} color="white" />
                        </div>
                        <div>
                          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 16 }}>{barbero.nombre_barbero}</h2>
                          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748B', fontSize: 13 }}>
                            {reservasDelBarbero.length} reserva{reservasDelBarbero.length !== 1 ? 's' : ''} para este día
                          </p>
                        </div>
                      </div>
                      <motion.span animate={{ rotate: estaExpandido ? 180 : 0 }} transition={{ duration: 0.3 }} style={{ color: '#64748B' }}>
                        <ChevronDown size={20} />
                      </motion.span>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {estaExpandido && (
                      <motion.div key="contenido" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {reservasDelBarbero.length === 0 ? (
                          <div style={{ padding: '28px', textAlign: 'center', color: '#475569' }}>
                            <Calendar size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>No hay reservas para este día.</p>
                          </div>
                        ) : (
                          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {reservasDelBarbero.map((reserva) => {
                              const colorEstado = obtenerColorEstado(reserva.estado);
                              return (
                                <div key={reserva.id} className="rs-reserva-item">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div style={{ flex: 1 }}>
                                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 15, marginBottom: 4 }}>{reserva.nombre}</h3>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                          <Clock size={12} /> {reserva.hora}
                                        </span>
                                        {reserva.telefono && (
                                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#94A3B8' }}>📱 {reserva.telefono}</span>
                                        )}
                                      </div>
                                      {reserva.nota && <div className="rs-nota">📝 {reserva.nota}</div>}
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                      <span className="rs-badge" style={{ background: colorEstado.bg, color: colorEstado.color, borderColor: colorEstado.border }}>
                                        {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                                      </span>
                                      {reserva.estado === 'incumplida' && reserva.razon_incumplida && (
                                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#FCA5A5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderLeft: '2px solid #EF4444', padding: '4px 10px', borderRadius: 6 }}>
                                          📝 {reserva.razon_incumplida}
                                        </span>
                                      )}
                                      {reserva.estado === 'cumplida' && reserva.id_ser && (
                                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#6EE7B7', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderLeft: '2px solid #10B981', padding: '4px 10px', borderRadius: 6 }}>
                                          ✅ {obtenerNombreServicio(reserva.id_ser)}
                                        </span>
                                      )}
                                      {reserva.estado === 'reprogramada' && reserva.motivo_reprogramacion && (
                                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#93C5FD', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderLeft: '2px solid #2563EB', padding: '4px 10px', borderRadius: 6 }}>
                                          🔄 {reserva.motivo_reprogramacion}
                                        </span>
                                      )}
                                    </div>
                                    {reserva.estado === 'pendiente' && (
                                      <div style={{ display: 'flex', gap: 4 }}>
                                        <button onClick={() => abrirModalReprogramacion(reserva)} disabled={actualizando} className="rs-btn-icon rs-btn-refresh" title="Reprogramar cita">
                                          <RefreshCw size={17} />
                                        </button>
                                        <button
                                          onClick={() => { if (!puedeMarcarse(reserva.fecha, reserva.hora)) { toast.error('❌ No puedes marcar esta reserva como cumplida antes de la hora programada'); return; } solicitarConfirmacion(reserva.id, 'cumplida', reserva); }}
                                          disabled={actualizando} className="rs-btn-icon rs-btn-check" style={{ opacity: !puedeMarcarse(reserva.fecha, reserva.hora) ? 0.4 : 1 }} title="Marcar como cumplida"
                                        >
                                          <Check size={17} />
                                        </button>
                                        <button
                                          onClick={() => { if (!puedeMarcarse(reserva.fecha, reserva.hora)) { toast.error('❌ No puedes marcar esta reserva como incumplida antes de la hora programada'); return; } solicitarConfirmacion(reserva.id, 'incumplida', reserva); }}
                                          disabled={actualizando} className="rs-btn-icon rs-btn-x" style={{ opacity: !puedeMarcarse(reserva.fecha, reserva.hora) ? 0.4 : 1 }} title="Marcar como incumplida"
                                        >
                                          <X size={17} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
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

      {/* ── Modal confirmación ── */}
      {mostrandoConfirmacion && (
        <div className="rs-modal-overlay">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rs-modal" style={{ maxWidth: 460 }}>
            <div className="rs-modal-title">
              {mostrandoConfirmacion.nuevoEstado === 'cumplida' ? (
                <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: 8, borderRadius: '50%' }}>
                  <CheckCircle size={20} color="#34D399" />
                </div>
              ) : (
                <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', padding: 8, borderRadius: '50%' }}>
                  <AlertCircle size={20} color="#FCA5A5" />
                </div>
              )}
              {mostrandoConfirmacion.nuevoEstado === 'cumplida' ? 'Confirmar Cita Cumplida' : 'Confirmar Cita Incumplida'}
            </div>
            <div className="rs-modal-info">
              <p><strong>Cliente:</strong> {mostrandoConfirmacion.nombreCliente}</p>
              <p><strong>Hora:</strong> {mostrandoConfirmacion.hora}</p>
            </div>
            {mostrandoConfirmacion.nuevoEstado === 'cumplida' && (
              <div style={{ marginBottom: 16 }}>
                <label className="rs-label">Servicio realizado: <span style={{ color: '#FCA5A5' }}>*</span></label>
                <div className="rs-input-wrap">
                  <select value={servicioModal} onChange={(e) => setServicioModal(e.target.value)} className="rs-select-plain" style={{ paddingLeft: 14 }}>
                    <option value="">Selecciona el servicio realizado</option>
                    {servicios.map((serv) => (<option key={serv.id_ser} value={serv.id_ser}>{serv.ser_nombre}</option>))}
                  </select>
                  <svg className="rs-chevron" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            )}
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#94A3B8', marginBottom: 16 }}>
              ¿Estás seguro de marcar esta cita como{' '}
              <strong style={{ color: mostrandoConfirmacion.nuevoEstado === 'cumplida' ? '#34D399' : '#FCA5A5' }}>
                {mostrandoConfirmacion.nuevoEstado === 'cumplida' ? 'CUMPLIDA' : 'INCUMPLIDA'}
              </strong>?
            </p>
            {mostrandoConfirmacion.nuevoEstado === 'incumplida' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                <div>
                  <label className="rs-label">Razón: <span style={{ color: '#FCA5A5' }}>*</span></label>
                  <div className="rs-input-wrap">
                    <select value={razonSeleccionada} onChange={(e) => setRazonSeleccionada(e.target.value)} className="rs-select-plain" style={{ paddingLeft: 14 }}>
                      <option value="">Selecciona una razón</option>
                      {razonesIncumplidas.map((razon) => (<option key={razon} value={razon}>{razon}</option>))}
                    </select>
                    <svg className="rs-chevron" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
                {razonSeleccionada === 'Otros motivos' && (
                  <div>
                    <label className="rs-label">Especificar motivo: <span style={{ color: '#FCA5A5' }}>*</span></label>
                    <textarea value={justificacionIncumplida} onChange={(e) => setJustificacionIncumplida(e.target.value)} placeholder="Describe el motivo específico..." className="rs-textarea" rows={3} />
                  </div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setMostrandoConfirmacion(null); setServicioModal(''); }} disabled={actualizando} className="rs-btn-neutral">Cancelar</button>
              <button onClick={confirmarActualizacion} disabled={actualizando} className="rs-btn-primary" style={{ background: mostrandoConfirmacion.nuevoEstado === 'cumplida' ? '#059669' : '#DC2626', boxShadow: mostrandoConfirmacion.nuevoEstado === 'cumplida' ? '0 4px 16px rgba(5,150,105,0.3)' : '0 4px 16px rgba(220,38,38,0.3)' }}>
                {actualizando ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Modal reprogramación ── */}
      {mostrandoReprogramacion && (
        <div className="rs-modal-overlay">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rs-modal" style={{ maxWidth: 560 }}>
            <div className="rs-modal-title">
              <div style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', padding: 8, borderRadius: '50%' }}>
                <RefreshCw size={20} color="#60A5FA" />
              </div>
              Reprogramar Cita
            </div>
            <div className="rs-modal-info">
              <p><strong>Cliente:</strong> {mostrandoReprogramacion.reserva.nombre}</p>
              <p><strong>Fecha actual:</strong> {new Date(mostrandoReprogramacion.reserva.fecha + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              <p><strong>Hora actual:</strong> {mostrandoReprogramacion.reserva.hora}</p>
            </div>

            {barberos.length > 1 && (
              <div style={{ marginBottom: 16 }}>
                <label className="rs-label">Profesional: <span style={{ color: '#FCA5A5' }}>*</span></label>
                <div className="rs-input-wrap">
                  <Users size={15} />
                  <select value={barberoSeleccionado} onChange={(e) => { setBarberoSeleccionado(e.target.value); setNuevaHoraReserva(''); obtenerHorariosDisponibles(e.target.value, nuevaFechaReserva); }} className="rs-select">
                    {barberos.map((barbero) => (<option key={barbero.id_barbero} value={barbero.id_barbero}>{barbero.nombre_barbero}</option>))}
                  </select>
                  <svg className="rs-chevron" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            )}

            {nuevaHoraReserva && (
              <div className="rs-preview">
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700, color: '#60A5FA', marginBottom: 4 }}>📅 Vista previa del cambio:</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#93C5FD' }}>
                  <strong>De:</strong> {new Date(mostrandoReprogramacion.reserva.fecha + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })} {mostrandoReprogramacion.reserva.hora}
                  {' → '}
                  <strong>A:</strong> {nuevaFechaReserva.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })} {nuevaHoraReserva}
                </p>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label className="rs-label">Nueva fecha: <span style={{ color: '#FCA5A5' }}>*</span></label>
              <DatePicker
                selected={nuevaFechaReserva}
                onChange={(date: Date) => { setNuevaFechaReserva(date); setNuevaHoraReserva(''); obtenerHorariosDisponibles(barberoSeleccionado, date); }}
                dateFormat="yyyy-MM-dd"
                locale="es"
                minDate={new Date()}
                maxDate={(() => { const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 30); return maxDate; })()}
                className="rs-input-plain"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="rs-label">Nueva hora: <span style={{ color: '#FCA5A5' }}>*</span></label>
              {cargandoHorarios ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: 24, height: 24, border: '2px solid rgba(37,99,235,0.2)', borderTop: '2px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#64748B' }}>Cargando horarios...</p>
                </div>
              ) : horariosDisponibles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#475569' }}>
                  <Clock size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>Este día no está disponible. Selecciona otra fecha.</p>
                </div>
              ) : (
                <div className="rs-hora-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, maxHeight: 180, overflowY: 'auto', padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                  {horariosDisponibles.map((hora) => (
                    <button key={hora} onClick={() => setNuevaHoraReserva(hora)} className={`rs-hora-btn ${nuevaHoraReserva === hora ? 'rs-hora-btn-active' : ''}`}>
                      {hora}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="rs-label">Motivo de la reprogramación: <span style={{ color: '#FCA5A5' }}>*</span></label>
              <textarea value={motivoReprogramacion} onChange={(e) => setMotivoReprogramacion(e.target.value)} placeholder="Ej: Cliente solicitó cambio de fecha, Disponibilidad del barbero, etc." className="rs-textarea" rows={3} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setMostrandoReprogramacion(null); setNuevaHoraReserva(''); setMotivoReprogramacion(''); }} disabled={actualizando} className="rs-btn-neutral">Cancelar</button>
              <button onClick={confirmarReprogramacion} disabled={actualizando || !nuevaHoraReserva || !motivoReprogramacion.trim()} className="rs-btn-primary" style={{ opacity: (actualizando || !nuevaHoraReserva || !motivoReprogramacion.trim()) ? 0.5 : 1 }}>
                {actualizando ? 'Reprogramando...' : 'Confirmar Reprogramación'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}