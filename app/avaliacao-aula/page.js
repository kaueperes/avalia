'use client';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '../components/AppLayout';

function token() { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; }
function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

const TEMAS = [
  { id: 'didatica', label: 'Didática' },
  { id: 'conteudo', label: 'Conteúdo da aula' },
  { id: 'dinamica', label: 'Dinâmica de aula' },
  { id: 'outro', label: 'Outro' },
];

const NIVEL_META = {
  'Em desenvolvimento': { bg: '#FFFBEB', color: '#d97706', border: '#d9770633' },
  'Consistente': { bg: '#EFF6FF', color: '#0081f0', border: '#0081f033' },
  'Destaque': { bg: '#F0FDF4', color: '#16a34a', border: '#16a34a33' },
};

// ── Upload de arquivo: Supabase Storage → Gemini Files API ───────────────────
async function uploadAudioToGemini(file) {
  const urlRes = await fetch('/api/storage/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ filename: file.name }),
  });
  const urlData = await urlRes.json();
  if (!urlRes.ok) throw new Error(urlData.error || 'Erro ao preparar upload');

  const putRes = await fetch(urlData.signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  if (!putRes.ok) throw new Error('Erro ao enviar arquivo para o storage');

  const geminiRes = await fetch('/api/upload-gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ supabasePath: urlData.path, mimeType: file.type, name: file.name, label: 'Áudio da aula' }),
  });
  const geminiData = await geminiRes.json();
  if (!geminiRes.ok) throw new Error(geminiData.error || 'Erro ao processar áudio');
  return { fileUri: geminiData.fileUri, mimeType: geminiData.mimeType, name: file.name };
}

function generatePDF(entry) {
  const date = new Date(entry.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const temaLabels = (entry.temas || []).map(t => TEMAS.find(x => x.id === t)?.label || (t === 'outro' ? entry.tema_outro : t)).join(', ');
  const fortesRows = (entry.pontos_fortes || []).map(p => `<li style="margin-bottom:6px">${esc(p)}</li>`).join('');
  const desenvolverRows = (entry.pontos_desenvolver || []).map(p => `<li style="margin-bottom:6px">${esc(p)}</li>`).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Avaliação de Aula</title>
    <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111; padding: 48px; max-width: 720px; margin: 0 auto; } @media print { body { padding: 32px 48px; } @page { margin: 0; size: A4; } }</style>
    </head><body>
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#810cfa;margin-bottom:6px">Avaliação de Aula</div>
    <h1 style="font-size:24px;margin-bottom:6px">${esc(temaLabels)}</h1>
    <div style="font-size:13px;color:#9ca3af;margin-bottom:24px">Gerado em ${date}</div>
    <div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:8px">Contexto</div><div style="font-size:14px;line-height:1.7;color:#374151">${esc(entry.contexto)}</div></div>
    ${fortesRows ? `<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#16a34a;margin-bottom:8px">Pontos Fortes</div><ul style="padding-left:18px">${fortesRows}</ul></div>` : ''}
    ${desenvolverRows ? `<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#dc2626;margin-bottom:8px">A Desenvolver</div><ul style="padding-left:18px">${desenvolverRows}</ul></div>` : ''}
    ${entry.parecer ? `<div style="margin-bottom:24px;padding:20px;background:#f9fafb;border-radius:10px;border-left:3px solid #0081f0"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Parecer</div><div style="font-size:14px;line-height:1.8;color:#374151">${esc(entry.parecer)}</div></div>` : ''}
    </body></html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

function ResultCard({ entry }) {
  const nivelMeta = NIVEL_META[entry.nivel] || NIVEL_META['Consistente'];
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: '22px 24px', marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>Resultado</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {entry.nivel && <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: nivelMeta.bg, color: nivelMeta.color, border: `1px solid ${nivelMeta.border}` }}>{entry.nivel}</span>}
          <button onClick={() => generatePDF(entry)} style={{ padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--bg-content)', color: 'var(--text-main)', cursor: 'pointer' }}>Gerar PDF</button>
        </div>
      </div>
      {entry.pontos_fortes?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#16a34a', marginBottom: 8 }}>Pontos fortes</p>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {entry.pontos_fortes.map((p, i) => <li key={i} style={{ fontSize: 13.5, color: 'var(--text-main)' }}>{p}</li>)}
          </ul>
        </div>
      )}
      {entry.pontos_desenvolver?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#dc2626', marginBottom: 8 }}>A desenvolver</p>
          <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {entry.pontos_desenvolver.map((p, i) => <li key={i} style={{ fontSize: 13.5, color: 'var(--text-main)' }}>{p}</li>)}
          </ul>
        </div>
      )}
      {entry.parecer && (
        <div style={{ padding: '14px 16px', background: 'var(--bg-content)', borderRadius: 10, borderLeft: '3px solid #0081f0' }}>
          <p style={{ fontSize: 13.5, color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>{entry.parecer}</p>
        </div>
      )}
    </div>
  );
}

