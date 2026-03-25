'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Calendar, User, BarChart3, TrendingUp, Download } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
registerLocale('es', es);

interface Barbero { id_barbero: string; nombre_barbero: string; }
interface ReservaConBarbero { id: string; id_ser: string; hora: string; fecha: string; id_barbero: string; barberos?: { nombre_barbero: string; } | null; }
interface VentaConsolidada { id: string; servicio: string; barbero: string; precio: number; cantidad: number; total: number; fechas: string[]; horas: string[]; }
interface VentasPorBarbero { nombreBarbero: string; idBarbero: string; ventas: VentaConsolidada[]; totalBarbero: number; serviciosBarbero: number; }
interface Estadisticas { totalVentas: number; serviciosRealizados: number; promedioVenta: number; servicioMasVendido: string; }

export default function VentasPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date>(new Date());
  const [vistaActual, setVistaActual] = useState<'dia' | 'rango'>('dia');
  const [ventas, setVentas] = useState<VentaConsolidada[]>([]);
  const [ventasPorBarbero, setVentasPorBarbero] = useState<VentasPorBarbero[]>([]);
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [servicios, setServicios] = useState<Array<{id_ser: string, ser_nombre: string}>>([]);
  const [barberoSeleccionado, setBarberoSeleccionado] = useState<string>('todos');
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>('todos');
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({ totalVentas: 0, serviciosRealizados: 0, promedioVenta: 0, servicioMasVendido: '' });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: clienteData } = await supabase.from('clientes').select('id_cliente').eq('user_id', user.id).single();
        if (!clienteData) return;
        console.log('ID Cliente actual:', clienteData.id_cliente);
        const { data: barberosData } = await supabase.from('barberos').select('id_barbero, nombre_barbero').eq('id_cliente', clienteData.id_cliente).eq('activo', true).neq('estado', 'eliminado');
        setBarberos(barberosData || []);
        console.log('Barberos cargados para cliente:', barberosData);
        const { data: todosLosServicios } = await supabase.from('servicios').select('id_ser, ser_nombre, ser_estado').eq('id_cliente', clienteData.id_cliente);
        const serviciosActivos = todosLosServicios?.filter(servicio => servicio.ser_estado === 'activo') || [];
        setServicios(serviciosActivos);
      } catch (err) { console.error('Error cargando datos:', err); }
    };
    cargarDatos();
  }, []);

  useEffect(() => {
    const cargarVentas = async () => {
      setLoading(true); setError(null);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) { setError('Error de autenticación'); setLoading(false); return; }
        const { data: clienteData, error: clienteError } = await supabase.from('clientes').select('id_cliente').eq('user_id', user.id).single();
        if (clienteError || !clienteData) { setError('Error al obtener información del cliente'); setLoading(false); return; }
        const idCliente = clienteData.id_cliente;
        let query = supabase.from('reservas').select(`id, id_ser, hora, fecha, id_barbero`).eq('id_cliente', idCliente).eq('estado', 'cumplida').not('id_ser', 'is', null);
        if (vistaActual === 'dia') { query = query.eq('fecha', fechaSeleccionada.toLocaleDateString('sv-SE')); }
        else { query = query.gte('fecha', fechaInicio.toLocaleDateString('sv-SE')).lte('fecha', fechaFin.toLocaleDateString('sv-SE')); }
        if (barberoSeleccionado !== 'todos') query = query.eq('id_barbero', barberoSeleccionado);
        if (servicioSeleccionado !== 'todos') query = query.eq('id_ser', servicioSeleccionado);
        const { data: reservasCumplidas, error: reservasError } = await query;
        if (reservasError) { setError(`Error al consultar reservas: ${reservasError.message}`); setLoading(false); return; }
        if (!reservasCumplidas || reservasCumplidas.length === 0) {
          setVentas([]); setVentasPorBarbero([]);
          setEstadisticas({ totalVentas: 0, serviciosRealizados: 0, promedioVenta: 0, servicioMasVendido: '' });
          setLoading(false); return;
        }
        const { data: serviciosData, error: serviciosError } = await supabase.from('servicios').select('id_ser, ser_nombre, ser_precio').eq('id_cliente', idCliente);
        if (serviciosError) { setError(`Error al obtener servicios: ${serviciosError.message}`); setLoading(false); return; }
        if (servicioSeleccionado !== 'todos') {
          const reservasFiltradas = reservasCumplidas.filter(r => r.id_ser === servicioSeleccionado);
          if (reservasFiltradas.length === 0) { setVentas([]); setVentasPorBarbero([]); setEstadisticas({ totalVentas: 0, serviciosRealizados: 0, promedioVenta: 0, servicioMasVendido: '' }); setLoading(false); return; }
        }
        const barberosIds = [...new Set(reservasCumplidas.map(r => r.id_barbero))];
        const { data: barberosReservasData, error: barberosReservasError } = await supabase.from('barberos').select('id_barbero, nombre_barbero').in('id_barbero', barberosIds);
        if (barberosReservasError) { setError(`Error al obtener barberos: ${barberosReservasError.message}`); setLoading(false); return; }
        const barberosMap = barberosReservasData?.reduce((acc, barbero) => { acc[barbero.id_barbero] = barbero.nombre_barbero; return acc; }, {} as Record<string, string>) || {};
        const ventasConsolidadas: Record<string, VentaConsolidada> = {};
        let totalIngresos = 0; let totalServicios = 0;
        const conteoServicios: Record<string, number> = {};
        reservasCumplidas.forEach((reserva) => {
          const servicio = serviciosData?.find(s => s.id_ser === reserva.id_ser);
          if (!servicio) return;
          const clave = `${servicio.id_ser}_${reserva.id_barbero}`;
          const nombreBarbero = barberosMap[reserva.id_barbero] || 'Sin barbero';
          if (!ventasConsolidadas[clave]) {
            ventasConsolidadas[clave] = { id: clave, servicio: servicio.ser_nombre, barbero: nombreBarbero, precio: servicio.ser_precio, cantidad: 1, total: servicio.ser_precio, fechas: vistaActual === 'rango' ? [reserva.fecha] : [], horas: vistaActual === 'dia' ? [reserva.hora] : [] };
          } else {
            ventasConsolidadas[clave].cantidad += 1; ventasConsolidadas[clave].total += servicio.ser_precio;
            if (vistaActual === 'rango') ventasConsolidadas[clave].fechas.push(reserva.fecha);
            else ventasConsolidadas[clave].horas.push(reserva.hora);
          }
          totalIngresos += servicio.ser_precio; totalServicios += 1;
          conteoServicios[servicio.ser_nombre] = (conteoServicios[servicio.ser_nombre] || 0) + 1;
        });
        const ventasArray = Object.values(ventasConsolidadas);
        const ventasAgrupadasPorBarbero: Record<string, VentasPorBarbero> = {};
        ventasArray.forEach((venta) => {
          if (!ventasAgrupadasPorBarbero[venta.barbero]) {
            ventasAgrupadasPorBarbero[venta.barbero] = { nombreBarbero: venta.barbero, idBarbero: Object.keys(barberosMap).find(id => barberosMap[id] === venta.barbero) || '', ventas: [], totalBarbero: 0, serviciosBarbero: 0 };
          }
          ventasAgrupadasPorBarbero[venta.barbero].ventas.push(venta);
          ventasAgrupadasPorBarbero[venta.barbero].totalBarbero += venta.total;
          ventasAgrupadasPorBarbero[venta.barbero].serviciosBarbero += venta.cantidad;
        });
        const ventasPorBarberoOrdenadas = Object.values(ventasAgrupadasPorBarbero).sort((a, b) => a.nombreBarbero.localeCompare(b.nombreBarbero)).map(grupo => ({ ...grupo, ventas: grupo.ventas.sort((a, b) => a.servicio.localeCompare(b.servicio)) }));
        const servicioMasVendido = Object.keys(conteoServicios).length > 0 ? Object.keys(conteoServicios).reduce((a, b) => conteoServicios[a] > conteoServicios[b] ? a : b) : '';
        setVentas(ventasArray); setVentasPorBarbero(ventasPorBarberoOrdenadas);
        setEstadisticas({ totalVentas: totalIngresos, serviciosRealizados: totalServicios, promedioVenta: totalServicios > 0 ? totalIngresos / totalServicios : 0, servicioMasVendido });
      } catch (err) { console.error('Error inesperado:', err); setError('Error inesperado al cargar las ventas'); }
      finally { setLoading(false); }
    };
    cargarVentas();
  }, [fechaSeleccionada, fechaInicio, fechaFin, vistaActual, barberoSeleccionado, servicioSeleccionado]);

  const exportarCSV = () => {
    if (ventas.length === 0) return;
    const headers = ['Barbero', 'Servicio', 'Precio', 'Cantidad', 'Total'];
    const csvContent = [headers.join(','), ...ventas.map(venta => [`"${venta.barbero}"`, `"${venta.servicio}"`, venta.precio, venta.cantidad, venta.total].join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas_${vistaActual === 'dia' ? fechaSeleccionada.toISOString().split('T')[0] : 'rango'}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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

        .vt-card {
          background: #1E3A5C;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }

        .vt-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #94A3B8;
          margin-bottom: 6px;
          display: block;
        }

        .vt-input-plain {
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
        .vt-input-plain:focus { border-color: rgba(37,99,235,0.6); box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .vt-input-plain::placeholder { color: #475569; }

        .vt-input {
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
        .vt-input:focus { border-color: rgba(37,99,235,0.6); box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .vt-input::placeholder { color: #475569; }

        .vt-select {
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
        .vt-select:focus { border-color: rgba(37,99,235,0.6); box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
        .vt-select option { background: #0F2438; color: white; }

        .vt-input-wrap {
          position: relative;
        }
        .vt-input-wrap > svg:first-child {
          position: absolute; left: 10px; top: 50%;
          transform: translateY(-50%);
          color: #475569; pointer-events: none; z-index: 1;
        }
        .vt-input-wrap .vt-chevron {
          position: absolute; right: 10px; top: 50%;
          transform: translateY(-50%);
          color: #475569; pointer-events: none;
        }

        .vt-tab-group {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 4px;
          display: inline-flex;
          gap: 4px;
        }
        .vt-tab {
          padding: 8px 20px;
          border-radius: 9px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          color: #94A3B8;
          background: transparent;
        }
        .vt-tab:hover { color: white; background: rgba(255,255,255,0.06); }
        .vt-tab-active {
          background: #2563EB !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(37,99,235,0.4);
        }

        .vt-barbero-group {
          background: #162033;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 16px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }
        .vt-barbero-header {
          background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          border-bottom: 1px solid rgba(56,189,248,0.2);
        }
        .vt-barbero-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }

        .vt-venta-item {
          background: #1E3A5C;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .vt-venta-item:hover {
          border-color: rgba(37,99,235,0.3);
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }

        .vt-badge-cantidad {
          display: inline-flex;
          align-items: center;
          background: rgba(16,185,129,0.15);
          color: #6EE7B7;
          border: 1px solid rgba(16,185,129,0.25);
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
        }

        .vt-resumen {
          background: linear-gradient(135deg, #0A2E1A, #0F3D24);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 16px;
          padding: 24px;
          margin-top: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .vt-alert-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 14px;
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
          .vt-grid-2 { grid-template-columns: 1fr !important; }
          .vt-grid-4 { grid-template-columns: 1fr 1fr !important; }
          .vt-barbero-header { flex-direction: column; align-items: flex-start; }
        }
        .vt-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .vt-grid-2-base {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
      `}</style>

      {/* ── Título ── */}
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: 'white', textAlign: 'center', marginBottom: 20 }}>
        Ventas
      </h1>

      {/* ── Selector vista ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <div className="vt-tab-group">
          <button onClick={() => setVistaActual('dia')} className={`vt-tab ${vistaActual === 'dia' ? 'vt-tab-active' : ''}`}>
            Vista por Día
          </button>
          <button onClick={() => setVistaActual('rango')} className={`vt-tab ${vistaActual === 'rango' ? 'vt-tab-active' : ''}`}>
            Rango de Fechas
          </button>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="vt-card">
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Calendar size={16} color="#60A5FA" />
          Filtros
        </h2>

        {vistaActual === 'dia' ? (
          <div style={{ marginBottom: 16 }}>
            <label className="vt-label">📅 Fecha:</label>
            <div className="vt-input-wrap">
              <Calendar size={16} />
              <DatePicker
                selected={fechaSeleccionada}
                onChange={(date: Date | null) => date && setFechaSeleccionada(date)}
                dateFormat="yyyy-MM-dd"
                locale="es"
                className="vt-input"
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="vt-grid-2">
            <div>
              <label className="vt-label">📅 Fecha Inicio:</label>
              <DatePicker selected={fechaInicio} onChange={(date: Date | null) => date && setFechaInicio(date)} dateFormat="yyyy-MM-dd" locale="es" className="vt-input-plain" />
            </div>
            <div>
              <label className="vt-label">📅 Fecha Fin:</label>
              <DatePicker selected={fechaFin} onChange={(date: Date | null) => date && setFechaFin(date)} dateFormat="yyyy-MM-dd" locale="es" className="vt-input-plain" />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="vt-grid-2">
          <div>
            <label className="vt-label">💼 Profesional:</label>
            <div className="vt-input-wrap">
              <User size={15} />
              <select value={barberoSeleccionado} onChange={(e) => setBarberoSeleccionado(e.target.value)} className="vt-select">
                <option value="todos">Todos</option>
                {barberos.map((barbero) => (
                  <option key={barbero.id_barbero} value={barbero.id_barbero}>{barbero.nombre_barbero}</option>
                ))}
              </select>
              <svg className="vt-chevron" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          <div>
            <label className="vt-label">✂️ Servicio:</label>
            <div className="vt-input-wrap">
              <BarChart3 size={15} />
              <select value={servicioSeleccionado} onChange={(e) => setServicioSeleccionado(e.target.value)} className="vt-select">
                <option value="todos">Todos</option>
                {servicios.map(servicio => (
                  <option key={servicio.id_ser} value={servicio.id_ser}>{servicio.ser_nombre}</option>
                ))}
              </select>
              <svg className="vt-chevron" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Estadísticas ── */}
      <div className="vt-grid-4" style={{ marginBottom: 16 }}>
        {[
          { label: 'Total Ventas', value: `$${estadisticas.totalVentas.toLocaleString()}`, icon: TrendingUp, grad: 'linear-gradient(135deg, #059669, #10B981)' },
          { label: 'Servicios', value: estadisticas.serviciosRealizados, icon: BarChart3, grad: 'linear-gradient(135deg, #1D4ED8, #2563EB)' },
          { label: 'Promedio', value: `$${Math.round(estadisticas.promedioVenta).toLocaleString()}`, icon: Calendar, grad: 'linear-gradient(135deg, #7C3AED, #8B5CF6)' },
          { label: 'Más Vendido', value: estadisticas.servicioMasVendido || 'N/A', icon: User, grad: 'linear-gradient(135deg, #D97706, #F59E0B)', small: true },
        ].map((s) => (
          <div key={s.label} style={{ background: s.grad, padding: 14, borderRadius: 14, color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, opacity: 0.85, marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: s.small ? 13 : 20, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</p>
              </div>
              <s.icon size={20} style={{ opacity: 0.8, flexShrink: 0 }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="vt-alert-error">
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#FCA5A5', fontSize: 14 }}>{error}</p>
        </div>
      )}

      {/* ── Contenido ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(37,99,235,0.2)', borderTop: '3px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748B', fontSize: 14 }}>Cargando ventas...</p>
        </div>
      ) : ventasPorBarbero.length === 0 && !error ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#475569' }}>
          <BarChart3 size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15 }}>No hay ventas registradas para los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          {/* ── Grupos por barbero ── */}
          {ventasPorBarbero.map((grupoBarbero) => (
            <motion.div key={grupoBarbero.idBarbero} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="vt-barbero-group">

              <div className="vt-barbero-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={20} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 18 }}>{grupoBarbero.nombreBarbero}</h3>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                      {grupoBarbero.serviciosBarbero} servicio{grupoBarbero.serviciosBarbero !== 1 ? 's' : ''} realizados
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 22 }}>${grupoBarbero.totalBarbero.toLocaleString()}</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Total del profesional</p>
                </div>
              </div>

              <div className="vt-barbero-body">
                {grupoBarbero.ventas.map((venta, index) => (
                  <motion.div key={venta.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} className="vt-venta-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                          <h4 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 15 }}>{venta.servicio}</h4>
                          <span className="vt-badge-cantidad">{venta.cantidad} servicio{venta.cantidad !== 1 ? 's' : ''}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#94A3B8' }}>
                            💰 Precio: ${venta.precio.toLocaleString()}
                          </span>
                          {vistaActual === 'dia' && venta.horas.length > 0 && (
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#94A3B8' }}>
                              🕒 {venta.horas.sort().join(', ')}
                            </span>
                          )}
                          {vistaActual === 'rango' && venta.fechas.length > 0 && (
                            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#94A3B8' }}>
                              📅 {[...new Set(venta.fechas)].sort().join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#34D399', fontSize: 18 }}>${venta.total.toLocaleString()}</p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748B', fontSize: 11 }}>Subtotal</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* ── Resumen final ── */}
          <div className="vt-resumen">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#34D399', fontSize: 18, marginBottom: 6 }}>
                  💰 Resumen {vistaActual === 'dia' ? 'del Día' : 'del Período'}
                </h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#6EE7B7', fontSize: 13, marginBottom: 4 }}>
                  {vistaActual === 'dia'
                    ? fechaSeleccionada.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                    : `${fechaInicio.toLocaleDateString('es-CO')} - ${fechaFin.toLocaleDateString('es-CO')}`}
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#4ADE80', fontSize: 13 }}>
                  {estadisticas.serviciosRealizados} servicio{estadisticas.serviciosRealizados !== 1 ? 's' : ''} realizado{estadisticas.serviciosRealizados !== 1 ? 's' : ''}
                  {barberoSeleccionado !== 'todos' && <span> por {barberos.find(b => b.id_barbero === barberoSeleccionado)?.nombre_barbero}</span>}
                  {servicioSeleccionado !== 'todos' && <span> del servicio "{servicios.find(s => s.id_ser === servicioSeleccionado)?.ser_nombre}"</span>}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#34D399', fontSize: 32 }}>${estadisticas.totalVentas.toLocaleString()}</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#6EE7B7', fontSize: 13 }}>Promedio: ${Math.round(estadisticas.promedioVenta).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

