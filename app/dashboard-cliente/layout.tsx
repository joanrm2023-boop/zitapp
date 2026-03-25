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

      if (data?.nombre) setClienteNombre(data.nombre)
      if (data?.tipo_negocio) setTipoNegocio(data.tipo_negocio)
      if (data?.logo_url) setClienteLogo(data.logo_url)
    }

    obtenerCliente()
  }, [])

  /* ── Sección logo compartida ── */
  const logoSection = (small = false) => (
    <motion.div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        borderRadius: 14,
        padding: small ? 8 : 10,
        marginBottom: 20,
        boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
        border: '1px solid rgba(56,189,248,0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glow interior */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80,
        background: 'radial-gradient(circle, rgba(56,189,248,0.3) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <img
        src="/logo_Zitapp.png"
        alt="Logo"
        style={{
          width: small ? 100 : (sidebarOpen ? 250 : 88),
          height: small ? 100 : (sidebarOpen ? 250 : 88),
          transition: 'all 0.3s',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </motion.div>
  )

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#1A3A5C',
      fontFamily: 'DM Sans, sans-serif',
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #94A3B8;
          border-radius: 10px;
          padding: 10px 12px;
          transition: all 0.2s;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 14px;
        }
        .nav-link:hover {
          color: white;
          background: rgba(37,99,235,0.15);
        }
        .nav-link-mobile {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #94A3B8;
          border-radius: 10px;
          padding: 12px 14px;
          transition: all 0.2s;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 15px;
        }
        .nav-link-mobile:hover {
          color: white;
          background: rgba(37,99,235,0.15);
        }
        .toggle-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .toggle-btn:hover {
          background: rgba(37,99,235,0.15);
          color: white;
          border-color: rgba(37,99,235,0.3);
        }
      `}</style>

      {/* ══ SIDEBAR DESKTOP ══ */}
      <motion.aside
        style={{
          display: 'none',
          flexDirection: 'column',
          gap: 6,
          padding: '16px',
          background: '#1E4068',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          width: sidebarOpen ? 240 : 72,
          transition: 'width 0.3s ease',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
        className="md:flex"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo con fondo azul vibrante */}
        {logoSection(false)}

        {/* Separador */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 12 }} />

        {/* Navegación */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <Link href="/dashboard-cliente" className="nav-link">
            <Home size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Inicio</span>}
          </Link>

          <Link href="/dashboard-cliente/mi-negocio" className="nav-link">
            <Settings size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Mi negocio</span>}
          </Link>

          <Link href="/dashboard-cliente/servicios" className="nav-link">
            <Package size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Servicios</span>}
          </Link>

          <Link href="/dashboard-cliente/ventas" className="nav-link">
            <DollarSign size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Ventas</span>}
          </Link>

          {['barberia', 'spa', 'veterinaria'].includes(tipoNegocio?.toLowerCase()) && (
            <Link href="/dashboard-cliente/barberos" className="nav-link">
              <Users size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>Profesionales</span>}
            </Link>
          )}

          {tipoNegocio === 'cancha' && (
            <Link href="/dashboard-cliente/canchas" className="nav-link">
              <Users size={18} style={{ flexShrink: 0 }} />
              {sidebarOpen && <span>Canchas</span>}
            </Link>
          )}

          <Link
            href={tipoNegocio === 'cancha' ? '/dashboard-cliente/reservas-canchas' : '/dashboard-cliente/reservas'}
            className="nav-link"
          >
            <Calendar size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span>Reservas</span>}
          </Link>
        </nav>

        {/* Logout */}
        <motion.button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            color: '#F87171',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 10,
            padding: '10px 12px',
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600,
            fontSize: 14,
            transition: 'all 0.2s',
            marginTop: 8,
            width: '100%',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.3)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.15)'
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {sidebarOpen && <span>Cerrar sesión</span>}
        </motion.button>
      </motion.aside>

      {/* ══ SIDEBAR MÓVIL ══ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              style={{
                position: 'fixed', inset: 0, zIndex: 40,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)',
              }}
              className="md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.aside
              style={{
                position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
                background: '#1E4068',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                width: 260,
                boxShadow: '8px 0 32px rgba(0,0,0,0.4)',
              }}
              className="md:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Header móvil — logo + botón cerrar */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>

                {/* Logo con fondo azul vibrante */}
                <motion.div
                  style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                    borderRadius: 14,
                    padding: 12,
                    boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
                    border: '1px solid rgba(56,189,248,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div style={{
                    position: 'absolute', top: -20, right: -20,
                    width: 80, height: 80,
                    background: 'radial-gradient(circle, rgba(56,189,248,0.3) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }} />
                  <img
                    src="/logo_Zitapp.png"
                    alt="Logo"
                    style={{ width: 72, height: 72, objectFit: 'contain', position: 'relative', zIndex: 1 }}
                  />
                </motion.div>

                {/* Botón cerrar */}
                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8, padding: 8,
                    cursor: 'pointer', color: '#94A3B8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* Separador */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />

              {/* Nav móvil */}
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                <Link href="/dashboard-cliente" onClick={() => setMobileMenuOpen(false)} className="nav-link-mobile">
                  <Home size={18} />
                  <span>Inicio</span>
                </Link>
                <Link href="/dashboard-cliente/mi-negocio" onClick={() => setMobileMenuOpen(false)} className="nav-link-mobile">
                  <Settings size={18} />
                  <span>Mi negocio</span>
                </Link>
                <Link href="/dashboard-cliente/servicios" onClick={() => setMobileMenuOpen(false)} className="nav-link-mobile">
                  <Package size={18} />
                  <span>Servicios</span>
                </Link>
                <Link href="/dashboard-cliente/ventas" onClick={() => setMobileMenuOpen(false)} className="nav-link-mobile">
                  <DollarSign size={18} />
                  <span>Ventas</span>
                </Link>

                {['barberia', 'spa', 'veterinaria'].includes(tipoNegocio?.toLowerCase()) && (
                  <Link href="/dashboard-cliente/barberos" onClick={() => setMobileMenuOpen(false)} className="nav-link-mobile">
                    <Users size={18} />
                    <span>Profesionales</span>
                  </Link>
                )}

                {tipoNegocio === 'cancha' && (
                  <Link href="/dashboard-cliente/canchas" onClick={() => setMobileMenuOpen(false)} className="nav-link-mobile">
                    <Users size={18} />
                    <span>Canchas</span>
                  </Link>
                )}

                <Link
                  href={tipoNegocio === 'cancha' ? '/dashboard-cliente/reservas-canchas' : '/dashboard-cliente/reservas'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="nav-link-mobile"
                >
                  <Calendar size={18} />
                  <span>Reservas</span>
                </Link>
              </nav>

              {/* Logout móvil */}
              <motion.button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: '#F87171',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  fontSize: 15,
                  transition: 'all 0.2s',
                  marginTop: 8,
                  width: '100%',
                }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut size={18} />
                <span>Cerrar sesión</span>
              </motion.button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══ CONTENIDO PRINCIPAL ══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <motion.div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            background: '#163354',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Menu hamburguesa móvil */}
          <motion.button
            onClick={() => setMobileMenuOpen(true)}
            className="toggle-btn md:hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu size={20} />
          </motion.button>

          {/* Toggle desktop */}
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="toggle-btn hidden md:flex"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>

          {/* Saludo + logo cliente */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h2
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                color: '#94A3B8',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Hola,{' '}
              <span style={{ color: 'white' }}>{clienteNombre}</span>
            </motion.h2>

            {clienteLogo && (
              <motion.img
                src={clienteLogo}
                alt="Logo del negocio"
                style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(37,99,235,0.4)',
                  boxShadow: '0 0 0 3px rgba(37,99,235,0.1)',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              />
            )}
          </motion.div>
        </motion.div>

        {/* Contenido de página */}
        <motion.main
          style={{ flex: 1, padding: '24px', background: '#1A3A5C' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.main>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1E4068',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'DM Sans, sans-serif',
            },
          }}
        />
      </div>
    </div>
  )
}