'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import { 
  Calendar, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  ChevronRight,
  Star,
  Activity,
  AlertTriangle,
  X
} from 'lucide-react'

export default function DashboardCliente() {
  const router = useRouter()
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [diasParaVencer, setDiasParaVencer] = useState(null)
  const [mostrarBanner, setMostrarBanner] = useState(false)
  const [bannerCerrado, setBannerCerrado] = useState(false)
  const [stats, setStats] = useState({
    reservasHoy: 0,
    serviciosActivos: 0,
    ventasHoy: 0,
    clientesAtendidos: 0
  })
  const [proximasReservas, setProximasReservas] = useState([])
  const [serviciosPopulares, setServiciosPopulares] = useState([])

  useEffect(() => setMounted(true), [])

  // Función para calcular días hasta vencimiento
  const calcularDiasParaVencer = (fechaVencimiento) => {
    if (!fechaVencimiento) return null
    
    // Usar solo fechas sin horas para evitar problemas de zona horaria
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0) // Resetear a medianoche
    
    const fechaVenc = new Date(fechaVencimiento)
    fechaVenc.setHours(0, 0, 0, 0) // Resetear a medianoche
    
    const diffTime = fechaVenc.getTime() - hoy.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Obtener información del cliente usando user_id
        const { data: clienteData, error: clienteError } = await supabase
          .from('clientes')
          .select('id_cliente, nombre, fecha_vencimiento_plan, correo, user_id')
          .eq('user_id', user.id)
          .single()

        console.log('User ID:', user.id)
        console.log('Cliente obtenido:', clienteData)
        console.log('Error cliente:', clienteError)

        if (!clienteData) {
          console.log('No se encontró cliente para user_id:', user.id)
          return
        }

        setCliente(clienteData)
        
        // Calcular días para vencer y mostrar banner si es necesario
        const dias = calcularDiasParaVencer(clienteData.fecha_vencimiento_plan)
        setDiasParaVencer(dias)
        
        // Mostrar banner si faltan 5 días o menos (y no está vencido)
        if (dias !== null && dias <= 5 && dias > 0) {
          setMostrarBanner(true)
        }

        const idCliente = clienteData.id_cliente
        const hoy = new Date().toLocaleDateString('sv-SE')

        // 1. Cargar todas las reservas del cliente (sin filtro de fecha para debug)
        const { data: todasReservas, error: errorReservas } = await supabase
          .from('reservas')
          .select('*')
          .eq('id_cliente', idCliente)

        console.log('Todas las reservas:', todasReservas)
        console.log('Error reservas:', errorReservas)

        // Filtrar reservas de hoy en JavaScript
        const reservasHoy = todasReservas?.filter(r => r.fecha === hoy) || []

        // 2. Cargar servicios activos
        const { data: serviciosActivos, error: errorServicios } = await supabase
          .from('servicios')
          .select('*')
          .eq('id_cliente', idCliente)
          .eq('ser_estado', 'activo')

        console.log('Servicios activos:', serviciosActivos)
        console.log('Error servicios:', errorServicios)

        // 3. Calcular ventas del día (reservas cumplidas con servicio)
        let ventasHoy = 0
        let clientesAtendidos = 0

        if (reservasHoy.length > 0 && serviciosActivos) {
          const reservasCumplidas = reservasHoy.filter(r => r.estado === 'cumplida' && r.id_ser)
          
          if (reservasCumplidas.length > 0) {
            // Calcular ventas basado en servicios
            ventasHoy = reservasCumplidas.reduce((sum, r) => {
              const servicio = serviciosActivos.find(s => s.id_ser === r.id_ser)
              return sum + (servicio?.ser_precio || 0)
            }, 0)

            // Contar clientes únicos atendidos
            const clientesUnicos = new Set(reservasCumplidas.map(r => r.identificacion))
            clientesAtendidos = clientesUnicos.size
          }
        }

        // 4. Próximas reservas (pendientes de hoy, ordenadas por hora)
        const proximasReservasFiltradas = reservasHoy
          .filter(r => r.estado === 'pendiente')
          .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))
          .slice(0, 3)
          .map(r => ({
            id: r.id,
            cliente: r.nombre,
            servicio: 'Servicio programado',
            hora: r.hora
          }))

        // 5. Servicios más populares (filtrar por último mes en JavaScript)
        const hace30Dias = new Date()
        hace30Dias.setDate(hace30Dias.getDate() - 30)
        const fechaHace30Dias = hace30Dias.toLocaleDateString('sv-SE')

        const reservasUltimoMes = todasReservas?.filter(r => 
          r.estado === 'cumplida' && 
          r.id_ser && 
          r.fecha >= fechaHace30Dias
        ) || []

        let serviciosPopularesCalculados = []

        if (reservasUltimoMes.length > 0 && serviciosActivos && serviciosActivos.length > 0) {
          // Contar reservas por servicio
          const conteoServicios = {}
          reservasUltimoMes.forEach(r => {
            conteoServicios[r.id_ser] = (conteoServicios[r.id_ser] || 0) + 1
          })

          // Mapear con nombres de servicios
          serviciosPopularesCalculados = serviciosActivos
            .map(servicio => ({
              nombre: servicio.ser_nombre,
              reservas: conteoServicios[servicio.id_ser] || 0
            }))
            .sort((a, b) => b.reservas - a.reservas)
            .slice(0, 3)
        }

        // Actualizar estados
        setStats({
          reservasHoy: reservasHoy.length,
          serviciosActivos: serviciosActivos?.length || 0,
          ventasHoy: ventasHoy,
          clientesAtendidos: clientesAtendidos
        })

        setProximasReservas(proximasReservasFiltradas)
        setServiciosPopulares(serviciosPopularesCalculados)

      } catch (error) {
        console.error('Error cargando datos del dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      cargarDatos()
    }
  }, [mounted])

  // Función para obtener el color del banner según los días restantes
  const obtenerColorBanner = (dias) => {
    if (dias <= 1) return 'bg-red-500 border-red-600'
    if (dias <= 3) return 'bg-orange-500 border-orange-600' 
    return 'bg-yellow-500 border-yellow-600'
  }

  // Función para obtener el mensaje del banner
  const obtenerMensajeBanner = (dias) => {
    if (dias <= 0) return 'Tu suscripción ha vencido'
    if (dias === 1) return 'Tu suscripción vence mañana'
    return `Tu suscripción vence en ${dias} días`
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto p-4 space-y-6"
    >
      {/* Header de bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              className="text-2xl md:text-3xl font-bold mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Hola, {cliente?.nombre}!
            </motion.h1>
            <p className="text-blue-100 text-lg">
              Aquí tienes un resumen de tu negocio hoy
            </p>
          </div>
          <div className="hidden md:block">
            <img
              src="/logo_Zitapp.png"
              alt="Logo Zitapp"
              className="w-20 h-20 opacity-80"
            />
          </div>
        </div>
      </div>

      {/* Banner de advertencia de vencimiento */}
      {mostrarBanner && !bannerCerrado && diasParaVencer !== null && diasParaVencer <= 5 && diasParaVencer > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`${obtenerColorBanner(diasParaVencer)} border-2 rounded-xl p-4 text-white shadow-lg relative overflow-hidden`}
        >
          {/* Patrón de fondo sutil */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 animate-pulse" />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold mb-1">
                  ⚠️ {obtenerMensajeBanner(diasParaVencer)}
                </h3>
                <p className="text-white/90 text-sm">
                  Renueva ahora para continuar disfrutando de todos los beneficios de Zitapp
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  // Guardar datos del usuario actual para la renovación
                  const renovacionData = {
                    email: cliente?.correo || '', // Necesitarías añadir correo al select del cliente
                    planId: 'pendiente',
                    userId: cliente?.user_id || '',
                    esRenovacion: true
                  }
                  localStorage.setItem('renovacionData', JSON.stringify(renovacionData))
                  router.push('/planes')
                }}
                className="bg-white/20 hover:bg-white/30..."
              >
                <span>Renovar Plan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setBannerCerrado(true)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reservas Hoy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.reservasHoy}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="text-blue-600" size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Servicios Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.serviciosActivos}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Package className="text-green-600" size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ventas Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.ventasHoy.toLocaleString('es-CO')}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <DollarSign className="text-purple-600" size={20} />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clientes Atendidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.clientesAtendidos}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Users className="text-orange-600" size={20} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contenido principal en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas reservas */}
        <motion.div 
          className="bg-white p-6 rounded-lg shadow-sm border"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="text-blue-600" size={20} />
              Próximas Reservas
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
            </button>
          </div>
          
          <div className="space-y-3">
            {proximasReservas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="mx-auto mb-2 opacity-50" size={32} />
                <p>No hay reservas pendientes para hoy</p>
              </div>
            ) : (
              proximasReservas.map((reserva, index) => (
                <motion.div
                  key={reserva.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {reserva.cliente.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{reserva.cliente}</p>
                      <p className="text-sm text-gray-600">{reserva.servicio}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">{reserva.hora}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Servicios más populares */}
        <motion.div 
          className="bg-white p-6 rounded-lg shadow-sm border"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              Servicios Populares
            </h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
            </button>
          </div>
          
          <div className="space-y-4">
            {serviciosPopulares.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Star className="mx-auto mb-2 opacity-50" size={32} />
                <p>No hay datos suficientes aún</p>
              </div>
            ) : (
              serviciosPopulares.map((servicio, index) => (
                <motion.div
                  key={servicio.nombre}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{servicio.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-200 rounded-full h-2 w-16 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${serviciosPopulares.length > 0 ? Math.max((servicio.reservas / Math.max(...serviciosPopulares.map(s => s.reservas))) * 100, 10) : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{servicio.reservas}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Acciones rápidas */}
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-sm border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="text-purple-600" size={20} />
          Acciones Rápidas
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
              onClick={() => router.push('/dashboard-cliente/reservas')}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center group"
            >
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-blue-900">Ver Reservas</span>
            </button>
          
          <button 
            onClick={() => router.push('/dashboard-cliente/servicios')}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center group"
          >
            <Package className="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-green-900">Gestionar Servicios</span>
          </button>
          
          <button 
            onClick={() => router.push('/dashboard-cliente/ventas')}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center group"
          >
            <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-purple-900">Ver Ventas</span>
          </button>
          
          <button 
            onClick={() => router.push('/dashboard-cliente/profesionales')}
            className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-center group"
          >
            <Users className="w-6 h-6 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-orange-900">Profesionales</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}