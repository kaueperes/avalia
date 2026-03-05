'use client';
import Link from 'next/link';

const FEATURES = [
  { icon: '✦', title: 'Feedback com IA', desc: 'Gere feedbacks detalhados e personalizados no seu tom de voz em segundos, para qualquer tipo de trabalho acadêmico.' },
  { icon: '👤', title: 'Perfis de professor', desc: 'Crie perfis por disciplina e turma, cada um com tom, vocabulário e estilo de escrita diferentes.' },
  { icon: '📋', title: '25+ tipos de trabalho', desc: 'Modelagem 3D, Design, Código, Redação, Fotografia, Ilustração e muito mais — com critérios específicos para cada área.' },
  { icon: '📊', title: 'Painel da turma', desc: 'Acompanhe médias, aprovações e evolução dos alunos com filtros avançados e relatórios completos.' },
  { icon: '💾', title: 'Exercícios reutilizáveis', desc: 'Salve enunciados e critérios de avaliação para usar em qualquer turma ou semestre.' },
  { icon: '📄', title: 'Exportação completa', desc: 'Exporte avaliações individuais e relatórios de turma em CSV e PDF com logo institucional.' },
];

const PLANS = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    desc: 'Para experimentar o produto',
    cta: 'Começar grátis',
    ctaHref: '/signup',
    highlight: false,
    items: [
      '5 avaliações por mês',
      '1 perfil de professor',
      '1 exercício salvo',
      'Tipos básicos de trabalho',
      'Histórico de avaliações',
    ],
    blocked: ['Exportação', 'Modo lote', 'Relatórios', 'Suporte'],
  },
  {
    name: 'Essencial',
    price: 'R$ 29',
    period: '/mês',
    desc: 'Para professores ativos',
    cta: 'Assinar Essencial',
    ctaHref: '/signup',
    highlight: true,
    badge: 'Mais popular',
    items: [
      '120 avaliações por mês',
      '3 perfis de professor',
      'Exercícios ilimitados',
      'Todos os 25 tipos de trabalho',
      'Modo lote (múltiplos alunos)',
      'Seleção de tom do feedback',
      'Critérios customizados',
      'Exportar CSV + PDF individual',
      'Logo institucional no PDF',
      'KPIs da turma',
      'Suporte por e-mail',
    ],
    blocked: [],
  },
  {
    name: 'Pro',
    price: 'R$ 59',
    period: '/mês',
    desc: 'Para uso intensivo e institucional',
    cta: 'Assinar Pro',
    ctaHref: '/signup',
    highlight: false,
    items: [
      '300 avaliações por mês',
      'Perfis ilimitados',
      'Tudo do plano Essencial',
      'Relatório PDF da turma',
      'Análise pedagógica com IA',
      'Parecer individual de evolução',
      'Filtros avançados completos',
      'Suporte prioritário',
    ],
    blocked: [],
  },
];

