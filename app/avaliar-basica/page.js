'use client';
import { useRef, useState } from 'react';
import AppLayout from '../components/AppLayout';

function token() { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; }

// ── Upload de arquivo: Supabase Storage → Gemini Files API ───────────────────
async function uploadFileToGemini(file, label) {
  const urlRes = await fetch('/api/storage/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ filename: file.name }),
  });
  const urlData = await urlRes.json();
  if (!urlRes.ok) throw new Error(urlData.error || 'Erro ao preparar upload');

  const putRes = await fetch(urlData.signedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!putRes.ok) throw new Error('Erro ao enviar arquivo para o storage');

  const geminiRes = await fetch('/api/upload-gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ supabasePath: urlData.path, mimeType: file.type, name: file.name, label }),
  });
  const geminiData = await geminiRes.json();
  if (!geminiRes.ok) throw new Error(geminiData.error || 'Erro ao processar arquivo');

  return { fileUri: geminiData.fileUri, mimeType: geminiData.mimeType, label, name: file.name };
}

const IconSpinner = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const IconUpload = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IconTrash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconHelp = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const STATUS_META = {
  certo: { icon: IconCheck, bg: '#F0FDF4', border: '#16a34a33', label: 'Certo' },
  errado: { icon: IconX, bg: '#FEF2F2', border: '#dc262633', label: 'Errado' },
  incerto: { icon: IconHelp, bg: '#FFFBEB', border: '#d9770633', label: 'Confirme' },
};

