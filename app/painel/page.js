'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TYPES, scoreToGrade, scoreColor } from '@/lib/types';
import AppHeader from '@/components/AppHeader';

export default function PainelPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [scoreMin, setScoreMin] = useState('');
  const [scoreMax, setScoreMax] = useState('');
  const [detail, setDetail] = useState(null);

  function token() { return localStorage.getItem('token'); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    fetch('/api/evaluations', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setEvaluations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const filtered = evaluations.filter(e => {
    if (search && !e.studentName.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && e.type !== typeFilter) return false;
    if (scoreMin !== '' && e.score < Number(scoreMin)) return false;
    if (scoreMax !== '' && e.score > Number(scoreMax)) return false;
    return true;
  });

  function clearFilters() { setSearch(''); setTypeFilter(''); setScoreMin(''); setScoreMax(''); }

  async function del(id) {
    if (!confirm('Excluir esta avaliação?')) return;
    await fetch(`/api/evaluations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setEvaluations(prev => prev.filter(e => e.id !== id));
  }

  async function clearAll() {
    if (!confirm('Excluir TODAS as avaliações? Esta ação não pode ser desfeita.')) return;
    await Promise.all(evaluations.map(e => fetch(`/api/evaluations/${e.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })));
    setEvaluations([]);
  }

  function exportCSV() {
    const rows = [['Aluno', 'Tipo', 'Nota', 'Conceito', 'Professor', 'Data']];
    filtered.forEach(e => rows.push([e.studentName, e.type, e.score.toFixed(1), scoreToGrade(e.score), e.profileName || '', new Date(e.createdAt).toLocaleDateString('pt-BR')]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `avaliacoes-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  const scores = evaluations.map(e => e.score);
  const avg = scores.length ? (scores.reduce((a,b) => a+b,0)/scores.length).toFixed(1) : '—';
  const passing = scores.filter(s => s >= 5).length;
  const best = scores.length ? Math.max(...scores).toFixed(1) : '—';

  const inp = { padding: '8px 10px', border: '1px solid #dddbd6', borderRadius: 8, fontSize: 12, outline: 'none', background: '#fff', fontFamily: 'Inter, sans-serif', color: '#1a1814', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'Inter, sans-serif' }}>
      <AppHeader active="/painel" />

      <main style={{ padding: '28px 32px' }}>
        {/* Título + ações */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1814', marginBottom: 4 }}>Painel da Turma</h1>
            <p style={{ fontSize: 12, color: '#8a8680' }}>Histórico de avaliações</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={exportCSV} disabled={filtered.length === 0} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #dddbd6', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: '#fff', color: '#4a4740' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar CSV
            </button>
            <button onClick={clearAll} disabled={evaluations.length === 0} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid rgba(217,79,79,.3)', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: '#fff', color: '#d94f4f' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              Limpar tudo
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'AVALIAÇÕES', value: evaluations.length },
            { label: 'MÉDIA GERAL', value: avg },
            { label: 'APROVADOS (≥5)', value: passing },
            { label: 'MELHOR NOTA', value: best },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', border: '1px solid #dddbd6', borderRadius: 10, padding: '18px 22px' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#2a7fd4', lineHeight: 1, marginBottom: 8 }}>{k.value}</div>
              <div style={{ fontSize: 10, color: '#8a8680', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{ background: '#fff', border: '1px solid #dddbd6', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#8a8680', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>FILTROS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <input style={{ ...inp, width: 180 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Aluno" />
            <select style={{ ...inp, width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">Todos os tipos</option>
              {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <input style={{ ...inp, width: 80 }} value={scoreMin} onChange={e => setScoreMin(e.target.value)} placeholder="Nota ≥" type="number" min="0" max="10" step="0.1" />
            <span style={{ fontSize: 12, color: '#8a8680' }}>–</span>
            <input style={{ ...inp, width: 80 }} value={scoreMax} onChange={e => setScoreMax(e.target.value)} placeholder="≤ 10" type="number" min="0" max="10" step="0.1" />
            {(search || typeFilter || scoreMin || scoreMax) && (
              <button onClick={clearFilters} style={{ ...inp, cursor: 'pointer', color: '#4a4740', display: 'flex', alignItems: 'center', gap: 4 }}>
                × Limpar
              </button>
            )}
          </div>
        </div>

        {/* Tabela */}
        <div style={{ background: '#fff', border: '1px solid #dddbd6', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #dddbd6', fontWeight: 600, fontSize: 14 }}>
            Registro de Avaliações
          </div>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#8a8680', fontSize: 13 }}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#8a8680' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dddbd6" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px' }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <div style={{ fontSize: 13 }}>Nenhuma avaliação encontrada.</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f5f4f0' }}>
                  {['Aluno', 'Tipo', 'Nota', 'Conceito', 'Professor', 'Data', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#8a8680', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => {
                  const c = scoreColor(e.score);
                  return (
                    <tr key={e.id} style={{ borderTop: '1px solid #f0eeea' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{e.studentName}</td>
                      <td style={{ padding: '12px 16px', color: '#8a8680' }}>{e.type}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: c.text }}>{typeof e.score === 'number' ? e.score.toFixed(1) : e.score}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: c.bg, color: c.text, borderRadius: 5, padding: '2px 9px', fontWeight: 600, fontSize: 12 }}>{scoreToGrade(e.score)}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#8a8680' }}>{e.profileName || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#8a8680' }}>{new Date(e.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setDetail(e)} style={{ padding: '5px 12px', border: '1px solid #dddbd6', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: '#fff', color: '#2a7fd4' }}>Ver</button>
                          <button onClick={() => del(e.id)} style={{ padding: '5px 12px', border: '1px solid rgba(217,79,79,.3)', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: '#fff', color: '#d94f4f' }}>✕</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal detalhe */}
      {detail && (
        <div onClick={() => setDetail(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, padding: 32, maxWidth: 680, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>{detail.studentName}</h2>
                <p style={{ fontSize: 13, color: '#8a8680', marginTop: 3 }}>{detail.type} · {new Date(detail.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: scoreColor(detail.score).text, lineHeight: 1 }}>{typeof detail.score === 'number' ? detail.score.toFixed(1) : detail.score}</div>
                <div style={{ fontSize: 12, color: '#8a8680', marginTop: 2 }}>{scoreToGrade(detail.score)}</div>
              </div>
            </div>
            {detail.criteria?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {detail.criteria.map((c, i) => {
                  const cc = scoreColor(c.score || 0);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ flex: 1, fontSize: 13, color: '#4a4740' }}>{c.name}</div>
                      <div style={{ width: 100, height: 3, background: '#f0eeea', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${(c.score || 0) * 10}%`, height: '100%', background: cc.text, borderRadius: 99 }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: cc.text, width: 28, textAlign: 'right' }}>{c.score?.toFixed(1) ?? '—'}</div>
                    </div>
                  );
                })}
              </div>
            )}
            {detail.feedback && (
              <div style={{ background: '#f5f4f0', borderRadius: 10, padding: 18, fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#4a4740', marginBottom: 16 }}>
                {detail.feedback}
              </div>
            )}
            <button onClick={() => setDetail(null)} style={{ padding: '9px 20px', border: '1px solid #dddbd6', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#4a4740' }}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
