'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'

export default function RegistroProfesionalPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [exito, setExito] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const nombreLimpio = nombre.trim()
    const emailLimpio = email.trim().toLowerCase()

    // Validar contraseñas
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      setLoading(false)
      return
    }

    // Verificar que el correo exista en la tabla barberos
    const { data: barbero, error: errorBarbero } = await supabase
      .from('barberos')
      .select('id_barbero, user_id, nombre_barbero')
      .ilike('correo_barbero', emailLimpio)
      .eq('activo', true)
      .neq('estado', 'eliminado')
      .maybeSingle()

    if (errorBarbero) {
      setError('Error al verificar el correo. Intenta de nuevo.')
      setLoading(false)
      return
    }

    if (!barbero) {
      setError('Este correo no está registrado como profesional. Contacta al dueño de tu negocio.')
      setLoading(false)
      return
    }

    if (barbero.user_id) {
      setError('Este profesional ya tiene una cuenta activa. Ve al login.')
      setLoading(false)
      return
    }

    // Crear usuario en Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: emailLimpio,
      password,
      options: {
        data: { nombre: nombreLimpio }
      }
    })

    const msg = signUpError?.message?.toLowerCase() || ''
    if (!data?.user) {
      if (msg.includes('user already registered')) {
        setError('Este correo ya tiene una cuenta. Ve al login.')
      } else if (msg.includes('you can only request this')) {
        setError('Por seguridad, espera unos segundos antes de volver a intentarlo.')
      } else {
        setError(signUpError?.message || 'No se pudo crear la cuenta.')
      }
      setLoading(false)
      return
    }

    const userId = data.user.id

    // Vincular user_id al registro del barbero via API (bypasea RLS)
    const vincularRes = await fetch('/api/vincular-profesional', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_barbero: barbero.id_barbero, user_id: userId }),
    })

    if (!vincularRes.ok) {
      setError('Error al vincular la cuenta. Contacta al soporte.')
      setLoading(false)
      return
    }

    // Insertar en perfiles como profesional
    await supabase.from('perfiles').insert([{
      user_id: userId,
      rol: 'profesional',
    }])

    setExito(true)
    setLoading(false)
    setTimeout(() => router.push('/login'), 5000)
  }

  if (!mounted) return null

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0D1B2A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      fontFamily: 'DM Sans, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-100px', right: '-100px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-100px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .reg-input {
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
        .reg-input::placeholder { color: #475569; }
        .reg-input:focus {
          border-color: rgba(37,99,235,0.6);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }

        .btn-registro {
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
        .btn-registro:hover:not(:disabled) {
          background: #1D4ED8;
          box-shadow: 0 12px 32px rgba(37,99,235,0.50);
          transform: translateY(-1px);
        }
        .btn-registro:disabled {
          background: #1E3A5F;
          cursor: not-allowed;
          box-shadow: none;
          opacity: 0.6;
        }

        .btn-login-link {
          background: none;
          border: none;
          color: #60A5FA;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }
        .btn-login-link:hover { color: #93C5FD; }

        .alert-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 16px;
          color: #FCA5A5;
          font-size: 14px;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 20px 0;
        }

        .info-box {
          background: rgba(37,99,235,0.08);
          border: 1px solid rgba(37,99,235,0.2);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 16px;
        }
      `}</style>

      <motion.div
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#162033',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '36px',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >

        {/* Logo */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: -60, marginTop: -80 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <img
            src="/logo_Zitapp.png"
            alt="Zitapp Logo"
            style={{ width: 240, height: 240, margin: '0 auto', display: 'block' }}
          />
        </motion.div>

        {/* Título */}
        <motion.h2
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 26,
            fontWeight: 800,
            color: 'white',
            textAlign: 'center',
            marginBottom: 6,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Registro de Profesional
        </motion.h2>

        <motion.p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 14,
            color: '#64748B',
            textAlign: 'center',
            marginBottom: 24,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Crea tu cuenta para acceder a tus citas
        </motion.p>

        {/* Info */}
        <motion.div
          className="info-box"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#93C5FD', lineHeight: 1.5 }}>
            Usa el correo con el que el dueño del negocio te registró como profesional.
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            className="alert-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* Modal éxito */}
        {exito && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 50, padding: 24,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, #1E3A5F, #162033)',
                border: '1px solid rgba(56,189,248,0.3)',
                borderRadius: 20,
                padding: '32px',
                maxWidth: 420,
                width: '100%',
                boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: 64, height: 64,
                background: 'rgba(37,99,235,0.2)',
                border: '1px solid rgba(37,99,235,0.4)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 32, height: 32 }} viewBox="0 0 20 20" fill="#38BDF8">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>

              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 8 }}>
                🎉 Cuenta creada con éxito
              </h3>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#94A3B8', marginBottom: 20, lineHeight: 1.6 }}>
                Revisa tu correo para confirmar tu cuenta e inicia sesión para ver tus citas.
              </p>

              <div style={{
                background: 'rgba(56,189,248,0.08)',
                border: '1px solid rgba(56,189,248,0.2)',
                borderRadius: 12, padding: '12px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 20,
              }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#38BDF8', fontSize: 14 }}>
                  Redirigiendo al login en 5 segundos...
                </span>
              </div>

              <button
                onClick={() => router.push('/login')}
                style={{
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 32px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.35)',
                }}
              >
                Ir al Login
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Formulario */}
        <motion.form
          onSubmit={handleRegistro}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="reg-input"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="reg-input"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="reg-input"
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
            className="reg-input"
          />

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="btn-registro"
            style={{ marginTop: 4 }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </motion.button>
        </motion.form>

        <div className="divider" />

        {/* Enlace al login */}
        <motion.div
          style={{ textAlign: 'center' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#64748B' }}>
            ¿Ya tienes cuenta?{' '}
          </span>
          <button onClick={() => router.push('/login')} className="btn-login-link">
            Inicia sesión
          </button>
        </motion.div>

        {/* Copyright */}
        <motion.p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: 12,
            color: '#1E293B',
            textAlign: 'center',
            marginTop: 20,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          © {new Date().getFullYear()} Zitapp — Reservas Inteligentes
        </motion.p>

      </motion.div>
    </div>
  )
}
