'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    <p style={{ fontSize: 36, fontWeight: 800, color, letterSpacing: '-1px', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{sub}</p>
  </div>
);

const AvaliacaoRow = ({ aluno, tipo, nota, data }) => (
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
        {aluno.charAt(0).toUpperCase()}
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{aluno}</p>
        <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{tipo}</p>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{data}</span>
      <span style={{
        fontSize: 13, fontWeight: 700,
        color: nota >= 8 ? '#10B981' : nota >= 6 ? '#F59E0B' : '#EF4444',
        background: nota >= 8 ? '#ECFDF520' : nota >= 6 ? '#FFFBEB20' : '#FEF2F220',
        padding: '3px 10px', borderRadius: 20,
        border: `1px solid ${nota >= 8 ? '#10B98133' : nota >= 6 ? '#F59E0B33' : '#EF444433'}`,
      }}>
        {typeof nota === 'number' ? nota.toFixed(1) : nota}
      </span>
    </div>
  </div>
);

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function InicioPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Professor');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setUserName(u.name);
      }
    } catch {}

    fetch('/api/evaluations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setEvaluations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const scores = evaluations.map(e => e.score).filter(s => typeof s === 'number');
  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
  const uniqueStudents = new Set(evaluations.map(e => e.studentName)).size;
  const recent = evaluations.slice(0, 5);
  const firstName = userName.split(' ')[0];

  return (
    <AppLayout userName={userName}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Início</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          {greeting()}, {firstName} 👋
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>
          {loading ? 'Carregando...' : 'Aqui está um resumo das suas avaliações recentes.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total de avaliações" value={loading ? '—' : evaluations.length} sub="desde o início"         color="var(--text-main)" />
        <StatCard label="Média geral"          value={loading ? '—' : avg}               sub="de todas as avaliações" color="#0081f0" />
        <StatCard label="Exercícios criados"   value="—"                                  sub="em breve"               color="#0033ad" />
        <StatCard label="Alunos avaliados"     value={loading ? '—' : uniqueStudents}    sub="alunos únicos"          color="#810cfa" />
      </div>

      {!loading && recent.length > 0 ? (
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>Avaliações recentes</h2>
            <button onClick={() => router.push('/painel')} style={{ fontSize: 13, fontWeight: 600, color: '#0081f0', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}>
              Ver todas →
            </button>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 20 }}>Últimas avaliações realizadas</p>
          {recent.map(e => (
            <AvaliacaoRow key={e.id} aluno={e.studentName} tipo={e.type} nota={e.score} data={new Date(e.createdAt).toLocaleDateString('pt-BR')} />
          ))}
        </div>
      ) : !loading && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🎯</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>Nenhuma avaliação ainda</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Faça sua primeira avaliação e os resultados aparecerão aqui.</p>
          <button onClick={() => router.push('/avaliar')} style={{ padding: '11px 28px', background: '#0081f0', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Fazer primeira avaliação
          </button>
        </div>
      )}
    </AppLayout>
  );
}
