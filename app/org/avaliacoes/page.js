'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function scoreColor(v) {
  return v >= 9 ? '#16a34a' : v >= 7 ? '#22c55e' : v >= 5 ? '#d97706' : '#ef4444';
}

export default function OrgAvaliacoesPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [evals, setEvals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');

  function token() { return localStorage.getItem('token'); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (!u.org_id || u.org_role !== 'admin') { router.push('/inicio'); return; }
      if (u.name) setUserName(u.name);
    } catch { router.push('/inicio'); return; }

    fetch('/api/org/evaluations', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => { setEvals(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const teachers = [...new Set(evals.map(e => e.teacherName).filter(Boolean))].sort();

  const filtered = evals.filter(e => {
    const matchSearch = !search || [e.student_name, e.exercise_name, e.turma, e.disciplina].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchTeacher = !filterTeacher || e.teacherName === filterTeacher;
    return matchSearch && matchTeacher;
  });

  return (
    <AppLayout userName={userName}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Institucional</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Avaliações da Instituição</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Todas as avaliações realizadas pelos professores da sua organização.</p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Buscar aluno, exercício, turma..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid var(--border-input)', borderRadius: 10, fontSize: 14, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit', outline: 'none' }}
        />
        <select
          value={filterTeacher}
          onChange={e => setFilterTeacher(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid var(--border-input)', borderRadius: 10, fontSize: 14, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">Todos os professores</option>
          {teachers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>}

      {!loading && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{filtered.length} avaliação{filtered.length !== 1 ? 'ões' : ''}</p>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              {evals.length === 0 ? 'Nenhuma avaliação ainda.' : 'Nenhum resultado para esse filtro.'}
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-content)' }}>
                  {['Data', 'Aluno', 'Exercício', 'Turma', 'Professor', 'Nota', ''].map(h => (
                    <th key={h} style={{ padding: '10px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmt(e.created_at)}</td>
                    <td style={{ padding: '13px 18px', fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{e.student_name || '—'}</td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.exercise_name || '—'}</td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: 'var(--text-muted)' }}>{e.turma || '—'}</td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: 'var(--text-muted)' }}>{e.teacherName || '—'}</td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor(e.score) }}>{e.score?.toFixed(1)}</span>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <button
                        onClick={() => router.push(`/relatorio-individual?id=${e.id}`)}
                        style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                      >
                        Ver PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AppLayout>
  );
}
