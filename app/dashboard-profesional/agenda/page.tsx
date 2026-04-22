'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, User, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AgendaProfesional() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingReservas, setLoadingReservas] = useState(false)
  const [idBarbero, setIdBarbero] = useState<string>('')
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('')
  const [reservasDia, setReservasDia] = useState<any[]>([])
  const [mesActual, setMesActual] = useState(new Date())

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: barbero } = await supabase
        .from('barberos')
        .select('id_barbero')
        .eq('user_id', user.id)
        .maybeSingle()

      if (barbero) setIdBarbero(barbero.id_barbero)
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!idBarbero || !fechaSeleccionada) return
    const cargarReservas = async () => {
      setLoadingReservas(true)
      const { data } = await supabase
        .from('reservas')
        .select('id, nombre, hora, estado, nota')
        .eq('id_barbero', idBarbero)
        .eq('fecha', fechaSeleccionada)
        .order('hora', { ascending: true })
      setReservasDia(data || [])
      setLoadingReservas(false)
    }
    cargarReservas()
  }, [idBarbero, fechaSeleccionada])

  // ── Generador de calendario ──
  const generarDiasDelMes = () => {
    const año = mesActual.getFullYear()
    const mes = mesActual.getMonth()
    const primerDia = new Date(año, mes, 1).getDay()
    const diasEnMes = new Date(año, mes + 1, 0).getDate()
    const dias: (number | null)[] = Array(primerDia).fill(null)
    for (let d = 1; d <= diasEnMes; d++) dias.push(d)
    return dias
  }

  const formatFecha = (dia: number) => {
    const año = mesActual.getFullYear()
    const mes = String(mesActual.getMonth() + 1).padStart(2, '0')
    return `${año}-${mes}-${String(dia).padStart(2, '0')}`
  }

  const hoy = new Date()
  const fechaHoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`

  const mesesNombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const diasSemana = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

  const getEstadoColor = (estado: string) => {
    if (estado === 'cumplida') return { color: '#6EE7B7', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' }
    if (estado === 'incumplida') return { color: '#FCA5A5', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' }
    return { color: '#60A5FA', bg: 'rgba(37,99,235,0.12)', border: 'rgba(37,99,235,0.25)' }
  }

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

      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(22px,4vw,28px)', fontWeight: 800, color: 'white', marginBottom: 20 }}>
        Mi Agenda
      </h1>

      {/* ── Calendario ── */}
      <div style={{ background: '#1E3A5C', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginBottom: 20 }}>

        {/* Navegación mes */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <motion.button
            onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1))}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#94A3B8', display: 'flex' }}
          >
            <ChevronLeft size={18} />
          </motion.button>

          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: 'white' }}>
            {mesesNombres[mesActual.getMonth()]} {mesActual.getFullYear()}
          </p>

          <motion.button
            onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1))}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#94A3B8', display: 'flex' }}
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>

        {/* Días de la semana */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {diasSemana.map(d => (
            <p key={d} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, color: '#475569', textAlign: 'center', padding: '4px 0' }}>{d}</p>
          ))}
        </div>

        {/* Días del mes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {generarDiasDelMes().map((dia, i) => {
            if (!dia) return <div key={`empty-${i}`} />
            const fecha = formatFecha(dia)
            const esHoy = fecha === fechaHoyStr
            const esSeleccionado = fecha === fechaSeleccionada
            const esPasado = fecha < fechaHoyStr

            return (
              <motion.button
                key={fecha}
                onClick={() => setFechaSeleccionada(fecha)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  aspectRatio: '1',
                  borderRadius: 10,
                  border: esSeleccionado
                    ? '2px solid #2563EB'
                    : esHoy
                    ? '1px solid rgba(56,189,248,0.4)'
                    : '1px solid transparent',
                  background: esSeleccionado
                    ? '#2563EB'
                    : esHoy
                    ? 'rgba(56,189,248,0.12)'
                    : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 13,
                  fontWeight: esHoy || esSeleccionado ? 700 : 400,
                  color: esSeleccionado ? 'white' : esHoy ? '#38BDF8' : esPasado ? '#334155' : '#94A3B8',
                }}>
                  {dia}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Citas del día seleccionado ── */}
      <AnimatePresence mode="wait">
        {!fechaSeleccionada ? (
          <motion.div
            key="sin-seleccion"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}
          >
            <Calendar size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Selecciona un día para ver tus citas</p>
          </motion.div>
        ) : loadingReservas ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 28, height: 28, border: '3px solid rgba(37,99,235,0.2)', borderTop: '3px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#64748B', fontSize: 13 }}>Cargando citas...</p>
          </motion.div>
        ) : (
          <motion.div key={fechaSeleccionada} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Calendar size={16} color="#60A5FA" />
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: 'white' }}>
                {new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#64748B' }}>
                — {reservasDia.length} cita{reservasDia.length !== 1 ? 's' : ''}
              </span>
            </div>

            {reservasDia.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569' }}>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>Sin citas este día.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reservasDia.map((reserva, i) => {
                  const estilo = getEstadoColor(reserva.estado)
                  return (
                    <motion.div
                      key={reserva.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ background: '#1E3A5C', border: `1px solid ${estilo.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
                    >
                      <div style={{ background: estilo.bg, border: `1px solid ${estilo.border}`, borderRadius: 10, padding: '8px 14px', flexShrink: 0, textAlign: 'center' }}>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: estilo.color }}>{reserva.hora}</p>
                      </div>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: estilo.bg, border: `1px solid ${estilo.border}`, borderRadius: 999, padding: '4px 12px', flexShrink: 0 }}>
                        {reserva.estado === 'cumplida'
                          ? <CheckCircle size={13} color="#6EE7B7" />
                          : <Clock size={13} color={estilo.color} />
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
