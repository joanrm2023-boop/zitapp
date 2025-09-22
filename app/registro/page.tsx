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
  const [aceptaTerminos, setAceptaTerminos] = useState(false) // 🆕 Estado para términos
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

    // 🆕 Validar términos y condiciones
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
        suscripcion_activa: false, // Trial no es suscripción pagada
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex justify-center items-center py-8">
      <motion.div
        className="w-full max-w-md bg-white shadow-lg rounded-2xl px-6 py-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.img
          src="/logo_Zitapp.png"
          alt="Zitapp Logo"
          className="w-40 h-40 mx-auto -mt-4 mb-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        <motion.h2 
          className="text-3xl font-bold text-center text-gray-800 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Crear cuenta
        </motion.h2>

        {/* Mensaje de error */}
        {error && (
          <motion.p
            className="text-sm text-red-600 text-center mb-6 border-2 border-red-200 p-4 rounded-xl bg-red-50 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {error}
          </motion.p>
        )}

        {exito && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500 to-blue-500 border-2 border-green-600 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white relative overflow-hidden"
            >
              {/* Patrón de fondo sutil */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
              
              <div className="relative text-center">
                {/* Icono de éxito */}
                <div className="mx-auto flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 animate-pulse"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {/* Título */}
                <h3 className="text-2xl font-bold mb-3">
                  🎉 Cuenta Creada con Éxito
                </h3>

                {/* Mensaje principal */}
                <p className="text-xl font-semibold mb-3">
                  ¡Bienvenido a Zitapp!
                </p>

                {/* Descripción */}
                <p className="text-white/90 mb-6 leading-relaxed">
                  Revisa tu correo electrónico para confirmar tu cuenta e inicia sesión para comenzar a gestionar tu negocio.
                </p>

                {/* Información adicional */}
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">
                      Redirigiendo al login en 5 segundos
                    </span>
                  </div>
                </div>

                {/* Botón de acción */}
                <div className="flex justify-center">
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 hover:scale-105 border border-white/30 flex items-center justify-center gap-2"
                  >
                    <span>Ir al Login Ahora</span>
                  </button>
                </div>

                {/* Texto pequeño */}
                <p className="text-xs text-white/70 mt-4">
                  Tu período de prueba gratuito de 15 días comienza ahora
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Formulario */}
        <motion.form 
          onSubmit={handleRegistro} 
          className="flex flex-col gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Nombre */}
          <input
            type="text"
            placeholder="Nombre del negocio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="text-gray-800 border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
          />

          {/* Slug en tiempo real */}
          {mounted && nombre && (
            <motion.p 
              className="text-sm text-gray-600 -mt-3 mb-1 bg-blue-50 p-3 rounded-lg border border-blue-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Tu enlace será:{' '}
              <span className="font-mono text-blue-700 font-semibold">
                zitapp.com/reservar/{slugPreview}
              </span>
            </motion.p>
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-gray-800 border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
          />

          {/* Tipo de negocio */}
          <select
            value={tipoNegocio}
            onChange={(e) => setTipoNegocio(e.target.value)}
            required
            className="text-gray-800 border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium bg-white"
          >
            <option value="">Selecciona el tipo de negocio</option>
            <option value="barberia">Barbería</option>
            <option value="spa">Spa</option>
            <option value="veterinaria">Veterinaria</option>
            <option value="cancha">Cancha de fútbol</option>
          </select>

          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            required
            className="text-gray-800 border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium bg-white"
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
            className="text-gray-800 border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
          />

          {/* Confirmar contraseña */}
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
            className="text-gray-800 border-2 border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
          />

          {/* 🆕 Términos y Condiciones */}
          {mounted && (
            <motion.div 
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <input
                type="checkbox"
                id="terminos"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                required
              />
              <label htmlFor="terminos" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                He leído y acepto los{' '}
                <Link 
                  href="/terminos" 
                  className="text-blue-600 hover:text-blue-800 font-semibold underline hover:no-underline transition-all duration-200"
                  target="_blank"
                >
                  términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link 
                  href="/politica-privacidad" 
                  className="text-blue-600 hover:text-blue-800 font-semibold underline hover:no-underline transition-all duration-200"
                  target="_blank"
                >
                  política de privacidad
                </Link>{' '}
                de Zitapp.
              </label>
            </motion.div>
          )}

          {/* Botón */}
          <motion.button
            type="submit"
            disabled={loading || !aceptaTerminos}
            whileTap={{ scale: 0.95 }}
            className={`py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-sm hover:shadow-md ${
              loading || !aceptaTerminos
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105'
            }`}
          >
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </motion.button>
        </motion.form>
        
        {/* Botón de soporte */}
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <p className="text-sm text-gray-700 mb-3">
              ¿Necesitas ayuda?
            </p>
            <button 
              onClick={() => window.open('https://wa.me/573152720293?text=Hola,%20necesito%20ayuda%20con%20el%20registro%20en%20Zitapp', '_blank')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.485"/>
              </svg>
              Contactar Soporte
            </button>
          </motion.div>

        {/* Enlace al login */}
        <motion.p 
          className="text-lg text-center text-gray-700 font-medium mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          ¿Ya tienes una cuenta?{' '}
          <span
            onClick={() => router.push('/login')}
            className="text-blue-600 font-bold hover:text-purple-600 transition-colors duration-200 hover:scale-105 transform inline-block cursor-pointer"
          >
            Inicia sesión
          </span>
        </motion.p>
        {mounted && (
        <motion.p
          className="text-sm text-gray-500 mt-6 text-center"
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




