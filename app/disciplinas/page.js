'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TYPES, scoreColor, scoreToGrade } from '@/lib/types';
import AppLayout from '../components/AppLayout';
import Tooltip from '../components/Tooltip';
import mammoth from 'mammoth';

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1px solid var(--border-input)', borderRadius: 10,
  fontSize: 14, outline: 'none',
  background: 'var(--bg-card)', color: 'var(--text-main)',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

// ── Helpers de upload (modo teste) ────────────────────────────────────────────

function isYoutubeUrl(url) {
  if (!url) return false;
  try { const u = new URL(url); return u.hostname === 'youtu.be' || u.hostname.includes('youtube.com'); }
  catch { return false; }
}

function normalizeYoutubeUrl(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/watch?v=${u.pathname.slice(1)}`;
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/watch?v=${v}`;
      const shorts = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
      if (shorts) return `https://www.youtube.com/watch?v=${shorts[1]}`;
    }
    return null;
  } catch { return null; }
}

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
    if (file.size > 20 * 1024 * 1024) throw new Error(`"${file.name}" ultrapassa 20MB.`);
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

const IconSpinner = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);
const IconYoutube = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
const IconLink = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const IconUpload = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;

// ─────────────────────────────────────────────────────────────────────────────

const BLANK_EXERCISE = { name: '', type: 'redacao', context: '', criteria: [] };

