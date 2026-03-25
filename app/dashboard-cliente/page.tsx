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
    console.log('📅 DEBUG DÍAS PARA VENCER:')
    console.log('Hoy:', hoy)
    console.log('Vence:', fechaVenc)
    console.log('Días restantes:', diffDays)
    return diffDays
  }

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

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
        
        const dias = calcularDiasParaVencer(clienteData.fecha_vencimiento_plan)
        setDiasParaVencer(dias)
        
        if (dias !== null && dias <= 5) {
          setMostrarBanner(true)
        }

        const idCliente = clienteData.id_cliente
        const hoy = new Date().toLocaleDateString('sv-SE')

        const { data: todasReservas, error: errorReservas } = await supabase
          .from('reservas')
          .select('*')
          .eq('id_cliente', idCliente)

        console.log('Todas las reservas:', todasReservas)
        console.log('Error reservas:', errorReservas)

        const reservasHoy = todasReservas?.filter(r => r.fecha === hoy) || []

        const { data: serviciosActivos, error: errorServicios } = await supabase
          .from('servicios')
          .select('*')
          .eq('id_cliente', idCliente)
          .eq('ser_estado', 'activo')

        console.log('Servicios activos:', serviciosActivos)
        console.log('Error servicios:', errorServicios)

        let ventasHoy = 0
        let clientesAtendidos = 0

        if (reservasHoy.length > 0 && serviciosActivos) {
          const reservasCumplidas = reservasHoy.filter(r => r.estado === 'cumplida' && r.id_ser)
          if (reservasCumplidas.length > 0) {
            ventasHoy = reservasCumplidas.reduce((sum, r) => {
              const servicio = serviciosActivos.find(s => s.id_ser === r.id_ser)
              return sum + (servicio?.ser_precio || 0)
            }, 0)
            const clientesUnicos = new Set(reservasCumplidas.map(r => r.identificacion))
            clientesAtendidos = clientesUnicos.size
          }
        }

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
          const conteoServicios = {}
          reservasUltimoMes.forEach(r => {
            conteoServicios[r.id_ser] = (conteoServicios[r.id_ser] || 0) + 1
          })
          serviciosPopularesCalculados = serviciosActivos
            .map(servicio => ({
              nombre: servicio.ser_nombre,
              reservas: conteoServicios[servicio.id_ser] || 0
            }))
            .sort((a, b) => b.reservas - a.reservas)
            .slice(0, 3)
        }

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

  const obtenerColorBanner = (dias) => {
    if (dias < 0) return 'bg-red-700 border-red-800'
    if (dias === 0) return 'bg-red-600 border-red-700'
    if (dias === 1) return 'bg-red-500 border-red-600'
    if (dias <= 3) return 'bg-orange-500 border-orange-600'
    return 'bg-yellow-500 border-yellow-600'
  }

  const obtenerMensajeBanner = (dias) => {
    if (dias < 0) return `🔴 Tu suscripción venció hace ${Math.abs(dias)} días`
    if (dias === 0) return '🔴 Tu suscripción vence HOY'
    if (dias === 1) return '⚠️ Tu suscripción vence MAÑANA'
    return `⚠️ Tu suscripción vence en ${dias} días`
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid rgba(37,99,235,0.2)',
          borderTop: '3px solid #2563EB',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }

        .stat-card {
          background: #1E3A5C;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 16px;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }
        .stat-card:hover {
          border-color: rgba(37,99,235,0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.1);
        }

        .panel-card {
          background: #1E3A5C;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }

        .reserva-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          transition: all 0.2s;
        }
        .reserva-item:hover {
          background: rgba(37,99,235,0.12);
          border-color: rgba(37,99,235,0.4);
        }

        .accion-btn {
          padding: 14px 8px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          text-align: center;
          transition: all 0.2s;
          background: rgba(255,255,255,0.04);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .accion-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37,99,235,0.12);
        }
        .accion-btn-blue:hover  { background: rgba(37,99,235,0.12); border-color: rgba(37,99,235,0.4); }
        .accion-btn-green:hover { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.3); }
        .accion-btn-purple:hover{ background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.3); }
        .accion-btn-orange:hover{ background: rgba(249,115,22,0.15); border-color: rgba(249,115,22,0.3); }

        /* ── GRIDS RESPONSIVE ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .panels-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .acciones-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          .panels-grid {
            grid-template-columns: 1fr;
          }
          .acciones-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .welcome-logo {
            width: 56px !important;
            height: 56px !important;
          }
          .welcome-pad {
            padding: 20px !important;
          }
          .welcome-title {
            font-size: 20px !important;
          }
        }
      `}</style>

      {/* ── Header bienvenida ── */}
      <div className="welcome-pad" style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 60%, #2563EB 100%)',
        borderRadius: 20,
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid rgba(56,189,248,0.2)',
        boxShadow: '0 8px 32px rgba(37,99,235,0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.h1
            className="welcome-title"
            style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 800, color: 'white', marginBottom: 4 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Hola, {cliente?.nombre}!
          </motion.h1>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            Aquí tienes un resumen de tu negocio hoy
          </p>
        </div>
        <img
          src="/logo_Zitapp.png"
          alt="Logo Zitapp"
          className="welcome-logo"
          style={{ width: 80, height: 80, opacity: 0.9, position: 'relative', zIndex: 1, flexShrink: 0 }}
        />
      </div>

      {/* ── Banner advertencia vencimiento ── */}
      {mostrarBanner && !bannerCerrado && diasParaVencer !== null && diasParaVencer <= 5 && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`${obtenerColorBanner(diasParaVencer)} border-2 rounded-xl p-4 text-white shadow-lg relative overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
          </div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                {diasParaVencer < 0 || diasParaVencer === 0 ? (
                  <X className="w-8 h-8 animate-bounce" />
                ) : (
                  <AlertTriangle className="w-8 h-8 animate-pulse" />
                )}
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold mb-1">{obtenerMensajeBanner(diasParaVencer)}</h3>
                <p className="text-white/90 text-sm">
                  {diasParaVencer <= 0
                    ? 'Renueva AHORA para recuperar el acceso completo a Zitapp'
                    : 'Renueva ahora para continuar disfrutando de todos los beneficios de Zitapp'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  console.log('=== GUARDANDO EN DASHBOARD ===');
                  console.log('cliente?.correo:', cliente?.correo);
                  console.log('cliente?.nombre:', cliente?.nombre);
                  console.log('cliente?.user_id:', cliente?.user_id);
                  const renovacionData = {
                    email: cliente?.correo || '',
                    nombre: cliente?.nombre || '',
                    planId: 'pendiente',
                    userId: cliente?.user_id || '',
                    esRenovacion: true
                  }
                  localStorage.setItem('renovacionData', JSON.stringify(renovacionData))
                  router.push('/planes')
                }}
                className={`${diasParaVencer <= 0
                  ? 'bg-white text-red-600 font-bold animate-pulse'
                  : 'bg-white/20 hover:bg-white/30 text-white'
                } backdrop-blur-sm px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2 border border-white/30`}
              >
                <span>{diasParaVencer <= 0 ? '🔥 RENOVAR AHORA' : 'Renovar Plan'}</span>
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

      {/* ── Stats ── */}
      <div className="stats-grid">
        {[
          { label: 'Reservas Hoy', value: stats.reservasHoy, icon: Calendar, color: '#60A5FA', bg: 'rgba(37,99,235,0.12)' },
          { label: 'Servicios Activos', value: stats.serviciosActivos, icon: Package, color: '#34D399', bg: 'rgba(16,185,129,0.12)' },
          { label: 'Ventas Hoy', value: `$${stats.ventasHoy.toLocaleString('es-CO')}`, icon: DollarSign, color: '#A78BFA', bg: 'rgba(139,92,246,0.12)' },
          { label: 'Clientes Atendidos', value: stats.clientesAtendidos, icon: Users, color: '#FB923C', bg: 'rgba(249,115,22,0.12)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>{stat.label}</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1 }}>{stat.value}</p>
              </div>
              <div style={{ width: 40, height: 40, background: stat.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <stat.icon size={18} color={stat.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Próximas reservas + Servicios populares ── */}
      <div className="panels-grid">

        <motion.div
          className="panel-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Clock size={17} color="#60A5FA" />
            Próximas Reservas
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {proximasReservas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: '#94A3B8' }}>
                <Calendar size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>No hay reservas pendientes para hoy</p>
              </div>
            ) : (
              proximasReservas.map((reserva, index) => (
                <motion.div
                  key={reserva.id}
                  className="reserva-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36,
                      background: 'linear-gradient(135deg, #2563EB, #38BDF8)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: 'white',
                      flexShrink: 0,
                    }}>
                      {reserva.cliente.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'white', fontSize: 13 }}>{reserva.cliente}</p>
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#94A3B8' }}>{reserva.servicio}</p>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#60A5FA' }}>{reserva.hora}</p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          className="panel-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Star size={17} color="#FBBF24" />
            Servicios Populares
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {serviciosPopulares.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: '#94A3B8' }}>
                <Star size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>No hay datos suficientes aún</p>
              </div>
            ) : (
              serviciosPopulares.map((servicio, index) => (
                <motion.div
                  key={servicio.nombre}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 30, height: 30,
                      background: 'linear-gradient(135deg, #34D399, #60A5FA)',
                      borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: 'white',
                    }}>
                      {index + 1}
                    </div>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, color: 'white', fontSize: 13 }}>{servicio.nombre}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ background: '#E8EDF5', borderRadius: 999, height: 6, width: 56, overflow: 'hidden' }}>
                      <div style={{
                        background: 'linear-gradient(90deg, #34D399, #60A5FA)',
                        height: '100%', borderRadius: 999,
                        width: `${serviciosPopulares.length > 0 ? Math.max((servicio.reservas / Math.max(...serviciosPopulares.map(s => s.reservas))) * 100, 10) : 0}%`,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>{servicio.reservas}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Acciones rápidas ── */}
      <motion.div
        className="panel-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Activity size={17} color="#A78BFA" />
          Acciones Rápidas
        </h2>

        <div className="acciones-grid">
          <button onClick={() => router.push('/dashboard-cliente/reservas')} className="accion-btn accion-btn-blue">
            <div style={{ width: 38, height: 38, background: 'rgba(37,99,235,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} color="#60A5FA" />
            </div>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>Ver Reservas</span>
          </button>

          <button onClick={() => router.push('/dashboard-cliente/servicios')} className="accion-btn accion-btn-green">
            <div style={{ width: 38, height: 38, background: 'rgba(16,185,129,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} color="#34D399" />
            </div>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>Servicios</span>
          </button>

          <button onClick={() => router.push('/dashboard-cliente/ventas')} className="accion-btn accion-btn-purple">
            <div style={{ width: 38, height: 38, background: 'rgba(139,92,246,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#A78BFA" />
            </div>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>Ver Ventas</span>
          </button>

          <button onClick={() => router.push('/dashboard-cliente/profesionales')} className="accion-btn accion-btn-orange">
            <div style={{ width: 38, height: 38, background: 'rgba(249,115,22,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#FB923C" />
            </div>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>Profesionales</span>
          </button>
        </div>
      </motion.div>

    </motion.div>
  )
}