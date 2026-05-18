'use client';
import { useEffect, useRef, useState } from 'react';
import { TONES, scoreToGrade, scoreColor } from '@/lib/types';
import AppLayout from '../components/AppLayout';
import mammoth from 'mammoth';

function token() { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; }

let _slotId = 0;
function newSlot() { return { id: ++_slotId, studentId: '', studentName: '', mediaFiles: [], textContent: '', fileNames: [], result: null, evalId: null, evaluating: false, error: '' }; }

// ── Helpers de arquivo ────────────────────────────────────────────────────────
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1600;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82).split(',')[1]);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function summarizeObj(text, filename) {
  let verts = 0, uvs = 0, normals = 0, tris = 0, quads = 0, ngons = 0;
  const objects = [], materials = [];
  let pos = 0;
  const len = text.length;
  while (pos < len) {
    const nl = text.indexOf('\n', pos);
    const end = nl === -1 ? len : nl;
    const t = text.slice(pos, end).trimStart();
    pos = end + 1;
    if (t.startsWith('v ')) verts++;
    else if (t.startsWith('vt ')) uvs++;
    else if (t.startsWith('vn ')) normals++;
    else if (t.startsWith('f ')) {
      const vCount = t.trim().split(/\s+/).length - 1;
      if (vCount === 3) tris++;
      else if (vCount === 4) quads++;
      else if (vCount >= 5) ngons++;
    } else if (t.startsWith('o ') || t.startsWith('g ')) {
      const name = t.slice(2).trim();
      if (name && name !== 'default') objects.push(name);
    } else if (t.startsWith('usemtl ')) {
      const name = t.slice(7).trim();
      if (name && !materials.includes(name)) materials.push(name);
    }
  }
  const total = tris + quads + ngons;
  const pct = n => total > 0 ? ` (${((n / total) * 100).toFixed(1)}%)` : '';
  return `=== ${filename} ===\nVértices: ${verts} | UVs: ${uvs} | Normais: ${normals}\nObjetos/grupos: ${objects.length ? objects.join(', ') : '(nenhum nomeado)'}\nMateriais: ${materials.length ? materials.join(', ') : '(nenhum)'}\nFaces: ${total} — Triângulos: ${tris}${pct(tris)} | Quads: ${quads}${pct(quads)} | N-gons: ${ngons}${pct(ngons)}`;
}

// Detecta o tipo e processa qualquer arquivo automaticamente
async function processAnyFile(file) {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (type.startsWith('image/')) {
    return { kind: 'media', data: await compressImage(file), mediaType: 'image/jpeg', label: 'Trabalho do aluno', name: file.name };
  }
  if (type.startsWith('video/') || type.startsWith('audio/')) {
    if (file.size > 20 * 1024 * 1024) throw new Error(`"${file.name}" é maior que 20MB. Reduza o tamanho ou exporte em qualidade menor.`);
    return { kind: 'media', data: await toBase64(file), mediaType: type, label: 'Trabalho do aluno', name: file.name };
  }
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return { kind: 'media', data: await toBase64(file), mediaType: 'application/pdf', label: 'Trabalho do aluno', name: file.name };
  }
  if (name.endsWith('.docx') || type.includes('wordprocessingml')) {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return { kind: 'text', content: value, name: file.name };
  }
  if (name.endsWith('.obj')) {
    const MAX = 5 * 1024 * 1024;
    const slice = file.size > MAX ? file.slice(0, MAX) : file;
    const text = await slice.text();
    return { kind: 'text', content: summarizeObj(text, file.name), name: file.name };
  }
  // txt e outros arquivos de texto
  try {
    const text = await file.text();
    return { kind: 'text', content: text, name: file.name };
  } catch {
    return { kind: 'media', data: await toBase64(file), mediaType: type || 'application/octet-stream', label: 'Trabalho do aluno', name: file.name };
  }
}

