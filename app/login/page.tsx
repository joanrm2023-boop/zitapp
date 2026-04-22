'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Clock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [trialExpirado, setTrialExpirado] = useState(false)
  const [diasRestantes, setDiasRestantes] = useState(0)
  
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false)
  const [emailRecuperacion, setEmailRecuperacion] = useState('')
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState('')
  const [errorRecuperacion, setErrorRecuperacion] = useState('')
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false)

  const [mostrarModalAdvertencia, setMostrarModalAdvertencia] = useState(false)
  const [diasParaVencer, setDiasParaVencer] = useState(0)
  const [clienteParaAcceso, setClienteParaAcceso] = useState(null)
  const [suscripcionVencida, setSuscripcionVencida] = useState(false)

  // ── NUEVO: estados para negocio dinámico ──
  const [buscandoNegocio, setBuscandoNegocio] = useState(false)
  const [negocioEncontrado, setNegocioEncontrado] = useState<{
    nombre: string
    logo_url: string | null
  } | null>(null)
  const [esProfesional, setEsProfesional] = useState(false)

  const router = useRouter()

  // ── NUEVO: debounce para buscar negocio por correo ──
  useEffect(() => {
    const timer = setTimeout(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(email)) {
        buscarNegocioPorEmail(email)
      } else {
        setNegocioEncontrado(null)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [email])

  // ── NUEVO: buscar negocio en tabla clientes ──
  const buscarNegocioPorEmail = async (emailBuscar: string) => {
    try {
      setBuscandoNegocio(true)
      const emailNormalizado = emailBuscar.trim().toLowerCase()

      // Buscar primero en clientes
      const { data, error } = await supabase
        .from('clientes')
        .select('nombre, logo_url')
        .eq('correo', emailNormalizado)
        .single()

      if (!error && data) {
        setNegocioEncontrado({ nombre: data.nombre, logo_url: data.logo_url })
        setEsProfesional(false)
        return
      }

      // Si no es cliente, buscar en barberos
      const { data: barbero } = await supabase
        .from('barberos')
        .select('nombre_barbero, foto_url')
        .ilike('correo_barbero', emailNormalizado)
        .eq('activo', true)
        .neq('estado', 'eliminado')
        .maybeSingle()

      if (barbero) {
        setNegocioEncontrado({ nombre: barbero.nombre_barbero, logo_url: barbero.foto_url })
        setEsProfesional(true)
      } else {
        setNegocioEncontrado(null)
        setEsProfesional(false)
      }
    } catch {
      setNegocioEncontrado(null)
      setEsProfesional(false)
    } finally {
      setBuscandoNegocio(false)
    }
  }

  // ── Lógica existente sin cambios ──
  const calcularDiasTranscurridos = (createdAt: string) => {
    const ahora = new Date()
    const fechaCreacion = new Date(createdAt)
    const diferencia = ahora.getTime() - fechaCreacion.getTime()
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
    return dias
  }

  const calcularDiasParaVencer = (fechaVencimiento) => {
    if (!fechaVencimiento) return null
    const ahora = new Date()
    const año = ahora.getFullYear()
    const mes = String(ahora.getMonth() + 1).padStart(2, '0')
    const dia = String(ahora.getDate()).padStart(2, '0')
    const hoy = `${año}-${mes}-${dia}`
    const fechaVenc = fechaVencimiento
    const fecha1 = new Date(hoy + 'T00:00:00')
    const fecha2 = new Date(fechaVenc + 'T00:00:00')
    const diffTime = fecha2.getTime() - fecha1.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const verificarVencimientoSuscripcion = async (cliente: any) => {
    if (!cliente.suscripcion_activa || !cliente.fecha_vencimiento_plan) return cliente
    const ahora = new Date()
    const año = ahora.getFullYear()
    const mes = String(ahora.getMonth() + 1).padStart(2, '0')
    const dia = String(ahora.getDate()).padStart(2, '0')
    const hoyStr = `${año}-${mes}-${dia}`
    const fechaVencStr = String(cliente.fecha_vencimiento_plan).substring(0, 10)
    if (hoyStr > fechaVencStr) {
      console.log(`Suscripción vencida para ${cliente.correo}. Vencimiento: ${fechaVencStr}`)
      await supabase.from('clientes').update({
        activo: 'Inactivo',
        suscripcion_activa: false,
        fecha_cambio_estado: new Date().toISOString()
      }).eq('correo', cliente.correo)
      return { ...cliente, activo: 'Inactivo', suscripcion_activa: false }
    }
    return cliente
  }

  const verificarEstadoCliente = async (email: string) => {
    const { data: cliente, error } = await supabase
      .from('clientes').select('*').eq('correo', email).single()
    if (error || !cliente) throw new Error('Cliente no encontrado')
    const diasTranscurridos = calcularDiasTranscurridos(cliente.created_at)
    const diasRestantes = Math.max(0, 15 - diasTranscurridos)
    let clienteActualizado = await verificarVencimientoSuscripcion(cliente)
    if (diasTranscurridos >= 15 && clienteActualizado.activo === 'Activo' && !clienteActualizado.suscripcion_activa) {
      await supabase.from('clientes').update({
        activo: 'Inactivo por P.P',
        fecha_cambio_estado: new Date().toISOString()
      }).eq('correo', email)
      return { ...clienteActualizado, activo: 'Inactivo por P.P', diasRestantes: 0 }
    }
    return { ...clienteActualizado, diasRestantes }
  }

  const procederAlDashboard = () => {
    setMostrarModalAdvertencia(false)
    router.push('/dashboard-cliente')
    setLoading(false)
  }

  const irARenovarPlan = () => {
    setMostrarModalAdvertencia(false)
    router.push('/planes')
    setLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTrialExpirado(false)
    setSuscripcionVencida(false)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      const userId = data.user.id
      const { data: perfil } = await supabase.from('perfiles').select('rol').eq('user_id', userId).single()
      if (perfil?.rol === 'superadmin') { router.push('/admin'); setLoading(false); return }
      if (perfil?.rol === 'profesional') { router.push('/dashboard-profesional'); setLoading(false); return }
      if (perfil?.rol === 'cliente') {
        const cliente = await verificarEstadoCliente(email)
        if (cliente.activo === 'Eliminado') { setError('Esta cuenta ha sido eliminada. Contacta al soporte.'); setLoading(false); return }
        if (cliente.activo === 'Inactivo') {
          if (cliente.suscripcion_activa === false && cliente.fecha_vencimiento_plan) { setSuscripcionVencida(true); setLoading(false); return }
          else { setError('Tu cuenta ha sido desactivada. Contacta al soporte para más información.'); setLoading(false); return }
        }
        if (cliente.activo === 'Inactivo por P.P') { setTrialExpirado(true); setDiasRestantes(0); setLoading(false); return }
        if (cliente.activo === 'Activo') {
          if (cliente.suscripcion_activa && cliente.fecha_vencimiento_plan) {
            const diasHastaVencer = calcularDiasParaVencer(cliente.fecha_vencimiento_plan)
            if (diasHastaVencer !== null && diasHastaVencer <= 3 && diasHastaVencer > 0) {
              setDiasParaVencer(diasHastaVencer); setClienteParaAcceso(cliente); setMostrarModalAdvertencia(true); return
            }
            router.push('/dashboard-cliente')
          } else { setDiasRestantes(cliente.diasRestantes); router.push('/dashboard-cliente') }
          setLoading(false); return
        }
        setError('Estado de cuenta no válido.'); setLoading(false); return
      }
      setError('Rol no válido o no definido.'); setLoading(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error inesperado')
      setLoading(false)
    }
  }

  const handleRecuperarPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviandoRecuperacion(true)
    setErrorRecuperacion('')
    setMensajeRecuperacion('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperacion, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) { setErrorRecuperacion(error.message) }
      else {
        setMensajeRecuperacion('Te enviamos un correo con instrucciones para restablecer tu contraseña')
        setTimeout(() => { setMostrarRecuperacion(false); setEmailRecuperacion('') }, 3000)
      }
    } catch { setErrorRecuperacion('Error al enviar el correo de recuperación') }
    finally { setEnviandoRecuperacion(false) }
  }

  const obtenerMensajeModal = (dias) => {
    if (dias === 1) return 'Tu suscripción vence mañana'
    return `Tu suscripción vence en ${dias} días`
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1B2A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'DM Sans, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>

      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:.5 } }

        .login-input {
          width: 100%;
          background: #0F2438;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: white;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: #475569; }
        .login-input:focus { border-color: rgba(37,99,235,0.6); box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }

        .btn-login {
          width: 100%;
          background: #2563EB;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(37,99,235,0.35);
        }
        .btn-login:hover:not(:disabled) { background: #1D4ED8; box-shadow: 0 12px 32px rgba(37,99,235,0.50); transform: translateY(-1px); }
        .btn-login:disabled { background: #1E3A5F; cursor: not-allowed; box-shadow: none; }

        .btn-register {
          background: transparent;
          border: 1.5px solid rgba(37,99,235,0.4);
          color: #93C5FD;
          border-radius: 12px;
          padding: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }
        .btn-register:hover { background: rgba(37,99,235,0.1); border-color: rgba(37,99,235,0.7); color: white; }

        .btn-forgot {
          background: none;
          border: none;
          color: #60A5FA;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }
        .btn-forgot:hover { color: #93C5FD; text-decoration: underline; }

        .btn-whatsapp {
          background: #25D366;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 20px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 auto;
          transition: all 0.2s;
        }
        .btn-whatsapp:hover { background: #1ebe5d; transform: translateY(-1px); }

        .alert-trial { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 14px; padding: 20px; margin-bottom: 20px; }
        .alert-vencida { background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.3); border-radius: 14px; padding: 20px; margin-bottom: 20px; }
        .alert-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; color: #FCA5A5; font-size: 14px; text-align: center; font-family: 'DM Sans', sans-serif; }

        .btn-upgrade {
          width: 100%;
          background: #2563EB;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          margin-top: 12px;
          transition: all 0.2s;
        }
        .btn-upgrade:hover { background: #1D4ED8; transform: translateY(-1px); }

        .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 20px 0; }
      `}</style>

      <motion.div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#162033',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '32px 36px 40px 36px',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >

        {/* ── NUEVO: Header dinámico ── */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: 24 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo / Avatar dinámico */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <AnimatePresence mode="wait">
              {buscandoNegocio ? (
                // Spinner buscando
                <motion.div
                  key="spinner"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  style={{
                    width: 80, height: 80,
                    borderRadius: 20,
                    background: '#0F2438',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <div style={{
                    width: 28, height: 28,
                    border: '3px solid rgba(37,99,235,0.2)',
                    borderTop: '3px solid #2563EB',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                </motion.div>
              ) : negocioEncontrado?.logo_url ? (
                // Logo del negocio
                <motion.div
                  key="logo-negocio"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  style={{
                    width: 80, height: 80,
                    borderRadius: 20,
                    overflow: 'hidden',
                    border: '2px solid rgba(37,99,235,0.4)',
                    boxShadow: '0 8px 24px rgba(37,99,235,0.25)',
                  }}
                >
                  <img
                    src={negocioEncontrado.logo_url}
                    alt={negocioEncontrado.nombre}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </motion.div>
              ) : negocioEncontrado && !negocioEncontrado.logo_url ? (
                // Iniciales del negocio
                <motion.div
                  key="iniciales"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  style={{
                    width: 80, height: 80,
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, #1D4ED8, #38BDF8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 800,
                    fontSize: 28,
                    color: 'white',
                    border: '2px solid rgba(56,189,248,0.3)',
                    boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
                  }}
                >
                  {negocioEncontrado.nombre.charAt(0).toUpperCase()}
                </motion.div>
              ) : (
                // Logo Zitapp por defecto
                <motion.div
                  key="logo-default"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <img
                    src="/logo_Zitapp.png"
                    alt="Zitapp"
                    style={{ width: 100, height: 100, objectFit: 'contain' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Título dinámico */}
          <AnimatePresence mode="wait">
            {negocioEncontrado ? (
              <motion.div
                key="nombre-negocio"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h1 style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 24,
                  fontWeight: 800,
                  color: 'white',
                  marginBottom: 4,
                }}>
                  {negocioEncontrado.nombre}
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#64748B' }}>
                  {esProfesional ? 'Accede a tus citas' : 'Ingresa tu contraseña para continuar'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="titulo-default"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <h1 style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 28,
                  fontWeight: 800,
                  color: 'white',
                  marginBottom: 4,
                }}>
                  Iniciar sesión
                </h1>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#64748B' }}>
                  Bienvenido de vuelta
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Mensaje de trial expirado */}
        {trialExpirado && (
          <motion.div className="alert-trial" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, color: '#FCA5A5', marginBottom: 8 }}>Período de Prueba Expirado</h3>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#FDA4A4', fontSize: 13, lineHeight: 1.6 }}>Tu período de prueba gratuita de 15 días ha finalizado. Para continuar usando Zitapp, actualiza tu plan.</p>
              <button className="btn-upgrade" onClick={() => { const userData = { email, isRenewal: true, renewalType: 'trial_expired' }; sessionStorage.setItem('renewalData', JSON.stringify(userData)); router.push('/planes'); }}>Actualizar Plan</button>
            </div>
          </motion.div>
        )}

        {/* Mensaje de suscripción vencida */}
        {suscripcionVencida && (
          <motion.div className="alert-vencida" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, color: '#FDB78A', marginBottom: 8 }}>Suscripción Vencida</h3>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#FDC9A4', fontSize: 13, lineHeight: 1.6 }}>Tu suscripción ha expirado. Renueva tu plan para continuar usando Zitapp.</p>
              <button className="btn-upgrade" onClick={() => { const userData = { email, isRenewal: true, renewalType: 'trial_expired' }; sessionStorage.setItem('renewalData', JSON.stringify(userData)); router.push('/planes'); }}>Renovar Suscripción</button>
            </div>
          </motion.div>
        )}

        {/* Error general */}
        {error && !trialExpirado && !suscripcionVencida && (
          <motion.div className="alert-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>{error}</motion.div>
        )}

        {/* Formulario */}
        {!trialExpirado && !suscripcionVencida && (
          <motion.form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="login-input" required />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="login-input" required />
            <div style={{ textAlign: 'right', marginTop: -6 }}>
              <button type="button" onClick={() => setMostrarRecuperacion(true)} className="btn-forgot">¿Olvidaste tu contraseña?</button>
            </div>
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} className="btn-login">
              {loading && (
                <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </motion.button>
          </motion.form>
        )}

        {/* Registrarse */}
        {!trialExpirado && !suscripcionVencida && (
          <motion.div style={{ marginTop: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <div className="divider" />
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 10 }}>¿No tienes una cuenta?</p>
            <button onClick={() => router.push('/registro')} className="btn-register">Regístrate</button>
          </motion.div>
        )}

        {/* Soporte WhatsApp */}
        <motion.div style={{ textAlign: 'center', marginTop: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div className="divider" />
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#475569', marginBottom: 10 }}>¿Problemas para iniciar sesión?</p>
          <button onClick={() => window.open('https://wa.me/573001334528?text=Hola,%20tengo%20problemas%20para%20iniciar%20sesión%20en%20Zitapp', '_blank')} className="btn-whatsapp">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.485"/>
            </svg>
            Ayuda con Login
          </button>
        </motion.div>

        <motion.p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#1E293B', textAlign: 'center', marginTop: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          © {new Date().getFullYear()} Zitapp — Reservas Inteligentes
        </motion.p>
      </motion.div>

      {/* Modal Recuperación */}
      {mostrarRecuperacion && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ background: '#162033', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '32px', maxWidth: 420, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', position: 'relative' }}>
            <button onClick={() => { setMostrarRecuperacion(false); setEmailRecuperacion(''); setErrorRecuperacion(''); setMensajeRecuperacion('') }} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 8 }}>Recuperar Contraseña</h3>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748B', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.</p>
            {mensajeRecuperacion && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#6EE7B7', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{mensajeRecuperacion}</div>}
            {errorRecuperacion && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#FCA5A5', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{errorRecuperacion}</div>}
            <form onSubmit={handleRecuperarPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input type="email" placeholder="correo@ejemplo.com" value={emailRecuperacion} onChange={(e) => setEmailRecuperacion(e.target.value)} className="login-input" required />
              <button type="submit" disabled={enviandoRecuperacion} className="btn-login" style={{ opacity: enviandoRecuperacion ? 0.6 : 1 }}>{enviandoRecuperacion ? 'Enviando...' : 'Enviar Instrucciones'}</button>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Advertencia Vencimiento */}
      {mostrarModalAdvertencia && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ background: diasParaVencer <= 1 ? 'linear-gradient(135deg, #7F1D1D, #991B1B)' : diasParaVencer <= 3 ? 'linear-gradient(135deg, #78350F, #92400E)' : 'linear-gradient(135deg, #1E3A5F, #162033)', border: `1px solid ${diasParaVencer <= 1 ? 'rgba(239,68,68,0.4)' : diasParaVencer <= 3 ? 'rgba(249,115,22,0.4)' : 'rgba(37,99,235,0.4)'}`, borderRadius: 20, padding: '32px', maxWidth: 420, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <AlertTriangle size={28} color="white" style={{ animation: 'pulse 2s infinite' }} />
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 10 }}>⚠️ Suscripción por Vencer</h3>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, fontWeight: 600, color: 'white', marginBottom: 10 }}>{obtenerMensajeModal(diasParaVencer)}</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>Tu suscripción está próxima a vencer. Te recomendamos renovarla ahora para evitar interrupciones en el servicio.</p>
              <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                <Clock size={18} color="white" />
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'white', fontSize: 15 }}>{diasParaVencer === 1 ? 'Último día disponible' : `${diasParaVencer} días restantes`}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={irARenovarPlan} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '13px 24px', color: 'white', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}>Renovar Ahora</button>
                <button onClick={procederAlDashboard} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: '13px 24px', color: 'rgba(255,255,255,0.75)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}>Continuar</button>
              </div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 16 }}>Podrás acceder normalmente hasta que expire tu suscripción</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}