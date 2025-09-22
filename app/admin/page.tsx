'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

export default function AdminDashboard() {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const [negocios, setNegocios] = useState(0)
  const [reservasTotales, setReservasTotales] = useState(0)
  const [clientesHoy, setClientesHoy] = useState(0)
  const [ultimasReservas, setUltimasReservas] = useState<any[]>([])

  useEffect(() => {
    const cargarDatos = async () => {
      // 1. Negocios registrados
      const { count: totalClientes } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
      setNegocios(totalClientes || 0)

      // 2. Reservas totales
      const { count: totalReservas } = await supabase
        .from('reservas')
        .select('*', { count: 'exact', head: true })
      setReservasTotales(totalReservas || 0)

      // 3. Clientes activos (estado = 'activo')
      const { count: activos } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .eq('activo', 'activo')
      setClientesHoy(activos || 0)

      // 4. Últimas reservas (5 más recientes)
      const { data: reservasData } = await supabase
        .from('reservas')
        .select('fecha, hora, clientes(nombre)')
        .order('fecha', { ascending: false })
        .limit(5)

      setUltimasReservas(reservasData || [])
    }

    cargarDatos()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="flex items-center gap-3">
            <img src="/logo_Zitapp.png" alt="Logo" className="w-12 h-12" />
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Zitapp</h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-white/50 transition"
            >
              Hola, Joan 👋
              <ChevronDown size={18} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-lg py-2 z-20">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TARJETAS DE RESUMEN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-gray-500 mb-2">Negocios registrados</p>
            <h2 className="text-3xl font-bold text-blue-700">{negocios}</h2>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-gray-500 mb-2">Reservas totales</p>
            <h2 className="text-3xl font-bold text-green-600">{reservasTotales}</h2>
          </motion.div>

          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-gray-500 mb-2">Clientes activos hoy</p>
            <h2 className="text-3xl font-bold text-purple-600">{clientesHoy}</h2>
          </motion.div>
        </div>

        {/* Sección de últimas reservas */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Últimas reservas</h3>
          {ultimasReservas.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay reservas recientes.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {ultimasReservas.map((reserva, idx) => (
                <li key={idx} className="py-2 flex justify-between text-sm text-gray-700">
                  <span>{reserva.clientes?.nombre || 'Negocio desconocido'}</span>
                  <span>
                    {reserva.hora} -{' '}
                    {reserva.fecha?.split('T')[0].split('-').reverse().join('/')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  )
}




