'use client';
import { useRouter } from 'next/navigation';

const Tag = ({ children, color = '#0081f0' }) => (
  <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: color === '#0081f0' ? '#E6F3FF' : color === '#810cfa' ? '#F3EEFF' : '#F0FDF4', color, letterSpacing: 0.3 }}>{children}</span>
);

const SectionLabel = ({ children }) => (
  <p style={{ fontSize: 11, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 12 }}>{children}</p>
);

const Divider = () => (
  <div style={{ height: 1, background: '#F3F4F6', margin: '0 0 64px' }} />
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: '28px 32px', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', ...style }}>{children}</div>
);

const DecisionCard = ({ number, title, problem, solution, why }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 24, paddingBottom: 40, borderBottom: '1px solid #F3F4F6', marginBottom: 40 }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #0081f0, #810cfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{number}</div>
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#00173f', marginBottom: 16 }}>{title}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '14px 18px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Problema</p>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65, margin: 0 }}>{problem}</p>
        </div>
        <div style={{ background: '#F0FDF4', borderRadius: 10, padding: '14px 18px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Solução</p>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65, margin: 0 }}>{solution}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</span>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{why}</p>
      </div>
    </div>
  </div>
);

export default function Portfolio() {
  const router = useRouter();

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: 'white', color: '#111827', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/imagens/logo.svg" alt="AvaliA" style={{ height: 32, width: 'auto' }} />
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <a href="#inicio" onClick={scrollTo('inicio')} style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>Início</a>
            <a href="#problema" onClick={scrollTo('problema')} style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>Problema</a>
            <a href="#pesquisa" onClick={scrollTo('pesquisa')} style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>Pesquisa</a>
            <a href="#decisoes" onClick={scrollTo('decisoes')} style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>Decisões</a>
            <a href="#arquitetura" onClick={scrollTo('arquitetura')} style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>Arquitetura</a>
            <a href="#processo" onClick={scrollTo('processo')} style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>Processo</a>
            <a href="#aprendizados" onClick={scrollTo('aprendizados')} style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>Aprendizados</a>
            <a href="#proximos" onClick={scrollTo('proximos')} style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>Próximos passos</a>
            <a href="#contato" onClick={scrollTo('contato')} style={{ background: '#0081f0', color: 'white', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Contato</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="inicio" style={{ padding: '120px 32px 80px', background: 'linear-gradient(145deg, #0a0c18 0%, #0d1230 55%, #1a0530 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,12,250,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,129,240,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #0081f0, #810cfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 800 }}>K</div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: 0 }}>Kauê Rodrigues Peres</p>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>UX Designer · São Paulo, BR</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(0,129,240,0.2)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>Case Study</span>
            <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(129,12,250,0.2)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.3)' }}>EdTech · SaaS</span>
            <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.08)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.15)' }}>2025–2026</span>
          </div>

          <h1 style={{ fontSize: 64, fontWeight: 900, color: 'white', lineHeight: 1.0, letterSpacing: '-2.5px', marginBottom: 28 }}>
            AvaliA<br />
            <span style={{ background: 'linear-gradient(90deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Menos tempo corrigindo.<br />Mais tempo ensinando.
            </span>
          </h1>

          <p style={{ fontSize: 20, color: '#94A3B8', lineHeight: 1.7, maxWidth: 640, marginBottom: 48 }}>
            Como projetei um SaaS de inteligência artificial para ajudar professores a avaliar dezenas de trabalhos com qualidade e consistência — sem esgotamento.
          </p>

          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              { label: 'Função', value: 'Designer & Fundador' },
              { label: 'Período', value: '4 meses' },
              { label: 'Stack', value: 'Next.js · Claude AI' },
              { label: 'Status', value: 'Em produção' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'white', margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform preview strip */}
      <section style={{ background: '#F8FAFF', borderBottom: '1px solid #E5E7EB', padding: '0 32px', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#E5E7EB' }}>
            {[
              { icon: '👤', title: 'Perfil do Professor', desc: 'Tom, disciplina e critérios' },
              { icon: '📋', title: 'Exercícios', desc: 'Enunciados reutilizáveis' },
              { icon: '🤖', title: 'Avaliação com IA', desc: 'Nota + feedback em segundos' },
              { icon: '📊', title: 'Relatórios', desc: 'Evolução da turma' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'white', padding: '24px 28px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24 }}>{icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{title}</p>
                  <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 32px 0' }}>

        {/* O Problema */}
        <section id="problema" style={{ marginBottom: 80 }}>
          <SectionLabel>01 · O Problema</SectionLabel>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: '#00173f', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 32 }}>
            "O problema não é o professor não saber avaliar."
          </h2>

          <div style={{ padding: '28px 36px', background: 'linear-gradient(135deg, #0a0c18, #1a0530)', borderRadius: 20, marginBottom: 40, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,12,250,0.2) 0%, transparent 70%)' }} />
            <p style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.5, margin: '0 0 12px', position: 'relative' }}>
              "É que avaliar bem, em escala, é humanamente esgotante."
            </p>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0, position: 'relative' }}>— Insight central do projeto</p>
          </div>

          <p style={{ fontSize: 17, color: '#374151', lineHeight: 1.8, marginBottom: 24 }}>
            Todo professor sabe avaliar. O problema é quando há 30, 40, 60 trabalhos para corrigir antes de sexta. A qualidade do feedback inevitavelmente cai. Os últimos trabalhos recebem menos atenção que os primeiros. O professor fica exausto. O aluno recebe um retorno superficial.
          </p>

          <p style={{ fontSize: 17, color: '#374151', lineHeight: 1.8, marginBottom: 40 }}>
            O AvaliA nasceu desse problema real — um problema que eu vivi como professor e que percebi não ter uma solução boa no mercado. As ferramentas existentes ou eram muito genéricas (chat GPT puro) ou muito complexas (LMS corporativos). Nenhuma respeitava o fluxo real de como um professor pensa e trabalha.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { icon: '⏱️', stat: '45–90 min', label: 'por trabalho avaliado com qualidade' },
              { icon: '📚', stat: '30–60', label: 'trabalhos em uma turma típica' },
              { icon: '😓', stat: '100%', label: 'de esgotamento no fim do ciclo' },
            ].map(({ icon, stat, label }) => (
              <Card key={stat}>
                <p style={{ fontSize: 24, margin: '0 0 8px' }}>{icon}</p>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#00173f', margin: '0 0 6px', letterSpacing: '-1px' }}>{stat}</p>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, margin: 0 }}>{label}</p>
              </Card>
            ))}
          </div>
        </section>

        <Divider />

        {/* Como eu pesquisei */}
        <section id="pesquisa" style={{ marginBottom: 80 }}>
          <SectionLabel>02 · Pesquisa & Descoberta</SectionLabel>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#00173f', letterSpacing: '-0.5px', marginBottom: 32 }}>O problema que eu mesmo vivia</h2>

          <p style={{ fontSize: 17, color: '#374151', lineHeight: 1.8, marginBottom: 24 }}>
            Diferente de projetos onde o designer está um passo afastado do problema, aqui eu era o próprio usuário. Isso acelerou o entendimento do problema, mas também criou um risco: projetar para mim mesmo, sem validar se outros professores tinham as mesmas dores.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
            <Card style={{ borderLeft: '3px solid #0081f0' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>O que eu fiz</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Mapeei meu próprio fluxo de avaliação passo a passo',
                  'Identifiquei os momentos de maior fricção e decisão',
                  'Construí um protótipo funcional em HTML para testar hipóteses',
                  'Conversei informalmente com colegas professores sobre suas dores',
                ].map(item => (
                  <li key={item} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                    <span style={{ color: '#0081f0', fontWeight: 700, flexShrink: 0 }}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
            <Card style={{ borderLeft: '3px solid #F59E0B' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>O que aprendi (tarde)</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Minha experiência era representativa, mas não universal',
                  'Professores de diferentes disciplinas têm critérios muito distintos',
                  'A resistência ao "AI avaliando" era maior do que eu esperava',
                  'Deveria ter feito testes com usuários reais antes de build',
                ].map(item => (
                  <li key={item} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                    <span style={{ color: '#D97706', fontWeight: 700, flexShrink: 0 }}>!</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Evolution: HTML → SaaS */}
          <div style={{ background: '#F9FAFB', borderRadius: 16, padding: '28px 32px', border: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 20 }}>Evolução do produto</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
              {[
                { version: 'v0', label: 'Planilha manual', sub: 'Coluna por critério', color: '#9CA3AF' },
                { version: 'v1', label: 'HTML + localStorage', sub: 'Funcionava, mas frágil', color: '#F59E0B' },
                { version: 'v2', label: 'Next.js + Express', sub: 'Multi-usuário, banco', color: '#0081f0' },
                { version: 'v3', label: 'SaaS completo', sub: 'Stripe, planos, exports', color: '#810cfa' },
              ].map(({ version, label, sub, color }, i, arr) => (
                <div key={version} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 800, margin: '0 auto 8px' }}>{version}</div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 2px', whiteSpace: 'nowrap' }}>{label}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, whiteSpace: 'nowrap' }}>{sub}</p>
                  </div>
                  {i < arr.length - 1 && (
                    <div style={{ width: 40, height: 2, background: '#E5E7EB', margin: '0 12px', marginBottom: 24, flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* Decisões de Design */}
        <section id="decisoes" style={{ marginBottom: 80 }}>
          <SectionLabel>03 · Decisões de Design</SectionLabel>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#00173f', letterSpacing: '-0.5px', marginBottom: 12 }}>Cada decisão tem um motivo</h2>
          <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.7, marginBottom: 48 }}>
            As escolhas de design foram guiadas por um princípio central: <strong style={{ color: '#374151' }}>reduzir a carga cognitiva em cada etapa.</strong> O professor já está cognitivamente sobrecarregado. A interface não pode ser mais um problema a resolver.
          </p>

          <DecisionCard
            number="01"
            title="Perfil de professor como âncora de personalidade"
            problem="Feedback genérico de IA não tem valor. 'Bom trabalho, mas pode melhorar' poderia ter sido escrito por qualquer coisa."
            solution="O professor configura seu tom (construtivo, rigoroso, didático, neutro), disciplina e critérios uma única vez. A IA escreve no estilo dele."
            why="A IA se adapta ao professor, não o contrário. O feedback soa como o professor — porque foi calibrado para isso."
          />

          <DecisionCard
            number="02"
            title="Exercícios reutilizáveis separados da avaliação"
            problem="Se o professor precisa redigir o enunciado da atividade toda vez que avalia, o fluxo quebra no meio e ele desiste."
            solution="Biblioteca de exercícios criada uma vez, reutilizada em todas as avaliações subsequentes da mesma atividade."
            why="Separar 'configurar' de 'agir' é um princípio fundamental de UX. Crie uma vez, use mil vezes."
          />

          <DecisionCard
            number="03"
            title="Feedback editável antes de exportar"
            problem="Confiar 100% na IA sem revisão humana é um erro de produto. O professor precisa sentir que está no controle."
            solution="Após a IA gerar o feedback, o professor pode editar qualquer campo antes de exportar em PDF ou compartilhar."
            why="A IA é um assistente, não um substituto. Dar controle ao professor aumenta a confiança e adoção."
          />

          <DecisionCard
            number="04"
            title="Nota por critério + nota final calculada"
            problem="Uma nota única não ensina nada ao aluno sobre onde ele precisa melhorar."
            solution="Cada critério tem peso e nota individual. A nota final é calculada automaticamente pela plataforma."
            why="Granularidade certa: detalhada o suficiente para o aluno aprender, simples o suficiente para o professor publicar rápido."
          />

          <DecisionCard
            number="05"
            title="Tema claro como padrão — com opção dark"
            problem="O primeiro protótipo no Figma era totalmente dark (#070b14). Visualmente atraente, mas inadequado para o contexto de uso: professores trabalham em salas de aula iluminadas, em laptops, durante o dia."
            solution="Tema claro como padrão da plataforma, mantendo a opção de dark mode para quem prefere. A landing page e páginas públicas preservam o dark como linguagem de marca."
            why="Tema claro reduz fadiga visual em sessões longas de correção. Dark themes estão associados a ferramentas de desenvolvedores — professores esperam interfaces parecidas com as ferramentas que já usam (Google Classroom, Moodle)."
          />

          <DecisionCard
            number="06"
            title="Exercícios como entidade independente — não existia no design original"
            problem="No Figma inicial, o enunciado do exercício era apenas um campo de texto dentro da tela de avaliação. O professor precisava redigir ou colar o enunciado toda vez que avaliava um trabalho da mesma atividade."
            solution="Exercícios viraram uma página e entidade própria: o professor cria o enunciado uma vez, dá um nome, e reutiliza em quantas avaliações quiser. A IA usa o enunciado como contexto para gerar o feedback."
            why="O enunciado é a âncora pedagógica da avaliação — sem ele, a IA gera feedback genérico. Separar exercícios da avaliação foi a decisão que mais elevou a qualidade do feedback gerado."
          />

          {/* Dark vs Light visual comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #1a1f2e' }}>
              <div style={{ background: '#070b14', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4d9fff' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#4d9fff' }}>v1 — Dark (Figma original)</span>
              </div>
              <div style={{ background: '#0a0e1a', padding: '20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#0f1420', border: '1px solid #1a1f2e', borderRadius: 8, padding: '10px 14px' }}>
                  <span style={{ fontSize: 12, color: '#8b9abf' }}>Tom do Feedback</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, background: '#0f1420', border: '1px solid #4d9fff', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, color: '#4d9fff', fontWeight: 600 }}>Formal Acadêmico</span>
                  </div>
                  <div style={{ flex: 1, background: '#0f1420', border: '1px solid #1a1f2e', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, color: '#8b9abf' }}>Construtivo</span>
                  </div>
                </div>
                <div style={{ background: '#4d9fff', borderRadius: 8, padding: '10px', textAlign: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#000' }}>Gerar Avaliação</span>
                </div>
              </div>
            </div>
            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
              <div style={{ background: '#F9FAFB', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0081f0' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#0081f0' }}>v2 — Light (atual)</span>
              </div>
              <div style={{ background: 'white', padding: '20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 14px' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Tom do Feedback</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, background: '#E6F3FF', border: '1px solid #0081f0', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, color: '#0081f0', fontWeight: 600 }}>Construtivo</span>
                  </div>
                  <div style={{ flex: 1, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>Rigoroso</span>
                  </div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #0081f0, #810cfa)', borderRadius: 8, padding: '10px', textAlign: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Gerar Avaliação</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Divider />

        {/* Arquitetura de informação */}
        <section id="arquitetura" style={{ marginBottom: 80 }}>
          <SectionLabel>04 · Arquitetura de Informação</SectionLabel>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#00173f', letterSpacing: '-0.5px', marginBottom: 12 }}>Três camadas de uso</h2>
          <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.7, marginBottom: 40 }}>
            A arquitetura foi desenhada em três camadas com frequências de uso distintas. Essa separação determinou a navegação, os menus e a hierarquia visual de toda a plataforma.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 40 }}>
            {[
              {
                layer: '01',
                name: 'Configurar',
                freq: 'Feito uma vez',
                color: '#0081f0',
                bg: '#E6F3FF',
                icon: '⚙️',
                items: ['Perfil do professor', 'Tom e estilo de feedback', 'Critérios por disciplina', 'Exercícios e enunciados'],
                desc: 'Setup inicial. O professor investe tempo aqui uma única vez e colhe benefício em todas as avaliações futuras.',
              },
              {
                layer: '02',
                name: 'Avaliar',
                freq: 'Ação recorrente',
                color: '#810cfa',
                bg: '#F3EEFF',
                icon: '🤖',
                items: ['Nova avaliação', 'Selecionar perfil + exercício', 'Colar texto do aluno', 'Revisar e aprovar feedback'],
                desc: 'O coração do produto. Fluxo otimizado para ser o mais rápido e fluido possível. Cada segundo conta.',
              },
              {
                layer: '03',
                name: 'Consultar',
                freq: 'Depois dos resultados',
                color: '#0EA5E9',
                bg: '#E0F7FF',
                icon: '📊',
                items: ['Histórico de avaliações', 'Relatórios de turma', 'Evolução por aluno', 'Exportação e compartilhamento'],
                desc: 'Camada de análise. Disponível quando o professor quer revisitar decisões e acompanhar a evolução dos alunos.',
              },
            ].map(({ layer, name, freq, color, bg, icon, items, desc }) => (
              <div key={name} style={{ background: 'white', border: `1px solid ${color}22`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: bg, padding: '20px 24px', borderBottom: `1px solid ${color}22` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 2 }}>Camada {layer}</span>
                  </div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#00173f', margin: '0 0 4px' }}>{name}</p>
                  <p style={{ fontSize: 12, color: '#6B7280', margin: 0, fontWeight: 500 }}>{freq}</p>
                </div>
                <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map(item => (
                      <li key={item} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151' }}>
                        <span style={{ color, fontWeight: 700 }}>·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.65, margin: 0, marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation principle */}
          <Card style={{ background: '#F9FAFB' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>Princípio de navegação</p>
            <p style={{ fontSize: 16, color: '#111827', lineHeight: 1.7, margin: '0 0 12px' }}>
              <strong>Camada 1 (Configurar)</strong> fica no menu lateral, no final — porque você vai lá raramente. <strong>Camada 2 (Avaliar)</strong> é o botão de destaque no topo — é a ação principal do dia a dia. <strong>Camada 3 (Consultar)</strong> está no menu lateral acima do Configurar, porque é acessada após as avaliações estarem prontas.
            </p>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0, lineHeight: 1.7 }}>
              A posição no menu espelha a frequência de uso e o momento na jornada do professor — não a ordem alfabética ou a lógica do banco de dados.
            </p>
          </Card>
        </section>

        <Divider />

        {/* Iterações */}
        <section id="processo" style={{ marginBottom: 80 }}>
          <SectionLabel>05 · Processo & Iterações</SectionLabel>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#00173f', letterSpacing: '-0.5px', marginBottom: 12 }}>Do HTML ao SaaS em produção</h2>
          <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.7, marginBottom: 40 }}>
            O processo foi deliberadamente iterativo — construir rápido, usar, quebrar, refazer. Cada versão ensinou algo que nenhum framework de design teria capturado.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderLeft: '2px solid #E5E7EB', marginLeft: 20 }}>
            {[
              {
                phase: 'Fase 1 — Conceito em HTML',
                duration: 'Meses 1-2',
                color: '#9CA3AF',
                description: 'Um arquivo HTML único com localStorage. Feio, mas funcionava. Provei que a premissa era válida: a IA conseguia gerar feedback coerente dado um contexto rico. A interface era tosca mas o fluxo fazia sentido.',
                learning: 'O produto core funciona. Próximo problema: escala e persistência de dados.',
              },
              {
                phase: 'Fase 2 — Reprojeto completo',
                duration: 'Meses 3-5',
                color: '#F59E0B',
                description: 'Joguei o HTML fora e comecei do zero com Next.js + Express. Criei o primeiro protótipo no Figma com tema totalmente dark — visualmente forte, mas inadequado para o contexto de uso. Após testar, migrei para tema claro. Foi também nessa fase que percebi que o campo "enunciado" precisava ser muito mais do que um campo de texto na tela de avaliação: exercícios viraram uma entidade própria com página dedicada, o que transformou completamente a qualidade do feedback gerado pela IA.',
                learning: 'Duas viradas nessa fase: tema claro é decisão de contexto, não estética. E separar exercícios da avaliação foi a decisão que mais impactou a qualidade do produto.',
              },
              {
                phase: 'Fase 3 — Sistemas de negócio',
                duration: 'Meses 6-9',
                color: '#0081f0',
                description: 'Integração com Stripe para pagamentos, sistema de cotas de avaliação, múltiplos planos, exportação PDF/CSV. Cada feature nova testada primeiro em staging.',
                learning: 'Definir o modelo de negócio antes de construir features teria poupado muito retrabalho. Aprendi isso da forma difícil.',
              },
              {
                phase: 'Fase 4 — Landing e conteúdo público',
                duration: 'Meses 10-12',
                color: '#810cfa',
                description: 'Landing page, central de ajuda, páginas de termos, privacidade e contato. Atenção à SEO e copywriting. A plataforma interna estava pronta; chegou a hora de apresentá-la ao mundo.',
                learning: 'A landing page é um produto de design separado da plataforma. Merecia mais atenção desde o começo.',
              },
            ].map(({ phase, duration, color, description, learning }, i) => (
              <div key={phase} style={{ paddingLeft: 32, paddingBottom: 40, position: 'relative' }}>
                <div style={{ position: 'absolute', left: -10, top: 0, width: 18, height: 18, borderRadius: '50%', background: color, border: '3px solid white', boxShadow: '0 0 0 2px ' + color + '44' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#00173f', margin: 0 }}>{phase}</h3>
                  <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{duration}</span>
                </div>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, marginBottom: 12 }}>{description}</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14 }}>🔍</span>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>{learning}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* Aprendizados */}
        <section id="aprendizados" style={{ marginBottom: 80 }}>
          <SectionLabel>06 · Aprendizados</SectionLabel>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#00173f', letterSpacing: '-0.5px', marginBottom: 12 }}>O que eu faria diferente</h2>
          <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.7, marginBottom: 40 }}>
            Honestidade é parte do processo de design. Aqui está o que aprendi — e o que eu mudaria se começasse hoje.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
            {[
              {
                icon: '👥',
                title: 'Envolver professores reais muito antes',
                desc: 'Eu era o usuário, então achei que entendia o problema. Mas cada professor tem um fluxo diferente. Testes com 5 professores reais nos primeiros 30 dias teriam revelado padrões que levei meses para descobrir sozinho.',
                tag: 'Pesquisa',
                tagColor: '#0081f0',
              },
              {
                icon: '💰',
                title: 'Definir o modelo de negócio antes das features',
                desc: 'Construí várias features sem saber se elas estavam no plano gratuito ou pago. Isso gerou retrabalho quando precisei definir os limites de cada plano. Modelo de negócio é decisão de produto — não é "depois".',
                tag: 'Estratégia',
                tagColor: '#D97706',
              },
              {
                icon: '📝',
                title: 'Documentar decisões em tempo real',
                desc: 'Muitas decisões foram tomadas de cabeça, no calor do momento. Meses depois, eu não lembrava mais o motivo. Um arquivo de decisões de design (ADR) simples teria preservado o raciocínio por trás de cada escolha.',
                tag: 'Processo',
                tagColor: '#7C3AED',
              },
              {
                icon: '🎯',
                title: 'Focar em menos tipos de trabalho primeiro',
                desc: 'Suportar 25+ tipos de trabalho logo no começo foi um erro de escopo. Teria sido mais inteligente dominar a experiência para redações e relatórios primeiro, validar, e expandir depois.',
                tag: 'Produto',
                tagColor: '#0EA5E9',
              },
            ].map(({ icon, title, desc, tag, tagColor }) => (
              <Card key={title} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24 }}>{icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Tag color={tagColor}>{tag}</Tag>
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#00173f', marginBottom: 10, lineHeight: 1.4 }}>{title}</h3>
                    <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, margin: 0 }}>{desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* What I'm proud of */}
          <div style={{ background: 'linear-gradient(135deg, #0a0c18, #0d1230)', borderRadius: 20, padding: '36px 40px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>O que me orgulha</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                'Construí um produto funcional end-to-end, do design ao código, sozinho — landing page, autenticação, IA, pagamentos, exportação.',
                'A arquitetura de 3 camadas (Configurar → Avaliar → Consultar) emergiu de observação real, não de framework teórico.',
                'O sistema de perfis de professor que personaliza o tom da IA é uma inovação genuína — não vi em nenhum concorrente.',
                'Cada decisão de design está conectada a uma dor real — não a uma tendência visual ou a "o que é bonito no Dribbble".',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'block' }} />
                  </span>
                  <p style={{ fontSize: 15, color: '#CBD5E1', lineHeight: 1.7, margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* Próximos passos */}
        <section id="proximos" style={{ marginBottom: 80 }}>
          <SectionLabel>07 · Próximos Passos</SectionLabel>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#00173f', letterSpacing: '-0.5px', marginBottom: 12 }}>O produto ainda está evoluindo</h2>
          <p style={{ fontSize: 17, color: '#6B7280', lineHeight: 1.7, marginBottom: 40 }}>
            O AvaliA está em produção, mas longe de terminado. Estes são os próximos horizontes de design e produto.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { icon: '🧪', title: 'Testes com usuários reais', desc: 'Sessões de usability testing com professores de diferentes disciplinas para identificar pontos de fricção que eu não consigo ver por estar too close.', priority: 'Alta prioridade' },
              { icon: '📱', title: 'Experiência mobile', desc: 'A plataforma hoje é otimizada para desktop. Professores frequentemente corrigem trabalhos em qualquer lugar. Uma versão mobile-first é necessária.', priority: 'Média prioridade' },
              { icon: '🔄', title: 'Feedback loop com o aluno', desc: 'Hoje o feedback chega ao aluno via PDF. Um portal onde o aluno pode acessar suas avaliações e ver sua evolução fecharia o ciclo de aprendizagem.', priority: 'Roadmap futuro' },
            ].map(({ icon, title, desc, priority }) => (
              <Card key={title}>
                <p style={{ fontSize: 24, margin: '0 0 12px' }}>{icon}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.5, margin: '0 0 8px' }}>{priority}</p>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </Card>
            ))}
          </div>
        </section>

      </div>

      {/* CTA final */}
      <section id="contato" style={{ padding: '80px 32px', background: 'linear-gradient(145deg, #0a0c18 0%, #0d1230 60%, #1a0530 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,12,250,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 20 }}>Vamos conversar</p>
          <h2 style={{ fontSize: 48, fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
            Kauê Rodrigues Peres
          </h2>
          <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.65, marginBottom: 40 }}>
            UX Designer com foco em experiências que resolvem problemas reais — do wireframe ao produto em produção.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:kaue.peres@hotmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              ✉ Entrar em contato
            </a>
            <a href="https://avalia.education" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
              Ver plataforma ao vivo →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#00173f', padding: '24px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#4B5563', margin: 0 }}>
          Portfolio de Kauê Rodrigues Peres · AvaliA © 2025 · <a href="/" style={{ color: '#4B5563' }}>avalia.education</a>
        </p>
      </footer>

    </div>
  );
}
