'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function DashboardProfesional() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profesional, setProfesional] = useState<any>(null)
  const [negocioActivo, setNegocioActivo] = useState(true)
  const [reservasHoy, setReservasHoy] = useState<any[]>([])

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Obtener datos del profesional
      const { data: barbero } = await supabase
        .from('barberos')
        .select('id_barbero, nombre_barbero, foto_url, id_cliente')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!barbero) { setLoading(false); return }
      setProfesional(barbero)

      // Verificar estado del negocio
      const { data: cliente } = await supabase
        .from('clientes')
        .select('activo, nombre')
        .eq('id_cliente', barbero.id_cliente)
        .maybeSingle()

      const activo = cliente?.activo === 'Activo'
      setNegocioActivo(activo)

      if (!activo) { setLoading(false); return }

      // Obtener citas de hoy
      const hoy = new Date()
      const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

      const { data: reservas } = await supabase
        .from('reservas')
        .select('id, nombre, hora, estado, nota, id_ser')
        .eq('id_barbero', barbero.id_barbero)
        .eq('fecha', fechaHoy)
        .neq('estado', 'incumplida')
        .order('hora', { ascending: true })

      setReservasHoy(reservas || [])
      setLoading(false)
    }

    cargarDatos()
  }, [])

  const getEstadoColor = (estado: string) => {
    if (estado === 'cumplida') return { color: '#6EE7B7', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' }
    return { color: '#60A5FA', bg: 'rgba(37,99,235,0.12)', border: 'rgba(37,99,235,0.25)' }
  }

  const horaActual = new Date().getHours() * 60 + new Date().getMinutes()
  const proximaCita = reservasHoy.find(r => {
    const [h, m] = r.hora.split(':').map(Number)
    return (h * 60 + m) >= horaActual && r.estado === 'pendiente'
  })

  if (!mounted) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ maxWidth: 800, margin: '0 auto' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Título */}
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px,4vw,28px)', fontWeight: 800, color: 'white', marginBottom: 20 }}>
        Mi Agenda de Hoy
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(37,99,235,0.2)', borderTop: '3px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748B', fontSize: 14 }}>Cargando tu agenda...</p>
        </div>
      ) : !negocioActivo ? (
        // ── Mensaje negocio en mora ──
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 16, padding: 32, textAlign: 'center' }}
        >
          <div style={{ width: 64, height: 64, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <AlertTriangle size={28} color="#FBBF24" />
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#FBBF24', marginBottom: 8 }}>
            Servicio no disponible
          </h2>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#94A3B8', fontSize: 15, lineHeight: 1.6 }}>
            El negocio donde trabajas tiene una suscripción inactiva.<br />
            No es posible cargar tu información en este momento.<br />
            Contacta al dueño del negocio para más información.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Estadísticas del día */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', padding: 16, borderRadius: 14, color: 'white', border: '1px solid rgba(56,189,248,0.2)' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Citas hoy</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800 }}>{reservasHoy.length}</p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #059669, #10B981)', padding: 16, borderRadius: 14, color: 'white' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Cumplidas</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800 }}>
                {reservasHoy.filter(r => r.estado === 'cumplida').length}
              </p>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', padding: 16, borderRadius: 14, color: 'white' }}>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Pendientes</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800 }}>
                {reservasHoy.filter(r => r.estado === 'pendiente').length}
              </p>
            </div>
          </div>

          {/* Próxima cita */}
          {proximaCita && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <Clock size={18} color="#60A5FA" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#60A5FA', fontWeight: 600, marginBottom: 2 }}>Próxima cita</p>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 800, color: 'white' }}>
                  {proximaCita.hora} — {proximaCita.nombre}
                </p>
              </div>
            </motion.div>
          )}

          {/* Lista de citas */}
          {reservasHoy.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#475569' }}>
              <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15 }}>No tienes citas programadas para hoy.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reservasHoy.map((reserva, i) => {
                const estilo = getEstadoColor(reserva.estado)
                const [h, m] = reserva.hora.split(':').map(Number)
                const minReserva = h * 60 + m
                const esPasada = minReserva < horaActual && reserva.estado === 'pendiente'

                return (
                  <motion.div
                    key={reserva.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      background: '#1E3A5C',
                      border: `1px solid ${esPasada ? 'rgba(255,255,255,0.06)' : estilo.border}`,
                      borderRadius: 14,
                      padding: '16px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                      opacity: esPasada ? 0.5 : 1,
                    }}
                  >
                    {/* Hora */}
                    <div style={{ background: estilo.bg, border: `1px solid ${estilo.border}`, borderRadius: 10, padding: '8px 14px', flexShrink: 0, textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: estilo.color }}>{reserva.hora}</p>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <User size={14} color="#94A3B8" />
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {reserva.nombre}
                        </p>
                      </div>
                      {reserva.nota && (
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {reserva.nota}
                        </p>
                      )}
                    </div>

                    {/* Estado */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: estilo.bg, border: `1px solid ${estilo.border}`, borderRadius: 999, padding: '4px 12px', flexShrink: 0 }}>
                      {reserva.estado === 'cumplida'
                        ? <CheckCircle size={13} color="#6EE7B7" />
                        : <Clock size={13} color="#60A5FA" />
                      }
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: estilo.color, textTransform: 'capitalize' }}>
                        {reserva.estado}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}
