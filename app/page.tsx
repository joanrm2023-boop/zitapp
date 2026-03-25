import { Calendar, Users, BarChart3, Smartphone, Check, Star, ArrowRight, Zap, Shield, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#0D1B2A', fontFamily: "'Georgia', serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .font-display { font-family: 'Syne', sans-serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }

        .hero-bg {
          background: #0D1B2A;
          position: relative;
          overflow: hidden;
        }
        .hero-bg::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%);
          pointer-events: none;
        }
        .hero-bg::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 65%);
          pointer-events: none;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(37,99,235,0.18);
          color: #93C5FD;
          border: 1px solid rgba(37,99,235,0.35);
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.03em;
          font-family: 'DM Sans', sans-serif;
        }

        .btn-primary {
          background: #2563EB;
          color: white;
          padding: 14px 28px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 16px;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
          box-shadow: 0 8px 32px rgba(37,99,235,0.35);
        }
        .btn-primary:hover {
          background: #1D4ED8;
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(37,99,235,0.50);
        }

        .btn-outline {
          background: transparent;
          color: #CBD5E1;
          padding: 14px 28px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 16px;
          border: 1.5px solid rgba(203,213,225,0.3);
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: 'DM Sans', sans-serif;
          text-decoration: none;
        }
        .btn-outline:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(203,213,225,0.6);
          color: white;
        }

        .nav-link {
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          color: #94A3B8;
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-link:hover { color: white; }

        /* ── BENTO ── */
        .bento-card {
          border-radius: 20px;
          padding: 24px;
          transition: transform 0.2s;
        }
        .bento-card:hover { transform: translateY(-3px); }
        .bento-dark  { background: #162033; border: 1px solid rgba(56,189,248,0.15); color: white; }
        .bento-blue  { background: #2563EB; color: white; }
        .bento-navy  { background: #0F2438; color: white; border: 1px solid rgba(255,255,255,0.07); }
        .bento-glow  { background: linear-gradient(135deg, #1E3A5F 0%, #162033 100%); color: white; border: 1px solid rgba(56,189,248,0.2); }
        .bento-accent{ background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.25); color: white; }

        /* ── STAT PILL ── */
        .stat-pill {
          background: #162033;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px 16px;
          text-align: center;
        }

        /* ── SECTION LABEL ── */
        .section-label {
          display: inline-block;
          background: rgba(37,99,235,0.15);
          color: #93C5FD;
          border: 1px solid rgba(37,99,235,0.3);
          padding: 6px 16px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
          margin-bottom: 16px;
        }

        /* ── PRICING ── */
        .pricing-card {
          background: #162033;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 28px;
          transition: all 0.2s;
        }
        .pricing-card:hover {
          border-color: rgba(37,99,235,0.5);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .pricing-card-featured {
          background: #2563EB;
          border-color: #2563EB;
          box-shadow: 0 24px 60px rgba(37,99,235,0.4);
        }

        /* ── TESTIMONIAL ── */
        .testimonial-section {
          background: #0A1628;
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .testimonial-section::before {
          content: '"';
          position: absolute;
          top: -40px; left: 20px;
          font-size: 200px;
          color: rgba(37,99,235,0.08);
          font-family: 'Syne', sans-serif;
          line-height: 1;
          pointer-events: none;
        }

        /* ── CTA ── */
        .cta-section {
          background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 50%, #2563EB 100%);
          position: relative;
          overflow: hidden;
        }

        /* ── CHECK ── */
        .check-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'DM Sans', sans-serif;
          color: #CBD5E1;
          font-size: 15px;
        }
        .check-dot {
          width: 24px; height: 24px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        /* ── FOOTER ── */
        .footer-bg { background: #060E18; }
        .footer-link {
          color: #475569;
          font-size: 14px;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
        }
        .footer-link:hover { color: #93C5FD; }

        /* ── SECTION BACKGROUNDS ── */
        .negocios-section { background: #0F1E30; }
        .features-section { background: #0D1B2A; }
        .pricing-section  { background: #0A1628; }

        /* ══ GRIDS RESPONSIVE ══ */

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 64px;
          align-items: center;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .two-col-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          align-items: start;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 48px;
        }
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        /* ── TABLET ── */
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .bento-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
        }

        /* ── MÓVIL ── */
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .hero-img {
            width: 100% !important;
            order: -1;
          }
          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .stats-grid-span2 {
            grid-column: span 2 !important;
          }
          .bento-grid {
            grid-template-columns: 1fr;
          }
          .bento-span2 {
            grid-column: span 1 !important;
          }
          .bento-span3 {
            grid-column: span 1 !important;
            flex-direction: column !important;
            gap: 16px !important;
          }
          .bento-span3-tags {
            flex-wrap: wrap;
          }
          .two-col-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .two-col-reverse {
            order: -1;
          }
          .pricing-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .pricing-featured {
            transform: none !important;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }
          .footer-brand {
            grid-column: span 2;
          }
          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .cta-btns {
            flex-direction: column;
            align-items: stretch;
          }
          .cta-btns a {
            text-align: center;
            justify-content: center;
          }
          .hero-section-pad {
            padding: 48px 16px 40px !important;
          }
          .section-pad {
            padding: 56px 16px !important;
          }
          .nav-link {
              font-size: 11px !important;
            }
            .logo-text {
              font-size: 15px !important;
            }
            .nav-btn-mobile {
              padding: 7px 10px !important;
              font-size: 11px !important;
              border-radius: 8px !important;
            }
          .nav-btn-mobile {
            padding: 9px 16px !important;
            font-size: 14px !important;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-brand {
            grid-column: span 1;
          }
        }
      `}</style>

      {/* ══ HEADER ══ */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(13,27,42,0.97)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: '#2563EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontWeight: 700, fontSize: 14, fontFamily: 'Syne, sans-serif' }}>Z</span>
              </div>
              <span className="font-display logo-text" style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>Zitapp</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <a href="/login" className="nav-link" style={{ fontSize: 14 }}>Iniciar Sesión</a>
              <a href="/registro" className="btn-primary nav-btn-mobile" style={{ padding: '10px 20px', fontSize: 14, borderRadius: 10 }}>
                Comenzar Gratis
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section className="hero-bg hero-section-pad" style={{ padding: '80px 16px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

            <div className="hero-grid">
              {/* Texto */}
              <div>
                <div className="badge-pill" style={{ marginBottom: 20 }}>
                  <Zap size={12} />
                  Prueba gratuita por 15 días
                </div>
                <h1 className="font-display" style={{
                  fontSize: 'clamp(32px, 5vw, 56px)',
                  fontWeight: 800,
                  lineHeight: 1.05,
                  color: 'white',
                  marginBottom: 18,
                }}>
                  La agenda digital que tu{' '}
                  <span style={{
                    background: 'linear-gradient(135deg, #60A5FA, #38BDF8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    negocio necesita
                  </span>
                </h1>
                <p className="font-body" style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.7, marginBottom: 28, maxWidth: 460 }}>
                  Automatiza tus reservas, gestiona tus clientes y haz crecer tu negocio con la plataforma más fácil de usar del mercado.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a href="/registro" className="btn-primary">
                    Comenzar ahora gratis
                    <ArrowRight size={16} />
                  </a>
                </div>
                <p className="font-body" style={{ fontSize: 12, color: '#475569', marginTop: 14 }}>
                  Configuración en 5 minutos · Sin tarjeta de crédito
                </p>
              </div>

              {/* Imagen */}
              <div className="hero-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src="/pantallazo.png"
                  alt="Zitapp dashboard en computador y celular"
                  style={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: 14,
                    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                  }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stats-grid-span2" style={{
                gridColumn: 'span 2', padding: '20px 24px', borderRadius: 20, textAlign: 'left',
                background: 'linear-gradient(135deg, #1E3A5F, #162033)',
                border: '1px solid rgba(56,189,248,0.2)',
              }}>
                <div className="font-body" style={{ fontSize: 11, color: '#38BDF8', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Resultado promedio</div>
                <div className="font-display" style={{ fontSize: 40, fontWeight: 800, color: 'white', lineHeight: 1 }}>+40%</div>
                <div className="font-body" style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Aumento en ingresos reportado por nuestros usuarios</div>
              </div>
              <div className="stat-pill">
                <div className="font-display" style={{ fontSize: 28, fontWeight: 800, color: '#38BDF8' }}>89%</div>
                <div className="font-body" style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Menos citas perdidas</div>
              </div>
              <div className="stat-pill">
                <div className="font-display" style={{ fontSize: 28, fontWeight: 800, color: '#60A5FA' }}>5min</div>
                <div className="font-body" style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Tiempo de setup</div>
              </div>
              <div className="stat-pill">
                <div className="font-display" style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>24/7</div>
                <div className="font-body" style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Reservas online</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ FEATURES BENTO ══ */}
      <section className="features-section section-pad" style={{ padding: '80px 16px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">Funcionalidades</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'white', maxWidth: 600, marginTop: 0, marginBottom: 0, marginLeft: 'auto', marginRight: 'auto' }}>
              Todo lo que necesitas para gestionar tu negocio
            </h2>
          </div>

          <div className="bento-grid">
            <div className="bento-card bento-blue bento-span2" style={{ gridColumn: 'span 2' }}>
              <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Calendar size={24} color="white" />
              </div>
              <h3 className="font-display" style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 10 }}>Reservas Online 24/7</h3>
              <p className="font-body" style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontSize: 14 }}>
                Tus clientes pueden agendar citas desde cualquier lugar, a cualquier hora. Sistema inteligente con confirmaciones automáticas.
              </p>
              <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>Automático</span>
                <span style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>Sin llamadas</span>
              </div>
            </div>

            <div className="bento-card bento-glow">
              <div style={{ width: 48, height: 48, background: 'rgba(56,189,248,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <BarChart3 size={24} color="#38BDF8" />
              </div>
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 8 }}>Monitorear Ventas</h3>
              <p className="font-body" style={{ color: '#94A3B8', lineHeight: 1.6, fontSize: 14 }}>
                Dashboard con métricas en tiempo real. Ingresos y rendimiento por profesional.
              </p>
            </div>

            <div className="bento-card bento-navy">
              <div style={{ width: 48, height: 48, background: 'rgba(37,99,235,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Users size={24} color="#60A5FA" />
              </div>
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 8 }}>Administrar Profesionales</h3>
              <p className="font-body" style={{ color: '#94A3B8', lineHeight: 1.6, fontSize: 14 }}>
                Agrega, edita o elimina profesionales. Asigna servicios y controla horarios.
              </p>
            </div>

            <div className="bento-card bento-navy">
              <div style={{ width: 48, height: 48, background: 'rgba(56,189,248,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Clock size={24} color="#38BDF8" />
              </div>
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 8 }}>Configurar Horarios</h3>
              <p className="font-body" style={{ color: '#94A3B8', lineHeight: 1.6, fontSize: 14 }}>
                Define horarios, días no laborables e intervalos entre citas.
              </p>
            </div>

            <div className="bento-card bento-accent">
              <div style={{ width: 48, height: 48, background: 'rgba(56,189,248,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Smartphone size={24} color="#38BDF8" />
              </div>
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 8 }}>Ver Todas las Reservas</h3>
              <p className="font-body" style={{ color: '#94A3B8', lineHeight: 1.6, fontSize: 14 }}>
                Panel centralizado para ver, confirmar o cancelar reservas.
              </p>
            </div>

            <div className="bento-card bento-dark bento-span3" style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <h3 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 8 }}>Gestionar Servicios</h3>
                <p className="font-body" style={{ color: '#64748B', fontSize: 14, maxWidth: 500 }}>
                  Agrega, edita precios o elimina servicios en tiempo real. Mantén tu catálogo actualizado al instante.
                </p>
              </div>
              <div className="bento-span3-tags" style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <div style={{ background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(37,99,235,0.3)', padding: '8px 16px', borderRadius: 10, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#93C5FD' }}>
                  Precios flexibles
                </div>
                <div style={{ background: '#2563EB', padding: '8px 16px', borderRadius: 10, fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: 'white' }}>
                  Tiempo real
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ NEGOCIOS ══ */}
      <section className="negocios-section section-pad" style={{ padding: '80px 16px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Para quién es</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'white' }}>
              Control total desde un solo lugar
            </h2>
            <p className="font-body" style={{ color: '#64748B', fontSize: 16, maxWidth: 560, marginTop: 12, marginBottom: 0, marginLeft: 'auto', marginRight: 'auto' }}>
              Zitapp se adapta a distintos tipos de negocios de servicios
            </p>
          </div>

          {/* Barbería */}
          <div className="two-col-grid" style={{ marginBottom: 64 }}>
            <div>
              <div className="section-label" style={{ background: 'rgba(37,99,235,0.15)', color: '#93C5FD', borderColor: 'rgba(37,99,235,0.3)' }}>Barberías</div>
              <h3 className="font-display" style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, color: 'white', marginTop: 12, marginBottom: 14, lineHeight: 1.1 }}>
                Aumenta tus ventas hasta un 40% con reservas online
              </h3>
              <p className="font-body" style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                Las barberías que usan Zitapp reportan menos citas perdidas, mayor ocupación y clientes más satisfechos.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Reduce las citas perdidas en un 60%', 'Automatiza confirmaciones por email', 'Clientes pueden reagendar sin llamarte'].map((item) => (
                  <div className="check-item" key={item}>
                    <div className="check-dot" style={{ background: '#2563EB' }}><Check size={13} color="white" /></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#162033', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <img src="barberia.png" alt="Barbería" style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>

          {/* Spa */}
          <div className="two-col-grid" style={{ marginBottom: 64 }}>
            <div className="two-col-reverse" style={{ background: '#162033', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <img src="/spa.png" alt="Spa" style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }} />
            </div>
            <div>
              <div className="section-label" style={{ background: 'rgba(167,139,250,0.12)', color: '#C4B5FD', borderColor: 'rgba(167,139,250,0.25)' }}>Spas y belleza</div>
              <h3 className="font-display" style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, color: 'white', marginTop: 12, marginBottom: 14, lineHeight: 1.1 }}>
                Perfecto también para Spas y centros de belleza
              </h3>
              <p className="font-body" style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                Los centros de belleza que usan Zitapp optimizan sus horarios y ofrecen una experiencia premium.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Gestiona tratamientos', 'Organiza múltiples terapeutas y especialistas', 'Clientes pueden elegir su terapeuta preferido'].map((item) => (
                  <div className="check-item" key={item}>
                    <div className="check-dot" style={{ background: '#7C3AED' }}><Check size={13} color="white" /></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Veterinaria */}
          <div className="two-col-grid">
            <div>
              <div className="section-label" style={{ background: 'rgba(16,185,129,0.12)', color: '#6EE7B7', borderColor: 'rgba(16,185,129,0.25)' }}>Veterinarias</div>
              <h3 className="font-display" style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, color: 'white', marginTop: 12, marginBottom: 14, lineHeight: 1.1 }}>
                Perfecto para Veterinarias y peluquerías caninas
              </h3>
              <p className="font-body" style={{ color: '#94A3B8', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
                Las peluquerías caninas que usan Zitapp organizan mejor sus citas y brindan un servicio más profesional.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Agenda baños, cortes y tratamientos estéticos', 'Los dueños pueden agendar desde casa sin estrés'].map((item) => (
                  <div className="check-item" key={item}>
                    <div className="check-dot" style={{ background: '#059669' }}><Check size={13} color="white" /></div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: '#162033', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              <img src="/veterianaria.png" alt="Veterinaria" style={{ width: '100%', height: 'auto', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>

        </div>
      </section>

      {/* ══ TESTIMONIAL ══ */}
      <section className="testimonial-section section-pad" style={{ padding: '80px 16px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 28 }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={22} fill="#FBBF24" color="#FBBF24" />
            ))}
          </div>
          <blockquote className="font-display" style={{ fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 700, color: 'white', lineHeight: 1.4, marginBottom: 32 }}>
            "Desde que uso Zitapp, mis clientes están más contentos y yo tengo más tiempo para enfocarme en cortar cabello. Las reservas se manejan solas."
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, background: '#2563EB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-display" style={{ fontWeight: 800, color: 'white', fontSize: 15 }}>JM</span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p className="font-body" style={{ fontWeight: 600, color: 'white', fontSize: 15 }}>Juan Manuel</p>
              <p className="font-body" style={{ color: '#475569', fontSize: 13 }}>Barbería El Clásico, Bogotá</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section className="pricing-section section-pad" style={{ padding: '80px 16px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label">Precios</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'white', marginBottom: 10 }}>
              Planes que se adaptan a tu negocio
            </h2>
            <p className="font-body" style={{ color: '#64748B', fontSize: 16 }}>Desde profesionales independientes hasta grandes cadenas</p>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 4 }}>Básico</h3>
              <p className="font-body" style={{ color: '#475569', fontSize: 13, marginBottom: 16 }}>Perfecto para empezar</p>
              <div style={{ marginBottom: 20 }}>
                <span className="font-display" style={{ fontSize: 38, fontWeight: 800, color: 'white' }}>$28.000</span>
                <span className="font-body" style={{ color: '#475569', fontSize: 14 }}>/mes</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['1 profesional', 'Reservas online', 'Reportes básicos'].map(f => (
                  <div className="check-item" key={f} style={{ fontSize: 13 }}>
                    <div className="check-dot" style={{ background: 'rgba(37,99,235,0.2)', width: 20, height: 20 }}>
                      <Check size={11} color="#60A5FA" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="pricing-card pricing-card-featured pricing-featured">
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '3px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif', marginBottom: 10 }}>
                Más Popular
              </div>
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 4 }}>Pro</h3>
              <p className="font-body" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 16 }}>Para equipos pequeños</p>
              <div style={{ marginBottom: 20 }}>
                <span className="font-display" style={{ fontSize: 38, fontWeight: 800, color: 'white' }}>$49.000</span>
                <span className="font-body" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>/mes</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Hasta 4 profesionales', 'Todo del plan Básico', 'Reportes avanzados'].map(f => (
                  <div className="check-item" key={f} style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                    <div className="check-dot" style={{ background: 'rgba(255,255,255,0.25)', width: 20, height: 20 }}>
                      <Check size={11} color="white" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="pricing-card">
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 4 }}>Premium</h3>
              <p className="font-body" style={{ color: '#475569', fontSize: 13, marginBottom: 16 }}>Para empresas grandes</p>
              <div style={{ marginBottom: 20 }}>
                <span className="font-display" style={{ fontSize: 38, fontWeight: 800, color: 'white' }}>$69.000</span>
                <span className="font-body" style={{ color: '#475569', fontSize: 14 }}>/mes</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Hasta 10 profesionales', 'Todo del plan Pro', 'Soporte prioritario'].map(f => (
                  <div className="check-item" key={f} style={{ fontSize: 13 }}>
                    <div className="check-dot" style={{ background: 'rgba(37,99,235,0.2)', width: 20, height: 20 }}>
                      <Check size={11} color="#60A5FA" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <a href="/planes-nuevos" className="btn-outline">
              Ver todos los planes
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="cta-section section-pad" style={{ padding: '80px 16px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 16 }}>
            ¿Listo para modernizar tu negocio?
          </h2>
          <p className="font-body" style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 520, marginTop: 0, marginBottom: 32, marginLeft: 'auto', marginRight: 'auto' }}>
            Únete a cientos de negocios que ya usan Zitapp para crecer
          </p>
          <div className="cta-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/registro" style={{ background: 'white', color: '#1E40AF', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif', textDecoration: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              Comenzar prueba gratuita
            </a>
            <a href="https://wa.me/573001334528?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20Zitapp%20para%20mi%20barbería" target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', padding: '14px 28px', borderRadius: 12, fontWeight: 600, fontSize: 16, border: '1.5px solid rgba(255,255,255,0.3)', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans, sans-serif', textDecoration: 'none' }}>
              Hablar con un experto
            </a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
            {[{ icon: Shield, text: 'Datos seguros' }, { icon: Clock, text: 'Setup en 5 min' }, { icon: Smartphone, text: '100% móvil' }].map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                <Icon size={16} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer-bg" style={{ padding: '48px 16px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="footer-grid">

            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, background: '#2563EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 14, fontFamily: 'Syne, sans-serif' }}>Z</span>
                </div>
                <span className="font-display" style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>Zitapp</span>
              </div>
              <p className="font-body" style={{ color: '#334155', fontSize: 13, lineHeight: 1.7, maxWidth: 260, marginBottom: 20 }}>
                La plataforma de reservas más fácil de usar para barberías y salones de belleza.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <a href="https://wa.me/573001334528?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20Zitapp" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, background: '#25D366', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="WhatsApp">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.485"/></svg>
                </a>
                <a href="https://facebook.com/AQUI_VA_TU_FACEBOOK" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, background: '#1877F2', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Facebook">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://instagram.com/AQUI_VA_TU_INSTAGRAM" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #833AB4, #E1306C)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Instagram">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 14 }}>Producto</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="/planes" className="footer-link">Precios</a>
                <a href="/Funcionalidades" className="footer-link">Funcionalidades</a>
              </div>
            </div>

            <div>
              <h4 className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 14 }}>Soporte</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="https://wa.me/573001334528?text=Hola,%20necesito%20ayuda%20con%20Zitapp" target="_blank" rel="noopener noreferrer" className="footer-link">Contacto</a>
                <a href="https://wa.me/573001334528?text=Hola,%20tengo%20una%20pregunta%20sobre%20el%20uso%20de%20Zitapp" target="_blank" rel="noopener noreferrer" className="footer-link">Centro de ayuda</a>
              </div>
            </div>

            <div>
              <h4 className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 14 }}>Empresa</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a href="/Sobre-nosotros" className="footer-link">Sobre nosotros</a>
                <a href="/terminos" className="footer-link">Términos</a>
                <a href="/politica-privacidad" className="footer-link">Política de Privacidad</a>
              </div>
            </div>

          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, textAlign: 'center' }}>
            <p className="font-body" style={{ color: '#1E293B', fontSize: 12 }}>
              © 2024 Zitapp. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}