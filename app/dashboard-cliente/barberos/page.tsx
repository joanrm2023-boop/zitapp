'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, User, UserPlus, Mail, TrendingUp, Users } from 'lucide-react';

export default function ProfesionalesPage() {
  const [mounted, setMounted] = useState(false);
  const [profesionales, setProfesionales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensajeVisible, setMensajeVisible] = useState(false);
  const [errorCamposVisible, setErrorCamposVisible] = useState(false);
  const [confirmacionVisible, setConfirmacionVisible] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [profesionalAEliminar, setProfesionalAEliminar] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCorreo, setEditCorreo] = useState('');
  const [planCliente, setPlanCliente] = useState<string>('');
  const [limitePlan, setLimitePlan] = useState<number>(0);
  const [profesionalEliminado, setProfesionalEliminado] = useState<string | null>(null);
  const [idCliente, setIdCliente] = useState<string>('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const cargarProfesionales = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clienteData } = await supabase
        .from('clientes')
        .select('id_cliente, plan')
        .eq('user_id', user.id)
        .single();

      if (!clienteData) { setLoading(false); return; }

      setIdCliente(clienteData.id_cliente);
      setPlanCliente(clienteData.plan);

      const limite = clienteData.plan === 'basico' ? 1 :
                    clienteData.plan === 'pro' ? 4 :
                    999;
      setLimitePlan(limite);

      const { data, error } = await supabase
        .from('barberos')
        .select('*')
        .eq('id_cliente', clienteData.id_cliente)
        .eq('activo', true)
        .neq('estado', 'eliminado');

      if (!error) setProfesionales(data || []);
      setLoading(false);
    };

    cargarProfesionales();
  }, []);

  const validarNombre = (valor: string) => {
    const nombreRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;
    const palabras = valor.trim().split(/\s+/);
    if (!nombreRegex.test(valor.trim())) {
      setMensajeError('El nombre solo puede contener letras y espacios.');
      return false;
    }
    if (palabras.length < 2) {
      setMensajeError('Por favor ingresa nombre y apellido (al menos dos palabras).');
      return false;
    }
    setMensajeError('');
    return true;
  };

  const validarCorreo = (valor: string) => {
    const correoRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|icloud\.com)$/;
    if (!correoRegex.test(valor.trim())) {
      setMensajeError('Por favor ingresa un correo válido con dominio permitido o revisa si esta bien escrito (@gmail.com, @hotmail.com, @outlook.com, @yahoo.com, @icloud.com).');
      return false;
    }
    setMensajeError('');
    return true;
  };

  const handleAgregar = async () => {
    if (!nombre.trim() || !correo.trim()) {
      setErrorCamposVisible(true);
      setTimeout(() => setErrorCamposVisible(false), 3000);
      return;
    }
    if (!validarNombre(nombre) || !validarCorreo(correo)) {
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }
    if (profesionales.length >= limitePlan) {
      const mensajeLimite = planCliente === 'basico'
        ? 'El plan Básico permite máximo 1 profesional. Actualiza tu plan para agregar más.'
        : `El plan Pro permite máximo ${limitePlan} profesionales. Actualiza tu plan para agregar más.`;
      setMensajeError(mensajeLimite);
      setTimeout(() => setMensajeError(''), 5000);
      return;
    }
    if (!idCliente) {
      setMensajeError('Error al obtener información del cliente.');
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }
    const { data, error } = await supabase
      .from('barberos')
      .insert([{ nombre_barbero: nombre.trim(), correo_barbero: correo.trim(), activo: true, id_cliente: idCliente }])
      .select();
    if (error) {
      console.error('Error al agregar profesional:', error.message);
      setMensajeError('Error al agregar el profesional.');
      setTimeout(() => setMensajeError(''), 3000);
    } else {
      setProfesionales((prev) => [...prev, ...data]);
      setNombre(''); setCorreo('');
      setMensajeVisible(true);
      setTimeout(() => setMensajeVisible(false), 3000);
    }
  };

  const iniciarEdicion = (profesional: any) => {
    setEditandoId(profesional.id_barbero);
    setEditNombre(profesional.nombre_barbero);
    setEditCorreo(profesional.correo_barbero);
  };

  const cancelarEdicion = () => { setEditandoId(null); setEditNombre(''); setEditCorreo(''); };

  const guardarEdicion = async () => {
    if (!editandoId || !editNombre.trim() || !editCorreo.trim()) {
      setErrorCamposVisible(true);
      setTimeout(() => setErrorCamposVisible(false), 3000);
      return;
    }
    if (!validarNombre(editNombre) || !validarCorreo(editCorreo)) {
      setTimeout(() => setMensajeError(''), 3000);
      return;
    }
    const { data, error } = await supabase
      .from('barberos')
      .update({ nombre_barbero: editNombre.trim(), correo_barbero: editCorreo.trim() })
      .eq('id_barbero', editandoId)
      .select();
    if (error) {
      setMensajeError('Error al guardar los cambios.');
      setTimeout(() => setMensajeError(''), 3000);
    } else {
      setProfesionales((prev) => prev.map((p) => (p.id_barbero === editandoId ? data[0] : p)));
      cancelarEdicion();
      setMensajeVisible(true);
      setTimeout(() => setMensajeVisible(false), 3000);
    }
  };

  const eliminarProfesional = (id: string) => { setProfesionalAEliminar(id); setConfirmacionVisible(true); };

  const confirmarEliminacion = async () => {
    if (!profesionalAEliminar) return;
    const { error } = await supabase
      .from('barberos')
      .update({ estado: 'eliminado' })
      .eq('id_barbero', profesionalAEliminar);
    if (!error) {
      setProfesionalEliminado(profesionalAEliminar);
      setConfirmacionVisible(false);
      setTimeout(() => {
        setProfesionales((prev) => prev.filter((p) => p.id_barbero !== profesionalAEliminar));
        setProfesionalEliminado(null);
        setProfesionalAEliminar(null);
      }, 2000);
    } else {
      setConfirmacionVisible(false);
      setProfesionalAEliminar(null);
    }
  };

  const cancelarEliminacion = () => { setConfirmacionVisible(false); setProfesionalAEliminar(null); };

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

        .pf-card {
          background: #1E3A5C;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }

        .pf-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #94A3B8;
          margin-bottom: 6px;
          display: block;
        }

        .pf-input {
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
        .pf-input:focus {
          border-color: rgba(37,99,235,0.6);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }
        .pf-input::placeholder { color: #475569; }

        .pf-input-plain {
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
        .pf-input-plain:focus {
          border-color: rgba(37,99,235,0.6);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }
        .pf-input-plain::placeholder { color: #475569; }

        .pf-input-wrap {
          position: relative;
        }
        .pf-input-wrap svg {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #475569;
          pointer-events: none;
        }

        .pf-btn-primary {
          width: 100%;
          background: #2563EB;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(37,99,235,0.3);
        }
        .pf-btn-primary:hover:not(:disabled) {
          background: #1D4ED8;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.4);
        }
        .pf-btn-primary:disabled {
          background: rgba(255,255,255,0.08);
          color: #475569;
          cursor: not-allowed;
          box-shadow: none;
        }

        .pf-btn-success {
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
        .pf-btn-success:hover { background: rgba(16,185,129,0.3); }

        .pf-btn-danger {
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
        .pf-btn-danger:hover { background: rgba(239,68,68,0.25); }

        .pf-btn-neutral {
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
        .pf-btn-neutral:hover { background: rgba(255,255,255,0.1); color: white; }

        .pf-btn-icon {
          background: none;
          border: none;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          min-height: 40px;
        }
        .pf-btn-edit { color: #60A5FA; }
        .pf-btn-edit:hover { background: rgba(37,99,235,0.15); }
        .pf-btn-del { color: #FCA5A5; }
        .pf-btn-del:hover { background: rgba(239,68,68,0.15); }

        .pf-prof-card {
          background: #1E3A5C;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pf-prof-card:hover {
          border-color: rgba(37,99,235,0.3);
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .pf-badge-activo {
          display: inline-block;
          background: rgba(16,185,129,0.15);
          color: #6EE7B7;
          border: 1px solid rgba(16,185,129,0.25);
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
        }

        .pf-plan-info {
          background: rgba(37,99,235,0.1);
          border: 1px solid rgba(37,99,235,0.2);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 14px;
        }

        .pf-alert-success {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 14px;
        }
        .pf-alert-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 14px;
        }
        .pf-alert-warning {
          background: rgba(251,191,36,0.08);
          border: 1px solid rgba(251,191,36,0.2);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .pf-alert-eliminated {
          background: rgba(16,185,129,0.08);
          border-top: 3px solid #10B981;
          padding: 28px;
          text-align: center;
        }

        @media (max-width: 640px) {
          .pf-grid-2 { grid-template-columns: 1fr !important; }
          .pf-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Título ── */}
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, color: 'white', textAlign: 'center', marginBottom: 20 }}>
        Profesionales
      </h1>

      {/* ── Estadísticas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }} className="pf-grid-3">
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: 16, borderRadius: 14, color: 'white', border: '1px solid rgba(56,189,248,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Total Profesionales</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800 }}>{profesionales.length}</p>
            </div>
            <Users size={22} style={{ opacity: 0.8 }} />
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #059669, #10B981)', padding: 16, borderRadius: 14, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Plan Actual</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, textTransform: 'capitalize' }}>{planCliente}</p>
            </div>
            <TrendingUp size={22} style={{ opacity: 0.8 }} />
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', padding: 16, borderRadius: 14, color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Límite del Plan</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800 }}>
                {limitePlan === 999 ? 'Ilimitado' : `${profesionales.length}/${limitePlan}`}
              </p>
            </div>
            <UserPlus size={22} style={{ opacity: 0.8 }} />
          </div>
        </div>
      </div>

      {/* ── Alertas ── */}
      <AnimatePresence>
        {errorCamposVisible && (
          <motion.div className="pf-alert-error" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#FCA5A5', fontSize: 14 }}>Todos los campos son obligatorios.</p>
          </motion.div>
        )}
        {mensajeError && (
          <motion.div className="pf-alert-error" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#FCA5A5', fontSize: 14 }}>{mensajeError}</p>
          </motion.div>
        )}
        {mensajeVisible && (
          <motion.div className="pf-alert-success" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#6EE7B7', fontSize: 14, fontWeight: 600 }}>✅ Operación realizada correctamente.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Formulario agregar ── */}
      <div className="pf-card">
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <UserPlus size={17} color="#60A5FA" />
          Agregar nuevo profesional
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }} className="pf-grid-2">
          <div>
            <label className="pf-label">Nombre del profesional:</label>
            <div className="pf-input-wrap">
              <User size={16} />
              <input
                type="text"
                value={nombre}
                onChange={(e) => { setNombre(e.target.value); if (e.target.value.trim()) validarNombre(e.target.value); }}
                placeholder="Nombre y apellido (ej: Juan Pérez)"
                className="pf-input"
              />
            </div>
          </div>
          <div>
            <label className="pf-label">Correo del profesional:</label>
            <div className="pf-input-wrap">
              <Mail size={16} />
              <input
                type="email"
                value={correo}
                onChange={(e) => { setCorreo(e.target.value); if (e.target.value.trim()) validarCorreo(e.target.value); }}
                placeholder="ejemplo@gmail.com"
                className="pf-input"
              />
            </div>
          </div>
        </div>

        {/* Info plan */}
        <div className="pf-plan-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#93C5FD' }}>
              <strong>Plan actual:</strong> {planCliente.charAt(0).toUpperCase() + planCliente.slice(1)}
            </span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#60A5FA' }}>
              {limitePlan === 999
                ? `${profesionales.length} profesionales (Ilimitado)`
                : `${profesionales.length}/${limitePlan} profesionales`}
            </span>
          </div>
          {limitePlan !== 999 && profesionales.length >= limitePlan && (
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#FBBF24', marginTop: 6 }}>
              Has alcanzado el límite de tu plan. Actualiza para agregar más profesionales.
            </p>
          )}
        </div>

        <button
          onClick={handleAgregar}
          disabled={profesionales.length >= limitePlan && limitePlan !== 999}
          className="pf-btn-primary"
        >
          {profesionales.length >= limitePlan && limitePlan !== 999
            ? `Límite alcanzado (${limitePlan} máximo)`
            : 'Agregar profesional'}
        </button>
      </div>

      {/* ── Lista profesionales ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(37,99,235,0.2)', borderTop: '3px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748B', fontSize: 14 }}>Cargando profesionales...</p>
        </div>
      ) : profesionales.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#475569' }}>
          <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15 }}>No hay profesionales registrados aún.</p>
        </div>
      ) : (
        <div>
          {profesionales.map((p) => (
            <motion.div key={p.id_barbero} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pf-prof-card">

              {/* Estado: editando */}
              {editandoId === p.id_barbero ? (
                <div style={{ padding: 20 }}>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#94A3B8', marginBottom: 14 }}>Editando profesional</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="pf-grid-2">
                    <div>
                      <label className="pf-label">Nombre:</label>
                      <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} placeholder="Nombre del profesional" className="pf-input-plain" />
                    </div>
                    <div>
                      <label className="pf-label">Correo:</label>
                      <input type="email" value={editCorreo} onChange={(e) => setEditCorreo(e.target.value)} placeholder="Correo del profesional" className="pf-input-plain" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={guardarEdicion} className="pf-btn-success">Guardar</button>
                    <button onClick={cancelarEdicion} className="pf-btn-neutral">Cancelar</button>
                  </div>
                </div>

              /* Estado: eliminado con éxito */
              ) : profesionalEliminado === p.id_barbero ? (
                <motion.div className="pf-alert-eliminated" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <div style={{ width: 56, height: 56, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <svg style={{ width: 28, height: 28 }} fill="none" stroke="#34D399" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#6EE7B7', fontWeight: 600, fontSize: 15 }}>Profesional eliminado con éxito</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#4ADE80', fontSize: 13, marginTop: 4 }}>La tarjeta se eliminará en un momento...</p>
                </motion.div>

              /* Estado: confirmación eliminación */
              ) : profesionalAEliminar === p.id_barbero ? (
                <div className="pf-alert-warning">
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#FBBF24', fontWeight: 600, fontSize: 14, marginBottom: 14 }}>
                    ¿Estás seguro de eliminar este profesional?
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                    <button onClick={confirmarEliminacion} className="pf-btn-danger">Eliminar</button>
                    <button onClick={cancelarEliminacion} className="pf-btn-neutral">Cancelar</button>
                  </div>
                </div>

              /* Estado: normal */
              ) : (
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #38BDF8)', padding: 10, borderRadius: '50%', flexShrink: 0 }}>
                        <User size={18} color="white" />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'white', fontSize: 16, marginBottom: 4 }}>{p.nombre_barbero}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <Mail size={13} color="#94A3B8" />
                          <span style={{ fontFamily: 'DM Sans, sans-serif', color: '#94A3B8', fontSize: 13 }}>{p.correo_barbero}</span>
                        </div>
                        <span className="pf-badge-activo">{p.estado || 'Activo'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      <button onClick={() => iniciarEdicion(p)} className="pf-btn-icon pf-btn-edit" title="Editar profesional">
                        <Pencil size={17} />
                      </button>
                      <button onClick={() => eliminarProfesional(p.id_barbero)} className="pf-btn-icon pf-btn-del" title="Eliminar profesional">
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