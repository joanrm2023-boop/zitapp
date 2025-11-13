'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'

import {
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign, 
  Package,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import 'react-datepicker/dist/react-datepicker.css';
import { supabase } from '@/lib/supabaseClient'
import { ReactNode } from 'react'

export default function ClienteLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [clienteNombre, setClienteNombre] = useState('cliente')
  const [clienteLogo, setClienteLogo] = useState('')
  const [tipoNegocio, setTipoNegocio] = useState('')
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Cargar datos del cliente (nombre, logo y tipo de negocio)
  useEffect(() => {
    const obtenerCliente = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('clientes')
        .select('nombre, tipo_negocio, logo_url')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data?.nombre) {
        setClienteNombre(data.nombre)
      }

      if (data?.tipo_negocio) {
        setTipoNegocio(data.tipo_negocio)
      }

      if (data?.logo_url) {
        setClienteLogo(data.logo_url)
      }
    }

    obtenerCliente()
  }, [])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-white">
      {/* Sidebar - escritorio */}
      <motion.aside
        className={`hidden md:flex flex-col gap-6 shadow-xl p-6 bg-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div 
          className="flex justify-center items-center mb-6"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <img
            src="/logo_Zitapp.png"
            alt="Logo"
            className={`transition-all duration-300 ${sidebarOpen ? 'w-24' : 'w-12'}`}
          />
        </motion.div>

        {/* Navegación */}
        <nav className="flex flex-col gap-3">
          <Link
            href="/dashboard-cliente"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-3 transition-all duration-200 group"
          >
            <Home size={20} className="group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="font-medium">Inicio</span>}
          </Link>

          <Link
            href="/dashboard-cliente/mi-negocio"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-3 transition-all duration-200 group"
          >
            <Settings size={20} className="group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="font-medium">Mi negocio</span>}
          </Link>

          <Link
            href="/dashboard-cliente/servicios"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-3 transition-all duration-200 group"
          >
            <Package size={20} className="group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="font-medium">Servicios</span>}
          </Link>

          <Link
            href="/dashboard-cliente/ventas"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-3 transition-all duration-200 group"
          >
            <DollarSign size={20} className="group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="font-medium">Ventas</span>}
          </Link>

          {/* Módulo condicional por tipo de negocio */}
          {['barberia', 'spa', 'veterinaria'].includes(tipoNegocio?.toLowerCase()) && (
            <Link
              href="/dashboard-cliente/barberos"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-3 transition-all duration-200 group"
            >
              <Users size={20} className="group-hover:scale-110 transition-transform" />
              {sidebarOpen && <span className="font-medium">Profesionales</span>}
            </Link>
          )}

          {tipoNegocio === 'cancha' && (
            <Link
              href="/dashboard-cliente/canchas"
              className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-3 transition-all duration-200 group"
            >
              <Users size={20} className="group-hover:scale-110 transition-transform" />
              {sidebarOpen && <span className="font-medium">Canchas</span>}
            </Link>
          )}

          <Link
            href={tipoNegocio === 'cancha' ? '/dashboard-cliente/reservas-canchas' : '/dashboard-cliente/reservas'}
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-3 transition-all duration-200 group"
          >
            <Calendar size={20} className="group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="font-medium">Reservas</span>}
          </Link>
        </nav>

        {/* Botón de logout */}
        <motion.button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg p-3 transition-all duration-200 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={20} className="group-hover:scale-110 transition-transform" />
          {sidebarOpen && <span className="font-medium">Cerrar sesión</span>}
        </motion.button>
      </motion.aside>

      {/* Sidebar - móvil */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu */}
            <motion.aside
              className="fixed left-0 top-0 bottom-0 z-50 bg-white shadow-2xl p-6 flex flex-col gap-6 w-72 md:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header del menu */}
              <div className="flex justify-between items-center mb-4">
                <motion.img 
                  src="/logo_Zitapp.png" 
                  alt="Logo" 
                  className="w-20"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                />
                <motion.button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Navegación móvil */}
              <nav className="flex flex-col gap-2">
                <Link
                  href="/dashboard-cliente"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-4 transition-all duration-200"
                >
                  <Home size={20} />
                  <span className="font-medium">Inicio</span>
                </Link>

                <Link
                  href="/dashboard-cliente/mi-negocio"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-4 transition-all duration-200"
                >
                  <Settings size={20} />
                  <span className="font-medium">Mi negocio</span>
                </Link>

                <Link
                  href="/dashboard-cliente/servicios"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-4 transition-all duration-200"
                >
                  <Package size={20} />
                  <span className="font-medium">Servicios</span>
                </Link>

                <Link
                  href="/dashboard-cliente/ventas"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-4 transition-all duration-200"
                >
                  <DollarSign size={20} />
                  <span className="font-medium">Ventas</span>
                </Link>

                {/* Módulos condicionales */}
                {['barberia', 'spa', 'veterinaria'].includes(tipoNegocio?.toLowerCase()) && (
                  <Link
                    href="/dashboard-cliente/barberos"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-4 transition-all duration-200"
                  >
                    <Users size={20} />
                    <span className="font-medium">Profesionales</span>
                  </Link>
                )}

                {tipoNegocio === 'cancha' && (
                  <Link
                    href="/dashboard-cliente/canchas"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-4 transition-all duration-200"
                  >
                    <Users size={20} />
                    <span className="font-medium">Canchas</span>
                  </Link>
                )}

                <Link
                  href={tipoNegocio === 'cancha' ? '/dashboard-cliente/reservas-canchas' : '/dashboard-cliente/reservas'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg p-4 transition-all duration-200"
                >
                  <Calendar size={20} />
                  <span className="font-medium">Reservas</span>
                </Link>
              </nav>

              {/* Logout móvil estilizado */}
              <motion.button
                onClick={handleLogout}
                className="mt-auto flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl p-4 transition-all duration-300 group shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-semibold">Cerrar sesión</span>
              </motion.button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <div className="flex-1 p-4 md:p-6 w-full">
        {/* Header */}
        <motion.div 
          className="flex justify-between items-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Toggle sidebar desktop */}
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:block text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>

          {/* Menu hamburguesa móvil */}
          <motion.button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg p-2 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu size={24} />
          </motion.button>

          {/* Saludo con logo */}
          <motion.div 
            className="flex items-center gap-3 ml-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h2 
              className="text-lg md:text-xl font-semibold text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Hola, {clienteNombre}
            </motion.h2>
            
            {/* Logo del cliente si existe */}
            {clienteLogo && (
              <motion.img
                src={clienteLogo}
                alt="Logo del negocio"
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              />
            )}
          </motion.div>
        </motion.div>

        {/* Contenido */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.main>
        
        <Toaster position="bottom-right" />
      </div>
    </div>
  )
}