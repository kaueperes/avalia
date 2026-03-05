'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import { scoreColor } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetch('/api/evaluations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setEvaluations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const scores = evaluations.map(e => e.score);
  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
  const recent = evaluations.slice(0, 5);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'Inter, sans-serif' }}>
      <AppHeader active="/dashboard" />

      <main style={{ padding: '32px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1814', marginBottom: 4 }}>Início</h1>
        <p style={{ fontSize: 13, color: '#8a8680', marginBottom: 28 }}>Resumo geral das suas avaliações</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Avaliações', value: evaluations.length },
            { label: 'Média geral', value: avg },
            { label: 'Alunos únicos', value: new Set(evaluations.map(e => e.studentName)).size },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', border: '1px solid #dddbd6', borderRadius: 10, padding: '18px 22px' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#2a7fd4', lineHeight: 1, marginBottom: 8 }}>{k.value}</div>
              <div style={{ fontSize: 11, color: '#8a8680', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
          <Link href="/avaliar" style={{ display: 'block', background: '#2a7fd4', borderRadius: 12, padding: 24, textDecoration: 'none' }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>✨</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Nova Avaliação</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Avalie um trabalho agora</div>
          </Link>
          <Link href="/painel" style={{ display: 'block', background: '#fff', border: '1px solid #dddbd6', borderRadius: 12, padding: 24, textDecoration: 'none' }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>📊</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1814', marginBottom: 4 }}>Painel da Turma</div>
            <div style={{ fontSize: 13, color: '#8a8680' }}>Histórico e análise de desempenho</div>
          </Link>
        </div>

        {recent.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #dddbd6', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #dddbd6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Avaliações recentes</span>
              <Link href="/painel" style={{ fontSize: 12, color: '#2a7fd4', textDecoration: 'none' }}>Ver todas →</Link>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f5f4f0' }}>
                  {['Aluno', 'Tipo', 'Nota', 'Data'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', color: '#8a8680', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map(e => {
                  const c = scoreColor(e.score);
                  return (
                    <tr key={e.id} style={{ borderTop: '1px solid #f0eeea' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 500 }}>{e.studentName}</td>
                      <td style={{ padding: '12px 20px', color: '#8a8680' }}>{e.type}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ background: c.bg, color: c.text, borderRadius: 6, padding: '2px 10px', fontWeight: 600 }}>
                          {typeof e.score === 'number' ? e.score.toFixed(1) : e.score}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', color: '#8a8680' }}>{new Date(e.createdAt).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {evaluations.length === 0 && !loading && (
          <div style={{ background: '#fff', border: '1px solid #dddbd6', borderRadius: 12, padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Nenhuma avaliação ainda</div>
            <div style={{ fontSize: 13, color: '#8a8680', marginBottom: 20 }}>Clique em "Nova Avaliação" para começar</div>
            <Link href="/avaliar" style={{ display: 'inline-block', padding: '10px 24px', background: '#2a7fd4', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              Fazer primeira avaliação
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
