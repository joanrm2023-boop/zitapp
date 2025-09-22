'use client' // Indica que este componente se ejecuta en el cliente (Next.js con app router)

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Home,
  Users,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react' // Iconos
import { motion, AnimatePresence } from 'framer-motion' // Para animaciones
import { supabase } from '@/lib/supabaseClient' // Cliente de Supabase
import { ReactNode } from 'react'

/**
 * Componente de layout general para el panel del administrador.
 * Incluye barra lateral, navegación, logout y vista responsive.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false) // Estado para el menú móvil
  const [sidebarOpen, setSidebarOpen] = useState(true) // Estado para barra lateral colapsada o expandida
  const router = useRouter()

  // Función para cerrar sesión con Supabase
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login') // Redirige al login
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-white">
      {/* BARRA LATERAL - ESCRITORIO */}
      <aside
        className={`hidden md:flex flex-col gap-6 shadow-lg p-6 bg-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        {/* Logo que cambia según estado expandido/colapsado */}
        <div className="flex justify-between items-center mb-4">
          {sidebarOpen ? (
            <img src="/logo_Zitapp.png" alt="Logo" className="w-24 mx-auto" />
          ) : (
            <img src="/logo_Zitapp.png" alt="Logo" className="w-8 mx-auto" />
          )}
        </div>

        {/* Navegación lateral */}
        <nav className="flex flex-col gap-4">
          <Link href="/admin" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <Home size={18} />
            {sidebarOpen && <span>Inicio</span>}
          </Link>
          <Link href="/admin/clientes" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <Users size={18} />
            {sidebarOpen && <span>Clientes</span>}
          </Link>
          <Link href="/admin/reservas" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <Calendar size={18} />
            {sidebarOpen && <span>Reservas</span>}
          </Link>
          <Link href="/admin/configuracion" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <Settings size={18} />
            {sidebarOpen && <span>Configuración</span>}
          </Link>
        </nav>

        {/* Botón de cerrar sesión al final de la barra lateral */}
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-2 text-red-600 hover:text-red-800"
        >
          <LogOut size={18} />
          {sidebarOpen && <span>Cerrar sesión</span>}
        </button>
      </aside>

      {/* BARRA LATERAL - MÓVIL CON ANIMACIÓN */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            className="fixed inset-0 z-40 bg-white shadow-lg p-6 flex flex-col gap-6 w-64 md:hidden"
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
          >
            {/* Logo y botón de cerrar */}
            <div className="flex justify-between items-center mb-6">
              <img src="/logo_Zitapp.png" alt="Logo" className="w-20" />
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Navegación en versión móvil */}
            <nav className="flex flex-col gap-4">
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <Home size={18} /> Inicio
              </Link>
              <Link href="/admin/clientes" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <Users size={18} /> Clientes
              </Link>
              <Link href="/admin/reservas" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <Calendar size={18} /> Reservas
              </Link>
              <Link href="/admin/configuracion" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <Settings size={18} /> Configuración
              </Link>
            </nav>

            {/* Botón de cerrar sesión móvil */}
            <button
              onClick={handleLogout}
              className="mt-auto flex items-center gap-2 text-red-600 hover:text-red-800"
            >
              <LogOut size={18} /> Cerrar sesión
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 p-4 md:p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          {/* Botón para colapsar barra lateral (escritorio) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:block text-gray-600 hover:text-gray-900"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Botón para abrir menú móvil (hamburguesa) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>

          {/* Nombre del usuario (estático por ahora) */}
          <h2 className="text-lg md:text-xl font-semibold text-gray-700 ml-auto">
            Hola, Joan 👋
          </h2>
        </div>

        {/* Aquí se renderiza el contenido de la página específica */}
        <main>{children}</main>
      </div>
    </div>
  )
}




