'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ── Lucide-style SVG icons ────────────────────────────────────────────────────
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d} /> : d}
  </svg>
);

const ZapIcon      = () => <Icon d={<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />} />;
const UserIcon     = () => <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const BarChartIcon = () => <Icon d={<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>} />;
const ShieldIcon   = () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
const BrainIcon    = () => <Icon d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.24M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.24" />;
const UsersIcon    = () => <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const FileTextIcon = () => <Icon d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>} />;
const DownloadIcon = () => <Icon d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>} />;
const CheckIcon    = () => <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3" />;
const ArrowRight   = () => <Icon d="M5 12h14M12 5l7 7-7 7" size={16} />;

// ── Check mark small ─────────────────────────────────────────────────────────
const CheckMark = ({ color = '#2a7fd4' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

// ── Star ─────────────────────────────────────────────────────────────────────
const Star = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ═════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* ── Global styles ─────────────────────────────────────────────────── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes subtlePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(42,127,212,0.3); }
          50%       { box-shadow: 0 0 0 8px rgba(42,127,212,0); }
        }

        .hero-headline { animation: fadeUp .7s ease both; }
        .hero-sub      { animation: fadeUp .7s .12s ease both; }
        .hero-ctas     { animation: fadeUp .7s .22s ease both; }
        .hero-badge    { animation: fadeIn .5s ease both; }
        .hero-mockup   { animation: fadeUp .9s .3s ease both; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #2a7fd4; color: white; border: none;
          padding: 14px 28px; border-radius: 10px;
          font-weight: 600; font-size: 15px; cursor: pointer;
          transition: background .2s, transform .2s, box-shadow .2s;
        }
        .btn-primary:hover {
          background: #1d6bbf;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(42,127,212,0.35);
        }
        .btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: white; color: #374151;
          border: 1.5px solid #E5E7EB;
          padding: 14px 28px; border-radius: 10px;
          font-weight: 500; font-size: 15px; cursor: pointer;
          transition: border-color .2s, background .2s, transform .2s;
        }
        .btn-secondary:hover {
          border-color: #9CA3AF; background: #F9FAFB;
          transform: translateY(-1px);
        }

        .nav-link {
          color: #6B7280; text-decoration: none;
          font-size: 15px; font-weight: 450;
          transition: color .15s;
        }
        .nav-link:hover { color: #111827; }

        .benefit-card { transition: transform .25s; }
        .benefit-card:hover { transform: translateY(-4px); }
        .benefit-card:hover .icon-box {
          background: #2a7fd4 !important;
          color: white !important;
        }
        .icon-box { transition: background .2s, color .2s; }

        .feature-card {
          padding: 28px; border-radius: 16px;
          border: 1px solid #F3F4F6; background: white;
          transition: transform .25s, box-shadow .25s, border-color .25s;
        }
        .feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 36px rgba(42,127,212,0.09);
          border-color: #DBEAFE;
        }

        .testimonial-card {
          padding: 32px; border-radius: 16px;
          border: 1px solid #F3F4F6; background: white;
          transition: transform .25s, box-shadow .25s;
        }
        .testimonial-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 36px rgba(0,0,0,0.07);
        }

        .plan-card {
          padding: 36px 32px; border-radius: 20px;
          transition: transform .25s, box-shadow .25s;
        }
        .plan-card:hover { transform: translateY(-4px); }

        @media (max-width: 900px) {
          .hero-h1 { font-size: 44px !important; letter-spacing: -1px !important; }
          .grid-4  { grid-template-columns: repeat(2,1fr) !important; }
          .grid-3  { grid-template-columns: 1fr !important; }
          .grid-2  { grid-template-columns: 1fr !important; }
          .grid-plans { grid-template-columns: 1fr !important; }
          .nav-links { display: none !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: 'white', color: '#111827' }}>

        {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: scrolled ? 'rgba(255,255,255,0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.07)' : '1px solid transparent',
          padding: '0 32px',
          transition: 'background .3s, border-color .3s, backdrop-filter .3s',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.5px', cursor: 'pointer' }} onClick={() => router.push('/')}>
              Avali<span style={{ color: '#2a7fd4' }}>A</span>
            </div>
            <div className="nav-links" style={{ display: 'flex', gap: 36 }}>
              <a href="#funcionalidades" className="nav-link">Funcionalidades</a>
              <a href="#como-funciona" className="nav-link">Como funciona</a>
              <a href="#planos" className="nav-link">Planos</a>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', color: '#374151', fontWeight: 500, fontSize: 15, cursor: 'pointer', padding: '8px 14px', borderRadius: 8, transition: 'background .15s' }}
                onMouseEnter={e => e.target.style.background = '#F9FAFB'}
                onMouseLeave={e => e.target.style.background = 'none'}>
                Entrar
              </button>
              <button onClick={() => router.push('/signup')} className="btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>
                Começar grátis
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO ───────────────────────────────────────────────────────────── */}
        <section style={{ padding: '110px 32px 80px', background: 'white', textAlign: 'center', overflow: 'hidden' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>

            <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EFF6FF', color: '#2a7fd4', padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500, marginBottom: 36, border: '1px solid #DBEAFE' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2a7fd4', display: 'inline-block', animation: 'subtlePulse 2.4s ease infinite' }} />
              Avaliação inteligente para educadores
            </div>

            <h1 className="hero-headline hero-h1" style={{ fontSize: 70, fontWeight: 800, color: '#0A0A0A', lineHeight: 1.05, letterSpacing: '-2.5px', marginBottom: 24 }}>
              Avalie trabalhos com<br />
              <span style={{ color: '#2a7fd4' }}>precisão e velocidade</span>
            </h1>

            <p className="hero-sub" style={{ fontSize: 20, color: '#6B7280', lineHeight: 1.65, maxWidth: 540, margin: '0 auto 44px', fontWeight: 400 }}>
              IA que entende pedagogia. Feedback personalizado, critérios da sua disciplina, resultados em segundos.
            </p>

            <div className="hero-ctas" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <button onClick={() => router.push('/signup')} className="btn-primary" style={{ fontSize: 16, padding: '15px 32px' }}>
                Começar gratuitamente <ArrowRight />
              </button>
              <button onClick={() => router.push('/login')} className="btn-secondary" style={{ fontSize: 16, padding: '15px 32px' }}>
                Já tenho conta
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#9CA3AF', animation: 'fadeIn .7s .35s ease both' }}>
              Sem cartão de crédito · Grátis para começar
            </p>
          </div>

          {/* Product mockup */}
          <div className="hero-mockup" style={{ maxWidth: 940, margin: '72px auto 0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.11), 0 0 0 1px rgba(0,0,0,0.06)' }}>
            {/* Browser chrome */}
            <div style={{ background: '#F5F5F5', borderBottom: '1px solid #E5E5E5', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: 6, height: 26, maxWidth: 280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E5E5E5' }}>
                <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>avalia.education/avaliar</span>
              </div>
            </div>
            {/* App interface */}
            <div style={{ padding: '28px', background: '#FAFAFA', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Left panel */}
              <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #F0F0F0' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>Trabalho do aluno</div>
                {[90, 70, 85, 60, 78, 55].map((w, i) => (
                  <div key={i} style={{ height: 10, background: '#F3F4F6', borderRadius: 5, marginBottom: 8, width: `${w}%` }} />
                ))}
                <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, height: 9, background: '#F3F4F6', borderRadius: 4 }} />
                  <div style={{ flex: 1, height: 9, background: '#F3F4F6', borderRadius: 4 }} />
                </div>
                <button className="btn-primary" style={{ marginTop: 20, width: '100%', justifyContent: 'center', fontSize: 13, padding: '11px 0' }}>
                  Avaliar com IA <ArrowRight />
                </button>
              </div>
              {/* Right panel */}
              <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #F0F0F0' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>Resultado da avaliação</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '14px 16px', background: '#EFF6FF', borderRadius: 10, border: '1px solid #DBEAFE' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#2a7fd4', lineHeight: 1 }}>8.5</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Nota final</div>
                    <div style={{ fontSize: 12, color: '#10B981', fontWeight: 500, marginTop: 2 }}>Bom desempenho</div>
                  </div>
                </div>
                {[['Coerência textual', 92], ['Argumentação', 76], ['Gramática', 88]].map(([label, val]) => (
                  <div key={label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                      <span>{label}</span><span style={{ fontWeight: 600, color: '#374151' }}>{val}%</span>
                    </div>
                    <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${val}%`, background: 'linear-gradient(90deg, #2a7fd4, #5da0e8)', borderRadius: 3, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── BENEFITS ───────────────────────────────────────────────────────── */}
        <section id="funcionalidades" style={{ padding: '96px 32px', background: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#2a7fd4', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>Por que AvaliA</p>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-1px', marginBottom: 16 }}>Avaliação que faz sentido</h2>
              <p style={{ fontSize: 18, color: '#6B7280', maxWidth: 440, margin: '0 auto' }}>Desenvolvido com foco em pedagogia, não apenas em tecnologia.</p>
            </div>
            <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { Icon: ZapIcon, title: 'Instantâneo', desc: 'Avaliação completa em segundos. Sem esperas, sem configurações complexas.' },
                { Icon: UserIcon, title: 'Personalizado', desc: 'Adapta-se ao seu estilo de ensino, disciplina e critérios específicos.' },
                { Icon: BarChartIcon, title: 'Analítico', desc: 'Visualize padrões de desempenho e a evolução individual de cada aluno.' },
                { Icon: ShieldIcon, title: 'Consistente', desc: 'Critérios padronizados em todas as avaliações. Sem variações involuntárias.' },
              ].map(({ Icon: Ic, title, desc }) => (
                <div key={title} className="benefit-card" style={{ padding: '36px 24px', textAlign: 'center', borderRadius: 16 }}>
                  <div className="icon-box" style={{ width: 52, height: 52, borderRadius: 14, background: '#EFF6FF', color: '#2a7fd4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <Ic />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRODUCT EXPLANATION ────────────────────────────────────────────── */}
        <section id="como-funciona" style={{ padding: '96px 32px', background: 'white' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 96 }}>
            {[
              {
                tag: '01 — Perfil',
                title: 'Configure uma vez,\nuse para sempre',
                desc: 'Defina sua disciplina, critérios de avaliação e tom de voz. O AvaliA aprende como você avalia e mantém esse padrão em todos os trabalhos.',
                points: ['Perfil personalizado por disciplina', 'Tom de voz configurável', 'Critérios salvos e reutilizáveis'],
                right: false,
              },
              {
                tag: '02 — Avaliação',
                title: 'Cole o texto,\nreceba o feedback',
                desc: 'Sem processos complicados. Cole o trabalho, escolha o exercício e a IA gera uma avaliação pedagógica completa com nota e comentários detalhados.',
                points: ['25+ tipos de trabalho suportados', 'Feedback por critério com nota', 'Comentários pedagógicos precisos'],
                right: true,
              },
              {
                tag: '03 — Resultados',
                title: 'Painel completo\nda turma',
                desc: 'Acompanhe o desempenho individual e coletivo, identifique padrões e exporte relatórios para reuniões pedagógicas com um clique.',
                points: ['Visão analítica da turma', 'Exportação em PDF e CSV', 'Histórico completo de avaliações'],
                right: false,
              },
            ].map((item, i) => (
              <div key={i} className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center', direction: item.right ? 'rtl' : 'ltr' }}>
                <div style={{ direction: 'ltr' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#2a7fd4', letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>{item.tag}</p>
                  <h3 style={{ fontSize: 38, fontWeight: 800, color: '#0A0A0A', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 20, whiteSpace: 'pre-line' }}>{item.title}</h3>
                  <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.75, marginBottom: 32 }}>{item.desc}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {item.points.map(p => (
                      <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: '#374151', fontWeight: 500 }}>
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CheckMark />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Visual placeholder */}
                <div style={{ direction: 'ltr', background: '#F9FAFB', borderRadius: 20, padding: '40px 36px', border: '1px solid #F0F0F0', minHeight: 280 }}>
                  <div style={{ height: 14, background: '#E5E7EB', borderRadius: 7, marginBottom: 12, width: '75%' }} />
                  <div style={{ height: 10, background: '#F3F4F6', borderRadius: 5, marginBottom: 8, width: '55%' }} />
                  <div style={{ height: 10, background: '#F3F4F6', borderRadius: 5, marginBottom: 8, width: '65%' }} />
                  <div style={{ height: 10, background: '#F3F4F6', borderRadius: 5, marginBottom: 28, width: '45%' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div style={{ height: 60, background: '#EFF6FF', borderRadius: 10, border: '1px solid #DBEAFE' }} />
                    <div style={{ height: 60, background: '#F0FDF4', borderRadius: 10, border: '1px solid #D1FAE5' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1, height: 38, background: '#2a7fd4', borderRadius: 8, opacity: 0.85 }} />
                    <div style={{ width: 80, height: 38, background: '#E5E7EB', borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SOCIAL PROOF ───────────────────────────────────────────────────── */}
        <section style={{ padding: '96px 32px', background: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#2a7fd4', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>Depoimentos</p>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-1px' }}>Professores que transformaram sua rotina</h2>
            </div>
            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[
                { name: 'Ana Lima', role: 'Professora de Português · UFMG', quote: 'A qualidade do feedback transformou minha relação com as correções. Economizo horas toda semana e os comentários ficaram mais precisos.' },
                { name: 'Carlos Santos', role: 'Professor de Biologia · UNIP', quote: 'O nível de personalização é impressionante. A IA mantém exatamente o padrão que configurei para minha disciplina, consistentemente.' },
                { name: 'Maria Oliveira', role: 'Coordenadora Pedagógica · Colégio São Paulo', quote: 'Recomendei para toda a equipe. A padronização das avaliações e os relatórios detalhados facilitaram muito nossas reuniões pedagógicas.' },
              ].map(t => (
                <div key={t.name} className="testimonial-card">
                  <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                    {[1,2,3,4,5].map(s => <Star key={s} />)}
                  </div>
                  <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#2a7fd4', flexShrink: 0 }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ───────────────────────────────────────────────────────── */}
        <section style={{ padding: '96px 32px', background: 'white' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#2a7fd4', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>Funcionalidades</p>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-1px' }}>Cada detalhe pensado para o professor</h2>
            </div>
            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { Ic: BrainIcon,    title: 'IA pedagógica',        desc: 'Treinada para educação. Entende contexto, disciplina e objetivos pedagógicos reais.' },
                { Ic: UsersIcon,    title: 'Múltiplos perfis',      desc: 'Gerencie disciplinas e turmas distintas com perfis completamente independentes.' },
                { Ic: FileTextIcon, title: '25+ formatos',          desc: 'Redações, relatórios, projetos, provas dissertativas, seminários e muito mais.' },
                { Ic: BarChartIcon, title: 'Analytics da turma',    desc: 'Dashboards visuais com desempenho individual, médias e evolução ao longo do tempo.' },
                { Ic: DownloadIcon, title: 'Exportação flexível',   desc: 'Exporte em PDF ou CSV para registros institucionais e reuniões pedagógicas.' },
                { Ic: CheckIcon,    title: 'Critérios customizados', desc: 'Defina e salve seus próprios critérios de avaliação reutilizáveis por exercício.' },
              ].map(({ Ic, title, desc }) => (
                <div key={title} className="feature-card">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', color: '#2a7fd4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Ic />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{title}</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ────────────────────────────────────────────────────────── */}
        <section id="planos" style={{ padding: '96px 32px', background: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ maxWidth: 1060, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#2a7fd4', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>Planos</p>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-1px', marginBottom: 14 }}>Simples e transparente</h2>
              <p style={{ fontSize: 17, color: '#6B7280' }}>Comece grátis. Faça upgrade quando precisar.</p>
            </div>
            <div className="grid-plans" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>

              {/* GRATUITO */}
              <div className="plan-card" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Gratuito</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 44, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-1px', lineHeight: 1 }}>R$ 0</span>
                </div>
                <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 28 }}>Para experimentar a plataforma</p>
                <button onClick={() => router.push('/signup')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: 28, padding: '13px' }}>
                  Criar conta grátis
                </button>
                <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['5 avaliações por mês', '1 exercício salvo', '1 perfil de professor', 'Feedback básico com IA'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151' }}>
                      <CheckMark /> {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* ESSENCIAL */}
              <div className="plan-card" style={{ background: '#0A0A0A', border: '1px solid #0A0A0A', position: 'relative', transform: 'scale(1.03)' }}>
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#2a7fd4', color: 'white', padding: '4px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: 0.5 }}>
                  MAIS POPULAR
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Essencial</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 44, fontWeight: 800, color: 'white', letterSpacing: '-1px', lineHeight: 1 }}>R$ 29</span>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)' }}>/mês</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>Para professores ativos</p>
                <button onClick={() => router.push('/signup')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 28, padding: '13px', background: '#2a7fd4' }}>
                  Assinar Essencial
                </button>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['100 avaliações por mês', 'Exercícios ilimitados', '3 perfis de professor', 'Feedback detalhado por critério', 'Painel da turma', 'Exportação PDF e CSV'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                      <CheckMark color="#5da0e8" /> {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* PRO */}
              <div className="plan-card" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Pro</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 44, fontWeight: 800, color: '#0A0A0A', letterSpacing: '-1px', lineHeight: 1 }}>R$ 59</span>
                  <span style={{ fontSize: 15, color: '#9CA3AF' }}>/mês</span>
                </div>
                <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 28 }}>Para coordenadores e instituições</p>
                <button onClick={() => router.push('/signup')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: 28, padding: '13px' }}>
                  Assinar Pro
                </button>
                <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Avaliações ilimitadas', 'Perfis ilimitados', 'Feedback avançado com IA', 'Analytics completo da turma', 'Exportação completa', 'Suporte prioritário'].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151' }}>
                      <CheckMark /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
        <section style={{ padding: '96px 32px', background: 'linear-gradient(135deg, #1558a8 0%, #2a7fd4 55%, #4a9de8 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%)' }} />
          <div style={{ maxWidth: 620, margin: '0 auto', position: 'relative' }}>
            <h2 style={{ fontSize: 48, fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
              Comece a avaliar de forma inteligente hoje
            </h2>
            <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, marginBottom: 44 }}>
              Crie sua conta gratuita agora e descubra como o AvaliA pode transformar sua rotina de avaliações.
            </p>
            <button onClick={() => router.push('/signup')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '18px 48px', background: 'white', color: '#1558a8',
              border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 17,
              cursor: 'pointer', transition: 'transform .2s, box-shadow .2s',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)'; }}
            >
              Criar conta gratuita <ArrowRight />
            </button>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 18 }}>
              Sem cartão de crédito · Cancela quando quiser
            </p>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
        <footer style={{ background: '#0A0A0A', padding: '56px 32px 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'white', letterSpacing: '-0.5px', marginBottom: 14 }}>
                  Avali<span style={{ color: '#2a7fd4' }}>A</span>
                </div>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.75, maxWidth: 260 }}>
                  Avaliação inteligente para educadores. Economize tempo e ofereça feedback de qualidade com IA.
                </p>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 18 }}>Produto</div>
                {['Funcionalidades', 'Como funciona', 'Planos', 'Entrar'].map(l => (
                  <div key={l} style={{ fontSize: 14, color: '#6B7280', marginBottom: 12, cursor: 'pointer', transition: 'color .15s' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = '#6B7280'}>{l}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 18 }}>Suporte</div>
                {['Central de Ajuda', 'Fale conosco', 'Privacidade', 'Termos de uso'].map(l => (
                  <div key={l} style={{ fontSize: 14, color: '#6B7280', marginBottom: 12, cursor: 'pointer', transition: 'color .15s' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = '#6B7280'}>{l}</div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: '1px solid #1F2937', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#4B5563' }}>© 2025 AvaliA · avalia.education</span>
              <span style={{ fontSize: 13, color: '#4B5563' }}>Todos os direitos reservados</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
