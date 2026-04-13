'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';

const faqs = [
  {
    q: 'Como criar meu primeiro perfil de professor?',
    a: 'Vá em "Perfil do Professor" no menu lateral. Preencha seu nome, disciplina e escolha o tom de feedback. Opcionalmente, adicione uma amostra do seu estilo de escrita — a IA vai imitar seu jeito de escrever. Se trabalhar em mais de uma instituição, crie um perfil para cada uma com o logo correspondente.',
  },
  {
    q: 'Como funciona a avaliação com IA?',
    a: 'Em "Nova Avaliação", você escolhe o tipo de trabalho (3D, Design, Redação etc.), seleciona um perfil de professor e envia o arquivo do aluno. A IA analisa o trabalho com base nos critérios da disciplina e gera um feedback detalhado com notas por critério, nota final e comentários personalizados no seu estilo.',
  },
  {
    q: 'O que são exercícios?',
    a: 'Exercícios são enunciados ou briefings que você cria e reutiliza em várias avaliações. Por exemplo: "Modelagem de personagem low-poly com no máximo 1.500 polígonos". Você cria uma vez em "Gerenciar Exercícios" e depois seleciona na hora de avaliar — a IA leva o enunciado em conta na análise.',
  },
  {
    q: 'Posso usar o mesmo perfil para turmas diferentes?',
    a: 'Sim. O campo "Turma" no perfil é opcional e serve só para organização. Se preferir, crie um perfil por turma (ex: "Turma A" e "Turma B") para separar melhor o histórico de avaliações.',
  },
  {
    q: 'Como exportar as avaliações em PDF?',
    a: 'Dentro de cada avaliação concluída, há um botão de exportar PDF. Se o seu perfil tiver o logo da instituição cadastrado, ele aparece no cabeçalho do documento automaticamente.',
  },
  {
    q: 'Os dados ficam salvos?',
    a: 'Sim. Todos os perfis, exercícios e avaliações ficam salvos no banco de dados e estarão disponíveis mesmo após fechar o navegador ou reiniciar o computador.',
  },
  {
    q: 'Qual o limite de avaliações no plano gratuito?',
    a: 'O plano gratuito permite até 10 avaliações por mês. Para uso ilimitado, assine o plano Pro.',
  },
];

const steps = [
  { num: '01', title: 'Crie seu perfil', desc: 'Vá em "Perfil do Professor" e configure nome, disciplina, tom de feedback e logo da sua instituição.' },
  { num: '02', title: 'Cadastre um exercício', desc: 'Em "Gerenciar Exercícios", adicione o enunciado do trabalho que os alunos devem entregar.' },
  { num: '03', title: 'Avalie um trabalho', desc: 'Clique em "Nova Avaliação", selecione o perfil e exercício, envie o arquivo do aluno e aguarde a IA gerar o feedback.' },
  { num: '04', title: 'Exporte e compartilhe', desc: 'Com a avaliação pronta, exporte em PDF timbrado ou copie o feedback para enviar ao aluno.' },
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 15, fontWeight: 600, color: 'var(--text-main)', textAlign: 'left', gap: 16,
        }}
      >
        {q}
        <span style={{ flexShrink: 0, color: 'var(--text-sub)', fontSize: 20, lineHeight: 1, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>+</span>
      </button>
      {open && (
        <div style={{ padding: '0 20px 18px', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, borderTop: '1px solid var(--border-card)' }}>
          <div style={{ paddingTop: 14 }}>{a}</div>
        </div>
      )}
    </div>
  );
}

export default function AjudaPage() {
  const [userName, setUserName] = useState('Professor');
  useEffect(() => {
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); if (u.name) setUserName(u.name); } catch {}
  }, []);

  return (
    <AppLayout userName={userName}>
      <div style={{ marginBottom: 36 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Suporte</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Ajuda</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Tudo que você precisa saber para usar o Kriteria.</p>
      </div>

      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 20 }}>Como funciona</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {steps.map(s => (
            <div key={s.num} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: '22px 20px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', letterSpacing: 2, marginBottom: 10 }}>{s.num}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>{s.title}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 16 }}>Perguntas frequentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
        </div>
      </div>

      <div style={{ marginTop: 48, background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: '28px 28px', maxWidth: 720 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>Ainda com dúvidas?</h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Entre em contato pelo e-mail de suporte. Respondemos em até 1 dia útil.
        </p>
        <a
          href="mailto:suporte@avalia.education"
          style={{
            display: 'inline-block', padding: '10px 22px',
            background: 'linear-gradient(135deg, #0081f0, #0033ad)',
            color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          suporte@avalia.education
        </a>
      </div>
    </AppLayout>
  );
}
