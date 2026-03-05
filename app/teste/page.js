'use client';

import AppLayout from '../components/AppLayout';

const StatCard = ({ label, value, sub, color }) => (
  <div style={{
    background: 'var(--bg-card)',
    borderRadius: 14,
    padding: '24px 28px',
    border: '1px solid var(--border-card)',
    display: 'flex', flexDirection: 'column', gap: 6,
  }}>
    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
    <p style={{ fontSize: 36, fontWeight: 800, color: color || '#00173f', letterSpacing: '-1px', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{sub}</p>
  </div>
);

const AvaliacaoRow = ({ aluno, exercicio, nota, data }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 0', borderBottom: '1px solid var(--border)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: 'linear-gradient(135deg, #0033ad22, #810cfa22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: '#0033ad',
      }}>
        {aluno.charAt(0)}
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{aluno}</p>
        <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{exercicio}</p>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{data}</span>
      <span style={{
        fontSize: 13, fontWeight: 700,
        color: nota >= 8 ? '#10B981' : nota >= 6 ? '#F59E0B' : '#EF4444',
        background: nota >= 8 ? '#ECFDF522' : nota >= 6 ? '#FFFBEB22' : '#FEF2F222',
        padding: '3px 10px', borderRadius: 20,
        border: `1px solid ${nota >= 8 ? '#10B98133' : nota >= 6 ? '#F59E0B33' : '#EF444433'}`,
      }}>
        {nota.toFixed(1)}
      </span>
    </div>
  </div>
);

export default function TestePage() {
  return (
    <AppLayout userName="Kaue Peres">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Dashboard</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Bom dia, Kaue 👋</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Aqui está um resumo das suas avaliações recentes.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Avaliações este mês" value="24" sub="↑ 6 em relação ao mês anterior" color="var(--text-main)" />
        <StatCard label="Média da turma"       value="7.8" sub="Turma de Redação — 2025"       color="#0081f0" />
        <StatCard label="Exercícios criados"   value="8"   sub="3 usados esta semana"           color="#0033ad" />
        <StatCard label="Alunos avaliados"     value="31"  sub="de 35 na turma"                 color="#810cfa" />
      </div>

      {/* Recent evaluations */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 14,
        border: '1px solid var(--border-card)',
        padding: '24px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>Avaliações recentes</h2>
          <button style={{
            fontSize: 13, fontWeight: 600, color: '#0081f0',
            background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6,
          }}>
            Ver todas →
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 20 }}>Últimas avaliações realizadas</p>

        <AvaliacaoRow aluno="Ana Clara"     exercicio="Redação dissertativa — Tema livre" nota={9.2} data="Hoje"  />
        <AvaliacaoRow aluno="Bruno Lima"    exercicio="Redação dissertativa — Tema livre" nota={7.4} data="Hoje"  />
        <AvaliacaoRow aluno="Carla Mendes"  exercicio="Relatório de pesquisa"             nota={8.8} data="Ontem" />
        <AvaliacaoRow aluno="Diego Santos"  exercicio="Relatório de pesquisa"             nota={5.5} data="Ontem" />
        <AvaliacaoRow aluno="Eduarda Faria" exercicio="Resumo de texto"                  nota={8.1} data="02/03" />
      </div>
    </AppLayout>
  );
}
