'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

export default function OrgRelatoriosPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');

  function token() { return localStorage.getItem('token'); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (!u.org_id) { router.push('/inicio'); return; }
      if (u.name) setUserName(u.name);
    } catch { router.push('/inicio'); return; }

    fetch('/api/org/reports', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => { if (r.status === 403) { router.push('/inicio'); return []; } return r.json(); })
      .then(d => { setReports(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const teachers = [...new Set(reports.map(r => r.teacherName).filter(Boolean))].sort();

  const filtered = reports.filter(r => {
    const matchSearch = !search || [r.subject, r.turma, r.exercise_name, r.disciplina].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchTeacher = !filterTeacher || r.teacherName === filterTeacher;
    return matchSearch && matchTeacher;
  });

  // Mesmo mapeamento de rota usado em /relatorios — reaproveita as páginas
  // de visualização completa (gráficos, PDF) já existentes.
  function reportRoute(r) {
    if (r.type === 'aluno') return `/relatorio-aluno-evolucao?id=${r.id}`;
    if (r.reportTemplate === 'turma-evolucao') return `/relatorio-turma-evolucao?id=${r.id}`;
    return `/relatorio-turma?id=${r.id}`;
  }

  async function del(id) {
    if (!confirm('Excluir este relatório?')) return;
    await fetch(`/api/reports/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setReports(prev => prev.filter(r => r.id !== id));
  }

  return (
    <AppLayout userName={userName}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Institucional</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Relatórios da Instituição</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Pareceres de aluno e relatórios de turma gerados pelos professores da sua organização.</p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Buscar aluno, turma, disciplina..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--border-input)', borderRadius: 10, fontSize: 14, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit', outline: 'none' }}
        />
        <select value={filterTeacher} onChange={e => setFilterTeacher(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid var(--border-input)', borderRadius: 10, fontSize: 14, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit' }}>
          <option value="">Todos os professores</option>
          {teachers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>}

      {!loading && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{filtered.length} relatório{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Nenhum relatório encontrado.</div>
          ) : (
            filtered.map(r => (
              <div key={r.id} style={{ borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: r.type === 'turma' ? '#faf5ff' : '#eff6ff', color: r.type === 'turma' ? '#810cfa' : '#0081f0', border: `1px solid ${r.type === 'turma' ? '#e9d5ff' : '#bfdbfe'}` }}>
                      {r.type === 'turma' ? 'Turma' : 'Aluno'}
                    </span>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>
                      {r.type === 'turma' ? (r.turma || 'Turma') : r.subject}
                    </p>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
                    {r.teacherName} · {r.disciplina || 'sem disciplina'} · {fmt(r.created_at)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => window.open(reportRoute(r), '_blank')}
                    style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: '#0081f0', fontFamily: 'inherit' }}>
                    Ver
                  </button>
                  <button onClick={() => window.open(`${reportRoute(r)}&print=1`, '_blank')}
                    style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit' }}>
                    Baixar PDF
                  </button>
                  {r.isOwner && (
                    <button onClick={() => del(r.id)}
                      style={{ padding: '5px 9px', border: '1px solid #EF444433', borderRadius: 7, cursor: 'pointer', background: 'transparent', color: '#EF4444', display: 'flex', alignItems: 'center', fontFamily: 'inherit' }}>
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </AppLayout>
  );
}
