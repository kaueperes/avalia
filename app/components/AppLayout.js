'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ChatBot from './ChatBot';

// ── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ── Nav Items ────────────────────────────────────────────────────────────────

const navItems = [
  { Icon: HomeIcon,      label: 'Início',                href: '/inicio' },
  { Icon: PlusIcon,      label: 'Nova Avaliação',         href: '/avaliar',   highlight: true },
  { Icon: ClipboardIcon, label: 'Gerenciar Avaliações',   href: '/avaliacoes' },
  { Icon: BookIcon,      label: 'Gerenciar Exercícios',   href: '/exercicios' },
  { Icon: UserIcon,      label: 'Perfil do Professor',    href: '/perfis' },
  { Icon: HelpIcon,      label: 'Ajuda',                  href: '/ajuda' },
];

// ── Layout ───────────────────────────────────────────────────────────────────

export default function AppLayout({ children, userName = 'Professor', userEmail = '', userPlan = 'free', noPadding = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(() => typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toggleHover, setToggleHover] = useState(false);
  const [quotaCiclo, setQuotaCiclo] = useState(null);
  const [quotaExtra, setQuotaExtra] = useState(null);
  const [planFromStorage, setPlanFromStorage] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.quota_ciclo !== undefined) setQuotaCiclo(u.quota_ciclo);
        if (u.quota_extra !== undefined) setQuotaExtra(u.quota_extra);
        if (u.plan) setPlanFromStorage(u.plan);
      }
    } catch {}
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const bg        = darkMode ? '#0f1117' : '#ffffff';
  const bgContent = darkMode ? '#13161c' : '#F7F8FA';
  const bgCard    = darkMode ? '#1a1e28' : '#ffffff';
  const border    = darkMode ? '#252a38' : '#E5E7EB';
  const borderCard= darkMode ? '#252a38' : '#E5E7EB';
  const textMain  = darkMode ? '#F1F5F9' : '#111827';
  const textMuted = darkMode ? '#8B95A8' : '#6B7280';
  const textSub   = darkMode ? '#5A6478' : '#9CA3AF';
  const navHover   = darkMode ? '#1e2330' : '#F3F4F6';
  const navActive  = darkMode ? '#0d1f3c'  : '#EBF4FF';
  const selectedBg = darkMode ? '#0d1f3c' : '#EBF4FF';

  return (
    <>

      <div style={{
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        background: bgContent, color: textMain,
        '--bg': bg,
        '--bg-content': bgContent,
        '--bg-card': bgCard,
        '--border': border,
        '--border-card': borderCard,
        '--text-main': textMain,
        '--text-muted': textMuted,
        '--text-sub': textSub,
        '--selected-bg': selectedBg,
      }}>

        {/* ── TOPBAR ── */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          height: 58,
          background: bg,
          borderBottom: `1px solid ${border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
        }}>
          {/* Hamburger (mobile only) */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(o => !o)}
            style={{ display: 'none', alignItems: 'center', justifyContent: 'center', padding: '6px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: textMain, marginRight: 8 }}
          >
            {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>

          {/* Logo */}
          <div style={{ cursor: 'pointer' }} onClick={() => router.push('/inicio')}>
            <img src={darkMode ? '/imagens/logo_branco.svg' : '/imagens/logo.svg'} alt="AvaliA" style={{ height: 30, width: 'auto', display: 'block' }} />
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

            {/* Separator */}
            {quotaCiclo !== null && <div style={{ width: 1, height: 20, background: border, margin: '0 4px' }} />}

            {/* Quota */}
            {quotaCiclo !== null && (
              <div
                className="quota-display"
                onClick={() => router.push('/conta')}
                title="Ver detalhes do seu plano"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${quotaCiclo === 0 && (quotaExtra ?? 0) === 0 ? '#EF4444' : border}`,
                  background: quotaCiclo === 0 && (quotaExtra ?? 0) === 0 ? (darkMode ? '#2a1212' : '#FEF2F2') : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = navHover}
                onMouseLeave={e => e.currentTarget.style.background = quotaCiclo === 0 && (quotaExtra ?? 0) === 0 ? (darkMode ? '#2a1212' : '#FEF2F2') : 'none'}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: quotaCiclo === 0 ? '#EF4444' : textMain }}>
                  {quotaCiclo} avaliações restantes
                </span>
                {(quotaExtra ?? 0) > 0 && (
                  <>
                    <span style={{ fontSize: 12, color: textSub }}>+</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: textMain }}>{quotaExtra} extras</span>
                  </>
                )}
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                  background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', marginLeft: 2,
                }}>
                  Comprar mais
                </span>
              </div>
            )}

            {/* User + Profile Dropdown */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setProfileOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 8, border: `1px solid ${profileOpen ? '#0081f0' : border}`, cursor: 'pointer', userSelect: 'none', transition: 'border-color .15s' }}
              >
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #0081f0, #810cfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: textMain }}>{userName}</span>
                <span style={{ color: textMuted, display: 'flex', transition: 'transform .2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}><ChevronDownIcon /></span>
              </div>

              {profileOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  width: 240, background: bg, border: `1px solid ${border}`,
                  borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                  zIndex: 200, overflow: 'hidden',
                }}>
                  {/* User info */}
                  <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #0081f0, #810cfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</div>
                        {userEmail && <div style={{ fontSize: 12, color: textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</div>}
                      </div>
                    </div>
                    {/* Plan badge */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: userPlan === 'pro' ? 'linear-gradient(135deg, #0081f0, #810cfa)' : (darkMode ? '#1e2330' : '#EBF4FF'),
                      color: userPlan === 'pro' ? 'white' : '#0081f0',
                    }}>
                      {(() => { const p = planFromStorage || userPlan; return p === 'pro' ? '★ Plano Pro' : p === 'premium' ? 'Plano Premium' : p === 'essencial' ? 'Plano Essencial' : 'Plano Gratuito'; })()}

                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '8px 8px' }}>
                    {/* Dark mode toggle */}
                    <div
                      onClick={() => { const next = !darkMode; setDarkMode(next); localStorage.setItem('darkMode', next); }}
                      onMouseEnter={() => setToggleHover(true)}
                      onMouseLeave={() => setToggleHover(false)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 10px', borderRadius: 8, cursor: 'pointer', background: toggleHover ? navHover : 'none' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: textMain }}>
                        <span style={{ color: darkMode ? '#818CF8' : '#F59E0B', display: 'flex' }}>{darkMode ? <MoonIcon /> : <SunIcon />}</span>
                        {darkMode ? 'Modo escuro' : 'Modo claro'}
                      </span>
                      <div style={{ width: 28, height: 16, borderRadius: 8, background: darkMode ? '#0081f0' : '#D1D5DB', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                        <div style={{ position: 'absolute', top: 2, left: darkMode ? 12 : 2, width: 12, height: 12, borderRadius: '50%', background: 'white', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                      </div>
                    </div>
                    <div style={{ height: 1, background: border, margin: '4px 0' }} />
                    <button
                      onClick={() => { setProfileOpen(false); router.push('/conta'); }}
                      onMouseEnter={e => e.currentTarget.style.background = navHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: textMain, textAlign: 'left' }}
                    >
                      <span style={{ color: textMuted, display: 'flex' }}><EditIcon /></span>
                      Configurações da conta
                    </button>
                    <div style={{ height: 1, background: border, margin: '4px 0' }} />
                    <button
                      onClick={() => { localStorage.clear(); router.push('/login'); }}
                      onMouseEnter={e => { e.currentTarget.style.background = darkMode ? '#2a1a1a' : '#FEF2F2'; e.currentTarget.style.color = '#ef4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = textMuted; }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: textMuted, textAlign: 'left', transition: 'background .15s, color .15s' }}
                    >
                      <LogoutIcon />
                      Sair da conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ display: 'flex', flex: 1, paddingTop: 58 }}>

          {/* Backdrop (mobile only) */}
          {menuOpen && (
            <div
              className="sidebar-backdrop"
              onClick={() => setMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 140 }}
            />
          )}

          {/* ── SIDEBAR ── */}
          <aside className={`sidebar${menuOpen ? ' sidebar-open' : ''}`} style={{
            position: 'fixed', top: 58, left: 0, bottom: 0,
            width: 230,
            background: bg,
            borderRight: `1px solid ${border}`,
            display: 'flex', flexDirection: 'column',
            padding: '20px 12px',
            overflowY: 'auto',
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {navItems.map(({ Icon, label, href, highlight }) => {
                const isActive = pathname === href;
                const baseBg = isActive ? navActive : highlight ? 'linear-gradient(135deg, #0081f0 0%, #810cfa 100%)' : 'none';
                return (
                  <button
                    key={href}
                    onClick={() => { router.push(href); setMenuOpen(false); }}
                    onMouseEnter={e => { if (!isActive && !highlight) e.currentTarget.style.background = navHover; }}
                    onMouseLeave={e => { if (!isActive && !highlight) e.currentTarget.style.background = 'none'; }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 14px', borderRadius: 10,
                      fontSize: 14, fontWeight: isActive || highlight ? 600 : 500,
                      cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
                      background: baseBg,
                      color: isActive ? '#0081f0' : highlight ? 'white' : textMain,
                      marginBottom: highlight ? 8 : 0,
                      transition: 'background .15s',
                    }}
                  >
                    <span style={{ opacity: isActive || highlight ? 1 : 0.6, display: 'flex' }}>
                      <Icon />
                    </span>
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* Bottom section */}
            <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: `1px solid ${border}` }}>
              <p style={{ fontSize: 11, color: textMuted, textAlign: 'center' }}>AvaliA · avalia.education</p>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="main-area" style={{ marginLeft: 230, flex: 1, minHeight: '100%', padding: noPadding ? 0 : '32px 36px', overflow: noPadding ? 'hidden' : undefined }}>
            {children}
          </main>
        </div>
      </div>

      <ChatBot darkMode={darkMode} />
    </>
  );
}
