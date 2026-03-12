'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/AppLayout';

export default function RelatoriosPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Professor');
  const [userPlan, setUserPlan] = useState('gratuito');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [turmaFilter, setTurmaFilter] = useState('');
  const [detail, setDetail] = useState(null);

  function token() { return localStorage.getItem('token'); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.name) setUserName(u.name);
      if (u.plan) setUserPlan(u.plan);
    } catch {}
    fetch('/api/reports', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setReports(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const canUseReports = ['pro', 'premium'].includes(userPlan);

  const turmas = [...new Set(reports.map(r => r.turma).filter(Boolean))].sort();

  const filtered = reports.filter(r => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (turmaFilter && (r.turma || '') !== turmaFilter) return false;
    return true;
  });

  async function del(id) {
    if (!confirm('Excluir este relatório?')) return;
    await fetch(`/api/reports/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setReports(prev => prev.filter(r => r.id !== id));
    if (detail?.id === id) setDetail(null);
  }

  function generatePDF(r) {
    const date = new Date(r.createdAt).toLocaleDateString('pt-BR');
    const c = r.content;

    if (r.type === 'turma') {
      const strongItems = (c.pontosFortes || []).map(p => `<li style="margin-bottom:4px;color:#374151;font-size:13px">${p}</li>`).join('');
      const weakItems = (c.pontosAtencao || []).map(p => `<li style="margin-bottom:4px;color:#374151;font-size:13px">${p}</li>`).join('');
      const suggestionsHtml = (c.sugestoes || []).map((s, i) => `
        <div style="margin-bottom:16px;padding:16px 20px;background:#f9fafb;border-radius:10px;border-left:3px solid #0081f0">
          <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:4px">${i+1}. ${s.titulo}</div>
          <div style="font-size:13px;color:#374151;margin-bottom:6px">${s.descricao}</div>
          <div style="font-size:12px;color:#6b7280;font-style:italic">${s.impacto}</div>
        </div>`).join('');
      const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório da Turma — ${r.turma || 'Turma'}</title>
        <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111; padding: 48px; max-width: 760px; margin: 0 auto; } @media print { body { padding: 24px; } @page { margin: 1.5cm; } }</style>
        </head><body>
        <div style="border-bottom:2px solid #e5e7eb;padding-bottom:24px;margin-bottom:32px">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:600;margin-bottom:6px">Relatório Pedagógico da Turma</div>
          <div style="font-size:26px;font-weight:800;color:#111">${r.turma || 'Turma'}${r.exerciseName ? ` · ${r.exerciseName}` : ''}</div>
          <div style="font-size:13px;color:#9ca3af;margin-top:4px">Gerado em ${date}</div>
        </div>
        <div style="margin-bottom:28px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Resumo Geral</div><div style="font-size:14px;line-height:1.8;color:#374151">${c.resumo}</div></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px">
          <div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#16a34a;margin-bottom:10px">Pontos Fortes</div><ul style="padding-left:18px">${strongItems}</ul></div>
          <div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#dc2626;margin-bottom:10px">Pontos de Atenção</div><ul style="padding-left:18px">${weakItems}</ul></div>
        </div>
        ${c.analiseDetalhada ? `<div style="margin-bottom:28px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Análise Detalhada</div><div style="font-size:14px;line-height:1.8;color:#374151">${c.analiseDetalhada}</div></div>` : ''}
        ${c.sugestoes?.length ? `<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:14px">Sugestões Pedagógicas</div>${suggestionsHtml}</div>` : ''}
        </body></html>`;
      const w = window.open('', '_blank');
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 400);
    } else {
      const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Parecer Individual — ${r.subject}</title>
        <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111; padding: 48px; max-width: 720px; margin: 0 auto; } @media print { body { padding: 24px; } @page { margin: 1.5cm; } }</style>
        </head><body>
        <div style="border-bottom:2px solid #e5e7eb;padding-bottom:24px;margin-bottom:32px">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:600;margin-bottom:6px">Parecer Individual do Aluno</div>
          <div style="font-size:26px;font-weight:800;color:#111">${r.subject}</div>
          <div style="font-size:13px;color:#9ca3af;margin-top:4px">Gerado em ${date}${r.turma ? ` · ${r.turma}` : ''}</div>
        </div>
        <div style="margin-bottom:24px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Resumo do Desempenho</div><div style="font-size:14px;line-height:1.8;color:#374151">${c.resumo}</div></div>
        ${c.pontosFortes?.length ? `<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#16a34a;margin-bottom:8px">Pontos Fortes</div><ul style="padding-left:18px">${c.pontosFortes.map(p=>`<li style="font-size:13px;color:#374151;margin-bottom:4px">${p}</li>`).join('')}</ul></div>` : ''}
        ${c.pontosDesenvolver?.length ? `<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#dc2626;margin-bottom:8px">A Desenvolver</div><ul style="padding-left:18px">${c.pontosDesenvolver.map(p=>`<li style="font-size:13px;color:#374151;margin-bottom:4px">${p}</li>`).join('')}</ul></div>` : ''}
        ${c.parecer ? `<div style="margin-bottom:24px;padding:20px;background:#f9fafb;border-radius:10px;border-left:3px solid #0081f0"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Parecer Final</div><div style="font-size:14px;line-height:1.8;color:#374151">${c.parecer}</div></div>` : ''}
        </body></html>`;
      const w = window.open('', '_blank');
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 400);
    }
  }

  const inpStyle = {
    padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 9,
    fontSize: 13, outline: 'none', background: 'var(--bg-card)',
    color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  const hasFilters = typeFilter || turmaFilter;

  return (
    <AppLayout userName={userName}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>IA Pedagógica</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Gerenciar Relatórios</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Acesse os relatórios pedagógicos gerados por IA.</p>
        </div>
      </div>

      {/* Upsell para planos sem acesso */}
      {!canUseReports && (
        <div style={{ textAlign: 'center', padding: '80px 32px', border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg-card)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>Relatórios disponíveis nos planos Pro e Premium</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 24px' }}>
            Gere pareceres pedagógicos individuais por aluno e análises completas de turma com inteligência artificial.
          </p>
          <button
            onClick={() => router.push('/conta')}
            style={{ padding: '11px 28px', background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Ver planos e fazer upgrade
          </button>
        </div>
      )}

      {/* Conteúdo para Pro/Premium */}
      {canUseReports && (
        <>
          {/* Filtros */}
          {reports.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
              <select style={{ ...inpStyle, width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">Todos os tipos</option>
                <option value="aluno">Aluno</option>
                <option value="turma">Turma</option>
              </select>
              {turmas.length > 0 && (
                <select style={{ ...inpStyle, width: 180 }} value={turmaFilter} onChange={e => setTurmaFilter(e.target.value)}>
                  <option value="">Todas as turmas</option>
                  {turmas.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
              {hasFilters && (
                <button
                  onClick={() => { setTypeFilter(''); setTurmaFilter(''); }}
                  style={{ padding: '9px 14px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 13, background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  × Limpar
                </button>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>Carregando relatórios...</div>
          )}

          {/* Empty state */}
          {!loading && reports.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 32px', border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg-card)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>Nenhum relatório ainda</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 380, margin: '0 auto 24px' }}>
                Gere um relatório de aluno ou de turma na página de avaliações para vê-lo aqui.
              </p>
              <button
                onClick={() => router.push('/avaliacoes')}
                style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Ir para Avaliações
              </button>
            </div>
          )}

          {/* Tabela */}
          {!loading && filtered.length > 0 && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-card)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-content)' }}>
                    {['Tipo', 'Aluno / Turma', 'Exercício', 'Data', ''].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background .12s' }}
                      onClick={() => setDetail(r)}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                          background: r.type === 'turma' ? '#ede9fe' : '#e0f2fe',
                          color: r.type === 'turma' ? '#7c3aed' : '#0369a1',
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                          {r.type === 'turma' ? 'Turma' : 'Aluno'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', fontWeight: 600, color: 'var(--text-main)', fontSize: 14 }}>
                        {r.type === 'aluno' ? r.subject : (r.turma || '—')}
                        {r.type === 'aluno' && r.turma && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>{r.turma}</span>
                        )}
                      </td>
                      <td style={{ padding: '13px 16px', color: 'var(--text-sub)', fontSize: 13 }}>{r.exerciseName || '—'}</td>
                      <td style={{ padding: '13px 16px', color: 'var(--text-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
                        {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '13px 16px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => generatePDF(r)}
                            title="Exportar PDF"
                            style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-sub)', fontFamily: 'inherit' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => del(r.id)}
                            title="Excluir"
                            style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'none', cursor: 'pointer', fontSize: 12, color: '#ef4444', fontFamily: 'inherit' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && reports.length > 0 && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>
              Nenhum relatório corresponde aos filtros aplicados.
            </div>
          )}
        </>
      )}

      {/* Modal de detalhe */}
      {detail && (
        <div
          onClick={() => setDetail(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border-card)', maxWidth: 680, width: '100%', maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 6, marginRight: 10,
                  background: detail.type === 'turma' ? '#ede9fe' : '#e0f2fe',
                  color: detail.type === 'turma' ? '#7c3aed' : '#0369a1',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {detail.type === 'turma' ? 'Turma' : 'Aluno'}
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                  {detail.type === 'aluno' ? detail.subject : (detail.turma || 'Turma')}
                </span>
                {detail.exerciseName && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>· {detail.exerciseName}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => generatePDF(detail)}
                  style={{ padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', fontFamily: 'inherit' }}
                >
                  Exportar PDF
                </button>
                <button
                  onClick={() => setDetail(null)}
                  style={{ padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)', lineHeight: 1, fontFamily: 'inherit' }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Gerado em {new Date(detail.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>

              {/* Resumo */}
              {detail.content.resumo && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Resumo</p>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>{detail.content.resumo}</p>
                </div>
              )}

              {/* Pontos fortes + a desenvolver / pontos de atenção */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {detail.content.pontosFortes?.length > 0 && (
                  <div style={{ padding: '16px', border: '1px solid #bbf7d0', borderRadius: 12, background: 'var(--bg-content)' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#16a34a', marginBottom: 10 }}>Pontos Fortes</p>
                    <ul style={{ paddingLeft: 18 }}>
                      {detail.content.pontosFortes.map((p, i) => (
                        <li key={i} style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 5, lineHeight: 1.5 }}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(detail.content.pontosDesenvolver || detail.content.pontosAtencao)?.length > 0 && (
                  <div style={{ padding: '16px', border: '1px solid #fecaca', borderRadius: 12, background: 'var(--bg-content)' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#dc2626', marginBottom: 10 }}>
                      {detail.type === 'turma' ? 'Pontos de Atenção' : 'A Desenvolver'}
                    </p>
                    <ul style={{ paddingLeft: 18 }}>
                      {(detail.content.pontosDesenvolver || detail.content.pontosAtencao).map((p, i) => (
                        <li key={i} style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 5, lineHeight: 1.5 }}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Análise detalhada (turma) */}
              {detail.content.analiseDetalhada && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Análise Detalhada</p>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>{detail.content.analiseDetalhada}</p>
                </div>
              )}

              {/* Parecer (aluno) */}
              {detail.content.parecer && (
                <div style={{ padding: '16px 20px', background: 'var(--bg-content)', borderRadius: 12, borderLeft: '3px solid #0081f0' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Parecer Final</p>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>{detail.content.parecer}</p>
                </div>
              )}

              {/* Sugestões (turma) */}
              {detail.content.sugestoes?.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 12 }}>Sugestões Pedagógicas</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {detail.content.sugestoes.map((s, i) => (
                      <div key={i} style={{ padding: '14px 18px', background: 'var(--bg-content)', borderRadius: 10, borderLeft: '3px solid #0081f0' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>{i+1}. {s.titulo}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 4 }}>{s.descricao}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{s.impacto}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
