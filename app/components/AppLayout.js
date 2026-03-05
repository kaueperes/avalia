'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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

const SettingsIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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

// ── Nav Items ────────────────────────────────────────────────────────────────

const navItems = [
  { Icon: HomeIcon,      label: 'Início',                href: '/inicio' },
  { Icon: PlusIcon,      label: 'Nova Avaliação',         href: '/avaliar',   highlight: true },
  { Icon: ClipboardIcon, label: 'Gerenciar Avaliações',   href: '/avaliacoes' },
  { Icon: BookIcon,      label: 'Gerenciar Exercícios',   href: '/exercicios' },
  { Icon: UserIcon,      label: 'Perfil do Professor',    href: '/perfil' },
  { Icon: HelpIcon,      label: 'Ajuda',                  href: '/ajuda' },
];

// ── Layout ───────────────────────────────────────────────────────────────────

export default function AppLayout({ children, userName = 'Professor' }) {
  const router = useRouter();
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);

  const bg        = darkMode ? '#0f1117' : '#ffffff';
  const bgContent = darkMode ? '#13161c' : '#F7F8FA';
  const bgCard    = darkMode ? '#1a1e28' : '#ffffff';
  const border    = darkMode ? '#252a38' : '#E5E7EB';
  const borderCard= darkMode ? '#252a38' : '#E5E7EB';
  const textMain  = darkMode ? '#F1F5F9' : '#111827';
  const textMuted = darkMode ? '#8B95A8' : '#6B7280';
  const textSub   = darkMode ? '#5A6478' : '#9CA3AF';
  const navHover  = darkMode ? '#1e2330' : '#F3F4F6';
  const navActive = darkMode ? '#0d1f3c'  : '#EBF4FF';

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
      }}>

        {/* ── TOPBAR ── */}
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: 58,
          background: bg,
          borderBottom: `1px solid ${border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
        }}>
          {/* Logo */}
          <div style={{ cursor: 'pointer' }} onClick={() => router.push('/inicio')}>
            <img src={darkMode ? '/imagens/logo_branco.svg' : '/imagens/logo.svg'} alt="AvaliA" style={{ height: 30, width: 'auto', display: 'block' }} />
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>

            {/* Dark mode toggle */}
            <div
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
              onMouseEnter={e => e.currentTarget.style.background = navHover}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${border}` }}
            >
              <span style={{ color: darkMode ? textMuted : '#F59E0B', display: 'flex' }}><SunIcon /></span>
              <div style={{ width: 32, height: 18, borderRadius: 9, background: darkMode ? '#0081f0' : '#D1D5DB', position: 'relative', transition: 'background .2s' }}>
                <div style={{ position: 'absolute', top: 2, left: darkMode ? 14 : 2, width: 14, height: 14, borderRadius: '50%', background: 'white', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
              <span style={{ color: darkMode ? '#818CF8' : textMuted, display: 'flex' }}><MoonIcon /></span>
            </div>

            {/* Settings */}
            <button
              title="Configurações"
              onMouseEnter={e => { e.currentTarget.style.background = navHover; e.currentTarget.style.color = textMain; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = textMuted; }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'none', color: textMuted, transition: 'background .15s, color .15s' }}
            >
              <SettingsIcon />
            </button>

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 8, border: `1px solid ${border}`, cursor: 'pointer' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #0081f0, #810cfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: textMain }}>{userName}</span>
            </div>

            {/* Logout */}
            <button
              title="Sair"
              onClick={() => router.push('/login')}
              onMouseEnter={e => { e.currentTarget.style.background = navHover; e.currentTarget.style.color = textMain; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = textMuted; }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'none', color: textMuted, transition: 'background .15s, color .15s' }}
            >
              <LogoutIcon />
              <span>Sair</span>
            </button>
          </div>
        </header>

        <div style={{ display: 'flex', flex: 1, paddingTop: 58 }}>

          {/* ── SIDEBAR ── */}
          <aside className="sidebar" style={{
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
                    onClick={() => router.push(href)}
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
          <main className="main-area" style={{ marginLeft: 230, flex: 1, minHeight: '100%', padding: '32px 36px' }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
