'use client';
import { useEffect, useRef, useState } from 'react';
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

let _slotId = 0;
function newSlot() { return { id: ++_slotId, studentName: '', mode: 'foto', studentWork: '', fileUris: [], fileNames: [], processing: false, evaluating: false, error: '', result: null }; }

const IconSpinner = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const IconUpload = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IconTrash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconX = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconHelp = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

const STATUS_META = {
  certo: { icon: IconCheck, bg: '#F0FDF4', border: '#16a34a33', label: 'Certo' },
  errado: { icon: IconX, bg: '#FEF2F2', border: '#dc262633', label: 'Errado' },
  incerto: { icon: IconHelp, bg: '#FFFBEB', border: '#d9770633', label: 'Confirme' },
};

const secLabel = { fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 };
const section = { padding: '20px 24px', borderBottom: '1px solid var(--border-card)' };
const sectionLast = { padding: '20px 24px' };
const inp = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' };
const btnPrimary = { background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' };
const btnSecondary = { background: 'transparent', color: 'var(--text-sub)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 20px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 };
const card = { background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 16, overflow: 'hidden' };

function SlotCard({ slot, index, onChange, onRemove, canRemove }) {
  const fileRef = useRef(null);

  async function handleFiles(selectedFiles) {
    onChange({ processing: true, error: '' });
    const uris = [], names = [];
    let uploadError = '';
    for (const file of Array.from(selectedFiles)) {
      try {
        const r = await uploadFileToGemini(file, 'Prova do aluno');
        uris.push(r);
        names.push(file.name);
      } catch (e) {
        uploadError = e.message || 'Erro ao processar arquivo';
      }
    }
    onChange({ fileUris: [...slot.fileUris, ...uris], fileNames: [...slot.fileNames, ...names], processing: false, error: uploadError });
  }

  function removeFile(i) {
    onChange({ fileUris: slot.fileUris.filter((_, idx) => idx !== i), fileNames: slot.fileNames.filter((_, idx) => idx !== i) });
  }

  return (
    <div style={{ ...card, marginBottom: 16 }}>
      <div style={section}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <input value={slot.studentName} onChange={e => onChange({ studentName: e.target.value })}
            placeholder={`Nome do aluno ${index + 1} (opcional)`}
            style={{ ...inp, flex: 1 }} />
          {canRemove && (
            <button onClick={onRemove} style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', padding: 6, flexShrink: 0 }}><IconTrash /></button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[{ id: 'foto', label: 'Foto' }, { id: 'texto', label: 'Texto colado' }].map(m => (
            <button key={m.id} onClick={() => onChange({ mode: m.id })}
              style={{ padding: '7px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: `1px solid ${slot.mode === m.id ? '#810cfa' : 'var(--border)'}`, background: slot.mode === m.id ? '#810cfa' : 'var(--bg-content)', color: slot.mode === m.id ? '#fff' : 'var(--text-main)', fontWeight: slot.mode === m.id ? 700 : 400, fontFamily: 'inherit' }}>
              {m.label}
            </button>
          ))}
        </div>

        {slot.mode === 'foto' ? (
          <div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={e => { if (e.target.files.length) handleFiles(e.target.files); e.target.value = ''; }} />
            <div onClick={() => !slot.processing && fileRef.current?.click()}
              style={{ border: `1.5px dashed ${slot.fileNames.length ? '#810cfa' : 'var(--border)'}`, borderRadius: 10, padding: slot.fileNames.length ? '10px 14px' : '20px', cursor: slot.processing ? 'wait' : 'pointer', background: slot.fileNames.length ? 'var(--bg-content)' : 'transparent' }}>
              {slot.processing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-sub)', fontSize: 13 }}><IconSpinner /> Processando...</div>
              ) : slot.fileNames.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {slot.fileNames.map((n, i) => (
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
          <textarea value={slot.studentWork} onChange={e => onChange({ studentWork: e.target.value })} rows={5}
            placeholder="Cole aqui as respostas do aluno..."
            style={inp} />
        )}

        {slot.evaluating && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-sub)', fontSize: 13, marginTop: 12 }}><IconSpinner /> Corrigindo...</div>}
        {slot.error && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', border: '1px solid #dc262633', borderRadius: 10, color: '#991B1B', fontSize: 13 }}>
            {slot.error}
          </div>
        )}
      </div>

      {slot.result && (
        <div style={sectionLast}>
          <div style={secLabel}>Resultado{slot.studentName ? ` — ${slot.studentName}` : ''}</div>
          {slot.result.summary && <p style={{ fontSize: 14, color: 'var(--text-main)', margin: '0 0 10px' }}>{slot.result.summary}</p>}
          {slot.result.suggestedScore && (
            <div style={{ marginBottom: 12, display: 'inline-block', padding: '4px 12px', borderRadius: 20, background: 'var(--bg-content)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>
              Nota sugerida: {slot.result.suggestedScore}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(slot.result.items || []).map((item, i) => {
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
      )}
    </div>
  );
}

export default function AvaliarBasica() {
  const [userName, setUserName] = useState('Professor');
  const [context, setContext] = useState('');
  const [contextFileUris, setContextFileUris] = useState([]);
  const [contextFileNames, setContextFileNames] = useState([]);
  const [contextProcessing, setContextProcessing] = useState(false);
  const [slots, setSlots] = useState([newSlot()]);
  const [correcting, setCorrecting] = useState(false);
  const contextFileRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setUserName(u.name);
      }
    } catch {}
  }, []);

  function updateSlot(id, patch) { setSlots(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s)); }
  function addSlot() { setSlots(prev => [...prev, newSlot()]); }
  function removeSlot(id) { setSlots(prev => prev.filter(s => s.id !== id)); }

  async function handleContextFiles(selectedFiles) {
    setContextProcessing(true);
    const uris = [], names = [];
    for (const file of Array.from(selectedFiles)) {
      try {
        const r = await uploadFileToGemini(file, 'Gabarito/Referência do professor');
        uris.push(r);
        names.push(file.name);
      } catch (e) {
        console.error('handleContextFiles error:', e.message);
      }
    }
    setContextFileUris(prev => [...prev, ...uris]);
    setContextFileNames(prev => [...prev, ...names]);
    setContextProcessing(false);
  }

  function removeContextFile(i) {
    setContextFileUris(prev => prev.filter((_, idx) => idx !== i));
    setContextFileNames(prev => prev.filter((_, idx) => idx !== i));
  }

  function resetAll() {
    setContext('');
    setContextFileUris([]);
    setContextFileNames([]);
    setSlots([newSlot()]);
  }

  async function handleCorrectAll() {
    const validSlots = slots.filter(s => s.studentWork || s.fileUris.length > 0);
    if (!validSlots.length) return;
    setCorrecting(true);

    for (const slot of slots) {
      if (!slot.studentWork && !slot.fileUris.length) continue;
      updateSlot(slot.id, { evaluating: true, error: '', result: null });
      try {
        const res = await fetch('/api/evaluate-basica', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body: JSON.stringify({
            context: context || undefined,
            contextFileUris: contextFileUris.length ? contextFileUris : undefined,
            studentWork: slot.studentWork || undefined,
            fileUris: slot.fileUris.length ? slot.fileUris : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao corrigir');
        updateSlot(slot.id, { result: data, evaluating: false });

        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          if (typeof u.quota_ciclo === 'number' && u.quota_ciclo > 0) u.quota_ciclo -= 1;
          else if (typeof u.quota_extra === 'number' && u.quota_extra > 0) u.quota_extra -= 1;
          localStorage.setItem('user', JSON.stringify(u));
          window.dispatchEvent(new Event('storage'));
        } catch {}
      } catch (e) {
        updateSlot(slot.id, { error: e.message || 'Erro ao corrigir', evaluating: false });
      }
    }

    setCorrecting(false);
  }

  const anyProcessing = contextProcessing || slots.some(s => s.processing);
  const readySlots = slots.filter(s => s.studentWork || s.fileUris.length > 0);
  const canCorrect = readySlots.length > 0 && !anyProcessing && !correcting;
  const anyResult = slots.some(s => s.result);

  return (
    <AppLayout userName={userName}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Avaliação</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>Nova Avaliação Básica</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 }}>
          Correção rápida por foto ou texto — sem cadastro de aluno, sem PDF. Ideal para provas de matemática, português e outras questões objetivas.
        </p>
      </div>

      <div style={{ maxWidth: 680 }}>
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={sectionLast}>
            <div style={secLabel}>Contexto ou gabarito (opcional)</div>
            <textarea value={context} onChange={e => setContext(e.target.value)} rows={3}
              placeholder="Ex: 7 questões sobre equação de 2º grau. Ou cole o gabarito, se tiver."
              style={{ ...inp, marginBottom: 10 }} />

            <input ref={contextFileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={e => { if (e.target.files.length) handleContextFiles(e.target.files); e.target.value = ''; }} />
            {contextFileNames.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                {contextFileNames.map((n, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: 'var(--text-main)' }}>
                    {n}
                    <span onClick={() => removeContextFile(i)} style={{ display: 'flex', color: 'var(--text-sub)', cursor: 'pointer' }}><IconTrash /></span>
                  </span>
                ))}
                <button onClick={() => contextFileRef.current?.click()} disabled={contextProcessing} style={{ ...btnSecondary, padding: '4px 10px', fontSize: 12 }}>
                  {contextProcessing ? <><IconSpinner /> Processando...</> : '+ adicionar foto'}
                </button>
              </div>
            ) : (
              <button onClick={() => contextFileRef.current?.click()} disabled={contextProcessing} style={{ ...btnSecondary, padding: '6px 12px', fontSize: 12 }}>
                {contextProcessing ? <><IconSpinner /> Processando...</> : <><IconUpload /> Anexar foto do gabarito</>}
              </button>
            )}
          </div>
        </div>

        {slots.map((slot, i) => (
          <SlotCard key={slot.id} slot={slot} index={i}
            onChange={patch => updateSlot(slot.id, patch)}
            onRemove={() => removeSlot(slot.id)}
            canRemove={slots.length > 1} />
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 20 }}>
          <button onClick={addSlot} style={btnSecondary}><IconPlus /> Adicionar aluno</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={handleCorrectAll} disabled={!canCorrect} style={{ ...btnPrimary, opacity: canCorrect ? 1 : 0.5, cursor: canCorrect ? 'pointer' : 'not-allowed' }}>
            {correcting ? <><IconSpinner /> Corrigindo...</> : `Corrigir ${readySlots.length > 1 ? `todos (${readySlots.length})` : 'agora'}`}
          </button>
          {anyResult && <button onClick={resetAll} style={btnSecondary}>Nova correção</button>}
        </div>
      </div>
    </AppLayout>
  );
}
