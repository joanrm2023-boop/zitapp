'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Lock, Eye, EyeOff, Calendar, Settings, Store, Link2, Copy, Globe, TrendingUp, CreditCard } from 'lucide-react';
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export default function MiNegocioPage() {
  const [mounted, setMounted] = useState(false);
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [rangoInicio, setRangoInicio] = useState('10:00');
  const [rangoFin, setRangoFin] = useState('20:00');
  const [intervalo, setIntervalo] = useState(45);
  const [diasNoDisponibles, setDiasNoDisponibles] = useState<string[]>([]);
  const [horasNoDisponibles, setHorasNoDisponibles] = useState<Record<string, string[]>>({});
  const [diasAbiertos, setDiasAbiertos] = useState<Record<string, boolean>>({});
  const [bloques, setBloques] = useState<Record<string, string[]>>({});
  const [intervaloInvalido, setIntervaloInvalido] = useState(false);
  const [mensajeVisible, setMensajeVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [mesActual, setMesActual] = useState(new Date());
  const [diasBloqueadosEspecificos, setDiasBloqueadosEspecificos] = useState<string[]>([]);
  const [cargandoDiasBloqueados, setCargandoDiasBloqueados] = useState(false);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [contrasenaNueva, setContrasenaNueva] = useState('');
  const [contrasenaConfirmar, setContrasenaConfirmar] = useState('');
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [cambiandoContrasena, setCambiandoContrasena] = useState(false);

  const [modalConflicto, setModalConflicto] = useState<{
    visible: boolean;
    citas: any[];
  }>({ visible: false, citas: [] });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    generarBloques();
    const abiertos: Record<string, boolean> = {};
    for (const dia of diasSemana) {
      if (horasNoDisponibles[dia]?.length > 0) abiertos[dia] = true;
    }
    setDiasAbiertos(abiertos);
  }, [rangoInicio, rangoFin, intervalo, diasNoDisponibles]);

  useEffect(() => {
    const obtenerDatos = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('clientes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setCliente(data);
        setNombre(data.nombre);
        setCorreo(data.correo);
        const diasConHorario = Object.keys(data.rango_horarios || {});
        const primerDia = diasConHorario[0];
        const horario = data.rango_horarios?.[primerDia] || { inicio: '10:00', fin: '20:00' };
        setRangoInicio(horario.inicio);
        setRangoFin(horario.fin);
        setIntervalo(data.intervalo_citas || 45);
        setDiasNoDisponibles(data.dias_no_disponibles || []);
        setHorasNoDisponibles(data.horas_no_disponibles || {});
      }
      setLoading(false);
    };
    obtenerDatos();
  }, []);

  useEffect(() => {
    if (cliente) { cargarDiasBloqueados(); }
  }, [cliente]);


  const generarBloques = () => {
    const start = convertirAHoras(rangoInicio);
    const end = convertirAHoras(rangoFin);
    if (!intervalo || intervalo < 5 || isNaN(intervalo)) { setIntervaloInvalido(true); return; }
    setIntervaloInvalido(false);
    let bloquesGenerados: Record<string, string[]> = {};
    diasSemana.forEach((dia) => {
      if (diasNoDisponibles.includes(dia)) return;
      let actual = start;
      let bloquesDia: string[] = [];
      while (actual < end) { bloquesDia.push(convertirATexto(actual)); actual += intervalo; }
      bloquesGenerados[dia] = bloquesDia;
    });
    setBloques(bloquesGenerados);
  };

  const convertirAHoras = (str: string) => { const [h, m] = str.split(':').map(Number); return h * 60 + m; };
  const convertirATexto = (mins: number) => { const h = String(Math.floor(mins / 60)).padStart(2, '0'); const m = String(mins % 60).padStart(2, '0'); return `${h}:${m}`; };
  const toggleDia = (dia: string) => { setDiasAbiertos((prev) => ({ ...prev, [dia]: !prev[dia] })); };

  const toggleHora = (dia: string, hora: string) => {
    setHorasNoDisponibles((prev) => {
      const actuales = prev[dia] || [];
      const nuevas = actuales.includes(hora) ? actuales.filter((h) => h !== hora) : [...actuales, hora];
      setDiasAbiertos((prevAbiertos) => ({ ...prevAbiertos, [dia]: nuevas.length > 0 }));
      return { ...prev, [dia]: nuevas };
    });
  };

  const verificarConflictosHorario = async () => {
    if (!cliente) return { hayConflicto: false, citasAfectadas: [] };
    const { data: clienteActual } = await supabase.from('clientes').select('dias_no_disponibles, horas_no_disponibles').eq('id_cliente', cliente.id_cliente).single();
    console.log('🔍 Datos actuales en BD:', clienteActual);
    console.log('🔍 Días NO disponibles (nuevo):', diasNoDisponibles);
    console.log('🔍 Horas NO disponibles (nuevo):', horasNoDisponibles);
    const hoy = new Date().toISOString().split('T')[0];
    const { data: reservasPendientes, error } = await supabase.from('reservas').select('id, nombre, correo, identificacion, telefono, fecha, hora, id_barbero').eq('id_cliente', cliente.id_cliente).eq('estado', 'pendiente').gte('fecha', hoy);
    console.log('📅 Reservas pendientes encontradas:', reservasPendientes);
    if (error) { console.error('Error consultando reservas:', error); return { hayConflicto: false, citasAfectadas: [] }; }
    const diasNoDisponiblesActuales = clienteActual.dias_no_disponibles || [];
    const horasNoDisponiblesActuales = clienteActual.horas_no_disponibles || {};
    const citasAfectadas: any[] = [];
    reservasPendientes?.forEach((reserva) => {
      const diaSemana = obtenerDiaSemana(reserva.fecha);
      console.log(`🔄 Procesando reserva: ${reserva.nombre} - Fecha: ${reserva.fecha} - Día: ${diaSemana}`);
      const diaSeBloqueoAhora = diasNoDisponibles.includes(diaSemana) && !diasNoDisponiblesActuales.includes(diaSemana);
      if (diaSeBloqueoAhora) { citasAfectadas.push(reserva); return; }
      const horaAhoraBloqueada = horasNoDisponibles[diaSemana]?.includes(reserva.hora);
      const horaEstabaBloqueada = horasNoDisponiblesActuales[diaSemana]?.includes(reserva.hora);
      if (horaAhoraBloqueada && !horaEstabaBloqueada) { citasAfectadas.push(reserva); }
    });
    console.log('🎯 TOTAL citas afectadas:', citasAfectadas);
    return { hayConflicto: citasAfectadas.length > 0, citasAfectadas };
  };

  const cargarDiasBloqueados = async () => {
    if (!cliente) return;
    setCargandoDiasBloqueados(true);
    try {
      const { data, error } = await supabase.from('dias_bloqueados').select('fecha').eq('id_cliente', cliente.id_cliente);
      if (error) throw error;
      setDiasBloqueadosEspecificos(data?.map(d => d.fecha) || []);
    } catch (error) { console.error('Error cargando días bloqueados:', error); }
    finally { setCargandoDiasBloqueados(false); }
  };

  const toggleDiaBloqueado = async (fecha: string) => {
    if (!cliente) return;
    const yaEstaBloqueado = diasBloqueadosEspecificos.includes(fecha);
    try {
      if (yaEstaBloqueado) {
        const { error } = await supabase.from('dias_bloqueados').delete().eq('id_cliente', cliente.id_cliente).eq('fecha', fecha);
        if (error) throw error;
        setDiasBloqueadosEspecificos(prev => prev.filter(f => f !== fecha));
        toast.success('✅ Día desbloqueado');
      } else {
        const { data: citasEnFecha, error: errorCitas } = await supabase.from('reservas').select('id, nombre, correo, telefono, hora').eq('id_cliente', cliente.id_cliente).eq('fecha', fecha).eq('estado', 'pendiente');
        if (errorCitas) { toast.error('Error al verificar citas existentes'); return; }
        if (citasEnFecha && citasEnFecha.length > 0) {
          setModalConflicto({ visible: true, citas: citasEnFecha.map(cita => ({ ...cita, fecha, id_barbero: null })) });
          toast.error(`❌ No puedes bloquear este día. Hay ${citasEnFecha.length} cita${citasEnFecha.length > 1 ? 's' : ''} pendiente${citasEnFecha.length > 1 ? 's' : ''}`);
          return;
        }
        const { error } = await supabase.from('dias_bloqueados').insert({ id_cliente: cliente.id_cliente, fecha });
        if (error) throw error;
        setDiasBloqueadosEspecificos(prev => [...prev, fecha]);
        toast.success('✅ Día bloqueado');
      }
    } catch (error) { console.error('Error:', error); toast.error('Error al actualizar el día'); }
  };

  const generarDiasDelMes = () => {
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const dias: Array<Date | null> = [];
    const diaSemanaInicio = primerDia.getDay();
    const diasVaciosInicio = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1;
    for (let i = 0; i < diasVaciosInicio; i++) dias.push(null);
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) dias.push(new Date(año, mes, dia));
    return dias;
  };

  const cambiarMes = (direccion: number) => {
    setMesActual(prev => { const nuevo = new Date(prev); nuevo.setMonth(nuevo.getMonth() + direccion); return nuevo; });
  };

  const formatearFecha = (fecha: Date): string => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  const esDiaPasado = (fecha: Date): boolean => {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const fechaComparar = new Date(fecha); fechaComparar.setHours(0, 0, 0, 0);
    return fechaComparar < hoy;
  };

  const obtenerDiaSemana = (fecha: string): string => {
    const diasMap = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return diasMap[new Date(fecha + 'T00:00:00').getDay()];
  };

  const handleGuardar = async () => {
    if (!cliente || guardando) return;
    setGuardando(true);
    try {
      const { data: datosActuales } = await supabase.from('clientes').select('dias_no_disponibles, horas_no_disponibles, rango_horarios, intervalo_citas').eq('id_cliente', cliente.id_cliente).single();
      const huboCAmbios = JSON.stringify(datosActuales.dias_no_disponibles || []) !== JSON.stringify(diasNoDisponibles) || JSON.stringify(datosActuales.horas_no_disponibles || {}) !== JSON.stringify(horasNoDisponibles) || datosActuales.intervalo_citas !== intervalo;
      if (!huboCAmbios) { toast.error('No hay cambios para guardar'); return; }
      const { hayConflicto, citasAfectadas } = await verificarConflictosHorario();
      if (hayConflicto) {
        setModalConflicto({ visible: true, citas: citasAfectadas });
        setDiasNoDisponibles(datosActuales.dias_no_disponibles || []);
        setHorasNoDisponibles(datosActuales.horas_no_disponibles || {});
        const abiertos: Record<string, boolean> = {};
        for (const dia of diasSemana) abiertos[dia] = false;
        setDiasAbiertos(abiertos);
        return;
      }
      const rangoPorDia: Record<string, { inicio: string; fin: string }> = {};
      diasSemana.forEach((dia) => { if (!diasNoDisponibles.includes(dia)) rangoPorDia[dia] = { inicio: rangoInicio, fin: rangoFin }; });
      const horasFiltradas: Record<string, string[]> = {};
      Object.entries(horasNoDisponibles).forEach(([dia, horas]) => { if (horas.length > 0) horasFiltradas[dia] = horas; });
      const res = await supabase.from('clientes').update({ rango_horarios: rangoPorDia, intervalo_citas: intervalo, dias_no_disponibles: diasNoDisponibles, horas_no_disponibles: horasFiltradas }).eq('id_cliente', cliente.id_cliente);
      if (res.error) { toast.error('Error al guardar: ' + res.error.message); }
      else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setMensajeVisible(true);
        setTimeout(() => setMensajeVisible(false), 3000);
        const { data } = await supabase.from('clientes').select('*').eq('id_cliente', cliente.id_cliente).maybeSingle();
        if (data) {
          const diasConHorario = Object.keys(data.rango_horarios || {});
          const primerDia = diasConHorario[0];
          const horario = data.rango_horarios?.[primerDia] || { inicio: '10:00', fin: '20:00' };
          setRangoInicio(horario.inicio); setRangoFin(horario.fin); setIntervalo(data.intervalo_citas || 45);
          setDiasNoDisponibles(data.dias_no_disponibles || []); setHorasNoDisponibles(data.horas_no_disponibles || {});
          const abiertos: Record<string, boolean> = {};
          for (const dia of diasSemana) abiertos[dia] = false;
          setDiasAbiertos(abiertos);
        }
      }
    } finally { setGuardando(false); }
  };

  const handleCambiarContrasena = async () => {
    if (!contrasenaActual || !contrasenaNueva || !contrasenaConfirmar) { toast.error("Por favor completa todos los campos"); return; }
    if (contrasenaNueva.length < 6) { toast.error("La nueva contraseña debe tener al menos 6 caracteres"); return; }
    if (contrasenaNueva !== contrasenaConfirmar) { toast.error("Las contraseñas nuevas no coinciden"); return; }
    if (contrasenaActual === contrasenaNueva) { toast.error("La nueva contraseña debe ser diferente a la actual"); return; }
    setCambiandoContrasena(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) { toast.error("No se pudo obtener el usuario actual"); return; }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: contrasenaActual });
      if (signInError) { toast.error("La contraseña actual es incorrecta"); return; }
      const { error: updateError } = await supabase.auth.updateUser({ password: contrasenaNueva });
      if (updateError) { toast.error("Error al cambiar la contraseña: " + updateError.message); return; }
      toast.success("✅ Contraseña actualizada correctamente");
      setContrasenaActual(''); setContrasenaNueva(''); setContrasenaConfirmar('');
      setModalAbierto(false);
    } catch (error) { console.error('Error:', error); toast.error("Error inesperado al cambiar la contraseña"); }
    finally { setCambiandoContrasena(false); }
  };

  const diasDisponibles = diasSemana.length - diasNoDisponibles.length;
  const horasDisponiblesPorDia = convertirAHoras(rangoFin) - convertirAHoras(rangoInicio);
  const totalHorasSemanales = diasDisponibles * (horasDisponiblesPorDia / 60);

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

        .mn-card {
          background: #1E3A5C;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }

        .mn-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #94A3B8;
          margin-bottom: 6px;
          display: block;
        }

        .mn-input {
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
        .mn-input:focus {
          border-color: rgba(37,99,235,0.6);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }
        .mn-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .mn-input::placeholder { color: #475569; }

        .mn-input-icon {
          position: relative;
        }
        .mn-input-icon input {
          padding-left: 36px;
        }
        .mn-input-icon svg {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #475569;
          pointer-events: none;
        }

        .mn-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .mn-btn-primary {
          background: #2563EB;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 16px rgba(37,99,235,0.3);
        }
        .mn-btn-primary:hover { background: #1D4ED8; transform: translateY(-1px); }
        .mn-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .mn-btn-secondary {
          background: rgba(255,255,255,0.06);
          color: #CBD5E1;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 10px 18px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .mn-btn-secondary:hover { background: rgba(255,255,255,0.1); color: white; }

        .mn-btn-dark {
          background: rgba(255,255,255,0.08);
          color: #CBD5E1;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 10px 18px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .mn-btn-dark:hover { background: rgba(255,255,255,0.14); color: white; }

        .mn-divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 16px 0;
        }

        .mn-dia-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: capitalize;
          font-family: 'DM Sans', sans-serif;
        }

        .mn-hora-btn {
          padding: 7px 12px;
          font-size: 12px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .mn-hora-disponible {
          background: rgba(255,255,255,0.06);
          color: #94A3B8;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .mn-hora-disponible:hover { background: rgba(255,255,255,0.12); color: white; }
        .mn-hora-bloqueada {
          background: rgba(239,68,68,0.2);
          color: #FCA5A5;
          border: 1px solid rgba(239,68,68,0.3) !important;
        }
        .mn-hora-bloqueada:hover { background: rgba(239,68,68,0.3); }

        .mn-acord-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255,255,255,0.04);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #CBD5E1;
          text-transform: capitalize;
        }
        .mn-acord-header:hover { background: rgba(255,255,255,0.08); color: white; }

        .mn-acord-body {
          padding: 14px;
          background: rgba(255,255,255,0.02);
          border-radius: 0 0 10px 10px;
          border: 1px solid rgba(255,255,255,0.06);
          border-top: none;
        }

        .mn-cal-header {
          background: rgba(255,255,255,0.04);
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .mn-cal-nav {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 6px;
          cursor: pointer;
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .mn-cal-nav:hover { background: rgba(37,99,235,0.2); color: white; }

        .mn-cal-day-header {
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .mn-logo-preview {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mn-file-input {
          display: block;
          width: 100%;
          font-size: 13px;
          color: #94A3B8;
          font-family: 'DM Sans', sans-serif;
          background: #0F2438;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px;
          cursor: pointer;
          box-sizing: border-box;
        }
        .mn-file-input::-webkit-file-upload-button {
          background: rgba(37,99,235,0.2);
          color: #93C5FD;
          border: 1px solid rgba(37,99,235,0.3);
          border-radius: 6px;
          padding: 4px 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 10px;
        }

        .mn-modal-overlay {
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
        .mn-modal {
          background: #1E3A5C;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          padding: 28px;
          width: 100%;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
        }
        .mn-modal-title {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: white;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .mn-pass-field {
          position: relative;
        }
        .mn-pass-field input {
          padding-right: 40px;
        }
        .mn-pass-toggle {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748B;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }
        .mn-pass-toggle:hover { color: #94A3B8; }

        .mn-conflict-item {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px;
          transition: background 0.2s;
        }
        .mn-conflict-item:hover { background: rgba(255,255,255,0.07); }

        .mn-badge-pending {
          background: rgba(251,191,36,0.15);
          color: #FBBF24;
          border: 1px solid rgba(251,191,36,0.3);
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
        }

        .mn-warning-box {
          background: rgba(249,115,22,0.1);
          border-left: 3px solid #F97316;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 16px;
        }

        @media (max-width: 640px) {
          .mn-grid-2 { grid-template-columns: 1fr !important; }
          .mn-flex-wrap { flex-wrap: wrap; }
          .mn-btn-full { width: 100%; justify-content: center; }
        }
      `}</style>

      {/* ── Título ── */}
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: 'white', textAlign: 'center', marginBottom: 20 }}>
        Mi Negocio
      </h1>

      {/* ── Tarjetas estadísticas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }} className="mn-grid-2">
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: 16, borderRadius: 14, color: 'white', border: '1px solid rgba(56,189,248,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Plan Actual</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, textTransform: 'capitalize' }}>{cliente?.plan || 'Sin plan'}</p>
            </div>
            <TrendingUp size={22} style={{ opacity: 0.8 }} />
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #059669, #10B981)', padding: 16, borderRadius: 14, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Días Disponibles</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800 }}>{diasDisponibles}/7</p>
            </div>
            <Calendar size={22} style={{ opacity: 0.8 }} />
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', padding: 16, borderRadius: 14, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Horas Semanales</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800 }}>{totalHorasSemanales.toFixed(0)}h</p>
            </div>
            <Clock size={22} style={{ opacity: 0.8 }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(37,99,235,0.2)', borderTop: '3px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748B', fontSize: 14 }}>Cargando información del negocio...</p>
        </div>
      ) : (
        <>
          {/* ── Mensaje éxito ── */}
          <AnimatePresence>
            {mensajeVisible && (
              <motion.div
                style={{ marginBottom: 16, padding: '14px 18px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#6EE7B7', fontSize: 14, fontWeight: 600 }}>✅ Cambios guardados correctamente.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Información básica ── */}
          <div className="mn-card">
            <h2 className="mn-section-title">
              <Store size={18} color="#60A5FA" />
              Información del Negocio
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="mn-grid-2">
              <div>
                <label className="mn-label">Nombre del negocio:</label>
                <div className="mn-input-icon">
                  <Store size={16} />
                  <input type="text" value={nombre} disabled className="mn-input" />
                </div>
              </div>
              <div>
                <label className="mn-label">Correo:</label>
                <div className="mn-input-icon">
                  <Globe size={16} />
                  <input type="email" value={correo} disabled className="mn-input" />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => setModalAbierto(true)} className="mn-btn-dark">
                <Lock size={16} />
                Cambiar Contraseña
              </button>
            </div>

            <div className="mn-divider" />

            <div className="mn-divider" />

            {/* Plan y link */}
            <div>
              <label className="mn-label">Plan y link para citas:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                <input type="text" value={cliente?.plan || "Sin plan"} disabled className="mn-input" style={{ width: 'auto', minWidth: 120 }} />
                {cliente?.slug && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <a href={`/reservar/${cliente.slug}`} target="_blank" rel="noopener noreferrer" className="mn-btn-primary" style={{ background: '#059669', boxShadow: '0 4px 16px rgba(5,150,105,0.3)' }}>
                      <Link2 size={14} /> Link para citas
                    </a>
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/reservar/${cliente.slug}`); toast.success("✅ Link copiado"); }} className="mn-btn-primary">
                      <Copy size={14} /> Copiar link para citas
                    </button>
                    <button onClick={() => window.location.href = '/planes'} className="mn-btn-primary" style={{ background: '#7C3AED', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}>
                      <CreditCard size={14} /> Pagar Suscripción
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Horarios ── */}
          <div className="mn-card">
            <h2 className="mn-section-title">
              <Clock size={18} color="#38BDF8" />
              Horarios de Atención
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="mn-grid-2">
              <div>
                <label className="mn-label">Hora de inicio:</label>
                <input type="time" value={rangoInicio} onChange={(e) => setRangoInicio(e.target.value)} className="mn-input" />
              </div>
              <div>
                <label className="mn-label">Hora de fin:</label>
                <input type="time" value={rangoFin} onChange={(e) => setRangoFin(e.target.value)} className="mn-input" />
              </div>
            </div>
            <div>
              <label className="mn-label">Intervalo entre citas (minutos):</label>
              <input type="number" value={intervalo} onChange={(e) => setIntervalo(Number(e.target.value))} className="mn-input" min={5} style={{ maxWidth: 200 }} />
              {intervaloInvalido && <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#FCA5A5', fontSize: 13, marginTop: 6 }}>El intervalo debe ser un número mayor o igual a 5 minutos.</p>}
            </div>
          </div>

          {/* ── Días no disponibles ── */}
          <div className="mn-card">
            <h2 className="mn-section-title">
              <Calendar size={18} color="#F472B6" />
              Días no Disponibles
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {diasSemana.map((dia) => (
                <button
                  key={dia}
                  type="button"
                  onClick={() => setDiasNoDisponibles((prev) => prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia])}
                  className="mn-dia-btn"
                  style={{
                    background: diasNoDisponibles.includes(dia) ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.15)',
                    color: diasNoDisponibles.includes(dia) ? '#FCA5A5' : '#6EE7B7',
                    border: `1px solid ${diasNoDisponibles.includes(dia) ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  }}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>

          {/* ── Horas no disponibles ── */}
          <div className="mn-card">
            <h2 className="mn-section-title">
              <Settings size={18} color="#A78BFA" />
              Horas no Disponibles por Día
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {diasSemana.filter((dia) => !diasNoDisponibles.includes(dia)).map((dia) => (
                <div key={dia} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <button type="button" onClick={() => toggleDia(dia)} className="mn-acord-header">
                    <span>{dia}</span>
                    <span style={{ fontSize: 11, color: '#64748B' }}>{diasAbiertos[dia] ? '▲' : '▼'}</span>
                  </button>
                  {diasAbiertos[dia] && (
                    <div className="mn-acord-body">
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {bloques[dia]?.map((hora) => (
                          <button
                            key={hora}
                            type="button"
                            onClick={() => toggleHora(dia, hora)}
                            className={`mn-hora-btn ${horasNoDisponibles[dia]?.includes(hora) ? 'mn-hora-bloqueada' : 'mn-hora-disponible'}`}
                          >
                            {hora}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Calendario días bloqueados ── */}
          <div className="mn-card">
            <h2 className="mn-section-title">
              <Calendar size={18} color="#FBBF24" />
              Bloquear Días Específicos
            </h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748B', fontSize: 13, marginBottom: 16 }}>
              Selecciona días específicos del calendario para bloquearlos. Esto es independiente del bloqueo por día de la semana.
            </p>

            {cargandoDiasBloqueados ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: 24, height: 24, border: '2px solid rgba(37,99,235,0.2)', borderTop: '2px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748B', fontSize: 13 }}>Cargando calendario...</p>
              </div>
            ) : (
              <div style={{ border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                {/* Header calendario */}
                <div className="mn-cal-header">
                  <button onClick={() => cambiarMes(-1)} className="mn-cal-nav"><ChevronLeft size={18} /></button>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'white', fontSize: 15 }}>
                    {mesActual.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={() => cambiarMes(1)} className="mn-cal-nav"><ChevronRight size={18} /></button>
                </div>

                {/* Días semana */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }} className="mn-cal-day-header">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia, i) => (
                    <div key={i} style={{ padding: '8px 4px', textAlign: 'center', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: '#64748B' }}>{dia}</div>
                  ))}
                </div>

                {/* Días del mes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                  {generarDiasDelMes().map((fecha, index) => {
                    if (!fecha) return <div key={`empty-${index}`} style={{ padding: 8, borderBottom: '1px solid rgba(255,255,255,0.04)', borderRight: '1px solid rgba(255,255,255,0.04)' }} />;
                    const fechaStr = formatearFecha(fecha);
                    const estaBloqueado = diasBloqueadosEspecificos.includes(fechaStr);
                    const esPasado = esDiaPasado(fecha);
                    const diasSemanaMap = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
                    const diaSemana = diasSemanaMap[fecha.getDay()];
                    const diaSemanaBloqueado = diasNoDisponibles.includes(diaSemana);
                    return (
                      <button
                        key={fechaStr}
                        onClick={() => !esPasado && !diaSemanaBloqueado && toggleDiaBloqueado(fechaStr)}
                        disabled={esPasado || diaSemanaBloqueado}
                        title={diaSemanaBloqueado ? `${diaSemana} está bloqueado` : ''}
                        style={{
                          padding: '8px 4px',
                          minHeight: 44,
                          border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          borderRight: '1px solid rgba(255,255,255,0.04)',
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: 13,
                          fontWeight: estaBloqueado ? 700 : 400,
                          cursor: esPasado || diaSemanaBloqueado ? 'not-allowed' : 'pointer',
                          transition: 'background 0.15s',
                          background: esPasado
                            ? 'rgba(255,255,255,0.02)'
                            : estaBloqueado || diaSemanaBloqueado
                            ? '#DC2626'
                            : 'transparent',
                          color: esPasado
                            ? '#334155'
                            : estaBloqueado || diaSemanaBloqueado
                            ? 'white'
                            : '#CBD5E1',
                        }}
                      >
                        {fecha.getDate()}
                      </button>
                    );
                  })}
                </div>

                {/* Leyenda */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {[
                    { color: '#DC2626', border: '#DC2626', label: 'Bloqueado' },
                    { color: 'transparent', border: 'rgba(255,255,255,0.1)', label: 'Disponible' },
                    { color: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.06)', label: 'Día pasado' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 14, height: 14, background: item.color, border: `1px solid ${item.border}`, borderRadius: 4 }} />
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#64748B' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Botón guardar ── */}
          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="mn-btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 16, borderRadius: 12, marginBottom: 24 }}
          >
            {guardando ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Guardando...
              </>
            ) : 'Guardar cambios'}
          </button>
        </>
      )}

      {/* ── Modal cambiar contraseña ── */}
      {modalAbierto && (
        <div className="mn-modal-overlay">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mn-modal" style={{ maxWidth: 440 }}>
            <h3 className="mn-modal-title">
              <Lock size={20} color="#60A5FA" />
              Cambiar Contraseña
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Contraseña actual', value: contrasenaActual, setter: setContrasenaActual, mostrar: mostrarActual, toggleMostrar: () => setMostrarActual(!mostrarActual) },
                { label: 'Nueva contraseña', value: contrasenaNueva, setter: setContrasenaNueva, mostrar: mostrarNueva, toggleMostrar: () => setMostrarNueva(!mostrarNueva), hint: 'Mínimo 6 caracteres' },
                { label: 'Confirmar nueva contraseña', value: contrasenaConfirmar, setter: setContrasenaConfirmar, mostrar: mostrarConfirmar, toggleMostrar: () => setMostrarConfirmar(!mostrarConfirmar) },
              ].map((field) => (
                <div key={field.label}>
                  <label className="mn-label">{field.label}</label>
                  <div className="mn-pass-field">
                    <input
                      type={field.mostrar ? "text" : "password"}
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className="mn-input"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={field.toggleMostrar} className="mn-pass-toggle">
                      {field.mostrar ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {field.hint && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#475569', marginTop: 4 }}>{field.hint}</p>}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => { setModalAbierto(false); setContrasenaActual(''); setContrasenaNueva(''); setContrasenaConfirmar(''); }} disabled={cambiandoContrasena} className="mn-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Cancelar
              </button>
              <button onClick={handleCambiarContrasena} disabled={cambiandoContrasena} className="mn-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                {cambiandoContrasena ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Cambiando...</>
                ) : 'Cambiar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Modal conflicto horarios ── */}
      {modalConflicto.visible && (
        <div className="mn-modal-overlay">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mn-modal" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
              <div style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', padding: 10, borderRadius: '50%', flexShrink: 0 }}>
                <Calendar size={22} color="#FB923C" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 4 }}>
                  ⚠️ No se puede guardar — Tienes citas programadas
                </h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#94A3B8', fontSize: 13 }}>
                  Los cambios afectan {modalConflicto.citas.length} cita{modalConflicto.citas.length !== 1 ? 's' : ''} pendiente{modalConflicto.citas.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="mn-warning-box">
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#CBD5E1', lineHeight: 1.6 }}>
                <strong style={{ color: '#FB923C' }}>Importante:</strong> Debes gestionar estas citas antes de poder cambiar tu disponibilidad. Ve a la página de Reservas para reprogramarlas o marcarlas como incumplidas.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, maxHeight: 320, overflowY: 'auto' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 4 }}>Citas que debes gestionar:</p>
              {modalConflicto.citas.map((cita) => (
                <div key={cita.id} className="mn-conflict-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 6 }}>{cita.nombre}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} />
                          {new Date(cita.fecha + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} />
                          {cita.hora}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#64748B', marginTop: 4 }}>📞 {cita.telefono}</p>
                    </div>
                    <span className="mn-badge-pending">Pendiente</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => setModalConflicto({ visible: false, citas: [] })} className="mn-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Volver
              </button>
              <button onClick={() => { setModalConflicto({ visible: false, citas: [] }); window.location.href = '/dashboard-cliente/reservas'; }} className="mn-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <Calendar size={16} />
                Ir a gestionar reservas
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}