const STEPS = [
  { n: '1', title: 'Crie seu perfil', desc: 'Configure seu nome, disciplina, turma e tom de voz preferido.' },
  { n: '2', title: 'Defina o exercício', desc: 'Adicione o enunciado e os critérios de avaliação com pesos.' },
  { n: '3', title: 'Gere o feedback', desc: 'Informe o nome do aluno e receba a avaliação completa em segundos.' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#1a1814', background: '#fff' }}>

      {/* NAVBAR */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e8e6e1', padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: '#1a1814' }}>
          Avali<span style={{ color: '#2a7fd4' }}>A</span>
        </span>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="#funcionalidades" style={{ fontSize: 14, color: '#4a4740', textDecoration: 'none', fontWeight: 500 }}>Funcionalidades</a>
          <a href="#como-funciona" style={{ fontSize: 14, color: '#4a4740', textDecoration: 'none', fontWeight: 500 }}>Como funciona</a>
          <a href="#planos" style={{ fontSize: 14, color: '#4a4740', textDecoration: 'none', fontWeight: 500 }}>Planos</a>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/login" style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #dddbd6', color: '#4a4740', fontWeight: 500, textDecoration: 'none', fontSize: 14 }}>
            Entrar
          </Link>
          <Link href="/signup" style={{ padding: '8px 20px', borderRadius: 8, background: '#2a7fd4', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
            Criar conta grátis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0f2744 0%, #1a3a5c 50%, #0f2744 100%)', padding: '100px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 60, minHeight: 520 }}>
        <div style={{ maxWidth: 560, flex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(42,127,212,0.2)', border: '1px solid rgba(42,127,212,0.4)', borderRadius: 20, padding: '6px 14px', fontSize: 12, color: '#7ab8f5', fontWeight: 600, marginBottom: 24, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Avaliação com Inteligência Artificial
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.15, marginBottom: 24, color: '#fff', letterSpacing: '-1px' }}>
            Avalie trabalhos<br />de alunos com<br /><span style={{ color: '#4da3f5' }}>IA em segundos</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', marginBottom: 40, lineHeight: 1.7 }}>
            Gere feedbacks personalizados no seu estilo, acompanhe o desempenho da turma e economize horas de trabalho toda semana.
          </p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Link href="/signup" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 10, background: '#2a7fd4', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 16 }}>
              Começar grátis →
            </Link>
            <a href="#como-funciona" style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500 }}>
              Ver como funciona ↓
            </a>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>Sem cartão de crédito · 5 avaliações grátis por mês</p>
        </div>

        {/* Mock UI */}
        <div style={{ flex: 1, maxWidth: 480, display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#8a8680', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Avaliação gerada</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 64, height: 64, borderRadius: 12, background: 'linear-gradient(135deg, #2a7fd4, #1a5fa0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>8.4</span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1814' }}>Maria Silva</div>
                <div style={{ fontSize: 12, color: '#8a8680' }}>Modelagem 3D — Exercício 3</div>
                <div style={{ display: 'inline-block', background: '#dcfce7', color: '#16a34a', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700, marginTop: 4 }}>Aprovado</div>
              </div>
            </div>
            {[
              { label: 'Topologia', score: 9 },
              { label: 'Proporção', score: 8 },
              { label: 'Acabamento', score: 7.5 },
            ].map(c => (
              <div key={c.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#4a4740' }}>{c.label}</span>
                  <span style={{ fontWeight: 700, color: '#1a1814' }}>{c.score}</span>
                </div>
                <div style={{ height: 6, background: '#f0eeea', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${c.score * 10}%`, background: '#2a7fd4', borderRadius: 3 }} />
                </div>
              </div>
            ))}
            <div style={{ background: '#f5f4f0', borderRadius: 8, padding: 12, marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8a8680', marginBottom: 6, textTransform: 'uppercase' }}>Feedback gerado</div>
              <div style={{ fontSize: 12, color: '#4a4740', lineHeight: 1.6 }}>O trabalho demonstra domínio técnico sólido. A topologia está bem executada, com edge loops funcionais nas regiões de curvatura...</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#f5f4f0', borderBottom: '1px solid #e8e6e1', padding: '40px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {[
            { value: '25+', label: 'Tipos de trabalho' },
            { value: '10×', label: 'Mais rápido que manual' },
            { value: '100%', label: 'No seu estilo de escrita' },
            { value: '3 planos', label: 'Para todo tipo de uso' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#2a7fd4', marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#8a8680' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" style={{ padding: '100px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#1a1814', marginBottom: 16, letterSpacing: '-0.5px' }}>Tudo que você precisa para avaliar</h2>
            <p style={{ fontSize: 16, color: '#8a8680', maxWidth: 520, margin: '0 auto' }}>Desenvolvido para professores que querem feedback de qualidade sem perder horas de trabalho.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: '#f5f4f0', border: '1px solid #e8e6e1', borderRadius: 14, padding: 28 }}>
                <div style={{ width: 44, height: 44, background: 'rgba(42,127,212,0.1)', border: '1px solid rgba(42,127,212,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: '#1a1814' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#8a8680', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" style={{ padding: '100px 48px', background: '#0f2744' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.5px' }}>Como funciona</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 64 }}>Três passos para gerar avaliações completas com IA</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ position: 'relative' }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', top: 28, left: '60%', width: '80%', height: 1, background: 'rgba(255,255,255,0.15)', zIndex: 0 }} />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2a7fd4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 auto 20px' }}>{s.n}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" style={{ padding: '100px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#1a1814', marginBottom: 16, letterSpacing: '-0.5px' }}>Escolha seu plano</h2>
            <p style={{ fontSize: 16, color: '#8a8680' }}>Comece grátis. Faça upgrade quando precisar de mais.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'start' }}>
            {PLANS.map(plan => (
              <div key={plan.name} style={{
                background: plan.highlight ? '#2a7fd4' : '#fff',
                border: plan.highlight ? 'none' : '1px solid #e8e6e1',
                borderRadius: 16,
                padding: 32,
                position: 'relative',
                boxShadow: plan.highlight ? '0 24px 60px rgba(42,127,212,0.35)' : 'none',
                transform: plan.highlight ? 'scale(1.04)' : 'none',
              }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: '#fff', borderRadius: 20, padding: '4px 16px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#8a8680', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: plan.highlight ? '#fff' : '#1a1814', lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#8a8680' }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#8a8680', marginBottom: 28 }}>{plan.desc}</p>
                <Link href={plan.ctaHref} style={{
                  display: 'block', textAlign: 'center', padding: '12px 20px', borderRadius: 8,
                  background: plan.highlight ? '#fff' : '#2a7fd4',
                  color: plan.highlight ? '#2a7fd4' : '#fff',
                  fontWeight: 700, textDecoration: 'none', fontSize: 14, marginBottom: 28,
                }}>
                  {plan.cta}
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.items.map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#4a4740' }}>
                      <span style={{ color: plan.highlight ? '#a8d8ff' : '#2a7fd4', flexShrink: 0, marginTop: 1 }}>✓</span>
                      {item}
                    </div>
                  ))}
                  {plan.blocked.map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#c0bdb8' }}>
                      <span style={{ flexShrink: 0, marginTop: 1 }}>—</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#8a8680', marginTop: 32 }}>
            Planos pagos podem adquirir avaliações extras a qualquer momento.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: 'linear-gradient(135deg, #0f2744 0%, #1a3a5c 100%)', padding: '100px 48px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 42, fontWeight: 800, color: '#fff', marginBottom: 20, letterSpacing: '-0.5px' }}>Comece a usar o AvalIA hoje</h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
          Crie sua conta grátis e gere suas primeiras avaliações em minutos.
        </p>
        <Link href="/signup" style={{ display: 'inline-block', padding: '16px 40px', borderRadius: 10, background: '#2a7fd4', color: '#fff', fontWeight: 700, textDecoration: 'none', fontSize: 17 }}>
          Criar conta grátis →
        </Link>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 16 }}>Sem cartão de crédito necessário</p>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0a1e35', padding: '48px 48px 32px', color: 'rgba(255,255,255,0.5)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: '-0.5px' }}>
                Avali<span style={{ color: '#4da3f5' }}>A</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 280 }}>Avaliação educacional com inteligência artificial para professores de qualquer área.</p>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Produto</div>
              {['Funcionalidades', 'Planos', 'Como funciona'].map(l => (
                <div key={l} style={{ fontSize: 13, marginBottom: 10 }}><a href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{l}</a></div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suporte</div>
              {[['Central de Ajuda', '/ajuda'], ['Entrar', '/login'], ['Criar conta', '/signup']].map(([l, h]) => (
                <div key={l} style={{ fontSize: 13, marginBottom: 10 }}><Link href={h} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{l}</Link></div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
            <span>© 2025 AvalIA — Desenvolvido por Kaue Peres</span>
            <span>avalia.education</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