export default function DisciplinasPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Professor');
  const [disciplines, setDisciplines] = useState([]);
  const [exercisesByDisc, setExercisesByDisc] = useState({});
  const [expandedDisc, setExpandedDisc] = useState(null);

  // Form disciplina
  const [formDisc, setFormDisc] = useState({ subject: '' });
  const [editingDiscId, setEditingDiscId] = useState(null);
  const [loadingDisc, setLoadingDisc] = useState(false);

  // Form exercício
  const [exerciseForm, setExerciseForm] = useState(BLANK_EXERCISE);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [loadingExercise, setLoadingExercise] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);

  // AI
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [msg, setMsg] = useState({ text: '', ok: true });

  // Modo teste
  const testFileRef = useRef(null);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testFileUris, setTestFileUris] = useState([]);
  const [testTextContent, setTestTextContent] = useState('');
  const [testFileNames, setTestFileNames] = useState([]);
  const [testLinkUrl, setTestLinkUrl] = useState('');
  const [testLinkInput, setTestLinkInput] = useState('');
  const [testShowLink, setTestShowLink] = useState(false);
  const [testLinkError, setTestLinkError] = useState('');
  const [testProcessing, setTestProcessing] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState('');
  const [quotaTestes, setQuotaTestes] = useState(null);

  function token() { return localStorage.getItem('token'); }
  function flash(text, ok = true) { setMsg({ text, ok }); setTimeout(() => setMsg({ text: '', ok: true }), 3000); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); if (u.name) setUserName(u.name); } catch {}
    loadDisciplines();
  }, [router]);

  async function loadDisciplines() {
    const r = await fetch('/api/disciplines', { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) setDisciplines(await r.json());
  }

  async function loadExercises(disciplineId) {
    const r = await fetch(`/api/exercises?disciplineId=${disciplineId}`, { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) {
      const data = await r.json();
      setExercisesByDisc(prev => ({ ...prev, [disciplineId]: data }));
    }
  }

  async function toggleExpand(disciplineId) {
    if (expandedDisc === disciplineId) { setExpandedDisc(null); setShowExerciseForm(false); return; }
    setExpandedDisc(disciplineId);
    setShowExerciseForm(false);
    setExerciseForm(BLANK_EXERCISE);
    setEditingExerciseId(null);
    if (!exercisesByDisc[disciplineId]) await loadExercises(disciplineId);
  }

  // ── Disciplina CRUD ─────────────────────────────────────────────────────────

  async function saveDisc() {
    if (!formDisc.subject.trim()) { flash('Nome da disciplina é obrigatório', false); return; }
    setLoadingDisc(true);
    try {
      const url = editingDiscId ? `/api/disciplines/${editingDiscId}` : '/api/disciplines';
      const method = editingDiscId ? 'PUT' : 'POST';
      const body = editingDiscId
        ? { subject: formDisc.subject, exerciseName: formDisc.subject, exerciseType: 'redacao' }
        : { subject: formDisc.subject, exerciseName: formDisc.subject, exerciseType: 'redacao' };
      const r = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.ok) {
        const isNew = !editingDiscId;
        const data = await r.json();
        flash(isNew ? 'Disciplina criada! Agora adicione um exercício a ela.' : 'Disciplina atualizada!');
        setFormDisc({ subject: '' }); setEditingDiscId(null);
        await loadDisciplines();
        if (isNew && data?.id) {
          setExpandedDisc(data.id);
          setShowExerciseForm(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        const d = await r.json(); flash(d.error || 'Erro ao salvar', false);
      }
    } finally { setLoadingDisc(false); }
  }

  async function deleteDisc(id) {
    if (!confirm('Excluir esta disciplina? Os exercícios vinculados perderão o vínculo.')) return;
    await fetch(`/api/disciplines/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    if (expandedDisc === id) setExpandedDisc(null);
    await loadDisciplines();
    flash('Disciplina excluída');
  }

  function startEditDisc(d) {
    setFormDisc({ subject: d.subject });
    setEditingDiscId(d.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Exercício CRUD ──────────────────────────────────────────────────────────

  async function saveExercise(disciplineId) {
    if (!exerciseForm.name.trim()) { flash('Nome do exercício é obrigatório', false); return; }
    setLoadingExercise(true);
    try {
      const url = editingExerciseId ? `/api/exercises/${editingExerciseId}` : '/api/exercises';
      const method = editingExerciseId ? 'PUT' : 'POST';
      const r = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...exerciseForm, disciplineId }),
      });
      if (r.ok) {
        flash(editingExerciseId ? 'Exercício atualizado!' : 'Exercício criado!');
        setExerciseForm(BLANK_EXERCISE); setEditingExerciseId(null); setShowExerciseForm(false);
        await loadExercises(disciplineId);
      } else {
        const d = await r.json(); flash(d.error || 'Erro ao salvar', false);
      }
    } finally { setLoadingExercise(false); }
  }

  async function deleteExercise(exerciseId, disciplineId) {
    if (!confirm('Excluir este exercício?')) return;
    await fetch(`/api/exercises/${exerciseId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    await loadExercises(disciplineId);
  }

  function startEditExercise(ex) {
    setExerciseForm({ name: ex.name, type: ex.type, context: ex.context || '', criteria: ex.criteria || [] });
    setEditingExerciseId(ex.id);
    setShowExerciseForm(true);
  }

  async function generateAll() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const r = await fetch('/api/exercises/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseName: exerciseForm.name, disciplinaName: disciplines.find(d => d.id === expandedDisc)?.subject, briefDescription: aiPrompt }),
      });
      const d = await r.json();
      if (d.context || d.criteria) {
        setExerciseForm(f => ({
          ...f,
          context: d.context || f.context,
          criteria: d.criteria?.length ? d.criteria : f.criteria,
        }));
        setShowAiPrompt(false);
        setAiPrompt('');
      }
    } finally { setAiLoading(false); }
  }

  // ── Modo teste ──────────────────────────────────────────────────────────────

  function openTestModal() {
    setTestModalOpen(true);
    setTestFileUris([]);
    setTestTextContent('');
    setTestFileNames([]);
    setTestLinkUrl('');
    setTestLinkInput('');
    setTestShowLink(false);
    setTestLinkError('');
    setTestResult(null);
    setTestError('');
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (typeof u.quota_testes === 'number') setQuotaTestes(u.quota_testes);
    } catch {}
  }

  async function uploadFileToGemini(file, label) {
    const urlRes = await fetch('/api/storage/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ filename: file.name }),
    });
    const urlData = await urlRes.json();
    if (!urlRes.ok) throw new Error(urlData.error || 'Erro ao preparar upload');
    const putRes = await fetch(urlData.signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    if (!putRes.ok) throw new Error('Erro ao enviar arquivo');
    const geminiRes = await fetch('/api/upload-gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ supabasePath: urlData.path, mimeType: file.type, name: file.name, label }),
    });
    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) throw new Error(geminiData.error || 'Erro ao processar arquivo');
    return { fileUri: geminiData.fileUri, mimeType: geminiData.mimeType, label, name: file.name };
  }

  async function handleTestFiles(selectedFiles) {
    setTestProcessing(true);
    setTestError('');
    const fileUris = [], textParts = [], fileNames = [], errors = [];
    for (const file of Array.from(selectedFiles)) {
      const n = file.name.toLowerCase(); const t = file.type;
      const isText = t === 'text/plain' || n.endsWith('.txt')
        || t.includes('wordprocessingml') || n.endsWith('.docx') || n.endsWith('.doc')
        || n.endsWith('.obj');
      try {
        if (isText) {
          const r = await processAnyFile(file);
          fileNames.push(file.name);
          if (r.kind === 'text') textParts.push(r.content);
        } else {
          const result = await uploadFileToGemini(file, 'Trabalho do aluno');
          fileUris.push(result);
          fileNames.push(file.name);
        }
      } catch (e) { errors.push(e.message || 'Erro ao processar arquivo'); }
    }
    setTestFileUris(fileUris);
    setTestTextContent(textParts.join('\n\n'));
    setTestFileNames(fileNames);
    if (errors.length) setTestError(errors.join(' '));
    setTestProcessing(false);
  }

  function handleTestLinkSubmit() {
    const raw = testLinkInput.trim();
    try { new URL(raw); } catch { setTestLinkError('URL inválida. Verifique e tente novamente.'); return; }
    const normalized = normalizeYoutubeUrl(raw);
    setTestLinkUrl(normalized || raw);
    setTestShowLink(false);
    setTestLinkInput('');
    setTestLinkError('');
  }

  async function runTest() {
    const criteriosValidos = exerciseForm.criteria.filter(c => c.name.trim());
    if (!criteriosValidos.length) { setTestError('Adicione pelo menos um critério antes de testar.'); return; }
    if (!testFileUris.length && !testTextContent.trim() && !testLinkUrl) {
      setTestError('Adicione o trabalho do aluno (arquivo, link ou texto).'); return;
    }
    setTestLoading(true);
    setTestError('');
    setTestResult(null);
    try {
      const res = await fetch('/api/evaluate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          exerciseName: exerciseForm.name || 'Teste',
          exerciseContext: exerciseForm.context || undefined,
          criteria: criteriosValidos,
          studentWork: testTextContent || undefined,
          fileUris: testFileUris.length ? testFileUris : undefined,
          linkUrl: testLinkUrl || undefined,
          tone: 'neutro',
        }),
      });
      const data = await res.json();
      if (!res.ok) { setTestError(data.error || 'Erro ao processar o teste.'); return; }
      setTestResult(data);
      if (typeof data.quota_testes_restante === 'number') {
        setQuotaTestes(data.quota_testes_restante);
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          u.quota_testes = data.quota_testes_restante;
          localStorage.setItem('user', JSON.stringify(u));
        } catch {}
      }
    } catch {
      setTestError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setTestLoading(false);
    }
  }

  const hasTestFiles = testFileNames.length > 0 || testTextContent;

  return (
    <AppLayout userName={userName}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Cadastro</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Cadastro de Disciplinas/Exercícios</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Cadastre suas disciplinas e adicione exercícios com critérios personalizados dentro de cada uma.</p>
      </div>

      {msg.text && (
        <div style={{ background: msg.ok ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${msg.ok ? '#10B98133' : '#EF444433'}`, color: msg.ok ? '#10B981' : '#EF4444', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14, fontWeight: 500 }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: disciplines.length > 0 ? '1.4fr 1fr' : '1fr', gap: 24, alignItems: 'start' }}>

        {/* Lista de disciplinas */}
        {disciplines.length > 0 && (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>Disciplinas cadastradas</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {disciplines.map(disc => {
                const isExpanded = expandedDisc === disc.id;
                const exercises = exercisesByDisc[disc.id] || [];

                return (
                  <div key={disc.id} style={{ background: 'var(--bg-card)', border: `1px solid ${editingDiscId === disc.id ? '#0081f0' : 'var(--border-card)'}`, borderRadius: 12, overflow: 'hidden' }}>

                    {/* Cabeçalho da disciplina */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{disc.subject}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                          {exercisesByDisc[disc.id] ? `${exercises.length} exercício${exercises.length !== 1 ? 's' : ''}` : 'Clique para ver exercícios'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                        <button onClick={() => toggleExpand(disc.id)}
                          style={{ padding: '5px 12px', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: isExpanded ? 'rgba(0,129,240,0.12)' : 'linear-gradient(135deg, #0081f0, #0033ad)', color: isExpanded ? '#0081f0' : 'white' }}>
                          {isExpanded ? 'Fechar' : 'Exercícios'}
                        </button>
                        <button onClick={() => startEditDisc(disc)}
                          style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)' }}>
                          Editar
                        </button>
                        <button onClick={() => deleteDisc(disc.id)}
                          style={{ padding: '5px 9px', border: '1px solid #EF444433', borderRadius: 7, cursor: 'pointer', background: 'transparent', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                          <TrashIcon />
                        </button>
                      </div>
                    </div>

                    {/* Painel de exercícios */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-content)' }}>

                        {/* Lista de exercícios */}
                        {exercises.length > 0 && (
                          <div style={{ padding: '12px 20px 0' }}>
                            {exercises.map(ex => (
                              <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-card)', marginBottom: 8 }}>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</p>
                                  <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>{ex.criteria?.length || 0} critérios</p>
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 10 }}>
                                  <button onClick={() => startEditExercise(ex)}
                                    style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)' }}>
                                    Editar
                                  </button>
                                  <button onClick={() => deleteExercise(ex.id, disc.id)}
                                    style={{ padding: '4px 7px', border: '1px solid #EF444433', borderRadius: 6, cursor: 'pointer', background: 'transparent', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                                    <TrashIcon />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Formulário de exercício */}
                        {showExerciseForm ? (
                          <div style={{ padding: '16px 20px', borderTop: exercises.length > 0 ? '1px solid var(--border)' : 'none' }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
                              {editingExerciseId ? 'Editar exercício' : 'Novo exercício'}
                            </p>

                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}><Tooltip text="Nome que identifica o exercício dentro da disciplina. Aparece nos relatórios de avaliação.">Nome do Exercício *</Tooltip></label>
                              <input style={inputStyle} value={exerciseForm.name} onChange={e => setExerciseForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Redação Descritiva, Prova P1..." />
                            </div>

                            {/* Descrição do exercício */}
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>
                                  <Tooltip text="Descreva o objetivo, requisitos e restrições do exercício. Quanto mais detalhado, mais precisa será a avaliação do Kriteria.">Descrição do exercício</Tooltip>
                                </label>
                                <button onClick={() => setShowAiPrompt(v => !v)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', border: '1px solid #0081f033', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'var(--selected-bg)', color: '#0081f0' }}>
                                  Gerar descrição e critérios automaticamente
                                </button>
                              </div>
                              {showAiPrompt && (
                                <div style={{ marginBottom: 8, padding: '10px 12px', background: 'var(--selected-bg)', border: '1px solid #0081f033', borderRadius: 8 }}>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <input style={{ ...inputStyle, flex: 1, fontSize: 13, padding: '7px 10px' }} value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && generateAll()} placeholder="Descreva brevemente o exercício..." autoFocus />
                                    <button onClick={() => generateAll()} disabled={aiLoading || !aiPrompt.trim()}
                                      style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: aiLoading ? 'wait' : 'pointer', opacity: !aiPrompt.trim() ? 0.5 : 1, flexShrink: 0 }}>
                                      {aiLoading ? '...' : 'Gerar'}
                                    </button>
                                  </div>
                                </div>
                              )}
                              <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical', lineHeight: 1.6 }} value={exerciseForm.context} onChange={e => setExerciseForm(f => ({ ...f, context: e.target.value }))} placeholder="Descreva o objetivo e requisitos..." />
                            </div>

                            {/* Critérios */}
                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>
                                <Tooltip text="Cada critério recebe nota de 0 a 10. O peso define a importância na nota final.">Critérios de Avaliação</Tooltip>
                              </label>
                              {exerciseForm.criteria.map((c, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 6 }}>
                                  <span style={{ fontSize: 10, background: '#0081f022', color: '#0081f0', border: '1px solid #0081f033', borderRadius: 4, padding: '1px 5px', fontWeight: 700, flexShrink: 0 }}>{c.weight}×</span>
                                  <input style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, outline: 'none', color: 'var(--text-main)', fontFamily: 'inherit' }} value={c.name} onChange={e => { const cr = [...exerciseForm.criteria]; cr[i] = { ...cr[i], name: e.target.value }; setExerciseForm(f => ({ ...f, criteria: cr })); }} placeholder="Nome do critério" />
                                  <select style={{ width: 54, padding: '3px 4px', fontSize: 11, background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }} value={c.weight} onChange={e => { const cr = [...exerciseForm.criteria]; cr[i] = { ...cr[i], weight: Number(e.target.value) }; setExerciseForm(f => ({ ...f, criteria: cr })); }}>
                                    {[1, 2, 3].map(w => <option key={w} value={w}>{w}×</option>)}
                                  </select>
                                  <button onClick={() => setExerciseForm(f => ({ ...f, criteria: f.criteria.filter((_, j) => j !== i) }))} style={{ border: 'none', background: 'transparent', color: 'var(--text-sub)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px' }}>×</button>
                                </div>
                              ))}
                              <button onClick={() => setExerciseForm(f => ({ ...f, criteria: [...f.criteria, { name: '', weight: 2 }] }))}
                                style={{ padding: '5px 12px', border: '1px dashed var(--border)', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                                + Critério
                              </button>
                            </div>

                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                              <button onClick={() => saveExercise(disc.id)} disabled={loadingExercise}
                                style={{ padding: '9px 20px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: loadingExercise ? 'not-allowed' : 'pointer', opacity: loadingExercise ? 0.6 : 1 }}>
                                {loadingExercise ? 'Salvando...' : editingExerciseId ? 'Salvar alterações' : 'Criar exercício'}
                              </button>
                              <button onClick={openTestModal}
                                title="Teste como a IA avalia com esses critérios (não consome suas cotas)"
                                style={{ padding: '9px 16px', border: '1px solid #0081f0', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#0081f0', fontFamily: 'inherit' }}>
                                🧪 Testar
                              </button>
                              <button onClick={() => { setShowExerciseForm(false); setExerciseForm(BLANK_EXERCISE); setEditingExerciseId(null); setShowAiPrompt(false); }}
                                style={{ padding: '9px 16px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 13, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ padding: '12px 20px 16px' }}>
                            <button onClick={() => { setShowExerciseForm(true); setExerciseForm(BLANK_EXERCISE); setEditingExerciseId(null); }}
                              style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                              + Novo exercício
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Formulário de disciplina */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
            {editingDiscId ? 'Editar disciplina' : 'Nova disciplina'}
          </h2>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '28px 28px' }}>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>Nome da Disciplina *</label>
            <input style={inputStyle} value={formDisc.subject} onChange={e => setFormDisc({ subject: e.target.value })} placeholder="Ex: Português, Matemática, Design Gráfico..." />
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              Após criar a disciplina, clique em <strong>Exercícios</strong> para adicionar atividades com critérios e enunciados.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={saveDisc} disabled={loadingDisc}
              style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loadingDisc ? 'not-allowed' : 'pointer', opacity: loadingDisc ? 0.6 : 1 }}>
              {loadingDisc ? 'Salvando...' : editingDiscId ? 'Salvar alterações' : 'Criar disciplina'}
            </button>
            {editingDiscId && (
              <button onClick={() => { setFormDisc({ subject: '' }); setEditingDiscId(null); }}
                style={{ padding: '11px 20px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* ── Lightbox: Modo Teste ──────────────────────────────────────────────── */}
      {testModalOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setTestModalOpen(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0081f0' }}>🧪 Modo Teste</span>
                  {quotaTestes !== null && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: quotaTestes <= 2 ? '#fef2f2' : '#eff6ff', color: quotaTestes <= 2 ? '#dc2626' : '#0081f0', border: `1px solid ${quotaTestes <= 2 ? '#fca5a5' : '#bfdbfe'}` }}>
                      {quotaTestes}/10 testes restantes este mês
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                  Não consome suas cotas de avaliação · {exerciseForm.name || 'Exercício sem nome'} · {exerciseForm.criteria.filter(c => c.name.trim()).length} critérios
                </p>
              </div>
              <button onClick={() => setTestModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 22, lineHeight: 1, padding: 4 }}>×</button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Upload area */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>Trabalho do aluno (exemplo para testar)</label>
                <div
                  onClick={() => !testProcessing && testFileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleTestFiles(e.dataTransfer.files); }}
                  style={{ border: `1.5px dashed ${hasTestFiles ? '#0081f0' : 'var(--border)'}`, borderRadius: 10, padding: hasTestFiles ? '10px 14px' : '18px 14px', cursor: testProcessing ? 'wait' : 'pointer', background: hasTestFiles ? 'var(--bg-content)' : 'transparent', transition: 'border-color .15s' }}
                >
                  {testProcessing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-sub)', fontSize: 13 }}><IconSpinner /> Processando arquivo...</div>
                  ) : hasTestFiles ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                      {testFileNames.map((name, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: 'var(--text-main)' }}>
                          {fileIcon(name)} {name}
                        </span>
                      ))}
                      <span style={{ fontSize: 12, color: '#0081f0', marginLeft: 4 }}>Clique para trocar</span>
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
                <input ref={testFileRef} type="file" style={{ display: 'none' }} multiple
                  accept="image/*,video/*,audio/*,.pdf,.docx,.doc,.txt,.obj"
                  onChange={e => handleTestFiles(e.target.files)} />

                {/* Link option */}
                {!testLinkUrl && !testShowLink && (
                  <button onClick={() => setTestShowLink(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-sub)', fontSize: 12, fontWeight: 500, padding: '6px 0', fontFamily: 'inherit', marginTop: 4 }}>
                    <IconLink /> Ou cole um link (YouTube, site, portfólio)
                  </button>
                )}
                {testShowLink && (
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input autoFocus placeholder="https://..."
                        value={testLinkInput}
                        onChange={e => { setTestLinkInput(e.target.value); setTestLinkError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleTestLinkSubmit()}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit', outline: 'none' }} />
                      <button onClick={handleTestLinkSubmit} style={{ padding: '8px 14px', background: '#0081f0', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>OK</button>
                      <button onClick={() => { setTestShowLink(false); setTestLinkInput(''); setTestLinkError(''); }} style={{ padding: '8px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)', fontFamily: 'inherit' }}>×</button>
                    </div>
                    {testLinkError && <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}>{testLinkError}</p>}
                  </div>
                )}
                {testLinkUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '7px 10px', background: isYoutubeUrl(testLinkUrl) ? '#fef2f2' : '#eff6ff', border: `1px solid ${isYoutubeUrl(testLinkUrl) ? '#fca5a5' : '#bfdbfe'}`, borderRadius: 8, fontSize: 12 }}>
                    {isYoutubeUrl(testLinkUrl) ? <IconYoutube /> : <IconLink />}
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>{testLinkUrl}</span>
                    <button onClick={() => setTestLinkUrl('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
                  </div>
                )}

                {/* Texto direto */}
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>Ou cole o texto do trabalho diretamente</label>
                  <textarea
                    placeholder="Cole aqui o texto do trabalho do aluno..."
                    value={testTextContent}
                    onChange={e => setTestTextContent(e.target.value)}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, fontSize: 13 }}
                  />
                </div>
              </div>

              {testError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                  {testError}
                </div>
              )}

              <button
                onClick={runTest}
                disabled={testLoading || testProcessing || quotaTestes === 0}
                style={{ padding: '11px 20px', background: testLoading || testProcessing || quotaTestes === 0 ? 'var(--border)' : 'linear-gradient(135deg, #0081f0, #0033ad)', color: testLoading || testProcessing || quotaTestes === 0 ? 'var(--text-muted)' : 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: testLoading || testProcessing || quotaTestes === 0 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {testLoading ? <><IconSpinner /> Avaliando...</> : quotaTestes === 0 ? 'Sem testes disponíveis este mês' : '🧪 Testar agora'}
              </button>

              {/* Resultado */}
              {testResult && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ padding: '6px 14px', borderRadius: 8, fontSize: 20, fontWeight: 800, background: scoreColor(testResult.score).bg, color: scoreColor(testResult.score).text }}>
                      {testResult.score?.toFixed(1)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{scoreToGrade(testResult.score)}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{testResult.criteriaScores?.length} critérios avaliados</div>
                    </div>
                  </div>

                  {testResult.criteriaScores?.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      {testResult.criteriaScores.map((c, i) => {
                        const cc = scoreColor(c.score);
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <div style={{ flex: 1, fontSize: 13, color: 'var(--text-main)' }}>{c.name}</div>
                            <div style={{ width: 80, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: `${(c.score / 10) * 100}%`, height: '100%', background: cc.text, borderRadius: 2 }} />
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: cc.text, minWidth: 30, textAlign: 'right' }}>{c.score?.toFixed(1)}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-sub)', minWidth: 28 }}>×{c.weight}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {testResult.feedback && (
                    <div style={{ background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                      {testResult.feedback}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}