export default function AvaliarBasica() {
  const [context, setContext] = useState('');
  const [mode, setMode] = useState('foto');
  const [studentWork, setStudentWork] = useState('');
  const [fileUris, setFileUris] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  async function handleFiles(selectedFiles) {
    setProcessing(true);
    setError('');
    const uris = [], names = [];
    for (const file of Array.from(selectedFiles)) {
      try {
        const r = await uploadFileToGemini(file, 'Prova do aluno');
        uris.push(r);
        names.push(file.name);
      } catch (e) {
        setError(e.message || 'Erro ao processar arquivo');
      }
    }
    setFileUris(prev => [...prev, ...uris]);
    setFileNames(prev => [...prev, ...names]);
    setProcessing(false);
  }

  function removeFile(i) {
    setFileUris(prev => prev.filter((_, idx) => idx !== i));
    setFileNames(prev => prev.filter((_, idx) => idx !== i));
  }

  function resetForNext() {
    setStudentWork('');
    setFileUris([]);
    setFileNames([]);
    setResult(null);
    setError('');
  }

  async function handleCorrect() {
    if (!studentWork && !fileUris.length) return;
    setEvaluating(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/evaluate-basica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          context: context || undefined,
          studentWork: studentWork || undefined,
          fileUris: fileUris.length ? fileUris : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao corrigir');
      setResult(data);
    } catch (e) {
      setError(e.message || 'Erro ao corrigir');
    } finally {
      setEvaluating(false);
    }
  }

  const secLabel = { fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 };
  const section = { padding: '20px 24px', borderBottom: '1px solid var(--border-card)' };
  const sectionLast = { padding: '20px 24px' };
  const inp = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' };
  const btnPrimary = { background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' };
  const btnSecondary = { background: 'transparent', color: 'var(--text-sub)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 20px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' };
  const card = { background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 16, overflow: 'hidden' };

  const canCorrect = (!!studentWork || fileUris.length > 0) && !processing && !evaluating;

  return (
    <AppLayout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Avaliação</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>Nova Avaliação Básica</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 }}>
          Correção rápida por foto ou texto — sem cadastro de aluno, sem PDF. Ideal para provas de matemática, português e outras questões objetivas.
        </p>
      </div>

      <div style={{ maxWidth: 680 }}>
        <div style={card}>
          <div style={section}>
            <div style={secLabel}>Contexto ou gabarito (opcional)</div>
            <textarea value={context} onChange={e => setContext(e.target.value)} rows={3}
              placeholder="Ex: 7 questões sobre equação de 2º grau. Ou cole o gabarito, se tiver."
              style={inp} />
          </div>

          <div style={section}>
            <div style={secLabel}>Prova do aluno</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[{ id: 'foto', label: 'Foto' }, { id: 'texto', label: 'Texto colado' }].map(m => (
                <button key={m.id} onClick={() => setMode(m.id)}
                  style={{ padding: '7px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: `1px solid ${mode === m.id ? '#810cfa' : 'var(--border)'}`, background: mode === m.id ? '#810cfa' : 'var(--bg-content)', color: mode === m.id ? '#fff' : 'var(--text-main)', fontWeight: mode === m.id ? 700 : 400, fontFamily: 'inherit' }}>
                  {m.label}
                </button>
              ))}
            </div>

            {mode === 'foto' ? (
              <div>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => { if (e.target.files.length) handleFiles(e.target.files); e.target.value = ''; }} />
                <div onClick={() => !processing && fileRef.current?.click()}
                  style={{ border: `1.5px dashed ${fileNames.length ? '#810cfa' : 'var(--border)'}`, borderRadius: 10, padding: fileNames.length ? '10px 14px' : '20px', cursor: processing ? 'wait' : 'pointer', background: fileNames.length ? 'var(--bg-content)' : 'transparent' }}>
                  {processing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-sub)', fontSize: 13 }}><IconSpinner /> Processando...</div>
                  ) : fileNames.length ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {fileNames.map((n, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: 'var(--text-main)' }}>
                          {n}
                          <span onClick={e => { e.stopPropagation(); removeFile(i); }} style={{ display: 'flex', color: 'var(--text-sub)' }}><IconTrash /></span>
                        </span>
                      ))}
                      <span style={{ fontSize: 12, color: 'var(--text-sub)', alignSelf: 'center' }}>+ adicionar mais</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-sub)', justifyContent: 'center' }}>
                      <IconUpload />
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>Clique ou arraste a foto da prova</div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <textarea value={studentWork} onChange={e => setStudentWork(e.target.value)} rows={6}
                placeholder="Cole aqui as respostas do aluno..."
                style={inp} />
            )}
          </div>

          <div style={{ ...sectionLast, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={handleCorrect} disabled={!canCorrect} style={{ ...btnPrimary, opacity: canCorrect ? 1 : 0.5, cursor: canCorrect ? 'pointer' : 'not-allowed' }}>
              {evaluating ? <><IconSpinner /> Corrigindo...</> : 'Corrigir agora'}
            </button>
            {result && <button onClick={resetForNext} style={btnSecondary}>Nova correção</button>}
          </div>
        </div>

        {error && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #dc262633', borderRadius: 10, color: '#991B1B', fontSize: 13 }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ ...card, marginTop: 20 }}>
            <div style={section}>
              <div style={secLabel}>Resultado</div>
              {result.summary && <p style={{ fontSize: 14, color: 'var(--text-main)', margin: 0, lineHeight: 1.6 }}>{result.summary}</p>}
              {result.suggestedScore && (
                <div style={{ marginTop: 10, display: 'inline-block', padding: '4px 12px', borderRadius: 20, background: 'var(--bg-content)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
                  Nota sugerida: {result.suggestedScore}
                </div>
              )}
            </div>
            <div style={sectionLast}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(result.items || []).map((item, i) => {
                  const meta = STATUS_META[item.status] || STATUS_META.incerto;
                  const Icon = meta.icon;
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 14px', background: meta.bg, border: `1px solid ${meta.border}`, borderRadius: 10 }}>
                      <div style={{ flexShrink: 0, marginTop: 1 }}><Icon /></div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>Questão {item.question} · {meta.label}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-main)', marginTop: 2, lineHeight: 1.5 }}>{item.comment}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
