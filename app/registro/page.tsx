'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import Link from 'next/link'



/**
 * Función para generar un slug URL-amigable a partir del nombre del negocio.
 * Convierte a minúsculas, quita tildes, reemplaza espacios por guiones
 * y elimina caracteres especiales.
 */
function generarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
}


export default function RegistroPage() {
  const router = useRouter()

  // Estado del formulario
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [tipoNegocio, setTipoNegocio] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState('')
  const [exito, setExito] = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true);
  }, []);

  // Slug generado a partir del nombre
  const slugPreview = generarSlug(nombre.trim())

  // Lista de slugs reservados que no deben permitirse
  const slugsProhibidos = [
    'login', 'admin', 'dashboard', 'superadmin', 'zitapp',
    'api', 'logout', 'registro', 'reserva', 'reservar', 'clientes',
    'terminos', 'privacidad', 'politica-privacidad', 'ayuda', 'soporte'
  ]

  /**
   * Manejador principal de registro.
   * Valida nombre, correo, slug, registra en Auth y guarda cliente + perfil.
   */
  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const nombreLimpio = nombre.trim()
    const slug = generarSlug(nombreLimpio)

    // Validar contraseñas
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.')
      setLoading(false)
      return
    }

    // Validar términos y condiciones
    if (!aceptaTerminos) {
      setError('Debes aceptar los términos y condiciones para continuar.')
      setLoading(false)
      return
    }

    // Validar que el slug no esté en la lista de palabras reservadas
    if (slugsProhibidos.includes(slug)) {
      setError('Este nombre no está permitido. Por favor elige otro diferente.')
      setLoading(false)
      return
    }

    // Validar nombre (ignora mayúsculas y tildes)
    const { data: clientesConNombre, error: nombreError } = await supabase
      .from('clientes')
      .select('nombre')

    if (nombreError) {
      setError('Error al validar el nombre del negocio.')
      setLoading(false)
      return
    }

    const existeNombreIgual = clientesConNombre?.some(
      (c) => c.nombre.trim().toLowerCase() === nombreLimpio.toLowerCase()
    )
    if (!tipoNegocio) {
      setError('Por favor selecciona el tipo de negocio.')
      setLoading(false)
      return
    }

    if (!plan) {
      setError('Por favor selecciona un plan.');
      setLoading(false);
      return;
    }

    if (existeNombreIgual) {
      setError('Este nombre de negocio ya está registrado. Usa uno diferente.')
      setLoading(false)
      return
    }

    // Validar slug único
    const { data: slugExistente } = await supabase
      .from('clientes')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle()

    if (slugExistente) {
      setError('Ya existe un cliente con un nombre similar. Prueba con otro nombre.')
      setLoading(false)
      return
    }

    // Validar correo
    const { data: correoExistente } = await supabase
      .from('clientes')
      .select('correo')
      .eq('correo', email)
      .maybeSingle()

    if (correoExistente) {
      setError('Este correo ya está registrado para otro cliente.')
      setLoading(false)
      return
    }

    // Crear usuario en Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    const msg = signUpError?.message?.toLowerCase() || ''
    if (!data?.user) {
      if (msg.includes('user already registered')) {
        setError('Este correo ya está registrado para otro cliente.')
      } else if (msg.includes('you can only request this')) {
        setError('Por seguridad, espera unos segundos antes de volver a intentarlo.')
      } else if (msg.includes('email is invalid')) {
        setError('El correo ingresado no es válido.')
      } else {
        setError(signUpError?.message || 'No se pudo crear el usuario.')
      }

      setLoading(false)
      return
    }

    const userId = data.user.id

    // Calcular fecha de vencimiento del trial (15 días desde hoy)
    const fechaVencimiento = new Date()
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 15)

    // Insertar cliente
    const { error: insertClienteError } = await supabase.from('clientes').insert([
      {
        id_cliente: userId,
        user_id: userId,
        nombre: nombreLimpio,
        correo: email,
        intervalo_citas: 45,
        slug,
        tipo_negocio: tipoNegocio,
        plan,
        activo: 'Activo',
        suscripcion_activa: false,
        fecha_vencimiento_plan: fechaVencimiento.toISOString(),
      },
    ])

    if (insertClienteError) {
      setError('Error al crear cliente: ' + insertClienteError.message)
      setLoading(false)
      return
    }

    // Insertar perfil
    const { error: insertPerfilError } = await supabase.from('perfiles').insert([
      {
        user_id: userId,
        rol: 'cliente',
        id_cliente: userId,
      },
    ])

    if (insertPerfilError) {
      setError('Error al crear perfil: ' + insertPerfilError.message)
      setLoading(false)
      return
    }

    // Redirigir al login
    setExito('🎉 Cuenta creada con éxito. Revisa tu correo para confirmar e inicia sesión.');
      setLoading(false);

      // Espera 3 segundos y luego redirige
      setTimeout(() => {
        router.push('/login');
      }, 5000);
  }

  if (!mounted) {
    return null;
  }

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

      {/* Ambient glow fondo */}
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

        .reg-select {
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
          appearance: none;
          cursor: pointer;
        }
        .reg-select:focus {
          border-color: rgba(37,99,235,0.6);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }
        .reg-select option {
          background: #0F2438;
          color: white;
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
        .btn-whatsapp:hover {
          background: #1ebe5d;
          transform: translateY(-1px);
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

        .slug-preview {
          background: rgba(37,99,235,0.1);
          border: 1px solid rgba(37,99,235,0.25);
          border-radius: 10px;
          padding: 10px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #94A3B8;
        }
        .slug-preview span {
          color: #60A5FA;
          font-weight: 600;
          font-family: monospace;
        }

        .terminos-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.07);
          margin: 20px 0;
        }

        .terminos-link {
          color: #60A5FA;
          font-weight: 600;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .terminos-link:hover { color: #93C5FD; text-decoration: none; }
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
          Crear cuenta
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
          Empieza tu prueba gratuita de 15 días
        </motion.p>

        {/* Error */}
        {error && (
          <motion.div
            className="alert-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {error}
          </motion.div>
        )}

        {/* Modal de éxito */}
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
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative' }}>
                {/* Ícono */}
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
                  🎉 Cuenta Creada con Éxito
                </h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 17, fontWeight: 600, color: '#60A5FA', marginBottom: 12 }}>
                  ¡Bienvenido a Zitapp!
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#94A3B8', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                  Revisa tu correo electrónico para confirmar tu cuenta e inicia sesión para comenzar a gestionar tu negocio.
                </p>

                <div style={{
                  background: 'rgba(56,189,248,0.08)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  borderRadius: 12, padding: '12px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginBottom: 20,
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18 }} viewBox="0 0 20 20" fill="#38BDF8">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: '#38BDF8', fontSize: 14 }}>
                    Redirigiendo al login en 5 segundos
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
                    transition: 'all 0.2s',
                  }}
                >
                  Ir al Login Ahora
                </button>

                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#475569', marginTop: 16 }}>
                  Tu período de prueba gratuito de 15 días comienza ahora
                </p>
              </div>
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
          {/* Nombre */}
          <input
            type="text"
            placeholder="Nombre del negocio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="reg-input"
          />

          {/* Slug preview */}
          {mounted && nombre && (
            <motion.div
              className="slug-preview"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Tu enlace será:{' '}
              <span>zitapp.com/reservar/{slugPreview}</span>
            </motion.div>
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="reg-input"
          />

          {/* Tipo de negocio */}
          <select
            value={tipoNegocio}
            onChange={(e) => setTipoNegocio(e.target.value)}
            required
            className="reg-select"
          >
            <option value="">Selecciona el tipo de negocio</option>
            <option value="barberia">Barbería</option>
            <option value="spa">Spa</option>
            <option value="veterinaria">Veterinaria</option>
            <option value="cancha">Cancha de fútbol</option>
          </select>

          {/* Plan */}
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            required
            className="reg-select"
          >
            <option value="">Selecciona un plan</option>
            <option value="basico">Plan Básico (1 Profesional)</option>
            <option value="pro">Plan Pro (2-4 Profesionales)</option>
            <option value="premium">Plan Premium (5-10 Profesionales)</option>
          </select>

          {/* Contraseña */}
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="reg-input"
          />

          {/* Confirmar contraseña */}
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
            className="reg-input"
          />

          {/* Términos y condiciones */}
          {mounted && (
            <motion.div
              className="terminos-box"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <input
                type="checkbox"
                id="terminos"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                style={{
                  marginTop: 2,
                  width: 18, height: 18,
                  accentColor: '#2563EB',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                required
              />
              <label htmlFor="terminos" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#94A3B8', lineHeight: 1.6, cursor: 'pointer' }}>
                He leído y acepto los{' '}
                <Link href="/terminos" className="terminos-link" target="_blank">
                  términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link href="/politica-privacidad" className="terminos-link" target="_blank">
                  política de privacidad
                </Link>{' '}
                de Zitapp.
              </label>
            </motion.div>
          )}

          {/* Botón submit */}
          <motion.button
            type="submit"
            disabled={loading || !aceptaTerminos}
            whileTap={{ scale: 0.97 }}
            className="btn-registro"
            style={{ marginTop: 4 }}
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </motion.button>
        </motion.form>

        {/* Soporte WhatsApp */}
        <motion.div
          style={{ textAlign: 'center', marginTop: 20 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="divider" />
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#475569', marginBottom: 10 }}>
            ¿Necesitas ayuda?
          </p>
          <button
            onClick={() => window.open('https://wa.me/573001334528?text=Hola,%20necesito%20ayuda%20con%20el%20registro%20en%20Zitapp', '_blank')}
            className="btn-whatsapp"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.485"/>
            </svg>
            Ayuda con Registro
          </button>
        </motion.div>

        {/* Enlace al login */}
        <motion.div
          style={{ textAlign: 'center', marginTop: 16 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#64748B' }}>
            ¿Ya tienes una cuenta?{' '}
          </span>
          <button
            onClick={() => router.push('/login')}
            className="btn-login-link"
          >
            Inicia sesión
          </button>
        </motion.div>

        {/* Copyright */}
        {mounted && (
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
        )}
      </motion.div>
    </div>
  )
}



