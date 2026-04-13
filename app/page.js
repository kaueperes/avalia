'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
const CheckMark = ({ color = '#0081f0' }) => (
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
  const [planTab, setPlanTab] = useState('individual');

  return (
    <>
      {/* ── Global styles ─────────────────────────────────────────────────── */}
      <style>{`
        html { scroll-behavior: smooth; }
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
          background: #0081f0; color: white; border: none;
          padding: 14px 28px; border-radius: 10px;
          font-weight: 600; font-size: 15px; cursor: pointer;
          transition: background .2s, transform .2s, box-shadow .2s;
        }
        .btn-primary:hover {
          background: #0033ad;
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
          text-decoration: none;
          font-size: 15px; font-weight: 450;
          transition: color .15s;
        }
        .nav-link-dark  { color: rgba(255,255,255,0.75); }
        .nav-link-dark:hover  { color: white; }
        .nav-link-light { color: #6B7280; }
        .nav-link-light:hover { color: #111827; }

        .benefit-card { transition: transform .25s; }
        .benefit-card:hover { transform: translateY(-4px); }
        .benefit-card:hover .icon-box {
          background: #0081f0 !important;
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
          border-color: #cad0dd;
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
          .cat-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: 'white', color: '#111827' }}>

        {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          padding: '0 32px',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src="/imagens/logo_kriteria.svg" alt="KriterIA" style={{ height: 36, width: 'auto' }} />
            </div>
            <div className="nav-links" style={{ display: 'flex', gap: 32 }}>
              <a href="#funcionalidades" className="nav-link nav-link-light">Funcionalidades</a>
              <a href="#disciplinas" className="nav-link nav-link-light">Tipos de Trabalho</a>
              <a href="#coordenadores" className="nav-link nav-link-light">Para Coordenadores</a>
              <a href="#planos" className="nav-link nav-link-light">Planos</a>
              <a href="/central-de-ajuda" className="nav-link nav-link-light">Ajuda</a>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', color: '#374151', fontWeight: 500, fontSize: 15, cursor: 'pointer', padding: '8px 14px', borderRadius: 8 }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                Entrar
              </button>
              <button onClick={() => router.push('/signup')} className="btn-primary" style={{ padding: '9px 20px', fontSize: 14 }}>
                Começar grátis
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO ───────────────────────────────────────────────────────────── */}
        <section style={{ padding: '174px 32px 80px', background: 'linear-gradient(145deg, #0a0c18 0%, #0d1230 55%, #1a0530 100%)', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
          {/* Glow effects */}
          <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,129,240,0.14) 0%, rgba(129,12,250,0.08) 45%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '0', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,12,250,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative', zIndex: 1 }}>

            <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,129,240,0.12)', color: '#60a5fa', padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 500, marginBottom: 36, border: '1px solid rgba(0,129,240,0.25)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#60a5fa', display: 'inline-block', animation: 'subtlePulse 2.4s ease infinite' }} />
              Professores economizam até 8h por semana
            </div>

            <h1 className="hero-headline hero-h1" style={{ fontSize: 70, fontWeight: 800, color: 'white', lineHeight: 1.05, letterSpacing: '-2.5px', marginBottom: 24 }}>
              Chega de perder horas<br />
              <span style={{ background: 'linear-gradient(135deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>corrigindo trabalho por trabalho</span>
            </h1>

            <p className="hero-sub" style={{ fontSize: 20, color: '#94A3B8', lineHeight: 1.65, maxWidth: 560, margin: '0 auto 44px', fontWeight: 400 }}>
              Você gasta horas avaliando redações, vídeos, projetos e códigos — e ainda se pergunta se está sendo consistente. O KriterIA avalia com seus critérios, no seu estilo, em qualquer disciplina.
            </p>

            <div className="hero-ctas" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <button onClick={() => router.push('/signup')} className="btn-primary" style={{ fontSize: 16, padding: '15px 32px', background: 'linear-gradient(135deg, #0081f0, #810cfa)', boxShadow: '0 4px 24px rgba(0,129,240,0.3)' }}>
                Começar gratuitamente <ArrowRight />
              </button>
              <button onClick={() => router.push('/login')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 16, padding: '15px 32px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                Já tenho conta
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#64748B', animation: 'fadeIn .7s .35s ease both' }}>
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
                  Gerar avaliação <ArrowRight />
                </button>
              </div>
              {/* Right panel */}
              <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #F0F0F0' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>Resultado da avaliação</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '14px 16px', background: '#E6F3FF', borderRadius: 10, border: '1px solid #cad0dd' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#0081f0', lineHeight: 1 }}>8.5</div>
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
                      <div style={{ height: '100%', width: `${val}%`, background: 'linear-gradient(90deg, #0081f0, #66b3ff)', borderRadius: 3, transition: 'width 1s ease' }} />
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
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>Por que KriterIA</p>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: '#00173f', letterSpacing: '-1px', marginBottom: 16 }}>O que muda na sua rotina</h2>
              <p style={{ fontSize: 18, color: '#6B7280', maxWidth: 440, margin: '0 auto' }}>Menos tempo corrigindo. Mais tempo ensinando.</p>
            </div>
            <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { Icon: ZapIcon, title: 'Horas de volta', desc: 'Professores relatam economizar de 4 a 8 horas por semana. Tempo que volta para você ensinar, planejar e descansar.' },
                { Icon: UserIcon, title: 'Seu estilo, sempre', desc: 'Configure uma vez como você avalia. O Kriteria replica seu padrão, seu tom e seus critérios em todas as avaliações.' },
                { Icon: BarChartIcon, title: 'Veja quem precisa de você', desc: 'Identifique rapidamente quais alunos estão lutando e quais critérios a turma toda está errando.' },
                { Icon: ShieldIcon, title: 'Justo para todos', desc: 'Sem mais a dúvida "fui mais rigoroso nesse aluno?" O padrão é o mesmo do 1º ao último trabalho.' },
              ].map(({ Icon: Ic, title, desc }) => (
                <div key={title} className="benefit-card" style={{ padding: '36px 24px', textAlign: 'center', borderRadius: 16 }}>
                  <div className="icon-box" style={{ width: 52, height: 52, borderRadius: 14, background: '#E6F3FF', color: '#0081f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
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
                desc: 'Defina sua disciplina, critérios e tom de voz. O KriterIA mantém exatamente esse padrão — mesmo quando você estiver avaliando o 40º trabalho da semana.',
                points: ['Perfil personalizado por disciplina', 'Tom de voz configurável', 'Critérios salvos e reutilizáveis'],
                right: false,
                visual: (
                  <div style={{ direction: 'ltr', background: 'white', borderRadius: 20, padding: '28px', border: '1px solid #E5E7EB', boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid #F3F4F6' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #0081f0, #810cfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>A</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Prof. Ana Lima</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>Língua Portuguesa</div>
                      </div>
                      <div style={{ marginLeft: 'auto', background: '#F0FDF4', color: '#16A34A', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, border: '1px solid #D1FAE5', whiteSpace: 'nowrap' }}>● Ativo</div>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Tom de feedback</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {[['Construtivo', true], ['Rigoroso', false], ['Neutro', false], ['Didático', false]].map(([t, active]) => (
                          <span key={t} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 100, background: active ? '#E6F3FF' : '#F9FAFB', color: active ? '#0081f0' : '#9CA3AF', border: `1px solid ${active ? '#cad0dd' : '#F3F4F6'}`, fontWeight: active ? 600 : 400 }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Critérios de avaliação</div>
                      {[['Coerência textual', '40%', '#0081f0'], ['Argumentação', '35%', '#810cfa'], ['Gramática', '25%', '#10B981']].map(([name, weight, color]) => (
                        <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#F9FAFB', borderRadius: 8, marginBottom: 6, border: '1px solid #F3F4F6' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: '#374151' }}>{name}</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color }}>{weight}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 18, padding: '10px 14px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0081f0' }} />
                      <span style={{ fontSize: 12, color: '#6B7280' }}>Exercícios salvos: <strong style={{ color: '#111827' }}>12</strong></span>
                      <span style={{ fontSize: 12, color: '#D1D5DB', marginLeft: 'auto' }}>·</span>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>Avaliações: <strong style={{ color: '#111827' }}>84</strong></span>
                    </div>
                  </div>
                ),
              },
              {
                tag: '02 — Avaliação',
                title: 'Cole o texto,\nreceba o feedback',
                desc: 'Sem processos complicados. Cole o trabalho do aluno, selecione o exercício e em segundos você tem nota por critério e feedback personalizado — pronto para compartilhar.',
                points: ['60+ tipos: texto, vídeo, imagem e código', 'Feedback por critério com nota', 'Comentários pedagógicos precisos'],
                right: true,
                visual: (
                  <div style={{ direction: 'ltr', background: 'white', borderRadius: 20, border: '1px solid #E5E7EB', boxShadow: '0 8px 40px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Redação argumentativa</div>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#E6F3FF', color: '#0081f0', fontWeight: 600 }}>Prof. Ana Lima</span>
                      </div>
                    </div>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Trabalho do aluno</div>
                      <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, background: '#F9FAFB', borderRadius: 10, padding: '14px', border: '1px solid #F3F4F6' }}>
                        A mobilidade urbana representa um dos maiores desafios das metrópoles brasileiras. A falta de investimentos em transporte público, aliada ao crescimento...
                        <span style={{ color: '#D1D5DB' }}> [continua]</span>
                      </div>
                    </div>
                    <div style={{ padding: '18px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, padding: '14px 16px', background: '#E6F3FF', borderRadius: 12, border: '1px solid #cad0dd' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 32, fontWeight: 800, color: '#0081f0', lineHeight: 1 }}>8.5</div>
                          <div style={{ fontSize: 11, color: '#60a5fa', marginTop: 2 }}>/ 10.0</div>
                        </div>
                        <div style={{ width: 1, height: 40, background: '#cad0dd' }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Bom desempenho</div>
                          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Acima da média da turma</div>
                        </div>
                        <div style={{ marginLeft: 'auto', background: '#F0FDF4', color: '#16A34A', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, border: '1px solid #D1FAE5' }}>✓ Concluído</div>
                      </div>
                      {[['Coerência textual', 90, '#0081f0'], ['Argumentação', 78, '#810cfa'], ['Gramática', 88, '#10B981']].map(([label, val, color]) => (
                        <div key={label} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>
                            <span>{label}</span><span style={{ fontWeight: 700, color: '#374151' }}>{val}%</span>
                          </div>
                          <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3 }}>
                            <div style={{ height: '100%', width: `${val}%`, background: color, borderRadius: 3 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                tag: '03 — Resultados',
                title: 'Painel completo\nda turma',
                desc: 'Veja de imediato quem está ficando para trás, quais critérios a turma toda erra e como cada aluno evoluiu. Dados reais para decisões pedagógicas mais assertivas.',
                points: ['Visão analítica da turma', 'Exportação em PDF e CSV', 'Histórico completo de avaliações'],
                right: false,
                visual: (
                  <div style={{ direction: 'ltr', background: 'white', borderRadius: 20, border: '1px solid #E5E7EB', boxShadow: '0 8px 40px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                    <div style={{ padding: '18px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Turma A · 5º Período</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>Redação argumentativa — 28 avaliados</div>
                      </div>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: '#0081f0' }}>7.6</div>
                          <div style={{ fontSize: 10, color: '#9CA3AF' }}>Média</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: '#10B981' }}>82%</div>
                          <div style={{ fontSize: 10, color: '#9CA3AF' }}>Aprovação</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '14px 24px', borderBottom: '1px solid #F3F4F6' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Desempenho por critério</div>
                      {[['Coerência textual', 82, '#0081f0'], ['Argumentação', 65, '#810cfa'], ['Gramática', 78, '#10B981']].map(([label, val, color]) => (
                        <div key={label} style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                            <span>{label}</span><span style={{ fontWeight: 700, color: val < 70 ? '#EF4444' : '#374151' }}>{val}%</span>
                          </div>
                          <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3 }}>
                            <div style={{ height: '100%', width: `${val}%`, background: val < 70 ? '#FCA5A5' : color, borderRadius: 3 }} />
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop: 8, padding: '7px 10px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: '#EF4444' }}>⚠</span>
                        <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 500 }}>Argumentação abaixo da média — atenção recomendada</span>
                      </div>
                    </div>
                    <div style={{ padding: '14px 24px' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Alunos</div>
                      {[['Lucas M.', 9.2, true], ['Carla S.', 8.7, true], ['Pedro A.', 6.1, true], ['Julia R.', 4.3, false]].map(([name, score, pass]) => (
                        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 8, marginBottom: 4, background: !pass ? '#FEF2F2' : 'transparent' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: pass ? '#E6F3FF' : '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: pass ? '#0081f0' : '#EF4444', flexShrink: 0 }}>{name[0]}</div>
                          <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{name}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: pass ? '#374151' : '#EF4444' }}>{score.toFixed(1)}</span>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: pass ? '#F0FDF4' : '#FEF2F2', color: pass ? '#16A34A' : '#EF4444', fontWeight: 600, border: `1px solid ${pass ? '#D1FAE5' : '#FECACA'}` }}>{pass ? 'Aprovado' : 'Atenção'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center', direction: item.right ? 'rtl' : 'ltr' }}>
                <div style={{ direction: 'ltr' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#810cfa', letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>{item.tag}</p>
                  <h3 style={{ fontSize: 38, fontWeight: 800, color: '#00173f', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 20, whiteSpace: 'pre-line' }}>{item.title}</h3>
                  <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.75, marginBottom: 32 }}>{item.desc}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {item.points.map(p => (
                      <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: '#374151', fontWeight: 500 }}>
                        <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#E6F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CheckMark />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ direction: 'ltr' }}>{item.visual}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── DISCIPLINAS ────────────────────────────────────────────────────── */}
        <section id="disciplinas" style={{ padding: '96px 32px', background: '#00173f' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>Para todas as disciplinas</p>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: 'white', letterSpacing: '-1px', marginBottom: 16 }}>Vai muito além de redações</h2>
              <p style={{ fontSize: 18, color: '#94A3B8', maxWidth: 520, margin: '0 auto' }}>60+ tipos de trabalho em 11 categorias — incluindo avaliação de vídeo.</p>
            </div>
            <div className="cat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: '3D e Animação',            types: ['Modelagem 3D', 'Animação', 'Rigging', 'VFX'],          color: '#818cf8', icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><line x1="12" y1="22.08" x2="12" y2="12"/></> },
                { label: 'Audiovisual',               types: ['Edição de Vídeo', 'Motion Graphics', 'Apresentação Oral', 'Locução'], color: '#f472b6', icon: <><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></> },
                { label: 'Design',                    types: ['Design Gráfico', 'Identidade Visual', 'UX/UI', 'Concept Art'], color: '#34d399', icon: <><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></> },
                { label: 'Música e Áudio',            types: ['Partitura', 'Composição', 'Produção Musical', 'Sound Design'], color: '#fbbf24', icon: <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></> },
                { label: 'Texto e Escrita',           types: ['Redação', 'TCC', 'Roteiro', 'Copywriting'],            color: '#60a5fa', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/></> },
                { label: 'Código e Tecnologia',       types: ['Programação', 'HTML/CSS/JS', 'Mobile', 'Banco de Dados'], color: '#a78bfa', icon: <><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></> },
                { label: 'Arquitetura e Eng.',        types: ['Prancha', 'BIM', 'Maquete', 'Desenho Técnico'],        color: '#f97316', icon: <><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M4 15v-3a8 8 0 0 1 16 0v3"/></> },
                { label: 'Arte e Artesanato',         types: ['Pintura', 'Escultura', 'Cerâmica', 'Gravura'],          color: '#e879f9', icon: <><path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/></> },
                { label: 'Ed. Física e Saúde',        types: ['Exercício', 'Dança', 'Técnica Esportiva'],              color: '#4ade80', icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/> },
                { label: 'Línguas e Acessibilidade',  types: ['Libras', 'Tradução', 'Produção Oral'],                  color: '#38bdf8', icon: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></> },
                { label: 'Outros',                    types: ['Design de Produto', 'Gastronomia', 'Proj. Interdisciplinar'], color: '#94a3b8', icon: <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></> },
              ].map(({ label, types, color, icon }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 18px', transition: 'background .2s, border-color .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10 }}>{icon}</svg>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 10 }}>{label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {types.map(t => <span key={t} style={{ fontSize: 13, color: '#64748B' }}>{t}</span>)}
                    <span style={{ fontSize: 12, color: '#3d4f63' }}>e mais...</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 40, padding: '16px 24px', background: 'rgba(0,129,240,0.1)', border: '1px solid rgba(0,129,240,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              <span style={{ fontSize: 14, color: '#94A3B8' }}>Trabalhos em <strong style={{ color: '#60a5fa' }}>vídeo</strong> (apresentações, danças, exercícios, Libras, animações) são avaliados pelo Kriteria.</span>
            </div>
          </div>
        </section>

        {/* ── COORDENADORES ──────────────────────────────────────────────────── */}
        <section id="coordenadores" style={{ padding: '96px 32px', background: 'white' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#810cfa', letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>Para coordenadores e gestores</p>
                <h2 style={{ fontSize: 38, fontWeight: 800, color: '#00173f', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 20 }}>Dados pedagógicos reais para decisões assertivas</h2>
                <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.75, marginBottom: 32 }}>
                  O KriterIA não é só uma ferramenta de correção — é uma plataforma de inteligência pedagógica. Coordenadores e gestores têm acesso a dados consolidados que antes exigiam horas de tabulação manual.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    'Relatório de turma com média, aprovação e desempenho por critério',
                    'Identifique quais critérios a turma toda está errando',
                    'Acompanhe a evolução de alunos ao longo do semestre',
                    'Dados prontos para reuniões pedagógicas e conselhos de classe',
                    'Exportação em PDF e CSV para registros institucionais',
                  ].map(p => (
                    <li key={p} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 15, color: '#374151', lineHeight: 1.55 }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <CheckMark color="#810cfa" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E5E7EB', boxShadow: '0 8px 40px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', background: '#F9FAFB', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#810cfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Relatório de Turma — IA</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#f3e8ff', color: '#810cfa', fontWeight: 600 }}>Pro / Premium</span>
                </div>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Resumo da turma</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[['7.4', 'Média geral', '#0081f0'], ['79%', 'Aprovação', '#10B981'], ['34', 'Avaliados', '#6B7280']].map(([val, label, color]) => (
                      <div key={label} style={{ textAlign: 'center', padding: '12px 8px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #F3F4F6' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Desempenho por critério</div>
                  {[['Estrutura do texto', 81, '#0081f0'], ['Argumentação', 58, '#EF4444'], ['Gramática e ortografia', 76, '#10B981'], ['Conclusão', 69, '#f59e0b']].map(([label, val, color]) => (
                    <div key={label} style={{ marginBottom: 9 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                        <span>{label}</span>
                        <span style={{ fontWeight: 700, color: val < 65 ? '#EF4444' : '#374151' }}>{val}%</span>
                      </div>
                      <div style={{ height: 5, background: '#F3F4F6', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${val}%`, background: val < 65 ? '#FCA5A5' : color, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 8, padding: '8px 10px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 12, color: '#EF4444', marginTop: 1 }}>⚠</span>
                    <span style={{ fontSize: 12, color: '#DC2626', fontWeight: 500, lineHeight: 1.5 }}>Argumentação (58%) abaixo da meta — considere revisar a abordagem em aula</span>
                  </div>
                </div>
                <div style={{ padding: '14px 20px' }}>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Alunos que precisam de atenção</div>
                  {[['Júlia R.', 3.8], ['Pedro A.', 4.6], ['Marcos T.', 4.9]].map(([name, score]) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', background: '#FEF2F2', borderRadius: 8, marginBottom: 4 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#EF4444', flexShrink: 0 }}>{name[0]}</div>
                      <span style={{ fontSize: 13, color: '#374151', flex: 1 }}>{name}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#EF4444' }}>{score.toFixed(1)}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: '#FEF2F2', color: '#EF4444', fontWeight: 600, border: '1px solid #FECACA' }}>Atenção</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF ───────────────────────────────────────────────────── */}
        <section style={{ padding: '96px 32px', background: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>Depoimentos</p>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: '#00173f', letterSpacing: '-1px' }}>Professores que transformaram sua rotina</h2>
            </div>
            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[
                { name: 'Ana Lima', role: 'Professora de Português · UFMG', quote: 'Eu corrigia 30 redações todo fim de semana. Hoje faço o mesmo em menos de 1 hora — e o feedback ficou ainda mais preciso. Não consigo mais imaginar minha rotina sem o KriterIA.' },
                { name: 'Carlos Santos', role: 'Professor de Programação · UNIP', quote: 'O que mais me surpreendeu foi a consistência. Antes eu era claramente mais rigoroso nas últimas avaliações do que nas primeiras. Agora o padrão é sempre o mesmo.' },
                { name: 'Maria Oliveira', role: 'Coordenadora Pedagógica · Colégio São Paulo', quote: 'Os relatórios de turma mudaram nossa forma de trabalhar. Em minutos vejo quais critérios estão abaixo da média, apresento os dados nas reuniões de equipe e tomamos decisões pedagógicas com base real. Toda a escola aderiu.' },
              ].map(t => (
                <div key={t.name} className="testimonial-card">
                  <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                    {[1,2,3,4,5].map(s => <Star key={s} />)}
                  </div>
                  <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#E6F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#0081f0', flexShrink: 0 }}>
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
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>Funcionalidades</p>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: '#00173f', letterSpacing: '-1px' }}>Cada detalhe pensado para o professor</h2>
            </div>
            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { Ic: BrainIcon,    title: 'Avaliação pedagógica',  desc: 'Treinada para educação. Entende contexto, disciplina e objetivos pedagógicos reais.' },
                { Ic: UsersIcon,    title: 'Múltiplos perfis',      desc: 'Gerencie disciplinas e turmas distintas com perfis completamente independentes.' },
                { Ic: FileTextIcon, title: '60+ tipos de trabalho',  desc: 'Texto, vídeo, imagem, código, partitura, 3D e muito mais — 11 categorias para todas as disciplinas.' },
                { Ic: BarChartIcon, title: 'Relatórios de turma',   desc: 'Dados consolidados por turma: média, aprovação, critérios abaixo da meta e alunos que precisam de atenção.' },
                { Ic: DownloadIcon, title: 'Exportação flexível',   desc: 'Exporte em PDF ou CSV para registros institucionais e reuniões pedagógicas.' },
                { Ic: CheckIcon,    title: 'Critérios customizados', desc: 'Defina e salve seus próprios critérios de avaliação reutilizáveis por exercício.' },
              ].map(({ Ic, title, desc }) => (
                <div key={title} className="feature-card">
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E6F3FF', color: '#0081f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
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
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 14 }}>Planos</p>
              <h2 style={{ fontSize: 44, fontWeight: 800, color: '#00173f', letterSpacing: '-1px', marginBottom: 14 }}>Simples e transparente</h2>
              <p style={{ fontSize: 17, color: '#6B7280', marginBottom: 32 }}>Comece grátis. Faça upgrade quando precisar.</p>
              {/* Toggle pill */}
              <div style={{ display: 'inline-flex', background: '#E5E7EB', borderRadius: 100, padding: 4, gap: 4 }}>
                <button onClick={() => setPlanTab('individual')} style={{ padding: '8px 24px', borderRadius: 100, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', background: planTab === 'individual' ? '#00173f' : 'transparent', color: planTab === 'individual' ? 'white' : '#6B7280' }}>
                  Planos Individuais
                </button>
                <button onClick={() => setPlanTab('institucional')} style={{ padding: '8px 24px', borderRadius: 100, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', background: planTab === 'institucional' ? '#00173f' : 'transparent', color: planTab === 'institucional' ? 'white' : '#6B7280' }}>
                  Planos Institucionais
                </button>
              </div>
            </div>

            {/* PLANOS INDIVIDUAIS */}
            {planTab === 'individual' && (
              <div className="grid-plans" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>

                {/* GRATUITO */}
                <div className="plan-card" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Gratuito</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, color: '#00173f', letterSpacing: '-1px', lineHeight: 1 }}>R$ 0</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 28 }}>Para experimentar a plataforma</p>
                  <button onClick={() => router.push('/signup')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: 28, padding: '13px' }}>
                    Criar conta grátis
                  </button>
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {['5 avaliações/mês', '1 perfil de avaliação', '3 exercícios salvos', 'Avaliação individual', 'PDF individual', 'Histórico de avaliações'].map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                        <CheckMark /> {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ESSENCIAL */}
                <div className="plan-card" style={{ background: '#00173f', border: '1px solid #00173f', position: 'relative', transform: 'scale(1.03)' }}>
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#810cfa', color: 'white', padding: '4px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: 0.5 }}>
                    MAIS POPULAR
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Essencial</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, color: 'white', letterSpacing: '-1px', lineHeight: 1 }}>R$ 29</span>
                    <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)' }}>/mês</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>Para professores ativos</p>
                  <button onClick={() => router.push('/signup')} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 28, padding: '13px', background: '#0081f0' }}>
                    Assinar Essencial
                  </button>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {['120 avaliações/mês', '4 perfis de avaliação', 'Exercícios ilimitados', 'Avaliação em lote', 'PDF + exportação CSV', 'Chatbot (50 msg)', 'Histórico completo'].map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                        <CheckMark color="#66b3ff" /> {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* PRO */}
                <div className="plan-card" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Pro</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, color: '#00173f', letterSpacing: '-1px', lineHeight: 1 }}>R$ 59</span>
                    <span style={{ fontSize: 15, color: '#9CA3AF' }}>/mês</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 28 }}>Para quem avalia turmas inteiras</p>
                  <button onClick={() => router.push('/signup')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: 28, padding: '13px' }}>
                    Assinar Pro
                  </button>
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {['180 avaliações/mês', '6 perfis de avaliação', 'Exercícios ilimitados', '10 relatórios/mês (IA)', 'Avaliação em lote', 'PDF + exportação CSV', 'Chatbot (150 msg)', 'Filtros avançados'].map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                        <CheckMark /> {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* PREMIUM */}
                <div className="plan-card" style={{ background: 'white', border: '2px solid #d97706' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Premium</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, color: '#00173f', letterSpacing: '-1px', lineHeight: 1 }}>R$ 119</span>
                    <span style={{ fontSize: 15, color: '#9CA3AF' }}>/mês</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 28 }}>Para professores de alta demanda</p>
                  <button onClick={() => router.push('/signup')} style={{ width: '100%', justifyContent: 'center', marginBottom: 28, padding: '13px', display: 'flex', alignItems: 'center', background: '#d97706', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    Assinar Premium
                  </button>
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {['240 avaliações/mês', '10 perfis de avaliação', 'Exercícios ilimitados', '30 relatórios/mês (IA)', 'Avaliação em lote', 'PDF + exportação CSV', 'Chatbot (300 msg)', 'Filtros avançados', 'Suporte prioritário'].map(item => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                        <CheckMark color="#d97706" /> {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PLANOS INSTITUCIONAIS */}
            {planTab === 'institucional' && (
              <>
                <p style={{ textAlign: 'center', fontSize: 14, color: '#6B7280', marginBottom: 40 }}>
                  Gerencie toda a sua equipe em um só lugar. Um coordenador distribui avaliações, relatórios e permissões para cada usuário.
                </p>
                <div className="grid-plans" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>

                  {/* STARTER */}
                  <div className="plan-card" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Starter</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 40, fontWeight: 800, color: '#00173f', letterSpacing: '-1px', lineHeight: 1 }}>R$ 1.090</span>
                    </div>
                    <span style={{ fontSize: 15, color: '#9CA3AF' }}>/mês</span>
                    <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 28, marginTop: 6 }}>Para pequenas equipes</p>
                    <a href="mailto:contato@avalia.education?subject=Plano Institucional Starter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 28, padding: '13px', background: 'transparent', color: '#00173f', border: '2px solid #00173f', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box' }}>
                      Solicitar proposta
                    </a>
                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {['10 usuários', '2.400 avaliações/mês', 'Perfis de avaliação ilimitados', '300 relatórios/mês (IA)', 'Dashboard do coordenador', 'Controle de permissões', 'Chatbot ilimitado', 'Suporte prioritário'].map(item => (
                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                          <CheckMark /> {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MÉDIO */}
                  <div className="plan-card" style={{ background: '#00173f', border: '1px solid #00173f', position: 'relative', transform: 'scale(1.03)' }}>
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#810cfa', color: 'white', padding: '4px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: 0.5 }}>
                      MAIS POPULAR
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Médio</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 40, fontWeight: 800, color: 'white', letterSpacing: '-1px', lineHeight: 1 }}>R$ 2.150</span>
                    </div>
                    <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)' }}>/mês</span>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 28, marginTop: 6 }}>Para escolas e cursos</p>
                    <a href="mailto:contato@avalia.education?subject=Plano Institucional Médio" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 28, padding: '13px', background: '#0081f0', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box' }}>
                      Solicitar proposta
                    </a>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {['20 usuários', '4.800 avaliações/mês', 'Perfis de avaliação ilimitados', '600 relatórios/mês (IA)', 'Dashboard do coordenador', 'Controle de permissões', 'Chatbot ilimitado', 'Suporte prioritário'].map(item => (
                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                          <CheckMark color="#66b3ff" /> {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PLUS */}
                  <div className="plan-card" style={{ background: 'white', border: '1px solid #E5E7EB' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Plus</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 40, fontWeight: 800, color: '#00173f', letterSpacing: '-1px', lineHeight: 1 }}>R$ 4.190</span>
                    </div>
                    <span style={{ fontSize: 15, color: '#9CA3AF' }}>/mês</span>
                    <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 28, marginTop: 6 }}>Para faculdades e institutos</p>
                    <a href="mailto:contato@avalia.education?subject=Plano Institucional Plus" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 28, padding: '13px', background: 'transparent', color: '#00173f', border: '2px solid #00173f', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box' }}>
                      Solicitar proposta
                    </a>
                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {['40 usuários', '9.600 avaliações/mês', 'Perfis de avaliação ilimitados', '1.200 relatórios/mês (IA)', 'Dashboard do coordenador', 'Controle de permissões', 'Chatbot ilimitado', 'Suporte prioritário'].map(item => (
                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                          <CheckMark /> {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PERSONALIZADO */}
                  <div className="plan-card" style={{ background: 'white', border: '2px solid #d97706' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Personalizado</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 32, fontWeight: 800, color: '#00173f', letterSpacing: '-1px', lineHeight: 1 }}>Sob consulta</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 28, marginTop: 6 }}>Para grandes instituições</p>
                    <a href="mailto:contato@avalia.education?subject=Plano Institucional Personalizado" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 28, padding: '13px', background: '#d97706', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box' }}>
                      Fale conosco
                    </a>
                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {['+40 usuários', 'Volume personalizado', 'Perfis de avaliação ilimitados', 'Relatórios ilimitados', 'Dashboard do coordenador', 'Controle de permissões', 'Chatbot ilimitado', 'Suporte dedicado'].map(item => (
                        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                          <CheckMark color="#d97706" /> {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
        <section style={{ padding: '96px 32px', background: 'linear-gradient(135deg, #0033ad 0%, #0081f0 55%, #0081f0 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%)' }} />
          <div style={{ maxWidth: 620, margin: '0 auto', position: 'relative' }}>
            <h2 style={{ fontSize: 48, fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
              Seu próximo fim de semana pode ser seu de volta
            </h2>
            <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, marginBottom: 44 }}>
              Crie sua conta grátis agora. Sem cartão de crédito. Em 5 minutos você já consegue avaliar seu primeiro trabalho com o Kriteria.
            </p>
            <button onClick={() => router.push('/signup')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '18px 48px', background: 'white', color: '#0033ad',
              border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 17,
              cursor: 'pointer', transition: 'transform .2s, box-shadow .2s',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)'; }}
            >
              Começar agora, de graça <ArrowRight />
            </button>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 18 }}>
              Sem cartão de crédito · Cancela quando quiser
            </p>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
        <footer style={{ background: '#00173f', padding: '56px 32px 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
              <div>
                <div style={{ marginBottom: 14 }}>
                  <img src="/imagens/logo_kriteria.svg" alt="KriterIA" style={{ height: 30, width: 'auto', filter: 'brightness(0) invert(1)' }} />
                </div>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.75, maxWidth: 260 }}>
                  Avaliação inteligente para educadores. Economize tempo e ofereça feedback de qualidade com consistência.
                </p>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 18 }}>Produto</div>
                {[
                  { label: 'Funcionalidades', href: '#funcionalidades' },
                  { label: 'Tipos de Trabalho', href: '#disciplinas' },
                  { label: 'Para Coordenadores', href: '#coordenadores' },
                  { label: 'Planos', href: '#planos' },
                  { label: 'Ajuda', href: '/central-de-ajuda' },
                ].map(({ label, href }) => (
                  <a key={label} href={href} style={{ display: 'block', fontSize: 14, color: '#6B7280', marginBottom: 12, cursor: 'pointer', transition: 'color .15s', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = '#6B7280'}>{label}</a>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 18 }}>Suporte</div>
                {[
                  { label: 'Central de Ajuda', href: '/central-de-ajuda' },
                  { label: 'Fale conosco', href: '/contato' },
                  { label: 'Privacidade', href: '/privacidade' },
                  { label: 'Termos de uso', href: '/termos' },
                ].map(({ label, href }) => (
                  <a key={label} href={href} style={{ display: 'block', fontSize: 14, color: '#6B7280', marginBottom: 12, cursor: 'pointer', transition: 'color .15s', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = '#6B7280'}>{label}</a>
                ))}
              </div>
            </div>
            <div style={{ borderTop: '1px solid #001025', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#4B5563' }}>© 2026 KriterIA · avalia.education</span>
              <span style={{ fontSize: 13, color: '#4B5563' }}>Todos os direitos reservados</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
