'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, DollarSign, Package, TrendingUp, ShoppingBag } from 'lucide-react';

export default function ServiciosPage() {
  const [mounted, setMounted] = useState(false);
  const [servicios, setServicios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensajeVisible, setMensajeVisible] = useState(false);
  const [errorCamposVisible, setErrorCamposVisible] = useState(false);
  const [confirmacionVisible, setConfirmacionVisible] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [servicioAEliminar, setServicioAEliminar] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [servicioEliminado, setServicioEliminado] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const cargarServicios = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: clienteData } = await supabase.from('clientes').select('id_cliente').eq('user_id', user.id).single();
      if (!clienteData) return;
      const { data, error } = await supabase.from('servicios').select('*').eq('id_cliente', user.id).neq('ser_estado', 'eliminado');
      if (!error) setServicios(data || []);
      setLoading(false);
    };
    cargarServicios();
  }, []);

  const handleAgregar = async () => {
    if (!nombre.trim() || !precio.trim()) {
      setErrorCamposVisible(true);
      setTimeout(() => setErrorCamposVisible(false), 3000);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: clienteData } = await supabase.from('clientes').select('id_cliente').eq('user_id', user.id).single();
    if (!clienteData) return;
    const { data, error } = await supabase.from('servicios').insert([{ ser_nombre: nombre.trim(), ser_precio: parseFloat(precio), ser_estado: 'activo', id_cliente: clienteData.id_cliente }]).select();
    if (error) {
      console.error('❌ Supabase insert error:', error.message);
      setMensajeError('❌ Error al agregar el servicio.');
      setTimeout(() => setMensajeError(''), 3000);
    } else {
      setServicios((prev) => [...prev, ...data]);
      setNombre(''); setPrecio('');
      setMensajeVisible(true);
      setTimeout(() => setMensajeVisible(false), 3000);
    }
  };

  const iniciarEdicion = (servicio: any) => { setEditandoId(servicio.id_ser); setEditNombre(servicio.ser_nombre); setEditPrecio(servicio.ser_precio.toString()); };
  const cancelarEdicion = () => { setEditandoId(null); setEditNombre(''); setEditPrecio(''); };

  const guardarEdicion = async () => {
    if (!editandoId || !editNombre.trim() || !editPrecio.trim()) { setErrorCamposVisible(true); setTimeout(() => setErrorCamposVisible(false), 3000); return; }
    const { data, error } = await supabase.from('servicios').update({ ser_nombre: editNombre.trim(), ser_precio: parseFloat(editPrecio) }).eq('id_ser', editandoId).select();
    if (error) { setMensajeError('❌ Error al guardar los cambios.'); setTimeout(() => setMensajeError(''), 3000); }
    else { setServicios((prev) => prev.map((s) => (s.id_ser === editandoId ? data[0] : s))); cancelarEdicion(); setMensajeVisible(true); setTimeout(() => setMensajeVisible(false), 3000); }
  };

  const eliminarServicio = (id: string) => { setServicioAEliminar(id); setConfirmacionVisible(true); };

  const confirmarEliminacion = async () => {
    if (!servicioAEliminar) return;
    const { error } = await supabase.from('servicios').update({ ser_estado: 'eliminado' }).eq('id_ser', servicioAEliminar);
    if (!error) {
      setServicioEliminado(servicioAEliminar);
      setConfirmacionVisible(false);
      setTimeout(() => { setServicios((prev) => prev.filter((s) => s.id_ser !== servicioAEliminar)); setServicioEliminado(null); setServicioAEliminar(null); }, 2000);
    } else { setConfirmacionVisible(false); setServicioAEliminar(null); }
  };

  const cancelarEliminacion = () => { setConfirmacionVisible(false); setServicioAEliminar(null); };

  const totalServicios = servicios.length;
  const precioPromedio = totalServicios > 0 ? servicios.reduce((sum, s) => sum + s.ser_precio, 0) / totalServicios : 0;
  const servicioMasCaro = totalServicios > 0 ? Math.max(...servicios.map(s => s.ser_precio)) : 0;

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

        .sv-card {
          background: #1E3A5C;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }

        .sv-input {
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
        .sv-input:focus {
          border-color: rgba(37,99,235,0.6);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }
        .sv-input::placeholder { color: #475569; }

        .sv-input-plain {
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
        .sv-input-plain:focus {
          border-color: rgba(37,99,235,0.6);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }
        .sv-input-plain::placeholder { color: #475569; }

        .sv-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #94A3B8;
          margin-bottom: 6px;
          display: block;
        }

        .sv-input-wrap {
          position: relative;
        }
        .sv-input-wrap svg {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #475569;
          pointer-events: none;
        }

        .sv-btn-primary {
          background: #2563EB;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px 20px;
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
        .sv-btn-primary:hover { background: #1D4ED8; transform: translateY(-1px); }

        .sv-btn-success {
          background: rgba(16,185,129,0.2);
          color: #6EE7B7;
          border: 1px solid rgba(16,185,129,0.3);
          border-radius: 10px;
          padding: 8px 16px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sv-btn-success:hover { background: rgba(16,185,129,0.3); }

        .sv-btn-danger {
          background: rgba(239,68,68,0.15);
          color: #FCA5A5;
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 8px 16px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sv-btn-danger:hover { background: rgba(239,68,68,0.25); }

        .sv-btn-neutral {
          background: rgba(255,255,255,0.06);
          color: #94A3B8;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 8px 16px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sv-btn-neutral:hover { background: rgba(255,255,255,0.1); color: white; }

        .sv-btn-icon {
          background: none;
          border: none;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sv-btn-edit { color: #60A5FA; }
        .sv-btn-edit:hover { background: rgba(37,99,235,0.15); }
        .sv-btn-del { color: #FCA5A5; }
        .sv-btn-del:hover { background: rgba(239,68,68,0.15); }

        .sv-servicio-card {
          background: #1E3A5C;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sv-servicio-card:hover {
          border-color: rgba(37,99,235,0.3);
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .sv-badge-activo {
          display: inline-block;
          background: rgba(16,185,129,0.15);
          color: #6EE7B7;
          border: 1px solid rgba(16,185,129,0.25);
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          text-transform: capitalize;
        }

        .sv-alert-success {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 14px;
        }
        .sv-alert-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 14px;
        }
        .sv-alert-warning {
          background: rgba(251,191,36,0.08);
          border: 1px solid rgba(251,191,36,0.2);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .sv-alert-eliminated {
          background: rgba(16,185,129,0.08);
          border-top: 3px solid #10B981;
          padding: 28px;
          text-align: center;
        }

        @media (max-width: 640px) {
          .sv-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Título ── */}
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: 'white', textAlign: 'center', marginBottom: 20 }}>
        Servicios
      </h1>

      {/* ── Estadísticas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }} className="sv-grid-2">
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: 16, borderRadius: 14, color: 'white', border: '1px solid rgba(56,189,248,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Total Servicios</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800 }}>{totalServicios}</p>
            </div>
            <Package size={22} style={{ opacity: 0.8 }} />
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #059669, #10B981)', padding: 16, borderRadius: 14, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Precio Promedio</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800 }}>${precioPromedio.toLocaleString('es-CO', { maximumFractionDigits: 0 })}</p>
            </div>
            <TrendingUp size={22} style={{ opacity: 0.8 }} />
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', padding: 16, borderRadius: 14, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Servicio Más Caro</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800 }}>${servicioMasCaro.toLocaleString('es-CO')}</p>
            </div>
            <DollarSign size={22} style={{ opacity: 0.8 }} />
          </div>
        </div>
      </div>

      {/* ── Alertas ── */}
      <AnimatePresence>
        {mensajeVisible && (
          <motion.div className="sv-alert-success" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#6EE7B7', fontSize: 14, fontWeight: 600 }}>✅ Servicio guardado correctamente.</p>
          </motion.div>
        )}
        {errorCamposVisible && (
          <motion.div className="sv-alert-error" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#FCA5A5', fontSize: 14 }}>❌ Todos los campos son obligatorios.</p>
          </motion.div>
        )}
        {mensajeError && (
          <motion.div className="sv-alert-error" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#FCA5A5', fontSize: 14 }}>{mensajeError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Formulario agregar ── */}
      <div className="sv-card">
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Package size={17} color="#60A5FA" />
          Agregar nuevo servicio
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="sv-grid-2">
          <div>
            <label className="sv-label">Nombre del servicio:</label>
            <div className="sv-input-wrap">
              <Package size={16} />
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Corte de cabello" className="sv-input" />
            </div>
          </div>
          <div>
            <label className="sv-label">Precio del servicio:</label>
            <div className="sv-input-wrap">
              <DollarSign size={16} />
              <input type="number" min="0" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Sin punto ni comas. Ej: 20000" className="sv-input" />
            </div>
          </div>
        </div>
        <button onClick={handleAgregar} className="sv-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, borderRadius: 12 }}>
          Agregar servicio
        </button>
      </div>

      {/* ── Lista servicios ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(37,99,235,0.2)', borderTop: '3px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748B', fontSize: 14 }}>Cargando servicios...</p>
        </div>
      ) : servicios.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#475569' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15 }}>No hay servicios registrados aún.</p>
        </div>
      ) : (
        <div>
          {servicios.map((s) => (
            <motion.div key={s.id_ser} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="sv-servicio-card">

              {/* Estado: eliminado con éxito */}
              {servicioEliminado === s.id_ser ? (
                <motion.div className="sv-alert-eliminated" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <div style={{ width: 56, height: 56, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <svg style={{ width: 28, height: 28, color: '#34D399' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#6EE7B7', fontWeight: 600, fontSize: 15 }}>Servicio eliminado con éxito</p>
                </motion.div>

              /* Estado: confirmación eliminación */
              ) : servicioAEliminar === s.id_ser ? (
                <div className="sv-alert-warning">
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#FBBF24', fontWeight: 600, fontSize: 14, marginBottom: 14 }}>
                    ⚠️ ¿Estás seguro de eliminar este servicio?
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <button onClick={confirmarEliminacion} className="sv-btn-danger">Eliminar</button>
                    <button onClick={cancelarEliminacion} className="sv-btn-neutral">Cancelar</button>
                  </div>
                </div>

              /* Estado: editando */
              ) : editandoId === s.id_ser ? (
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#94A3B8', marginBottom: 14 }}>Editando servicio</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="sv-grid-2">
                    <div>
                      <label className="sv-label">Nombre:</label>
                      <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} placeholder="Nombre del servicio" className="sv-input-plain" />
                    </div>
                    <div>
                      <label className="sv-label">Precio:</label>
                      <input type="number" value={editPrecio} onChange={(e) => setEditPrecio(e.target.value)} placeholder="Precio del servicio" className="sv-input-plain" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={guardarEdicion} className="sv-btn-success">Guardar</button>
                    <button onClick={cancelarEdicion} className="sv-btn-neutral">Cancelar</button>
                  </div>
                </div>

              /* Estado: normal */
              ) : (
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #38BDF8)', padding: 10, borderRadius: '50%', flexShrink: 0 }}>
                        <Package size={18} color="white" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 16, marginBottom: 4 }}>{s.ser_nombre}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                          <DollarSign size={13} color="#94A3B8" />
                          <span style={{ fontFamily: 'DM Sans, sans-serif', color: '#94A3B8', fontSize: 13 }}>${s.ser_precio.toLocaleString('es-CO')}</span>
                        </div>
                        <span className="sv-badge-activo">{s.ser_estado}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button onClick={() => iniciarEdicion(s)} className="sv-btn-icon sv-btn-edit" title="Editar">
                        <Pencil size={17} />
                      </button>
                      <button onClick={() => eliminarServicio(s.id_ser)} className="sv-btn-icon sv-btn-del" title="Eliminar">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}