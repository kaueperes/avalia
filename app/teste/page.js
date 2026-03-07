'use client';

// Protótipo do estilo dark aplicado às páginas internas

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);
const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const ChevronDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const navItems = [
  { Icon: HomeIcon,      label: 'Início',               active: true },
  { Icon: PlusIcon,      label: 'Nova Avaliação',        highlight: true },
  { Icon: ClipboardIcon, label: 'Gerenciar Avaliações'  },
  { Icon: BookIcon,      label: 'Gerenciar Exercícios'  },
  { Icon: UserIcon,      label: 'Perfil do Professor'   },
  { Icon: HelpIcon,      label: 'Ajuda'                 },
];

const stats = [
  { label: 'Avaliações este mês', value: '12', sub: '+3 esta semana' },
  { label: 'Alunos avaliados',    value: '47', sub: 'em 3 turmas' },
  { label: 'Média geral',         value: '7.8', sub: '↑ 0.4 vs mês passado' },
  { label: 'Avaliações restantes', value: '38', sub: 'Plano Essencial' },
];

const recent = [
  { name: 'Maria Silva',  grade: 9.2, label: 'Bom desempenho', color: '#22c55e' },
  { name: 'João Santos',  grade: 6.5, label: 'Regular',         color: '#f59e0b' },
  { name: 'Ana Oliveira', grade: 8.8, label: 'Bom desempenho', color: '#22c55e' },
  { name: 'Pedro Costa',  grade: 4.1, label: 'Atenção',         color: '#ef4444' },
];

export default function TestePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #0a0c18 0%, #0d1230 60%, #1a0530 100%)', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Glow de fundo */}
      <div style={{ position: 'fixed', top: '20%', left: '30%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,129,240,0.07) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,12,250,0.07) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── TOPBAR ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 58,
        background: 'rgba(10,12,24,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <img src="/imagens/logo_branco100.svg" alt="AvaliA" style={{ height: 28, width: 'auto' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>38 avaliações restantes</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white' }}>Comprar mais</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #0081f0, #810cfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>P</div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>Professor</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', display: 'flex' }}><ChevronDownIcon /></span>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, paddingTop: 58, position: 'relative', zIndex: 1 }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          position: 'fixed', top: 58, left: 0, bottom: 0, width: 230,
          background: 'rgba(10,12,24,0.7)',
          backdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column',
          padding: '20px 12px',
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map(({ Icon, label, active, highlight }) => (
              <button key={label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', borderRadius: 10,
                fontSize: 14, fontWeight: active || highlight ? 600 : 500,
                cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
                marginBottom: highlight ? 8 : 0,
                background: highlight
                  ? 'linear-gradient(135deg, #0081f0 0%, #810cfa 100%)'
                  : active
                  ? 'rgba(0,129,240,0.15)'
                  : 'none',
                color: highlight ? 'white' : active ? '#60a5fa' : 'rgba(255,255,255,0.65)',
              }}>
                <span style={{ opacity: active || highlight ? 1 : 0.7, display: 'flex' }}><Icon /></span>
                {label}
              </button>
            ))}
          </nav>
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>AvaliA · avalia.education</p>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ marginLeft: 230, flex: 1, padding: '32px 36px' }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', letterSpacing: '-0.5px', marginBottom: 6 }}>Início</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Bem-vindo de volta, Professor. Aqui está o resumo do seu mês.</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
            {stats.map(({ label, value, sub }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '20px 22px',
                backdropFilter: 'blur(8px)',
              }}>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8, fontWeight: 500 }}>{label}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-1px', marginBottom: 4 }}>{value}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Recentes */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 16 }}>Últimas avaliações</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recent.map(({ name, grade, label, color }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #0081f0, #810cfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>
                        {name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{name}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Exercício 3 · Turma A</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{grade}</p>
                      <p style={{ fontSize: 11, fontWeight: 600, color }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ background: 'linear-gradient(135deg, rgba(0,129,240,0.15), rgba(129,12,250,0.12))', border: '1px solid rgba(0,129,240,0.2)', borderRadius: 16, padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #0081f0, #810cfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <ZapIcon />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 8 }}>Avaliar com IA</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 260 }}>Cole o trabalho do aluno e receba uma correção detalhada em segundos.</p>
              </div>
              <button style={{ alignSelf: 'flex-start', padding: '10px 22px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', cursor: 'pointer' }}>
                Começar agora →
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
