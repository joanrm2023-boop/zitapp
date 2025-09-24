'use client' // Indicamos que este componente se renderiza exclusivamente en el cliente (Next.js App Router)

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { AlertTriangle, X, Clock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [trialExpirado, setTrialExpirado] = useState(false)
  const [diasRestantes, setDiasRestantes] = useState(0)
  
  // Nuevos estados para modal de advertencia
  const [mostrarModalAdvertencia, setMostrarModalAdvertencia] = useState(false)
  const [diasParaVencer, setDiasParaVencer] = useState(0)
  const [clienteParaAcceso, setClienteParaAcceso] = useState(null)

  // Nuevo estado para suscripción vencida
  const [suscripcionVencida, setSuscripcionVencida] = useState(false)

  const router = useRouter()

  // Función para calcular días transcurridos desde created_at
  const calcularDiasTranscurridos = (createdAt: string) => {
    const ahora = new Date()
    const fechaCreacion = new Date(createdAt)
    const diferencia = ahora.getTime() - fechaCreacion.getTime()
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
    return dias
  }

  // Función para calcular días hasta vencimiento
  const calcularDiasParaVencer = (fechaVencimiento) => {
    if (!fechaVencimiento) return null
    
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    
    const fechaVenc = new Date(fechaVencimiento)
    fechaVenc.setHours(0, 0, 0, 0)
    
    const diffTime = fechaVenc.getTime() - hoy.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const verificarVencimientoSuscripcion = async (cliente: any) => {
      // Solo verificar si tiene suscripción activa
      if (!cliente.suscripcion_activa || !cliente.fecha_vencimiento_plan) {
        return cliente;
      }

      const ahora = new Date();
      const fechaVencimiento = new Date(cliente.fecha_vencimiento_plan);

      // Si la suscripción ha vencido
      if (ahora > fechaVencimiento) {
        console.log(`Suscripción vencida para ${cliente.correo}. Vencimiento: ${fechaVencimiento}`);
        
        // Cambiar estado a Inactivo
        await supabase
          .from('clientes')
          .update({
            activo: 'Inactivo',
            suscripcion_activa: false,
            fecha_cambio_estado: new Date().toISOString()
          })
          .eq('correo', cliente.correo);
        
        return { 
          ...cliente, 
          activo: 'Inactivo', 
          suscripcion_activa: false 
        };
      }

      return cliente;
    };

  // Función para verificar y actualizar estado del cliente
    const verificarEstadoCliente = async (email: string) => {
      const { data: cliente, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('correo', email)
        .single()

      if (error || !cliente) {
        throw new Error('Cliente no encontrado')
      }

      const diasTranscurridos = calcularDiasTranscurridos(cliente.created_at)
      const diasRestantes = Math.max(0, 15 - diasTranscurridos)

      // Primero verificar vencimiento de suscripción pagada
      let clienteActualizado = await verificarVencimientoSuscripcion(cliente);

      // Luego verificar trial solo si no tiene suscripción activa
      if (diasTranscurridos >= 15 && clienteActualizado.activo === 'Activo' && !clienteActualizado.suscripcion_activa) {
        await supabase
          .from('clientes')
          .update({
            activo: 'Inactivo por P.P',
            fecha_cambio_estado: new Date().toISOString()
          })
          .eq('correo', email)
        
        return { ...clienteActualizado, activo: 'Inactivo por P.P', diasRestantes: 0 }
      }

      return { ...clienteActualizado, diasRestantes }
    }

  // Función para proceder al dashboard después del modal
  const procederAlDashboard = () => {
    setMostrarModalAdvertencia(false)
    router.push('/dashboard-cliente')
    setLoading(false)
  }

  // Función para ir a renovar plan
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
    setSuscripcionVencida(false) // Reset del nuevo estado

    try {
      // 1. Verificar credenciales
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      const userId = data.user.id

      // 2. Verificar rol
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('rol')
        .eq('user_id', userId)
        .single()

      // 3. Si es superadmin, permitir acceso directo
      if (perfil?.rol === 'superadmin') {
        router.push('/admin')
        setLoading(false)
        return
      }

      // 4. Si es cliente, verificar estado del trial
      if (perfil?.rol === 'cliente') {
        const cliente = await verificarEstadoCliente(email)

        // Verificar estado del cliente
        if (cliente.activo === 'Eliminado') {
          setError('Esta cuenta ha sido eliminada. Contacta al soporte.')
          setLoading(false)
          return
        }

        if (cliente.activo === 'Inactivo') {
          // Verificar si la inactividad es por suscripción vencida
          if (cliente.suscripcion_activa === false && cliente.fecha_vencimiento_plan) {
            setSuscripcionVencida(true)
            setLoading(false)
            return
          } else {
            // Inactividad por otros motivos (soporte)
            setError('Tu cuenta ha sido desactivada. Contacta al soporte para más información.')
            setLoading(false)
            return
          }
        }

        if (cliente.activo === 'Inactivo por P.P') {
          setTrialExpirado(true)
          setDiasRestantes(0)
          setLoading(false)
          return
        }

        // Si es "Activo", verificar si necesita advertencia
        if (cliente.activo === 'Activo') {
          if (cliente.suscripcion_activa && cliente.fecha_vencimiento_plan) {
            // Usuario con suscripción pagada - verificar si necesita advertencia
            const diasHastaVencer = calcularDiasParaVencer(cliente.fecha_vencimiento_plan)
            
            if (diasHastaVencer !== null && diasHastaVencer <= 3 && diasHastaVencer > 0) {
              // Mostrar modal de advertencia
              setDiasParaVencer(diasHastaVencer)
              setClienteParaAcceso(cliente)
              setMostrarModalAdvertencia(true)
              return // No setear loading(false) aquí, se hace en las funciones del modal
            }
            
            // Si no necesita advertencia, acceso directo
            router.push('/dashboard-cliente')
          } else {
            // Usuario en trial
            setDiasRestantes(cliente.diasRestantes)
            router.push('/dashboard-cliente')
          }
          setLoading(false)
          return
        }

        // Este caso no debería ocurrir, pero por seguridad
        setError('Estado de cuenta no válido.')
        setLoading(false)
        return
      }

      // Si no tiene rol válido
      setError('Rol no válido o no definido.')
      setLoading(false)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error inesperado')
      setLoading(false)
    }
  }

  // Función para obtener el mensaje del modal según días restantes
  const obtenerMensajeModal = (dias) => {
    if (dias === 1) return 'Tu suscripción vence mañana'
    return `Tu suscripción vence en ${dias} días`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white flex justify-center items-center py-6">
      <motion.div
        className="w-full max-w-md bg-white shadow-lg rounded-2xl px-6 pt-2 pb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.img
          src="/logo_Zitapp.png"
          alt="Zitapp Logo"
          className="w-40 h-40 mx-auto -mt-4 mb-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        <motion.h1
          className="text-3xl font-bold text-center mb-4 text-gray-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Iniciar sesión
        </motion.h1>

        {/* Mensaje de trial expirado */}
        {trialExpirado && (
          <motion.div
            className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Período de Prueba Expirado
              </h3>
              <p className="text-red-700 text-sm mb-3">
                Tu período de prueba gratuita de 15 días ha finalizado. 
                Para continuar usando Zitapp, actualiza tu plan.
              </p>
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                onClick={() => router.push('/planes')}
              >
                Actualizar Plan
              </button>
            </div>
          </motion.div>
        )}

        {/* Mensaje de suscripción vencida */}
        {suscripcionVencida && (
          <motion.div
            className="mb-4 p-4 bg-orange-50 border border-orange-300 rounded-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                Suscripción Vencida
              </h3>
              <p className="text-orange-700 text-sm mb-3">
                Tu suscripción ha expirado. Renueva tu plan para continuar usando Zitapp.
              </p>
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                onClick={() => router.push('/planes')}
              >
                Renovar Suscripción
              </button>
            </div>
          </motion.div>
        )}

        {error && !trialExpirado && !suscripcionVencida && (
          <motion.p
            className="text-sm text-red-500 text-center mb-4 border border-red-300 p-2 rounded bg-red-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {error}
          </motion.p>
        )}

        {!trialExpirado && !suscripcionVencida && (
          <motion.form
            onSubmit={handleLogin}
            className="flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-gray-800 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
                loading
                  ? 'bg-blue-600 text-white cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {loading && (
                <svg
                  className="w-5 h-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </motion.button>
          </motion.form>
        )}

        {/* Sección para registrarse - solo mostrar si no hay trial expirado ni suscripción vencida */}
        {!trialExpirado && !suscripcionVencida && (
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-base text-gray-700">¿No tienes una cuenta?</p>
            <button
              onClick={() => router.push('/registro')}
              className="mt-2 text-blue-600 text-xl font-bold hover:underline hover:text-blue-800 transition"
            >
              Regístrate
            </button>
          </motion.div>
        )}

        <motion.p
          className="text-sm text-gray-500 mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          © {new Date().getFullYear()} Zitapp — Reservas Inteligentes
        </motion.p>
      </motion.div>

      {/* Modal de Advertencia de Vencimiento */}
      {mostrarModalAdvertencia && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`${diasParaVencer <= 1 ? 'bg-gradient-to-r from-red-500 to-orange-500 border-red-600' : diasParaVencer <= 3 ? 'bg-gradient-to-r from-orange-500 to-yellow-500 border-orange-600' : 'bg-gradient-to-r from-yellow-500 to-orange-400 border-yellow-600'} border-2 rounded-2xl p-6 max-w-md w-full shadow-2xl text-white relative overflow-hidden`}
          >
            {/* Patrón de fondo sutil */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
            
            <div className="relative text-center">
              {/* Icono de advertencia */}
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 animate-pulse" />
              </div>

              {/* Título */}
              <h3 className="text-2xl font-bold mb-3">
                ⚠️ Suscripción por Vencer
              </h3>

              {/* Mensaje principal */}
              <p className="text-xl font-semibold mb-3">
                {obtenerMensajeModal(diasParaVencer)}
              </p>

              {/* Descripción */}
              <p className="text-white/90 mb-6 leading-relaxed">
                Tu suscripción está próxima a vencer. Te recomendamos renovarla ahora para evitar interrupciones en el servicio.
              </p>

              {/* Información adicional */}
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">
                    {diasParaVencer === 1 ? 'Último día disponible' : `${diasParaVencer} días restantes`}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={irARenovarPlan}
                  className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 border border-white/30 flex items-center justify-center gap-2"
                >
                  <span>Renovar Ahora</span>
                </button>
                
                <button
                  onClick={procederAlDashboard}
                  className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/90 font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-white/20"
                >
                  Continuar
                </button>
              </div>

              {/* Texto pequeño */}
              <p className="text-xs text-white/70 mt-4">
                Podrás acceder normalmente hasta que expire tu suscripción
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

