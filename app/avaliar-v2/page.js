'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
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
  let pos = 0; const len = text.length;
  while (pos < len) {
    const nl = text.indexOf('\n', pos); const end = nl === -1 ? len : nl;
    const t = text.slice(pos, end).trimStart(); pos = end + 1;
    if (t.startsWith('v ')) verts++;
    else if (t.startsWith('vt ')) uvs++;
    else if (t.startsWith('vn ')) normals++;
    else if (t.startsWith('f ')) { const v = t.trim().split(/\s+/).length - 1; if (v === 3) tris++; else if (v === 4) quads++; else if (v >= 5) ngons++; }
    else if (t.startsWith('o ') || t.startsWith('g ')) { const n = t.slice(2).trim(); if (n && n !== 'default') objects.push(n); }
    else if (t.startsWith('usemtl ')) { const n = t.slice(7).trim(); if (n && !materials.includes(n)) materials.push(n); }
  }
  const total = tris + quads + ngons;
  const pct = n => total > 0 ? ` (${((n / total) * 100).toFixed(1)}%)` : '';
  return `=== ${filename} ===\nVértices: ${verts} | UVs: ${uvs} | Normais: ${normals}\nObjetos: ${objects.join(', ') || '(nenhum)'} | Materiais: ${materials.join(', ') || '(nenhum)'}\nFaces: ${total} — Triângulos: ${tris}${pct(tris)} | Quads: ${quads}${pct(quads)} | N-gons: ${ngons}${pct(ngons)}`;
}

async function processAnyFile(file) {
  const name = file.name.toLowerCase(); const type = file.type;
  if (type.startsWith('image/')) return { kind: 'media', data: await compressImage(file), mediaType: 'image/jpeg', label: 'Trabalho do aluno', name: file.name };
  if (type.startsWith('video/') || type.startsWith('audio/')) {
    if (file.size > 20 * 1024 * 1024) throw new Error(`"${file.name}" maior que 20MB.`);
    return { kind: 'media', data: await toBase64(file), mediaType: type, label: 'Trabalho do aluno', name: file.name };
  }
  if (type === 'application/pdf' || name.endsWith('.pdf')) return { kind: 'media', data: await toBase64(file), mediaType: 'application/pdf', label: 'Trabalho do aluno', name: file.name };
  if (name.endsWith('.docx') || type.includes('wordprocessingml')) { const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() }); return { kind: 'text', content: value, name: file.name }; }
  if (name.endsWith('.obj')) { const slice = file.size > 5e6 ? file.slice(0, 5e6) : file; return { kind: 'text', content: summarizeObj(await slice.text(), file.name), name: file.name }; }
  try { return { kind: 'text', content: await file.text(), name: file.name }; }
  catch { return { kind: 'media', data: await toBase64(file), mediaType: type || 'application/octet-stream', label: 'Trabalho do aluno', name: file.name }; }
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
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const IconSpinner = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const IconPDF = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconUpload = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;

