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
  const [selected, setSelected] = useState(new Set());
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  function token() { return localStorage.getItem('token'); }

  function toggleSelect(id) {
    setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      // Admin vê tudo; coordenador vê a própria equipe — ambos passam daqui,
      // a autorização real (e o filtro por equipe) acontece na API.
      if (!u.org_id) { router.push('/inicio'); return; }
      if (u.name) setUserName(u.name);
    } catch { router.push('/inicio'); return; }

    fetch('/api/org/evaluations', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => { if (r.status === 403) { router.push('/inicio'); return []; } return r.json(); })
      .then(d => { setEvals(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const teachers = [...new Set(evals.map(e => e.teacherName).filter(Boolean))].sort();

  const filtered = evals.filter(e => {
    const matchSearch = !search || [e.student_name, e.exercise_name, e.turma, e.disciplina].some(f => f?.toLowerCase().includes(search.toLowerCase()));
    const matchTeacher = !filterTeacher || e.teacherName === filterTeacher;
    return matchSearch && matchTeacher;
  });

  const selectedItems = filtered.filter(e => selected.has(e.id));
  const studentIds = [...new Set(selectedItems.map(e => e.student_id).filter(Boolean))];
  const classIds = [...new Set(selectedItems.map(e => e.class_id).filter(Boolean))];
  const canGenerateStudent = selectedItems.length > 0 && studentIds.length === 1;
  const canGenerateClass = selectedItems.length > 0 && classIds.length === 1;

  async function generateStudentReport() {
    setGenerating(true);
    setGenError('');
    try {
      const r = await fetch('/api/analyze-student', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentIds[0], studentName: selectedItems[0]?.student_name }),
      });
      const d = await r.json();
      if (!r.ok) { setGenError(d.error || 'Erro ao gerar parecer.'); return; }
      router.push('/org/relatorios');
    } finally { setGenerating(false); }
  }

  async function generateClassReport() {
    setGenerating(true);
    setGenError('');
    try {
      const r = await fetch('/api/analyze-class', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: classIds[0], turma: selectedItems[0]?.turma }),
      });
      const d = await r.json();
      if (!r.ok) { setGenError(d.error || 'Erro ao gerar relatório.'); return; }
      router.push('/org/relatorios');
    } finally { setGenerating(false); }
  }

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
          <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{filtered.length} avaliação{filtered.length !== 1 ? 'ões' : ''}</p>
            {selectedItems.length > 0 && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedItems.length} selecionada{selectedItems.length !== 1 ? 's' : ''}</span>
                <button onClick={generateStudentReport} disabled={!canGenerateStudent || generating}
                  title={!canGenerateStudent ? 'Selecione avaliações do mesmo aluno' : ''}
                  style={{ padding: '6px 14px', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: canGenerateStudent ? 'pointer' : 'not-allowed', background: canGenerateStudent ? '#0081f0' : 'var(--border)', color: canGenerateStudent ? 'white' : 'var(--text-muted)' }}>
                  {generating ? 'Gerando...' : 'Gerar parecer do aluno'}
                </button>
                <button onClick={generateClassReport} disabled={!canGenerateClass || generating}
                  title={!canGenerateClass ? 'Selecione avaliações da mesma turma' : ''}
                  style={{ padding: '6px 14px', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: canGenerateClass ? 'pointer' : 'not-allowed', background: canGenerateClass ? '#810cfa' : 'var(--border)', color: canGenerateClass ? 'white' : 'var(--text-muted)' }}>
                  {generating ? 'Gerando...' : 'Gerar relatório de turma'}
                </button>
              </div>
            )}
          </div>
          {genError && (
            <div style={{ padding: '10px 24px', background: '#fef2f2', borderBottom: '1px solid #fca5a5', color: '#dc2626', fontSize: 13 }}>{genError}</div>
          )}

          {filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              {evals.length === 0 ? 'Nenhuma avaliação ainda.' : 'Nenhum resultado para esse filtro.'}
            </div>
          ) : (
            <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-content)' }}>
                  {['', 'Data', 'Aluno', 'Exercício', 'Turma', 'Professor', 'Nota', ''].map((h, i) => (
                    <th key={i} style={{ padding: '10px 18px', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '13px 18px' }}>
                      <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleSelect(e.id)} style={{ cursor: 'pointer', accentColor: '#0081f0' }} />
                    </td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmt(e.created_at)}</td>
                    <td style={{ padding: '13px 18px', fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{e.student_name || '—'}</td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.exercise_name || '—'}</td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: 'var(--text-muted)' }}>{e.turma || '—'}</td>
                    <td style={{ padding: '13px 18px', fontSize: 13, color: 'var(--text-muted)' }}>{e.teacherName || '—'}</td>
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor(e.score) }}>{e.score?.toFixed(1)}</span>
                    </td>
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => window.open(`/relatorio-individual?id=${e.id}`, '_blank')}
                          style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: '#0081f0', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                          Ver
                        </button>
                        <button onClick={() => window.open(`/relatorio-individual?id=${e.id}&print=1`, '_blank')}
                          style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                          Baixar PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
