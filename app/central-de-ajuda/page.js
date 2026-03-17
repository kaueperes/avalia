'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthGuard from '../components/useAuthGuard';

const faqs = [
  {
    cat: 'Primeiros passos',
    items: [
      {
        q: 'Como criar minha conta?',
        a: 'Clique em "Começar gratuitamente" na página inicial. Preencha seu nome, e-mail e senha. Não é necessário cartão de crédito para começar.',
      },
      {
        q: 'Como criar meu primeiro perfil de professor?',
        a: 'Após fazer login, vá em "Perfis" no menu lateral. Clique em "Novo perfil" e preencha seu nome, disciplina e o tom de feedback preferido (construtivo, rigoroso, neutro ou didático). Salve e o perfil estará disponível para suas avaliações.',
      },
      {
        q: 'O que são exercícios?',
        a: 'Exercícios são os enunciados ou briefings das atividades que você passa para os alunos. Você cria uma vez em "Exercícios" e reutiliza em várias avaliações. A IA leva o enunciado em conta na análise do trabalho.',
      },
    ],
  },
  {
    cat: 'Avaliações',
    items: [
      {
        q: 'Como funciona a avaliação com IA?',
        a: 'Vá em "Nova Avaliação", selecione o perfil de professor, o exercício correspondente e cole o texto do trabalho do aluno. Em segundos a IA gera nota por critério, nota final e feedback personalizado no seu estilo.',
      },
      {
        q: 'Quantos tipos de trabalho são suportados?',
        a: 'O AvaliA suporta mais de 25 tipos, incluindo redações, relatórios, projetos, provas dissertativas, estudos de caso, trabalhos de TCC, seminários, análises críticas e muito mais.',
      },
      {
        q: 'O feedback da IA pode ser editado?',
        a: 'Sim. Após a avaliação ser gerada, você pode editar qualquer parte do feedback antes de exportar ou compartilhar com o aluno.',
      },
      {
        q: 'Como exportar as avaliações?',
        a: 'Dentro de cada avaliação concluída, há botões para exportar em PDF ou CSV. O PDF inclui cabeçalho com o nome do exercício, nota, critérios e feedback completo.',
      },
    ],
  },
  {
    cat: 'Planos e pagamentos',
    items: [
      {
        q: 'Qual o limite de avaliações no plano gratuito?',
        a: 'O plano gratuito permite 5 avaliações por mês, 1 perfil de professor e até 3 exercícios salvos. Para mais avaliações, faça upgrade para o plano Essencial, Pro ou Premium.',
      },
      {
        q: 'Como funciona a renovação mensal?',
        a: 'As cotas de avaliação renovam automaticamente a cada ciclo de pagamento. Você não precisa fazer nada — no início de cada mês a sua cota é restaurada ao limite do plano.',
      },
      {
        q: 'Posso comprar avaliações extras?',
        a: 'Sim. Na página de planos é possível comprar pacotes de avaliações extras (50 ou 100 unidades) que não expiram e ficam acumuladas na sua conta.',
      },
      {
        q: 'Como cancelar minha assinatura?',
        a: 'Você pode cancelar a qualquer momento na página "Minha Conta", sem multa. O acesso aos recursos pagos continua até o fim do período já pago.',
      },
    ],
  },
  {
    cat: 'Relatórios e análises',
    items: [
      {
        q: 'O que são os relatórios de turma?',
        a: 'Disponíveis nos planos Pro e Premium, os relatórios de turma mostram médias, taxas de aprovação, desempenho por critério e alertas sobre pontos onde a turma toda está com dificuldade — gerados por IA.',
      },
      {
        q: 'O que são os relatórios individuais de aluno?',
        a: 'Também disponíveis nos planos Pro e Premium, os relatórios individuais analisam o histórico completo de um aluno, identificando evolução, pontos fortes e áreas a desenvolver.',
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #F3F4F6', overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#111827', textAlign: 'left', gap: 16 }}>
        {q}
        <span style={{ flexShrink: 0, color: '#9CA3AF', fontSize: 22, lineHeight: 1, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s', display: 'inline-block', fontWeight: 300 }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 18, fontSize: 14, color: '#6B7280', lineHeight: 1.75 }}>{a}</div>
      )}
    </div>
  );
}

const steps = [
  { num: '01', title: 'Crie seu perfil', desc: 'Configure nome, disciplina, tom de feedback e seus critérios de avaliação.' },
  { num: '02', title: 'Cadastre um exercício', desc: 'Adicione o enunciado da atividade que os alunos devem entregar.' },
  { num: '03', title: 'Avalie um trabalho', desc: 'Cole o texto do aluno, selecione perfil e exercício, e receba o feedback em segundos.' },
  { num: '04', title: 'Exporte e compartilhe', desc: 'Exporte em PDF ou CSV e compartilhe o feedback com o aluno.' },
];

export default function CentralDeAjuda() {
  const router = useRouter();
  const ready = useAuthGuard();
  const [activecat, setActivecat] = useState(faqs[0].cat);

  const scrollToSection = (cat) => {
    setActivecat(cat);
    const el = document.getElementById(cat);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const observers = faqs.map(({ cat }) => {
      const el = document.getElementById(cat);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActivecat(cat); },
        { rootMargin: '-15% 0px -75% 0px' }
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  if (!ready) return null;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: 'white', color: '#111827', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 32px' }}>
        <style>{`.pub-nav-link { text-decoration: none; font-size: 15px; font-weight: 450; color: #6B7280; transition: color .15s; } .pub-nav-link:hover { color: #111827; }`}</style>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/imagens/logo.svg" alt="AvaliA" style={{ height: 36, width: 'auto' }} />
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <a href="/#funcionalidades" className="pub-nav-link">Funcionalidades</a>
            <a href="/#disciplinas" className="pub-nav-link">Tipos de Trabalho</a>
            <a href="/#coordenadores" className="pub-nav-link">Para Coordenadores</a>
            <a href="/#planos" className="pub-nav-link">Planos</a>
            <a href="/central-de-ajuda" className="pub-nav-link" style={{ color: '#0081f0', fontWeight: 600 }}>Ajuda</a>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', color: '#374151', fontWeight: 500, fontSize: 15, cursor: 'pointer', padding: '8px 14px', borderRadius: 8 }}>
              Entrar
            </button>
            <button onClick={() => router.push('/signup')} style={{ background: '#0081f0', color: 'white', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Começar grátis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '140px 32px 72px', background: 'linear-gradient(145deg, #0a0c18 0%, #0d1230 55%, #1a0530 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 16 }}>Suporte</p>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>Central de Ajuda</h1>
          <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.65, marginBottom: 36 }}>Tudo que você precisa saber para usar o AvaliA.</p>
          <button onClick={() => router.push('/contato')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '11px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Não encontrou o que procura? Fale conosco →
          </button>
        </div>
      </section>

      {/* Como funciona */}
      <section style={{ padding: '80px 32px 0', background: '#F9FAFB', borderTop: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 12 }}>Início rápido</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#00173f', letterSpacing: '-0.5px' }}>Como usar o AvaliA</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, paddingBottom: 80 }}>
            {steps.map((s, i) => (
              <div key={s.num} style={{ background: 'white', borderRadius: 16, padding: '28px 24px', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: 36, right: -12, width: 24, height: 2, background: '#E5E7EB', zIndex: 1 }} />
                )}
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0081f0, #810cfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>{s.num}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 32px 96px', background: 'white' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 12 }}>FAQ</p>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#00173f', letterSpacing: '-0.5px' }}>Perguntas frequentes</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 48, alignItems: 'start' }}>
            {/* Category sidebar */}
            <div style={{ position: 'sticky', top: 84, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {faqs.map(({ cat }) => (
                <button key={cat} onClick={() => scrollToSection(cat)}
                  style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: activecat === cat ? 700 : 400, background: activecat === cat ? '#E6F3FF' : 'transparent', color: activecat === cat ? '#0081f0' : '#6B7280', transition: 'all .15s' }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ items */}
            <div>
              {faqs.map(({ cat, items }) => (
                <div key={cat} id={cat} style={{ marginBottom: 48 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#00173f', marginBottom: 4, paddingBottom: 16, borderBottom: '2px solid #F3F4F6' }}>{cat}</h3>
                  {items.map((item, i) => <FAQItem key={i} {...item} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 32px', background: '#F9FAFB', borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#00173f', marginBottom: 12 }}>Ainda com dúvidas?</h2>
          <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 28, lineHeight: 1.65 }}>Nossa equipe responde em até 24 horas úteis.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push('/contato')} style={{ background: '#0081f0', color: 'white', border: 'none', borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Fale conosco
            </button>
            <a href="mailto:contato@avalia.education" style={{ display: 'inline-flex', alignItems: 'center', background: 'white', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
              contato@avalia.education
            </a>
          </div>
        </div>
      </section>

      {/* Footer simples */}
      <footer style={{ background: '#00173f', padding: '32px', textAlign: 'center' }}>
        <div style={{ cursor: 'pointer', display: 'inline-block', marginBottom: 12 }} onClick={() => router.push('/')}>
          <img src="/imagens/logo.svg" alt="AvaliA" style={{ height: 28, width: 'auto', filter: 'brightness(0) invert(1)' }} />
        </div>
        <p style={{ fontSize: 13, color: '#4B5563' }}>© 2025 AvaliA · Todos os direitos reservados</p>
      </footer>

    </div>
  );
}