// ── Barra de progresso ────────────────────────────────────────────────────────
function StepBar({ current }) {
  const steps = ['Configuração', 'Revisão do Exercício', 'Alunos e arquivos'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
      {steps.map((label, i) => {
        const n = i + 1; const done = current > n; const active = current === n;
        return (
          <div key={n} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done || active ? '#810cfa' : 'var(--bg-card)', border: `2px solid ${done || active ? '#810cfa' : 'var(--border)'}`, color: done || active ? '#fff' : 'var(--text-sub)', fontSize: 12, fontWeight: 700 }}>
                {done ? <IconCheck /> : n}
              </div>
              <span style={{ fontSize: 11, color: active ? '#810cfa' : 'var(--text-sub)', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: done ? '#810cfa' : 'var(--border)', margin: '0 8px', marginBottom: 20 }} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Seletor com botão + ───────────────────────────────────────────────────────
function SelectWithAdd({ label, value, onChange, options, placeholder, href, disabled }) {
  const inp = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, background: disabled ? 'var(--bg-card)' : 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box' };
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <select style={{ ...inp, flex: 1, opacity: disabled ? 0.5 : 1 }} value={value} onChange={e => onChange(e.target.value)} disabled={disabled}>
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Link href={href} style={{ width: 38, height: 38, border: '1px solid var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textDecoration: 'none', fontSize: 18, background: 'var(--bg-content)', flexShrink: 0 }}>+</Link>
      </div>
    </div>
  );
}

// ── Slot de aluno ─────────────────────────────────────────────────────────────
function StudentSlot({ slot, index, students, onChange, onRemove, canRemove }) {
  const fileRef = useRef(null);
  const [processing, setProcessing] = useState(false);

  async function handleFiles(selectedFiles) {
    setProcessing(true);
    const mediaFiles = [], textParts = [], fileNames = [], errors = [];
    for (const file of Array.from(selectedFiles)) {
      try { const r = await processAnyFile(file); fileNames.push(file.name); if (r.kind === 'media') mediaFiles.push(r); else textParts.push(r.content); }
      catch (e) { errors.push(e.message); }
    }
    onChange({ mediaFiles, textContent: textParts.join('\n\n'), fileNames, error: errors.join(' ') });
    setProcessing(false);
  }

  const inp = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box' };
  const hasFiles = slot.fileNames.length > 0 || slot.textContent;

  return (
    <div style={{ background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#810cfa', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 7 }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <select value={slot.studentId}
            onChange={e => { const s = students.find(s => s.id === e.target.value); onChange({ studentId: e.target.value, studentName: s?.name || '' }); }}
            style={inp}>
            <option value="">Selecione o aluno...</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <div onClick={() => !processing && fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            style={{ border: `1.5px dashed ${hasFiles ? '#810cfa' : 'var(--border)'}`, borderRadius: 10, padding: hasFiles ? '10px 14px' : '16px', cursor: processing ? 'wait' : 'pointer', background: hasFiles ? 'var(--bg-card)' : 'transparent' }}>
            {processing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-sub)', fontSize: 13 }}><IconSpinner /> Processando...</div>
            ) : hasFiles ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                {slot.fileNames.map((name, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: 'var(--text-main)' }}>
                    {fileIcon(name)} {name}
                  </span>
                ))}
                <span style={{ fontSize: 12, color: '#810cfa', marginLeft: 4 }}>Clique para trocar</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-sub)' }}>
                <IconUpload />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>Clique ou arraste o trabalho do aluno</div>
                  <div style={{ fontSize: 11, marginTop: 2 }}>Imagem, vídeo, áudio, PDF, DOCX, TXT, OBJ...</div>
                </div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" style={{ display: 'none' }} multiple
            accept="image/*,video/*,audio/*,.pdf,.docx,.doc,.txt,.obj"
            onChange={e => handleFiles(e.target.files)} />

          {slot.error && <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}>{slot.error}</p>}

          {slot.evaluating && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-sub)', fontSize: 13 }}><IconSpinner /> Avaliando...</div>}
          {slot.result && !slot.evaluating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ ...scoreColor(slot.result.score), padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>{slot.result.score?.toFixed(1)} — {scoreToGrade(slot.result.score)}</span>
              {slot.evalId && (
                <button onClick={() => window.open(`/relatorio-individual?id=${slot.evalId}&print=1`, '_blank')}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit' }}>
                  <IconPDF /> Baixar PDF
                </button>
              )}
            </div>
          )}
        </div>
        {canRemove && (
          <button onClick={onRemove} style={{ background: 'transparent', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', padding: 4, marginTop: 6, flexShrink: 0 }}><IconTrash /></button>
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
    <div style={{ border: '1px solid var(--border-card)', borderRadius: 12, overflow: 'hidden' }}>
      <div onClick={() => setExpanded(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', background: 'var(--bg-card)' }}>
        <div style={{ ...col, borderRadius: 8, padding: '5px 12px', fontSize: 16, fontWeight: 800, flexShrink: 0 }}>{slot.result.score?.toFixed(1)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{slot.studentName || 'Aluno'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>{scoreToGrade(slot.result.score)} · {slot.result.criteriaScores?.length} critérios</div>
        </div>
        {slot.evalId && (
          <>
            <button onClick={e => { e.stopPropagation(); window.open(`/relatorio-individual?id=${slot.evalId}&print=1`, '_blank'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', fontWeight: 500, flexShrink: 0 }}>
              <IconPDF /> Baixar PDF
            </button>
            <button onClick={e => { e.stopPropagation(); window.open(`/avaliacoes?edit=${slot.evalId}`, '_blank'); }}
              style={{ padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', fontWeight: 500, flexShrink: 0 }}>
              Editar
            </button>
          </>
        )}
        <span style={{ color: 'var(--text-sub)', fontSize: 11 }}>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div style={{ padding: '18px 20px', borderTop: '1px solid var(--border-card)', background: 'var(--bg-content)' }}>
          {slot.result.criteriaScores?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {slot.result.criteriaScores.map((c, i) => {
                const cc = scoreColor(c.score);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1, fontSize: 13, color: 'var(--text-main)' }}>{c.name}</div>
                    <div style={{ width: 100, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${(c.score / 10) * 100}%`, height: '100%', background: cc.text, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: cc.text, minWidth: 32, textAlign: 'right' }}>{c.score?.toFixed(1)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sub)', minWidth: 36 }}>×{c.weight}</div>
                  </div>
                );
              })}
            </div>
          )}
          {slot.result.feedback && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
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
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseContext, setExerciseContext] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [tone, setTone] = useState('neutro');

  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [profName, setProfName] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
  const [disciplines, setDisciplines] = useState([]);
  const [selectedDisciplineId, setSelectedDisciplineId] = useState('');
  const [disciplineExercises, setDisciplineExercises] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);

  const [slots, setSlots] = useState([newSlot()]);
  const [evaluating, setEvaluating] = useState(false);
  const [evalProgress, setEvalProgress] = useState('');
  const [showResults, setShowResults] = useState(false);
  const abortRef = useRef(null);

  const [refFiles, setRefFiles] = useState([]);
  const [refFileNames, setRefFileNames] = useState([]);
  const [refWeight, setRefWeight] = useState('livre');
  const [refProcessing, setRefProcessing] = useState(false);
  const refInputRef = useRef(null);

  function cancelEvaluation() {
    if (abortRef.current) abortRef.current.abort();
  }

  async function handleRefFiles(selectedFiles) {
    setRefProcessing(true);
    const mediaFiles = [], names = [];
    for (const file of Array.from(selectedFiles)) {
      try {
        const r = await processAnyFile(file);
        names.push(file.name);
        if (r.kind === 'media') mediaFiles.push({ ...r, label: `Referência para Correção: ${file.name}` });
      } catch {}
    }
    setRefFiles(mediaFiles);
    setRefFileNames(names);
    setRefProcessing(false);
  }

  useEffect(() => {
    const h = { Authorization: `Bearer ${token()}` };
    Promise.all([
      fetch('/api/profiles',     { headers: h }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/institutions', { headers: h }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/disciplines',  { headers: h }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/classes',      { headers: h }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([profs, inst, disc, cls]) => {
      setProfiles(profs || []);
      setInstitutions(inst || []);
      setDisciplines(disc || []);
      setClasses(cls || []);
      const def = (profs || []).find(p => p.isDefault) || (profs || [])[0];
      if (def) { setSelectedProfileId(def.id); setProfName(def.name || ''); if (def.tone) setTone(def.tone); }
    });
  }, []);

  async function loadDisciplinesForInstitution(institutionId) {
    setSelectedInstitutionId(institutionId);
    setSelectedDisciplineId(''); setDisciplineExercises([]); setSelectedExerciseId('');
    setExerciseName(''); setExerciseContext(''); setCriteria([]);
    const url = institutionId ? `/api/disciplines?institutionId=${institutionId}` : '/api/disciplines';
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) setDisciplines(await r.json());
  }

  async function loadDiscipline(id) {
    setSelectedDisciplineId(id); setDisciplineExercises([]); setSelectedExerciseId('');
    setExerciseName(''); setExerciseContext(''); setCriteria([]);
    if (!id) return;
    const r = await fetch(`/api/exercises?disciplineId=${id}`, { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) setDisciplineExercises(await r.json());
  }

  function loadExercise(id) {
    setSelectedExerciseId(id);
    if (!id) { setExerciseName(''); setExerciseContext(''); setCriteria([]); return; }
    const ex = disciplineExercises.find(e => e.id === id);
    if (!ex) return;
    setExerciseName(ex.name || '');
    setExerciseContext(ex.context || '');
    if (ex.criteria?.length) setCriteria(ex.criteria.map(c => ({ name: c.name, weight: c.weight || 1 })));
  }

  async function loadClass(classId) {
    setSelectedClassId(classId);
    if (!classId) { setStudents([]); return; }
    const r = await fetch(`/api/students?classId=${classId}`, { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) setStudents(await r.json());
  }

  function loadProfile(id) {
    setSelectedProfileId(id);
    const p = profiles.find(p => p.id === id);
    if (!p) { setProfName(''); return; }
    setProfName(p.name || '');
    if (p.tone) setTone(p.tone);
  }

  function updateSlot(id, patch) { setSlots(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s)); }

  async function handleEvaluateAll() {
    const validSlots = slots.filter(s => s.studentId || s.textContent || s.mediaFiles.length > 0);
    if (!validSlots.length) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setEvaluating(true); setShowResults(false);
    const profile = profiles.find(p => p.id === selectedProfileId);
    const turmaName = classes.find(c => c.id === selectedClassId)?.name || '';
    const institutionObj = institutions.find(i => i.id === selectedInstitutionId);

    for (let i = 0; i < slots.length; i++) {
      if (controller.signal.aborted) break;
      const slot = slots[i];
      if (!slot.studentId && !slot.textContent && slot.mediaFiles.length === 0) continue;
      setEvalProgress(`Avaliando ${slot.studentName || `Aluno ${i + 1}`} (${i + 1} de ${validSlots.length})...`);
      updateSlot(slot.id, { evaluating: true, error: '', result: null, evalId: null });
      try {
        const evalRes = await fetch('/api/evaluate', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
          body: JSON.stringify({
            type: 'outro', exerciseName, exerciseContext, criteria,
            studentName: slot.studentName,
            studentWork: slot.textContent || undefined,
            tone, profName: profile?.name || '',
            profDisc: profile?.discipline || '',
            writingSample: profile?.writingSample || undefined,
            images: (slot.mediaFiles.length > 0 || refFiles.length > 0) ? [...slot.mediaFiles, ...refFiles] : undefined,
            referenceWeight: refFiles.length > 0 ? refWeight : undefined,
          }),
        });
        const evalData = await evalRes.json();
        if (!evalRes.ok) throw new Error(evalData.error || 'Erro ao avaliar');

        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          if (typeof u.quota_ciclo === 'number' && u.quota_ciclo > 0) u.quota_ciclo -= 1;
          else if (typeof u.quota_extra === 'number' && u.quota_extra > 0) u.quota_extra -= 1;
          localStorage.setItem('user', JSON.stringify(u));
          window.dispatchEvent(new Event('storage'));
        } catch {}

        let evalId = null;
        try {
          const saveRes = await fetch('/api/evaluations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
            body: JSON.stringify({
              studentName: slot.studentName || 'Aluno', type: 'outro',
              score: evalData.score, feedback: evalData.feedback,
              criteria: evalData.criteriaScores, profileName: profile?.name || '',
              turma: turmaName, exerciseName,
              institution: institutionObj?.name || profile?.institution || '',
              disciplina: disciplines.find(d => d.id === selectedDisciplineId)?.subject || profile?.discipline || '',
              student_id: slot.studentId || null, class_id: selectedClassId || null,
              institution_logo_url: institutionObj?.logoUrl || profile?.institutionLogo || '',
            }),
          });
          if (saveRes.ok) { const saved = await saveRes.json(); evalId = saved.id; }
        } catch {}
        updateSlot(slot.id, { result: evalData, evalId, evaluating: false });
      } catch (e) {
        if (e.name === 'AbortError') { updateSlot(slot.id, { evaluating: false }); break; }
        updateSlot(slot.id, { error: e.message, evaluating: false });
      }
    }
    setEvaluating(false); setEvalProgress('');
    const hasDone = slots.some(s => s.result);
    if (hasDone) setShowResults(true);
  }

  function reset() {
    setStep(1); setExerciseName(''); setExerciseContext(''); setCriteria([]);
    setSelectedExerciseId(''); setSelectedDisciplineId(''); setDisciplineExercises([]);
    setSelectedClassId(''); setStudents([]); setSlots([newSlot()]); setShowResults(false);
    setRefFiles([]); setRefFileNames([]); setRefWeight('livre');
  }

  const canGoToStep2 = !!selectedExerciseId;
  const readySlots = slots.filter(s => s.studentId || s.textContent || s.mediaFiles.length > 0);
  const doneSlots = slots.filter(s => s.result);

  // Design system
  const secLabel = { fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 };
  const section = { padding: '20px 24px', borderBottom: '1px solid var(--border-card)' };
  const sectionLast = { padding: '20px 24px' };
  const inp = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 };
  const btnPrimary = { background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' };
  const btnSecondary = { background: 'transparent', color: 'var(--text-sub)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 20px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' };
  const card = { background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 16, overflow: 'hidden' };

  return (
    <AppLayout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Avaliação</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>Nova Avaliação</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 }}>
          Selecione o exercício, adicione os trabalhos e gere as avaliações.{' '}
          <span style={{ background: '#810cfa', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10 }}>V2</span>
        </p>
      </div>

      <div style={{ maxWidth: 680 }}>
        {!showResults && <StepBar current={step} />}

        {/* ── PASSO 1: Configuração ────────────────────────────────────── */}
        {step === 1 && (
          <div style={card}>
            {/* Perfil */}
            <div style={section}>
              <div style={secLabel}>Perfil do Professor</div>
              {profName ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-content)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{profName}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-sub)', marginLeft: 8 }}>· {TONES.find(t => t.id === tone)?.label || 'Neutro'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {profiles.length > 1 && (
                      <select value={selectedProfileId} onChange={e => loadProfile(e.target.value)}
                        style={{ ...inp, width: 'auto', padding: '4px 8px', fontSize: 12 }}>
                        {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    )}
                    <Link href="/perfis" style={{ fontSize: 12, color: '#0081f0', textDecoration: 'none', fontWeight: 500 }}>Editar perfil</Link>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '10px 14px', background: '#FEF9EC', border: '1px solid #F59E0B33', borderRadius: 10 }}>
                  <span style={{ fontSize: 13, color: '#92400E' }}>Nenhum perfil configurado. </span>
                  <Link href="/perfis" style={{ fontSize: 13, color: '#0081f0', fontWeight: 600, textDecoration: 'none' }}>Criar perfil →</Link>
                </div>
              )}
            </div>

            {/* Configuração */}
            <div style={section}>
              <div style={secLabel}>Configuração da Avaliação</div>

              <SelectWithAdd label="Instituição" value={selectedInstitutionId}
                onChange={loadDisciplinesForInstitution}
                options={institutions.map(i => ({ value: i.id, label: i.name }))}
                placeholder="Selecione uma instituição" href="/instituicao" />

              <SelectWithAdd label="Disciplina" value={selectedDisciplineId}
                onChange={loadDiscipline}
                options={disciplines.map(d => ({ value: d.id, label: d.subject }))}
                placeholder="Selecione uma disciplina" href="/disciplinas" />

              <SelectWithAdd label="Exercício" value={selectedExerciseId}
                onChange={loadExercise}
                options={disciplineExercises.map(e => ({ value: e.id, label: e.name }))}
                placeholder={selectedDisciplineId ? 'Selecione um exercício' : 'Selecione uma disciplina primeiro'}
                href="/disciplinas" disabled={!selectedDisciplineId} />

              <SelectWithAdd label="Turma" value={selectedClassId}
                onChange={loadClass}
                options={classes.map(c => ({ value: c.id, label: c.name }))}
                placeholder="Selecione uma turma" href="/turmas" />
            </div>

            {/* Tom */}
            <div style={section}>
              <div style={secLabel}>Tom do Feedback</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TONES.map(t => (
                  <button key={t.id} onClick={() => setTone(t.id)} title={t.desc}
                    style={{ padding: '7px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: `1px solid ${tone === t.id ? '#810cfa' : 'var(--border)'}`, background: tone === t.id ? '#810cfa' : 'var(--bg-content)', color: tone === t.id ? '#fff' : 'var(--text-main)', fontWeight: tone === t.id ? 700 : 400, fontFamily: 'inherit' }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...sectionLast, display: 'flex', justifyContent: 'flex-end' }}>
              {!canGoToStep2 && (
                <p style={{ fontSize: 13, color: 'var(--text-sub)', marginRight: 'auto', alignSelf: 'center' }}>
                  Selecione um exercício para continuar
                </p>
              )}
              <button style={{ ...btnPrimary, opacity: !canGoToStep2 ? 0.5 : 1 }}
                onClick={() => canGoToStep2 && setStep(2)} disabled={!canGoToStep2}>
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* ── PASSO 2: Exercício ───────────────────────────────────────── */}
        {step === 2 && (
          <div style={card}>
            <div style={section}>
              <div style={secLabel}>Passo 2 — Revisão do Exercício</div>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Nome do exercício</label>
                <input type="text" value={exerciseName} onChange={e => setExerciseName(e.target.value)} style={inp} />
              </div>
              <div>
                <label style={lbl}>Descrição do exercício</label>
                <textarea value={exerciseContext} onChange={e => setExerciseContext(e.target.value)} rows={5}
                  style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
              </div>
            </div>

            <div style={section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={secLabel}>Critérios de Avaliação</div>
                <button style={{ background: 'transparent', color: 'var(--text-sub)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit' }}
                  onClick={() => setCriteria(prev => [...prev, { name: '', weight: 1 }])}>
                  <IconPlus /> Adicionar
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {criteria.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}>
                    <span style={{ fontSize: 10, background: '#0081f022', color: '#0081f0', border: '1px solid #0081f033', borderRadius: 4, padding: '1px 5px', fontWeight: 700, flexShrink: 0 }}>{c.weight}×</span>
                    <input type="text" value={c.name} placeholder="Nome do critério"
                      onChange={e => setCriteria(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                      style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, outline: 'none', color: 'var(--text-main)', fontFamily: 'inherit' }} />
                    <select value={c.weight}
                      onChange={e => setCriteria(prev => prev.map((x, j) => j === i ? { ...x, weight: Number(e.target.value) } : x))}
                      style={{ width: 54, padding: '3px 4px', fontSize: 11, background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}>
                      {[1, 2, 3].map(w => <option key={w} value={w}>{w}×</option>)}
                    </select>
                    <button onClick={() => setCriteria(prev => prev.filter((_, j) => j !== i))}
                      style={{ border: 'none', background: 'transparent', color: 'var(--text-sub)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px' }}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...sectionLast, display: 'flex', justifyContent: 'space-between' }}>
              <button style={btnSecondary} onClick={() => setStep(1)}>← Voltar</button>
              <button style={{ ...btnPrimary, opacity: !exerciseName || !criteria.length ? 0.6 : 1 }}
                onClick={() => setStep(3)} disabled={!exerciseName || !criteria.length}>
                Próximo →
              </button>
            </div>
          </div>
        )}

        {/* ── PASSO 3: Alunos ─────────────────────────────────────────── */}
        {step === 3 && !showResults && (
          <div style={card}>
            {/* Materiais de Referência */}
            <div style={section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={secLabel}>
                  Materiais de Referência
                  <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>— opcional · aplicado a todos os alunos</span>
                </div>
              </div>
              <div
                onClick={() => !refProcessing && refInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleRefFiles(e.dataTransfer.files); }}
                style={{ border: `1.5px dashed ${refFiles.length > 0 ? '#810cfa' : 'var(--border)'}`, borderRadius: 10, padding: refFiles.length > 0 ? '10px 14px' : '16px', cursor: refProcessing ? 'wait' : 'pointer', background: refFiles.length > 0 ? 'var(--bg-card)' : 'transparent' }}>
                {refProcessing ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-sub)', fontSize: 13 }}><IconSpinner /> Processando...</div>
                ) : refFiles.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                    {refFileNames.map((name, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: 'var(--text-main)' }}>
                        {fileIcon(name)} {name}
                      </span>
                    ))}
                    <button onClick={e => { e.stopPropagation(); setRefFiles([]); setRefFileNames([]); }}
                      style={{ fontSize: 11, color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 4, fontFamily: 'inherit' }}>
                      Remover
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-sub)' }}>
                    <IconUpload />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-main)' }}>Gabarito, concept ou referências visuais</div>
                      <div style={{ fontSize: 11, marginTop: 2 }}>Imagem, PDF — usado como contexto de correção para toda a turma</div>
                    </div>
                  </div>
                )}
              </div>
              <input ref={refInputRef} type="file" style={{ display: 'none' }} multiple
                accept="image/*,.pdf"
                onChange={e => handleRefFiles(e.target.files)} />
              {refFiles.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <label style={{ ...lbl, marginBottom: 6 }}>Peso na correção</label>
                  <select style={inp} value={refWeight} onChange={e => setRefWeight(e.target.value)}>
                    <option value="livre">Referência livre — apenas orientação, valorize a criatividade</option>
                    <option value="parcial">Parcial — considere o gabarito, mas aceite variações</option>
                    <option value="estrito">Estrito — o aluno deve seguir o gabarito de perto</option>
                  </select>
                </div>
              )}
            </div>

            <div style={section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={secLabel}>Alunos {selectedClassId && students.length > 0 ? `— ${students.length} na turma` : ''}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {slots.map((slot, i) => (
                  <StudentSlot key={slot.id} slot={slot} index={i} students={students}
                    onChange={patch => updateSlot(slot.id, patch)}
                    onRemove={() => setSlots(prev => prev.filter(s => s.id !== slot.id))}
                    canRemove={slots.length > 1} />
                ))}
              </div>
              <button onClick={() => setSlots(prev => [...prev, newSlot()])}
                style={{ ...btnSecondary, marginTop: 10, width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, borderRadius: 10 }}>
                <IconPlus /> Adicionar aluno
              </button>
            </div>

            {evaluating && (
              <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-sub)', fontSize: 13 }}>
                  <IconSpinner /> {evalProgress}
                </div>
                <button onClick={cancelEvaluation}
                  style={{ padding: '5px 14px', border: '1px solid #ef444455', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#ef4444', fontFamily: 'inherit' }}>
                  Cancelar
                </button>
              </div>
            )}

            <div style={{ ...sectionLast, display: 'flex', justifyContent: 'space-between' }}>
              <button style={btnSecondary} onClick={() => setStep(2)} disabled={evaluating}>← Voltar</button>
              <button style={{ ...btnPrimary, opacity: evaluating || readySlots.length === 0 ? 0.6 : 1 }}
                onClick={handleEvaluateAll} disabled={evaluating || readySlots.length === 0}>
                {evaluating ? <><IconSpinner /> Avaliando...</> : readySlots.length > 1 ? `Gerar Avaliações (${readySlots.length})` : 'Gerar Avaliação'}
              </button>
            </div>
          </div>
        )}

        {/* ── RESULTADOS ─────────────────────────────────────────────── */}
        {showResults && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.3px' }}>Resultados</h2>
                <p style={{ fontSize: 14, color: 'var(--text-sub)', margin: '4px 0 0' }}>
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
                  {slot.result ? <ResultCard slot={slot} /> : (
                    <div style={{ border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 20px', background: '#fef2f2' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{slot.studentName || 'Aluno'}</span>
                      <span style={{ fontSize: 13, color: '#dc2626', marginLeft: 10 }}>{slot.error}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