export default function AvaliacaoAula() {
  const [userName, setUserName] = useState('Professor');
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null);
  const [temas, setTemas] = useState([]);
  const [temaOutro, setTemaOutro] = useState('');
  const [contexto, setContexto] = useState('');
  const [tom, setTom] = useState('encorajador');
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('');
  const [historyLoading, setHistoryLoading] = useState(true);
  const [quota, setQuota] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) { const u = JSON.parse(stored); if (u.name) setUserName(u.name); }
    } catch {}
    loadHistory();
  }, []);

  function loadHistory(tema) {
    setHistoryLoading(true);
    const qs = tema ? `?tema=${tema}` : '';
    fetch(`/api/evaluate-aula${qs}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setHistory(Array.isArray(data.history) ? data.history : []); if (data.quota) setQuota(data.quota); })
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }

  function toggleTema(id) {
    setTemas(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  }

  async function handleFile(file) {
    setAudioFile(file);
    setUploading(true);
    setError('');
    try {
      const info = await uploadAudioToGemini(file);
      setUploadInfo(info);
    } catch (e) {
      setError(e.message || 'Erro ao enviar áudio');
      setAudioFile(null);
    } finally {
      setUploading(false);
    }
  }

  async function handleEvaluate() {
    if (!uploadInfo || !temas.length || !contexto.trim()) return;
    setEvaluating(true);
    setError('');
    try {
      const res = await fetch('/api/evaluate-aula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ temas, temaOutro: temas.includes('outro') ? temaOutro : undefined, contexto, tom, fileUri: uploadInfo.fileUri, mimeType: uploadInfo.mimeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao avaliar a aula');
      setResult(data);
      if (data._quota) setQuota(data._quota);
      loadHistory(historyFilter);
    } catch (e) {
      setError(e.message || 'Erro ao avaliar a aula');
    } finally {
      setEvaluating(false);
    }
  }

  function resetForm() {
    setAudioFile(null); setUploadInfo(null); setTemas([]); setTemaOutro(''); setContexto(''); setTom('encorajador'); setResult(null); setError('');
  }

  const quotaExhausted = quota ? (quota.isGratuito ? quota.trialUsed : quota.remaining <= 0) : false;
  const canEvaluate = uploadInfo && temas.length > 0 && contexto.trim() && !evaluating && !uploading && !quotaExhausted;

  const quotaLabel = !quota ? null
    : quota.isGratuito
      ? (quota.trialUsed ? 'Você já usou sua avaliação de aula gratuita — faça upgrade de plano para continuar.' : 'Você tem 1 avaliação de aula grátis (vitalícia) disponível.')
      : `Você tem ${quota.remaining} de ${quota.limit} avaliações de aula disponíveis este mês.`;
  const quotaColor = quotaExhausted ? '#dc2626' : 'var(--text-muted)';

  const inp = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' };
  const card = { background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: '22px 24px' };

  return (
    <AppLayout userName={userName}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Ferramenta (Beta)</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>Avaliação de Aula</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 6, marginBottom: 6 }}>
          Grave o áudio da sua aula e receba um feedback privado sobre sua própria prática — didática, conteúdo ou dinâmica, do jeito que você escolher.
        </p>
        {quotaLabel && (
          <p style={{ fontSize: 13, color: quotaColor, fontWeight: quotaExhausted ? 700 : 500, marginTop: 8 }}>
            {quotaExhausted ? '⚠ ' : ''}{quotaLabel}
          </p>
        )}
      </div>

      <div style={{ maxWidth: 680 }}>
        <div style={card}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Áudio da aula</p>
          <input ref={fileRef} type="file" accept="audio/*" style={{ display: 'none' }}
            onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; }} />
          <div onClick={() => !uploading && fileRef.current?.click()}
            style={{ border: `1.5px dashed ${uploadInfo ? '#810cfa' : 'var(--border)'}`, borderRadius: 10, padding: uploadInfo ? '12px 16px' : '24px', cursor: uploading ? 'wait' : 'pointer', background: uploadInfo ? 'var(--bg-content)' : 'transparent', marginBottom: 24, textAlign: 'center' }}>
            {uploading ? <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>Processando áudio...</span>
              : uploadInfo ? <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600 }}>🎵 {uploadInfo.name} — clique pra trocar</span>
              : <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>Clique pra escolher o arquivo de áudio (mp3, wav, m4a...)</span>}
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>O que você quer avaliar?</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: temas.includes('outro') ? 12 : 20 }}>
            {TEMAS.map(t => (
              <button key={t.id} onClick={() => toggleTema(t.id)}
                style={{ padding: '7px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: `1px solid ${temas.includes(t.id) ? '#810cfa' : 'var(--border)'}`, background: temas.includes(t.id) ? '#810cfa' : 'var(--bg-content)', color: temas.includes(t.id) ? '#fff' : 'var(--text-main)', fontWeight: temas.includes(t.id) ? 700 : 400, fontFamily: 'inherit' }}>
                {t.label}
              </button>
            ))}
          </div>
          {temas.includes('outro') && (
            <input value={temaOutro} onChange={e => setTemaOutro(e.target.value)} placeholder="O que você quer identificar nessa avaliação?" style={{ ...inp, marginBottom: 20 }} />
          )}

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Contexto</p>
          <textarea value={contexto} onChange={e => setContexto(e.target.value)} rows={3}
            placeholder="Ex: Sou professor de modelagem 3D, nessa aula estou mostrando as ferramentas X e Y pra turma do 2º ano do ensino médio."
            style={{ ...inp, marginBottom: 20 }} />

          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Tom do feedback</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {[{ id: 'encorajador', label: 'Encorajador' }, { id: 'direto', label: 'Direto e crítico' }].map(o => (
              <button key={o.id} onClick={() => setTom(o.id)}
                style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, cursor: 'pointer', border: `1px solid ${tom === o.id ? '#0081f0' : 'var(--border)'}`, background: tom === o.id ? '#0081f0' : 'var(--bg-content)', color: tom === o.id ? '#fff' : 'var(--text-main)', fontWeight: tom === o.id ? 700 : 400, fontFamily: 'inherit' }}>
                {o.label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #dc262633', borderRadius: 10, color: '#991B1B', fontSize: 13 }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={handleEvaluate} disabled={!canEvaluate}
              style={{ background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 26px', fontSize: 14, fontWeight: 700, cursor: canEvaluate ? 'pointer' : 'not-allowed', opacity: canEvaluate ? 1 : 0.5, fontFamily: 'inherit' }}>
              {evaluating ? 'Avaliando...' : 'Avaliar aula'}
            </button>
            {result && <button onClick={resetForm} style={{ background: 'transparent', color: 'var(--text-sub)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 20px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Nova avaliação</button>}
          </div>
        </div>

        {result && <ResultCard entry={result} />}
      </div>

      <div style={{ marginTop: 40, maxWidth: 680 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>Histórico</h2>
          <select className="filter-field" value={historyFilter} onChange={e => { setHistoryFilter(e.target.value); loadHistory(e.target.value); }}
            style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 13, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit' }}>
            <option value="">Todos os temas</option>
            {TEMAS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, overflow: 'hidden' }}>
          {historyLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Carregando...</div>
          ) : history.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Nenhuma avaliação de aula ainda.</div>
          ) : (
            <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-content)' }}>
                  {['Data', 'Temas', 'Nível', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(h => {
                  const nivelMeta = NIVEL_META[h.nivel] || NIVEL_META['Consistente'];
                  return (
                    <tr key={h.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(h.created_at).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>{(h.temas || []).map(t => TEMAS.find(x => x.id === t)?.label || t).join(', ')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {h.nivel && <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: nivelMeta.bg, color: nivelMeta.color, border: `1px solid ${nivelMeta.border}` }}>{h.nivel}</span>}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button onClick={() => setResult(h)} style={{ fontSize: 12, color: '#0081f0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginRight: 12 }}>Ver</button>
                        <button onClick={() => generatePDF(h)} style={{ fontSize: 12, color: 'var(--text-sub)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>PDF</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
