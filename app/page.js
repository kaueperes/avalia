'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", overflowX: 'hidden' }}>

      {/* NAVBAR */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'white', borderBottom: '1px solid #E5E7EB', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#7C3AED' }}>AvaliA</div>
          <div style={{ display: 'flex', gap: 32, fontSize: 15, color: '#374151' }}>
            <a href="#funcionalidades" style={{ textDecoration: 'none', color: 'inherit' }}>Funcionalidades</a>
            <a href="#como-funciona" style={{ textDecoration: 'none', color: 'inherit' }}>Como funciona</a>
            <a href="#planos" style={{ textDecoration: 'none', color: 'inherit' }}>Planos</a>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => router.push('/login')} style={{ padding: '9px 20px', border: '1.5px solid #7C3AED', borderRadius: 8, background: 'white', color: '#7C3AED', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              Entrar
            </button>
            <button onClick={() => router.push('/signup')} style={{ padding: '9px 20px', border: 'none', borderRadius: 8, background: '#7C3AED', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              Criar conta grátis
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 45%, #4F46E5 100%)', padding: '96px 24px 88px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '6px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 32, border: '1px solid rgba(255,255,255,0.25)' }}>
            🎓 Feito para professores brasileiros
          </div>

          <h1 style={{ fontSize: 58, fontWeight: 900, color: 'white', lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-1.5px' }}>
            Chega de perder fins de semana corrigindo trabalhos
          </h1>

          <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, margin: '0 auto 44px', maxWidth: 580 }}>
            O AvaliA usa inteligência artificial para avaliar os trabalhos dos seus alunos em segundos, com feedback personalizado e os critérios da sua disciplina.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/signup')} style={{ padding: '16px 40px', background: '#F59E0B', color: '#1F2937', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 17, cursor: 'pointer', boxShadow: '0 8px 28px rgba(245,158,11,0.45)' }}>
              Começar grátis agora →
            </button>
            <button onClick={() => router.push('/login')} style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: 12, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
              Já tenho conta
            </button>
          </div>

          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 18 }}>
            Sem cartão de crédito &nbsp;·&nbsp; 5 avaliações grátis &nbsp;·&nbsp; Cancela quando quiser
          </p>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', padding: '44px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, textAlign: 'center' }}>
          {[
            { n: '10×', label: 'mais rápido que corrigir manualmente' },
            { n: '25+', label: 'tipos de trabalho suportados' },
            { n: '100%', label: 'personalizado para sua disciplina' },
            { n: '0 min', label: 'para começar a usar' },
          ].map(s => (
            <div key={s.n}>
              <div style={{ fontSize: 42, fontWeight: 900, color: '#7C3AED', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section style={{ padding: '96px 24px', background: 'white' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 12 }}>A realidade de todo professor</p>
            <h2 style={{ fontSize: 42, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>Você se identifica com isso?</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { emoji: '😩', title: 'Fins de semana perdidos', desc: 'Horas e horas corrigindo pilhas de trabalhos enquanto seus alunos descansam.' },
              { emoji: '😔', title: 'Feedback vago e repetitivo', desc: 'Por falta de tempo, os comentários ficam genéricos e não ajudam o aluno a evoluir de verdade.' },
              { emoji: '🤯', title: 'Critérios inconsistentes', desc: 'É difícil manter o mesmo padrão do primeiro ao último trabalho de uma turma de 40 alunos.' },
            ].map(p => (
              <div key={p.title} style={{ padding: 32, borderRadius: 16, background: '#FFF7ED', border: '1px solid #FED7AA' }}>
                <div style={{ fontSize: 42, marginBottom: 16 }}>{p.emoji}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1F2937', margin: '0 0 10px' }}>{p.title}</h3>
                <p style={{ fontSize: 15, color: '#6B7280', margin: 0, lineHeight: 1.65 }}>{p.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 52 }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#374151', margin: 0 }}>
              O AvaliA resolve tudo isso — em segundos. ✨
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" style={{ padding: '96px 24px', background: '#F5F3FF' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 12 }}>O que você ganha</p>
            <h2 style={{ fontSize: 42, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>Tudo que você precisa para avaliar melhor</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: '🤖', title: 'IA treinada para educação', desc: 'Feedback profissional e pedagógico, não respostas genéricas de chatbot. A IA entende o contexto educacional.' },
              { icon: '👤', title: 'Perfil do professor', desc: 'Configure sua disciplina, tom de voz e critérios. A IA avalia como você avaliaria, no seu estilo.' },
              { icon: '📋', title: '25+ tipos de trabalho', desc: 'Redações, projetos, relatórios, provas dissertativas, seminários e muito mais.' },
              { icon: '📊', title: 'Painel da turma', desc: 'Veja o desempenho geral, identifique alunos em dificuldade e exporte relatórios com um clique.' },
              { icon: '⚡', title: 'Exercícios salvos', desc: 'Cadastre seus exercícios uma vez e reutilize nas próximas avaliações sem precisar reconfigurar nada.' },
              { icon: '📄', title: 'Exportação completa', desc: 'Exporte avaliações em PDF ou CSV para registros, reuniões pedagógicas e portfólios dos alunos.' },
            ].map(f => (
              <div key={f.title} style={{ padding: 28, borderRadius: 16, background: 'white', border: '1px solid #E9D5FF', boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
                <div style={{ fontSize: 38, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1F2937', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" style={{ padding: '96px 24px', background: 'white' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 12 }}>Simples assim</p>
            <h2 style={{ fontSize: 42, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>3 passos para avaliar qualquer trabalho</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { n: '1', title: 'Configure seu perfil', desc: 'Informe sua disciplina, o tom de voz que prefere e os critérios que importam para você. Leva menos de 2 minutos.' },
              { n: '2', title: 'Cole o trabalho do aluno', desc: 'Cole o texto na plataforma e selecione o tipo de exercício. Simples como um copiar e colar.' },
              { n: '3', title: 'Receba a avaliação completa', desc: 'Em segundos: nota, feedback detalhado por critério e comentários que ajudam o aluno a melhorar de verdade.' },
            ].map((step, i) => (
              <div key={step.n} style={{ display: 'flex', gap: 28, alignItems: 'flex-start', paddingBottom: i < 2 ? 44 : 0, position: 'relative' }}>
                {i < 2 && <div style={{ position: 'absolute', left: 23, top: 52, bottom: 0, width: 2, background: '#E9D5FF' }} />}
                <div style={{ width: 48, height: 48, minWidth: 48, borderRadius: '50%', background: '#7C3AED', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, position: 'relative', zIndex: 1 }}>
                  {step.n}
                </div>
                <div style={{ paddingTop: 8 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{step.title}</h3>
                  <p style={{ fontSize: 16, color: '#6B7280', margin: 0, lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '96px 24px', background: '#F5F3FF' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 12 }}>Quem já usa</p>
            <h2 style={{ fontSize: 42, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>Professores que recuperaram seu tempo</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { name: 'Ana Lima', role: 'Professora de Português · UFMG', quote: 'Antes eu passava o domingo inteiro corrigindo redações. Agora faço tudo em 1 hora e os comentários estão ainda melhores.' },
              { name: 'Carlos Santos', role: 'Professor de Biologia · Colégio São Paulo', quote: 'O que me surpreendeu foi a qualidade do feedback. A IA realmente entende os critérios que cadastrei para minha disciplina.' },
              { name: 'Maria Oliveira', role: 'Coordenadora Pedagógica · UNIP', quote: 'Recomendei para toda a equipe de professores. A padronização das avaliações melhorou muito desde que começamos a usar.' },
            ].map(t => (
              <div key={t.name} style={{ padding: 28, borderRadius: 16, background: 'white', border: '1px solid #E9D5FF', boxShadow: '0 2px 8px rgba(124,58,237,0.06)' }}>
                <div style={{ fontSize: 40, color: '#C4B5FD', marginBottom: 12, lineHeight: 1 }}>"</div>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.7, margin: '0 0 20px', fontStyle: 'italic' }}>{t.quote}</p>
                <div>
                  <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="planos" style={{ padding: '96px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 12 }}>Planos e preços</p>
            <h2 style={{ fontSize: 42, fontWeight: 900, color: '#111827', margin: '0 0 14px', letterSpacing: '-0.5px' }}>Escolha seu plano</h2>
            <p style={{ fontSize: 17, color: '#6B7280', margin: 0 }}>Comece grátis e faça upgrade quando precisar</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'start' }}>

            {/* GRATUITO */}
            <div style={{ padding: '36px 32px', borderRadius: 20, border: '2px solid #E5E7EB', background: 'white' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Gratuito</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 46, fontWeight: 900, color: '#111827', lineHeight: 1 }}>R$ 0</span>
              </div>
              <p style={{ fontSize: 14, color: '#9CA3AF', margin: '0 0 28px' }}>Para experimentar</p>
              <button onClick={() => router.push('/signup')} style={{ width: '100%', padding: '13px', border: '2px solid #7C3AED', borderRadius: 10, background: 'white', color: '#7C3AED', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 28 }}>
                Criar conta grátis
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['5 avaliações por mês', '1 exercício salvo', '1 perfil de professor', 'Feedback básico com IA'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151' }}>
                    <span style={{ color: '#10B981', fontWeight: 700, fontSize: 16 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* ESSENCIAL */}
            <div style={{ padding: '36px 32px', borderRadius: 20, border: '3px solid #7C3AED', background: 'linear-gradient(180deg, #7C3AED 0%, #6D28D9 100%)', position: 'relative', transform: 'scale(1.04)' }}>
              <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', background: '#F59E0B', color: '#1F2937', padding: '5px 18px', borderRadius: 100, fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap' }}>
                ⭐ MAIS POPULAR
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Essencial</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 46, fontWeight: 900, color: 'white', lineHeight: 1 }}>R$ 29</span>
                <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)' }}>/mês</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: '0 0 28px' }}>Para professores ativos</p>
              <button onClick={() => router.push('/signup')} style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 10, background: '#F59E0B', color: '#1F2937', fontWeight: 800, fontSize: 15, cursor: 'pointer', marginBottom: 28, boxShadow: '0 4px 16px rgba(245,158,11,0.4)' }}>
                Assinar Essencial →
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['100 avaliações por mês', 'Exercícios ilimitados', '3 perfis de professor', 'Feedback detalhado por critério', 'Painel da turma', 'Exportação PDF e CSV'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: '#FCD34D', fontWeight: 700, fontSize: 16 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* PRO */}
            <div style={{ padding: '36px 32px', borderRadius: 20, border: '2px solid #E5E7EB', background: 'white' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 46, fontWeight: 900, color: '#111827', lineHeight: 1 }}>R$ 59</span>
                <span style={{ fontSize: 16, color: '#9CA3AF' }}>/mês</span>
              </div>
              <p style={{ fontSize: 14, color: '#9CA3AF', margin: '0 0 28px' }}>Para coordenadores e instituições</p>
              <button onClick={() => router.push('/signup')} style={{ width: '100%', padding: '13px', border: '2px solid #111827', borderRadius: 10, background: 'white', color: '#111827', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 28 }}>
                Assinar Pro →
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Avaliações ilimitadas', 'Perfis ilimitados', 'Feedback avançado com IA', 'Painel com analytics completo', 'Exportação completa', 'Suporte prioritário por e-mail'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151' }}>
                    <span style={{ color: '#10B981', fontWeight: 700, fontSize: 16 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '96px 24px', background: 'linear-gradient(135deg, #6B21A8 0%, #7C3AED 45%, #4F46E5 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ maxWidth: 620, margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontSize: 46, fontWeight: 900, color: 'white', margin: '0 0 20px', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Seu próximo fim de semana pode ser diferente
          </h2>
          <p style={{ fontSize: 19, color: 'rgba(255,255,255,0.85)', margin: '0 0 44px', lineHeight: 1.65 }}>
            Junte-se a professores que já economizam horas toda semana com o AvaliA. Comece de graça, sem compromisso.
          </p>
          <button onClick={() => router.push('/signup')} style={{ padding: '18px 52px', background: '#F59E0B', color: '#1F2937', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 18, cursor: 'pointer', boxShadow: '0 8px 32px rgba(245,158,11,0.5)' }}>
            Criar minha conta grátis →
          </button>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 18 }}>
            Sem cartão de crédito &nbsp;·&nbsp; Cancela quando quiser
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#111827', padding: '56px 24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 12 }}>AvaliA</div>
              <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.7, maxWidth: 280, margin: 0 }}>
                Avaliação inteligente para professores. Economize tempo e ofereça feedback de qualidade com IA.
              </p>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Produto</div>
              {['Funcionalidades', 'Como funciona', 'Planos', 'Entrar'].map(l => (
                <div key={l} style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 10, cursor: 'pointer' }}>{l}</div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', marginBottom: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Suporte</div>
              {['Central de Ajuda', 'Fale conosco', 'Privacidade', 'Termos de uso'].map(l => (
                <div key={l} style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 10, cursor: 'pointer' }}>{l}</div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1F2937', paddingTop: 24, fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
            © 2025 AvaliA · avalia.education · Todos os direitos reservados
          </div>
        </div>
      </footer>
    </div>
  );
}