function fileIcon(name = '') {
  const n = name.toLowerCase();
  if (n.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return '🖼';
  if (n.match(/\.(mp4|mov|avi|mkv|webm)$/)) return '🎬';
  if (n.match(/\.(mp3|wav|m4a|ogg|aac)$/)) return '🎵';
  if (n.endsWith('.pdf')) return '📄';
  if (n.endsWith('.docx') || n.endsWith('.doc')) return '📝';
  if (n.endsWith('.obj')) return '📦';
  return '📎';
}

// ── Ícones ───────────────────────────────────────────────────────────────────
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconPlus = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconSpinner = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const IconPDF = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconUpload = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IconX = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// ── Barra de progresso ────────────────────────────────────────────────────────
function StepBar({ current }) {
  const steps = ['Descrição', 'Critérios', 'Alunos'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done || active ? 'var(--accent)' : 'var(--bg-card)', border: `2px solid ${done || active ? 'var(--accent)' : 'var(--border)'}`, color: done || active ? '#fff' : 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>
                {done ? <IconCheck /> : n}
              </div>
              <span style={{ fontSize: 11, color: active ? 'var(--accent)' : 'var(--text-muted)', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? 'var(--accent)' : 'var(--border)', margin: '0 8px', marginBottom: 20 }} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Slot de aluno ─────────────────────────────────────────────────────────────
function StudentSlot({ slot, index, students, onChange, onRemove, canRemove }) {
  const fileRef = useRef(null);
  const [processing, setProcessing] = useState(false);

  async function handleFiles(selectedFiles) {
    setProcessing(true);
    const mediaFiles = [];
    const textParts = [];
    const fileNames = [];
    const errors = [];

    for (const file of Array.from(selectedFiles)) {
      try {
        const result = await processAnyFile(file);
        fileNames.push(file.name);
        if (result.kind === 'media') mediaFiles.push(result);
        else textParts.push(result.content);
      } catch (e) {
        errors.push(e.message);
      }
    }

    onChange({
      mediaFiles,
      textContent: textParts.join('\n\n'),
      fileNames,
      error: errors.join(' '),
    });
    setProcessing(false);
  }

  const inputStyle = { width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' };
  const hasFiles = slot.fileNames.length > 0 || slot.textContent;

  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 6 }}>
          {index + 1}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Seletor de aluno */}
          <select value={slot.studentId}
            onChange={e => {
              const s = students.find(s => s.id === e.target.value);
              onChange({ studentId: e.target.value, studentName: s?.name || '' });
            }}
            style={inputStyle}>
            <option value="">Selecionar aluno...</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {/* Área de upload */}
          <div
            onClick={() => !processing && fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            style={{ border: `1.5px dashed ${hasFiles ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: hasFiles ? '10px 14px' : '18px 16px', cursor: processing ? 'wait' : 'pointer', transition: 'border-color 0.15s', background: hasFiles ? 'var(--bg-card)' : 'transparent' }}
          >
            {processing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
                <IconSpinner /> Processando arquivos...
              </div>
            ) : hasFiles ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {slot.fileNames.map((name, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: 12 }}>
                    {fileIcon(name)} {name}
                  </span>
                ))}
                {slot.textContent && !slot.fileNames.length && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Texto extraído ({slot.textContent.length} caracteres)</span>
                )}
                <span style={{ fontSize: 12, color: 'var(--accent)', marginLeft: 4 }}>Clique para trocar</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)' }}>
                <IconUpload />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Clique ou arraste qualquer arquivo</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>Imagem, vídeo, áudio, PDF, DOCX, TXT, OBJ...</div>
                </div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" style={{ display: 'none' }} multiple
            accept="image/*,video/*,audio/*,.pdf,.docx,.doc,.txt,.obj"
            onChange={e => handleFiles(e.target.files)} />

          {slot.error && <p style={{ color: '#dc2626', fontSize: 12, margin: 0 }}>{slot.error}</p>}

          {/* Status da avaliação */}
          {slot.evaluating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13 }}>
              <IconSpinner /> Avaliando...
            </div>
          )}
          {slot.result && !slot.evaluating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ ...scoreColor(slot.result.score), padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
                {slot.result.score?.toFixed(1)} — {scoreToGrade(slot.result.score)}
              </span>
              {slot.evalId && (
                <button onClick={() => window.open(`/relatorio-individual?id=${slot.evalId}&print=1`, '_blank')}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: 'var(--bg-card)', color: 'var(--text)', fontFamily: 'inherit' }}>
                  <IconPDF /> Baixar PDF
                </button>
              )}
            </div>
          )}
        </div>

        {canRemove && (
          <button onClick={onRemove}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, marginTop: 4, flexShrink: 0 }}>
            <IconTrash />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Card de resultado ─────────────────────────────────────────────────────────
function ResultCard({ slot }) {
  const [expanded, setExpanded] = useState(false);
  const col = scoreColor(slot.result.score);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div onClick={() => setExpanded(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', cursor: 'pointer', background: 'var(--bg-card)' }}>
        <div style={{ ...col, borderRadius: 6, padding: '4px 10px', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
          {slot.result.score?.toFixed(1)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{slot.studentName || 'Aluno'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{scoreToGrade(slot.result.score)} · {slot.result.criteriaScores?.length} critérios</div>
        </div>
        {slot.evalId && (
          <button onClick={e => { e.stopPropagation(); window.open(`/relatorio-individual?id=${slot.evalId}&print=1`, '_blank'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit', flexShrink: 0 }}>
            <IconPDF /> PDF
          </button>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div style={{ padding: '16px 18px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
          {slot.result.criteriaScores?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {slot.result.criteriaScores.map((c, i) => {
                const cc = scoreColor(c.score);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1, fontSize: 13 }}>{c.name}</div>
                    <div style={{ width: 100, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${(c.score / 10) * 100}%`, height: '100%', background: cc.text, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: cc.text, minWidth: 32, textAlign: 'right' }}>{c.score?.toFixed(1)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 36 }}>×{c.weight}</div>
                  </div>
                );
              })}
            </div>
          )}
          {slot.result.feedback && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {slot.result.feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AvaliarV2() {
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseContext, setExerciseContext] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [tone, setTone] = useState('neutro');

  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);

  const [slots, setSlots] = useState([newSlot()]);
  const [evaluating, setEvaluating] = useState(false);
  const [evalProgress, setEvalProgress] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loadingCriteria, setLoadingCriteria] = useState(false);
  const [stepError, setStepError] = useState('');

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token()}` };
    Promise.all([
      fetch('/api/profiles', { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/classes', { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([profs, cls]) => {
      setProfiles(profs || []);
      setClasses(cls || []);
      if (profs?.length === 1) setSelectedProfileId(profs[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedClassId) { setStudents([]); return; }
    fetch(`/api/students?classId=${selectedClassId}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.ok ? r.json() : []).then(s => setStudents(s || [])).catch(() => setStudents([]));
  }, [selectedClassId]);

  function updateSlot(id, patch) {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  async function handleGenerateCriteria() {
    if (!description.trim()) return;
    setLoadingCriteria(true);
    setStepError('');
    try {
      const res = await fetch('/api/generate-criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar');
      setExerciseName(data.exerciseName || '');
      setExerciseContext(data.exerciseContext || '');
      setCriteria(data.criteria || []);
      setStep(2);
    } catch (e) {
      setStepError(e.message);
    } finally {
      setLoadingCriteria(false);
    }
  }

  async function handleEvaluateAll() {
    const validSlots = slots.filter(s => s.studentId || s.textContent || s.mediaFiles.length > 0);
    if (!validSlots.length) return;
    setEvaluating(true);
    setShowResults(false);
    const profile = profiles.find(p => p.id === selectedProfileId);
    const turmaName = classes.find(c => c.id === selectedClassId)?.name || '';

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot.studentId && !slot.textContent && slot.mediaFiles.length === 0) continue;
      setEvalProgress(`Avaliando ${slot.studentName || `Aluno ${i + 1}`} (${i + 1} de ${validSlots.length})...`);
      updateSlot(slot.id, { evaluating: true, error: '', result: null, evalId: null });

      try {
        const evalRes = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body: JSON.stringify({
            type: 'outro',
            exerciseName,
            exerciseContext,
            criteria,
            studentName: slot.studentName,
            studentWork: slot.textContent || undefined,
            tone,
            profName: profile?.name || '',
            profDisc: profile?.discipline || '',
            images: slot.mediaFiles.length > 0 ? slot.mediaFiles : undefined,
            referenceWeight: 'livre',
          }),
        });
        const evalData = await evalRes.json();
        if (!evalRes.ok) throw new Error(evalData.error || 'Erro ao avaliar');

        let evalId = null;
        try {
          const saveRes = await fetch('/api/evaluations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            body: JSON.stringify({
              studentName: slot.studentName || 'Aluno',
              type: 'outro',
              score: evalData.score,
              feedback: evalData.feedback,
              criteria: evalData.criteriaScores,
              profileName: profile?.name || '',
              turma: turmaName,
              exerciseName,
              institution: profile?.institution || '',
              disciplina: profile?.discipline || '',
              student_id: slot.studentId || null,
              class_id: selectedClassId || null,
              institution_logo_url: profile?.institutionLogo || '',
            }),
          });
          if (saveRes.ok) { const saved = await saveRes.json(); evalId = saved.id; }
        } catch {}

        updateSlot(slot.id, { result: evalData, evalId, evaluating: false });
      } catch (e) {
        updateSlot(slot.id, { error: e.message, evaluating: false });
      }
    }

    setEvaluating(false);
    setEvalProgress('');
    setShowResults(true);
  }

  function reset() {
    setStep(1); setDescription(''); setExerciseName(''); setExerciseContext('');
    setCriteria([]); setTone('neutro'); setSelectedClassId(''); setStudents([]);
    setSlots([newSlot()]); setShowResults(false); setStepError('');
  }

  const readySlots = slots.filter(s => s.studentId || s.textContent || s.mediaFiles.length > 0);
  const doneSlots = slots.filter(s => s.result);

  const cardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, maxWidth: 700, margin: '0 auto' };
  const btnPrimary = { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' };
  const btnSecondary = { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' };
  const inputStyle = { width: '100%', padding: '9px 11px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 };

  return (
    <AppLayout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '8px 0 40px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Nova Avaliação</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Descreva o exercício e a IA cuida do resto.{' '}
            <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>V2</span>
          </p>
        </div>

        {!showResults && <StepBar current={step} />}

        {/* ── PASSO 1: Descrição ──────────────────────────────────────────── */}
        {step === 1 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 0, marginBottom: 6 }}>Descreva o exercício</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 0, marginBottom: 20 }}>
              Escreva em suas próprias palavras — a IA vai gerar o enunciado e os critérios para você revisar.
            </p>
            <textarea value={description} onChange={e => setDescription(e.target.value)} autoFocus
              placeholder="Ex: Redação sobre os impactos da tecnologia na educação, mínimo 25 linhas, argumentação clara com pelo menos 3 argumentos..."
              rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
            {stepError && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{stepError}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button style={{ ...btnPrimary, opacity: !description.trim() || loadingCriteria ? 0.6 : 1 }}
                onClick={handleGenerateCriteria} disabled={!description.trim() || loadingCriteria}>
                {loadingCriteria ? <><IconSpinner /> Gerando...</> : 'Próximo'}
              </button>
            </div>
          </div>
        )}

        {/* ── PASSO 2: Critérios ──────────────────────────────────────────── */}
        {step === 2 && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 0, marginBottom: 6 }}>Revise e ajuste</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 0, marginBottom: 20 }}>Edite o enunciado e os critérios à vontade.</p>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Nome do exercício</label>
              <input type="text" value={exerciseName} onChange={e => setExerciseName(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Enunciado</label>
              <textarea value={exerciseContext} onChange={e => setExerciseContext(e.target.value)} rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Critérios de avaliação</label>
                <button style={{ ...btnSecondary, padding: '5px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                  onClick={() => setCriteria(prev => [...prev, { name: '', weight: 1 }])}>
                  <IconPlus /> Adicionar
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {criteria.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="text" value={c.name} placeholder="Nome do critério"
                      onChange={e => setCriteria(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                      style={{ ...inputStyle, flex: 1 }} />
                    <select value={c.weight}
                      onChange={e => setCriteria(prev => prev.map((x, j) => j === i ? { ...x, weight: Number(e.target.value) } : x))}
                      style={{ ...inputStyle, width: 90 }}>
                      <option value={1}>Peso 1</option>
                      <option value={2}>Peso 2</option>
                      <option value={3}>Peso 3</option>
                    </select>
                    <button onClick={() => setCriteria(prev => prev.filter((_, j) => j !== i))}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }}>
                      <IconTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button style={btnSecondary} onClick={() => setStep(1)}>Voltar</button>
              <button style={{ ...btnPrimary, opacity: !exerciseName || !criteria.length ? 0.6 : 1 }}
                onClick={() => setStep(3)} disabled={!exerciseName || !criteria.length}>
                Próximo
              </button>
            </div>
          </div>
        )}

        {/* ── PASSO 3: Alunos ─────────────────────────────────────────────── */}
        {step === 3 && !showResults && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 0, marginBottom: 20 }}>Alunos e trabalhos</h2>

            <div style={{ display: 'grid', gridTemplateColumns: profiles.length > 1 ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 20 }}>
              {profiles.length > 1 && (
                <div>
                  <label style={labelStyle}>Perfil do professor</label>
                  <select value={selectedProfileId} onChange={e => setSelectedProfileId(e.target.value)} style={inputStyle}>
                    <option value="">Selecionar perfil...</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label style={labelStyle}>Turma</label>
                <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} style={inputStyle}>
                  <option value="">Selecionar turma...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Tom do feedback</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TONES.map(t => (
                  <button key={t.id} onClick={() => setTone(t.id)} title={t.desc}
                    style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: `1px solid ${tone === t.id ? 'var(--accent)' : 'var(--border)'}`, background: tone === t.id ? 'var(--accent)' : 'transparent', color: tone === t.id ? '#fff' : 'var(--text)', fontWeight: tone === t.id ? 600 : 400, fontFamily: 'inherit' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ ...labelStyle, marginBottom: 12 }}>
                Alunos {selectedClassId && students.length > 0 ? `— ${students.length} na turma` : ''}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {slots.map((slot, i) => (
                  <StudentSlot key={slot.id} slot={slot} index={i} students={students}
                    onChange={patch => updateSlot(slot.id, patch)}
                    onRemove={() => setSlots(prev => prev.filter(s => s.id !== slot.id))}
                    canRemove={slots.length > 1} />
                ))}
              </div>
              <button onClick={() => setSlots(prev => [...prev, newSlot()])}
                style={{ ...btnSecondary, marginTop: 10, width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <IconPlus /> Adicionar aluno
              </button>
            </div>

            {evaluating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>
                <IconSpinner /> {evalProgress}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button style={btnSecondary} onClick={() => setStep(2)} disabled={evaluating}>Voltar</button>
              <button style={{ ...btnPrimary, opacity: evaluating || readySlots.length === 0 ? 0.6 : 1 }}
                onClick={handleEvaluateAll} disabled={evaluating || readySlots.length === 0}>
                {evaluating ? <><IconSpinner /> Avaliando...</> : `Gerar Avaliação${readySlots.length > 1 ? `ões (${readySlots.length})` : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* ── RESULTADOS ─────────────────────────────────────────────────── */}
        {showResults && (
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Resultados</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  {exerciseName} · {doneSlots.length} avaliação{doneSlots.length !== 1 ? 'ões' : ''} concluída{doneSlots.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={btnSecondary} onClick={() => setShowResults(false)}>Adicionar alunos</button>
                <button style={btnPrimary} onClick={reset}>Nova Avaliação</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {slots.filter(s => s.result || s.error).map(slot => (
                <div key={slot.id}>
                  {slot.result
                    ? <ResultCard slot={slot} />
                    : <div style={{ border: '1px solid #fca5a5', borderRadius: 10, padding: '14px 18px', background: '#fef2f2' }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{slot.studentName || 'Aluno'}</span>
                        <span style={{ fontSize: 13, color: '#dc2626', marginLeft: 10 }}>{slot.error}</span>
                      </div>
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
