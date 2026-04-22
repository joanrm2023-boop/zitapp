'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { Home, Calendar, LogOut, Menu, X, ChevronRight, User, Camera, Eye } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { ReactNode } from 'react'

const navLinks = [
  {
    href: '/dashboard-profesional',
    label: 'Inicio',
    icon: Home,
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.3)',
    glow: 'rgba(96,165,250,0.2)',
  },
  {
    href: '/dashboard-profesional/agenda',
    label: 'Mi Agenda',
    icon: Calendar,
    color: '#34D399',
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.3)',
    glow: 'rgba(52,211,153,0.2)',
  },
]

export default function ProfesionalLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profesionalNombre, setProfesionalNombre] = useState('')
  const [profesionalFoto, setProfesionalFoto] = useState('')
  const [idBarbero, setIdBarbero] = useState('')
  const [menuFotoTarget, setMenuFotoTarget] = useState<'sidebar' | 'header' | null>(null)
  const [verFotoAbierto, setVerFotoAbierto] = useState(false)
  const [fotoSubiendo, setFotoSubiendo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  useEffect(() => {
    const obtenerProfesional = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('barberos')
        .select('nombre_barbero, foto_url, id_barbero')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data?.nombre_barbero) setProfesionalNombre(data.nombre_barbero)
      if (data?.foto_url) setProfesionalFoto(data.foto_url)
      if (data?.id_barbero) setIdBarbero(data.id_barbero)
    }
    obtenerProfesional()
  }, [])

  // Cerrar menú al hacer clic afuera
  useEffect(() => {
    if (!menuFotoTarget) return
    const handleClick = () => setMenuFotoTarget(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [menuFotoTarget])

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !idBarbero) return
    if (!file.type.startsWith('image/')) { e.target.value = ''; return }
    if (file.size > 2 * 1024 * 1024) { e.target.value = ''; return }
    setFotoSubiendo(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${idBarbero}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('profesionales_fotos')
      .upload(fileName, file, { upsert: true })
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('profesionales_fotos').getPublicUrl(fileName)
      await supabase.from('barberos').update({ foto_url: publicUrl }).eq('id_barbero', idBarbero)
      setProfesionalFoto(publicUrl)
    }
    setFotoSubiendo(false)
    e.target.value = ''
  }

  const ProfesionalAvatar = ({ size = 40, menuId }: { size?: number, menuId?: 'sidebar' | 'header' }) => {
    const isOpen = !!menuId && menuFotoTarget === menuId
    const avatarEl = profesionalFoto ? (
      <img
        src={profesionalFoto}
        alt={profesionalNombre}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(37,99,235,0.4)', boxShadow: '0 0 0 3px rgba(37,99,235,0.1)', flexShrink: 0, display: 'block' }}
      />
    ) : (
      <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #1D4ED8, #38BDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: size * 0.38, color: 'white', flexShrink: 0, border: '2px solid rgba(56,189,248,0.3)', boxShadow: '0 0 12px rgba(37,99,235,0.3)' }}>
        {profesionalNombre ? profesionalNombre.charAt(0).toUpperCase() : <User size={size * 0.45} />}
      </div>
    )

    if (!menuId) return avatarEl

    return (
      <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
        <motion.button
          onClick={(e) => { e.stopPropagation(); setMenuFotoTarget(isOpen ? null : menuId) }}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%', position: 'relative', display: 'block' }}
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
        >
          {avatarEl}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isOpen ? 1 : 0, transition: 'opacity 0.2s' }}>
            <Camera size={Math.round(size * 0.35)} color="white" />
          </div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -4 }}
              transition={{ duration: 0.15 }}
              style={{ position: 'absolute', top: 'calc(100% + 8px)', ...(menuId === 'sidebar' ? { left: 0 } : { right: 0 }), background: '#1E3A5C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 6, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minWidth: 168 }}
            >
              {profesionalFoto && (
                <button
                  onClick={() => { setVerFotoAbierto(true); setMenuFotoTarget(null) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', fontFamily: 'DM Sans, sans-serif', fontSize: 14, textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Eye size={15} color="#60A5FA" />
                  <span>Ver foto</span>
                </button>
              )}
              <button
                onClick={() => { fileInputRef.current?.click(); setMenuFotoTarget(null) }}
                disabled={fotoSubiendo}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, background: 'transparent', border: 'none', cursor: fotoSubiendo ? 'not-allowed' : 'pointer', color: '#94A3B8', fontFamily: 'DM Sans, sans-serif', fontSize: 14, textAlign: 'left', opacity: fotoSubiendo ? 0.6 : 1 }}
                onMouseEnter={e => { if (!fotoSubiendo) e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {fotoSubiendo
                  ? <div style={{ width: 15, height: 15, border: '2px solid rgba(96,165,250,0.3)', borderTop: '2px solid #60A5FA', borderRadius: '50%', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                  : <Camera size={15} color="#60A5FA" />
                }
                <span>{fotoSubiendo ? 'Subiendo...' : 'Cambiar foto'}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const NavItem = ({ link, collapsed = false, onClick }: {
    link: typeof navLinks[0]
    collapsed?: boolean
    onClick?: () => void
  }) => {
    const isActive = pathname === link.href ||
      (link.href !== '/dashboard-profesional' && pathname?.startsWith(link.href))
    const Icon = link.icon

    return (
      <Link href={link.href} onClick={onClick} style={{ textDecoration: 'none' }}>
        <motion.div
          style={{
            display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 12,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '10px' : '10px 12px',
            borderRadius: 12,
            position: 'relative',
            cursor: 'pointer',
            background: isActive ? link.bg : 'transparent',
            border: `1px solid ${isActive ? link.border : 'transparent'}`,
            boxShadow: isActive ? `0 0 16px ${link.glow}` : 'none',
          }}
          whileHover={{ background: link.bg, borderColor: link.border, boxShadow: `0 0 16px ${link.glow}` }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
        >
          {isActive && (
            <motion.div
              layoutId="activeBarPro"
              style={{
                position: 'absolute', left: 0, top: '20%', bottom: '20%',
                width: 3, borderRadius: 999,
                background: link.color,
                boxShadow: `0 0 8px ${link.color}`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
          <motion.div
            style={{
              width: 34, height: 34, borderRadius: 9,
              background: isActive ? `${link.color}22` : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              border: `1px solid ${isActive ? link.border : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.2s',
            }}
            whileHover={{ background: `${link.color}22`, borderColor: link.border }}
          >
            <Icon size={16} style={{ color: isActive ? link.color : '#64748B', transition: 'color 0.2s' }} />
          </motion.div>
          {!collapsed && (
            <span style={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: isActive ? 700 : 500,
              fontSize: 14,
              color: isActive ? link.color : '#94A3B8',
              flex: 1,
              transition: 'color 0.2s',
            }}>
              {link.label}
            </span>
          )}
          {!collapsed && isActive && (
            <ChevronRight size={14} style={{ color: link.color, opacity: 0.7 }} />
          )}
        </motion.div>
      </Link>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1A3A5C', fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        .toggle-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 8px; cursor: pointer;
          color: #94A3B8; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
        }
        .toggle-btn:hover { background: rgba(37,99,235,0.15); color: white; border-color: rgba(37,99,235,0.3); }
      `}</style>

      {/* ══ SIDEBAR DESKTOP ══ */}
      <motion.aside
        style={{
          display: 'none', flexDirection: 'column', gap: 4, padding: '16px',
          background: '#1E4068', borderRight: '1px solid rgba(255,255,255,0.06)',
          width: sidebarOpen ? 240 : 72, transition: 'width 0.3s ease',
          flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
          overflowY: 'auto', overflowX: 'hidden',
        }}
        className="md:flex"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header sidebar */}
        <motion.div
          style={{
            display: 'flex', alignItems: 'center',
            gap: sidebarOpen ? 12 : 0,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            padding: '12px 8px', marginBottom: 8, borderRadius: 14,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            overflow: 'hidden',
          }}
          layout
        >
          <ProfesionalAvatar size={sidebarOpen ? 40 : 36} menuId="sidebar" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden', minWidth: 0 }}
              >
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                  {profesionalNombre || 'Profesional'}
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#64748B', marginTop: 2 }}>
                  Mi Panel
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          {navLinks.map((link) => (
            <NavItem key={link.href} link={link} collapsed={!sidebarOpen} />
          ))}
        </nav>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />

        <motion.button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center',
            gap: sidebarOpen ? 12 : 0,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            color: '#F87171', background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12,
            padding: sidebarOpen ? '10px 12px' : '10px',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            fontWeight: 600, fontSize: 14, transition: 'all 0.2s', width: '100%',
          }}
          whileHover={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)' }}
          whileTap={{ scale: 0.98 }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LogOut size={16} />
          </div>
          {sidebarOpen && <span>Cerrar sesión</span>}
        </motion.button>
      </motion.aside>

      {/* ══ SIDEBAR MÓVIL ══ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              className="md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              style={{
                position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
                background: '#1E4068', borderRight: '1px solid rgba(255,255,255,0.06)',
                padding: '16px', display: 'flex', flexDirection: 'column', gap: 4,
                width: 260, boxShadow: '8px 0 32px rgba(0,0,0,0.4)', overflowY: 'auto',
              }}
              className="md:hidden"
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 8px', marginBottom: 8, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                  <ProfesionalAvatar size={38} menuId="sidebar" />
                  <div style={{ overflow: 'hidden', minWidth: 0 }}>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {profesionalNombre || 'Profesional'}
                    </p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#64748B' }}>Mi Panel</p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 8 }} />

              <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                {navLinks.map((link) => (
                  <NavItem key={link.href} link={link} onClick={() => setMobileMenuOpen(false)} />
                ))}
              </nav>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />

              <motion.button
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#F87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, transition: 'all 0.2s', width: '100%' }}
                whileHover={{ background: 'rgba(239,68,68,0.15)' }} whileTap={{ scale: 0.98 }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LogOut size={16} />
                </div>
                <span>Cerrar sesión</span>
              </motion.button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══ CONTENIDO PRINCIPAL ══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <motion.div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#163354', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 30 }}
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        >
          <motion.button onClick={() => setMobileMenuOpen(true)} className="toggle-btn md:hidden" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Menu size={20} />
          </motion.button>
          <motion.button onClick={() => setSidebarOpen(!sidebarOpen)} className="toggle-btn hidden md:flex" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
          <motion.div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <ProfesionalAvatar size={34} menuId="header" />
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: 'white', lineHeight: 1.2 }}>
                {profesionalNombre || 'Profesional'}
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#64748B' }}>Mi Panel</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.main
          style={{ flex: 1, padding: '24px', background: '#1A3A5C' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.main>

        <Toaster
          position="bottom-right"
          toastOptions={{ style: { background: '#1E4068', color: 'white', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'DM Sans, sans-serif' } }}
        />
      </div>

      {/* ══ MODAL VER FOTO ══ */}
      <AnimatePresence>
        {verFotoAbierto && profesionalFoto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setVerFotoAbierto(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'relative', maxWidth: 360, width: '100%' }}
            >
              <img
                src={profesionalFoto}
                alt={profesionalNombre}
                style={{ width: '100%', borderRadius: 20, objectFit: 'cover', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', border: '2px solid rgba(255,255,255,0.1)', display: 'block' }}
              />
              <motion.button
                onClick={() => setVerFotoAbierto(false)}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                style={{ position: 'absolute', top: -14, right: -14, background: '#1E3A5C', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94A3B8', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
              >
                <X size={16} />
              </motion.button>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: 'white', textAlign: 'center', marginTop: 14 }}>
                {profesionalNombre}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input de foto oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFotoChange}
      />
    </div>
  )
}
