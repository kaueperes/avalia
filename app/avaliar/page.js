'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TYPES, CATEGORIES, TONES, scoreToGrade, scoreColor } from '@/lib/types';
import AppLayout from '../components/AppLayout';
import Tooltip from '../components/Tooltip';

function token() { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; }

const TYPE_ICONS = {
  modelagem:       <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  animacao:        <polygon points="5 3 19 12 5 21 5 3"/>,
  render:          <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></>,
  iluminacao:      <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
  rigging:         <><path d="M17 10c.7-.7 1.69-.7 2.5 0a1.77 1.77 0 0 1 0 2.5c-.7.7-1.69.7-2.5 0L7 3c-.7-.7-.7-1.69 0-2.5a1.77 1.77 0 0 1 2.5 0c.7.7.7 1.69 0 2.5"/><path d="M7 14c-.7.7-1.69.7-2.5 0a1.77 1.77 0 0 1 0-2.5c.7-.7 1.69-.7 2.5 0L17 21c.7.7.7 1.69 0 2.5a1.77 1.77 0 0 1-2.5 0c-.7-.7-.7-1.69 0-2.5"/></>,
  texturizacao:    <><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></>,
  design_grafico:  <><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></>,
  fotografia:      <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
  ilustracao:      <><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></>,
  storyboard:      <><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></>,
  ux_ui:           <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
  moda:            <><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></>,
  redacao:         <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
  roteiro:         <><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 3H8.5a2.5 2.5 0 0 0 0 5H12"/></>,
  game_design:     <><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></>,
  tcc:             <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
  musica_partitura:<><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
  programacao:     <><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></>,
  web:             <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
  shader:          <><path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3z"/><path d="M5 3v4M19 17v4M3 5h4M17 19h4"/></>,
  arquitetura_img: <><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a8 8 0 0 1 16 0v3"/></>,
  maquete:         <><path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5z"/><path d="m9 9 5 5"/><path d="M14 9h1"/><path d="M14 12h1"/><path d="M14 15h1"/></>,
  produto:         <><path d="m12.89 1.45 8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"/><polyline points="2.32 6.16 12 11 21.68 6.16"/><line x1="12" y1="22.76" x2="12" y2="11"/></>,
};

export default function AvaliarPage() {
  const router = useRouter();
  const studentFileRef = useRef(null);
  const cameraRef = useRef(null);
  const referenceFilesRef = useRef(null);
  const batchFilesRef = useRef(null);
  const extraFilesRef = useRef(null);
  const [userName, setUserName] = useState('Professor');
  const [profiles, setProfiles] = useState([]);
  const [exercises, setExercises] = useState([]);

  // Perfil
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [profName, setProfName] = useState('');
  const [profDisc, setProfDisc] = useState('');
  const [profTurma, setProfTurma] = useState('');
  const [writingSample, setWritingSample] = useState('');

  // Tipo e exercício
  const [activeCat, setActiveCat] = useState('3d');
  const [selectedType, setSelectedType] = useState('modelagem');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseContext, setExerciseContext] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [newCritName, setNewCritName] = useState('');
  const [newCritWeight, setNewCritWeight] = useState(2);

  // Modo de avaliação
  const [evalMode, setEvalMode] = useState('individual');

  // Aluno
  const [tone, setTone] = useState('neutro');
  const [studentName, setStudentName] = useState('');
  const [studentWork, setStudentWork] = useState('');
  const [studentMatricula, setStudentMatricula] = useState('');
  const [studentFile, setStudentFile] = useState(null);
  const [referenceFiles, setReferenceFiles] = useState([]);
  const [batchFiles, setBatchFiles] = useState([]);
  const [filePattern, setFilePattern] = useState('nome_matricula');
  const [dragZone, setDragZone] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);

  // Resultado
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [evalError, setEvalError] = useState('');
  const [saved, setSaved] = useState(false);

  // Cota
  const [quotaCiclo, setQuotaCiclo] = useState(null);
  const [quotaExtra, setQuotaExtra] = useState(null);

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.name) setUserName(u.name);
      setQuotaCiclo(typeof u.quota_ciclo === 'number' ? u.quota_ciclo : null);
      setQuotaExtra(typeof u.quota_extra === 'number' ? u.quota_extra : null);
    } catch {}
    setCriteria((TYPES['modelagem']?.criteria || []).map(c => ({ name: c.name, weight: c.w })));
    Promise.all([
      fetch('/api/profiles', { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/exercises', { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([p, e]) => {
      setProfiles(Array.isArray(p) ? p : []);
      setExercises(Array.isArray(e) ? e : []);
    }).catch(() => {});
  }, [router]);

  function loadProfile(id) {
    setSelectedProfileId(id);
    if (!id) { setProfName(''); setProfDisc(''); setProfTurma(''); setWritingSample(''); setTone('neutro'); return; }
    const p = profiles.find(p => p.id === id);
    if (!p) return;
    setProfName(p.name || '');
    setProfDisc(p.discipline || '');
    setProfTurma(p.turma || '');
    setWritingSample(p.writingSample || '');
    if (p.tone) setTone(p.tone);
  }

  function switchType(type) {
    setSelectedType(type);
    setSelectedExerciseId('');
    setCriteria((TYPES[type]?.criteria || []).map(c => ({ name: c.name, weight: c.w })));
  }

  function loadExercise(id) {
    setSelectedExerciseId(id);
    if (!id) return;
    const ex = exercises.find(e => e.id === id);
    if (!ex) return;
    setSelectedType(ex.type);
    setActiveCat(TYPES[ex.type]?.cat || '3d');
    setExerciseName(ex.name || '');
    setExerciseContext(ex.context || '');
    setCriteria(ex.criteria?.map(c => ({ name: c.name, weight: c.weight || 1 })) || (TYPES[ex.type]?.criteria || []).map(c => ({ name: c.name, weight: c.w })));
  }

  function addCriteria() {
    if (!newCritName.trim()) return;
    setCriteria(prev => [...prev, { name: newCritName.trim(), weight: newCritWeight }]);
    setNewCritName(''); setNewCritWeight(2);
  }

  async function runEvaluation() {
    if (!exerciseName.trim()) return;
    setGenerating(true);
    setEvalError('');
    setResult(null);
    setSaved(false);
    try {
      let workContent = studentWork;
      if (TYPES[selectedType]?.input === 'obj' && studentFile) {
        try { workContent = await studentFile.text(); } catch { workContent = `[Arquivo: ${studentFile.name}]`; }
      }

      // Helper: file → base64
      const toBase64 = (file) => new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result.split(',')[1]);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });

      // Collect all images to send to the AI as vision
      const images = [];
      if (TYPES[selectedType]?.input === 'img' && studentFile && studentFile.type.startsWith('image/')) {
        images.push({ data: await toBase64(studentFile), mediaType: studentFile.type, label: `Trabalho do aluno: ${studentFile.name}` });
      }
      for (const f of referenceFiles) {
        if (f.type.startsWith('image/')) {
          images.push({ data: await toBase64(f), mediaType: f.type, label: `Referência: ${f.name}` });
        }
      }
      for (const f of extraFiles) {
        if (f.type.startsWith('image/')) {
          images.push({ data: await toBase64(f), mediaType: f.type, label: `Arquivo adicional: ${f.name}` });
        } else if (f.type === 'text/plain' || f.name.endsWith('.txt')) {
          try { workContent = (workContent ? workContent + '\n\n' : '') + await f.text(); } catch {}
        }
      }

      const r = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, exerciseName, exerciseContext, criteria, studentName, studentWork: workContent, tone, profName, profDisc, writingSample, images: images.length > 0 ? images : undefined }),
      });
      const data = await r.json();
      if (!r.ok) { setEvalError(data.error || 'Erro ao gerar avaliação.'); return; }
      setResult(data);
      // Decrement quota in localStorage
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (typeof u.quota_ciclo === 'number' && u.quota_ciclo > 0) {
          u.quota_ciclo = u.quota_ciclo - 1;
          setQuotaCiclo(u.quota_ciclo);
        } else if (typeof u.quota_extra === 'number' && u.quota_extra > 0) {
          u.quota_extra = u.quota_extra - 1;
          setQuotaExtra(u.quota_extra);
        }
        localStorage.setItem('user', JSON.stringify(u));
        window.dispatchEvent(new Event('storage'));
      } catch {}
    } catch { setEvalError('Erro de conexão. Tente novamente.'); }
    finally { setGenerating(false); }
  }

  async function saveResult() {
    if (!result || saved) return;
    const r = await fetch('/api/evaluations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: studentName || 'Aluno',
        type: selectedType,
        score: result.score,
        feedback: result.feedback,
        criteria: result.criteriaScores,
        profileName: profName || '',
        turma: profTurma || '',
        exerciseName: exerciseName || '',
      }),
    });
    if (r.ok) setSaved(true);
  }

  function novaAvaliacao() {
    setResult(null); setSaved(false); setEvalError('');
    setStudentName(''); setStudentWork('');
    setStudentMatricula(''); setStudentFile(null); setReferenceFiles([]); setBatchFiles([]);
  }

  const hasQuota = quotaCiclo === null || quotaCiclo > 0 || (quotaExtra !== null && quotaExtra > 0);
  const canEval = exerciseName.trim().length > 0 && hasQuota;
  const sc = result ? scoreColor(result.score) : null;

  const inp = {
    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
    borderRadius: 10, fontSize: 14, outline: 'none', background: 'var(--bg-content)',
    color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box',
  };
  const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 };
  const secLabel = { fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 };
  const section = { padding: '22px 24px', borderBottom: '1px solid var(--border-card)' };

  return (
    <AppLayout userName={userName}>

      {/* Header padrão */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Avaliação</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Nova Avaliação</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Configure as opções e gere um feedback personalizado com IA.</p>
      </div>

      {/* Grid 2 colunas */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 24, alignItems: 'start' }}>

        {/* COLUNA ESQUERDA — Configuração */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 16, overflow: 'hidden' }}>

          {/* 1. PERFIL */}
          <div style={section}>
            <div style={secLabel}><Tooltip text="Selecione um perfil salvo ou preencha manualmente. O perfil define seus dados e critérios padrão.">Perfil do Professor</Tooltip></div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <select style={{ ...inp, flex: 1 }} value={selectedProfileId} onChange={e => loadProfile(e.target.value)}>
                  <option value="">— Selecione um perfil —</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.name} · {p.discipline}</option>)}
                </select>
                <Link href="/perfis" style={{ width: 38, height: 38, border: '1px solid var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textDecoration: 'none', fontSize: 18, background: 'var(--bg-content)', flexShrink: 0 }}>+</Link>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}><Tooltip text="Seu nome completo que aparecerá nos relatórios e PDFs das avaliações.">Nome do Professor</Tooltip></label>
              <input style={inp} value={profName} onChange={e => setProfName(e.target.value)} placeholder="Prof. Dr. Fulano de Tal" />
            </div>
            <div className="form-grid">
              <div>
                <label style={lbl}><Tooltip text="Matéria ou disciplina que você leciona. Ex: Design Gráfico, Animação 3D.">Disciplina</Tooltip></label>
                <input style={inp} value={profDisc} onChange={e => setProfDisc(e.target.value)} placeholder="Design Gráfico" />
              </div>
              <div>
                <label style={lbl}><Tooltip text="Identificação da turma. Ex: Turma A, 3º semestre.">Turma</Tooltip></label>
                <input style={inp} value={profTurma} onChange={e => setProfTurma(e.target.value)} placeholder="Turma B" />
              </div>
            </div>
          </div>

          {/* 2. TIPO */}
          <div style={section}>
            <div style={secLabel}><Tooltip text="Selecione a categoria e o tipo específico do trabalho enviado pelo aluno. Isso define como a IA vai analisar.">Tipo de Trabalho</Tooltip></div>
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 9, overflow: 'hidden', marginBottom: 10 }}>
              {Object.entries(CATEGORIES).map(([catKey, cat]) => (
                <div key={catKey} onClick={() => setActiveCat(catKey)} style={{
                  flex: 1, padding: '8px 4px', fontSize: 13, textAlign: 'center', cursor: 'pointer',
                  background: activeCat === catKey ? 'var(--bg-content)' : 'transparent',
                  color: activeCat === catKey ? '#0081f0' : 'var(--text-sub)',
                  fontWeight: activeCat === catKey ? 700 : 500,
                  borderRight: '1px solid var(--border)',
                }}>
                  {cat.label}
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
              {Object.entries(TYPES).filter(([, v]) => v.cat === activeCat).map(([k, v]) => (
                <div key={k} onClick={() => switchType(k)} style={{
                  padding: '12px 4px', border: `1px solid ${selectedType === k ? '#0081f0' : 'var(--border)'}`,
                  borderRadius: 9, background: selectedType === k ? 'var(--selected-bg)' : 'var(--bg-content)',
                  fontSize: 12, fontWeight: selectedType === k ? 700 : 500,
                  color: selectedType === k ? '#0081f0' : 'var(--text-muted)', cursor: 'pointer', textAlign: 'center', lineHeight: 1.3,
                }}>
                  <div style={{ width: 20, height: 20, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {TYPE_ICONS[k]}
                    </svg>
                  </div>
                  {v.label}
                </div>
              ))}
            </div>
            {TYPES[selectedType] && (
              <div style={{ fontSize: 12, color: 'var(--text-sub)', padding: '8px 10px', background: 'var(--bg-content)', borderRadius: 8, border: '1px solid var(--border)', lineHeight: 1.5 }}>
                {TYPES[selectedType].input === 'obj' && 'Arquivo .obj com análise automática de vértices, faces, quads e n-gons.'}
                {TYPES[selectedType].input === 'img' && 'Imagem do trabalho: render, foto, screenshot ou digitalização.'}
                {TYPES[selectedType].input === 'text' && 'Texto, código ou documento: cole o conteúdo diretamente.'}
              </div>
            )}
          </div>

          {/* 3. EXERCÍCIO */}
          <div style={section}>
            <div style={secLabel}><Tooltip text="Defina o exercício a ser avaliado e os critérios que a IA vai usar para pontuar o trabalho.">Exercício & Critérios</Tooltip></div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <select style={{ ...inp, flex: 1 }} value={selectedExerciseId} onChange={e => loadExercise(e.target.value)}>
                  <option value="">— Exercício livre —</option>
                  {exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <Link href="/exercicios" style={{ width: 38, height: 38, border: '1px solid var(--border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textDecoration: 'none', fontSize: 18, background: 'var(--bg-content)', flexShrink: 0 }}>+</Link>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}><Tooltip text="Nome obrigatório do exercício. Aparece no relatório de avaliação gerado.">Nome do Exercício *</Tooltip></label>
              <input style={inp} value={exerciseName} onChange={e => setExerciseName(e.target.value)} placeholder="Ex: Exercício 3 — Modelagem de Personagem" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}><Tooltip text="Descreva o que foi pedido ao aluno. Quanto mais detalhado, melhor será a avaliação da IA.">Enunciado / Descrição</Tooltip></label>
              <textarea style={{ ...inp, minHeight: 64, resize: 'vertical' }} value={exerciseContext} onChange={e => setExerciseContext(e.target.value)} placeholder="Descreva o objetivo e requisitos do exercício..." />
            </div>
            <div>
              <label style={{ ...lbl, marginBottom: 8 }}><Tooltip text="Cada critério recebe nota de 0 a 10. O peso (×) multiplica a importância do critério na nota final.">Critérios</Tooltip></label>
              {criteria.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 9, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ flex: 1, color: 'var(--text-main)' }}>{c.name}</span>
                  <span style={{ fontSize: 10, background: 'var(--selected-bg)', color: '#0081f0', borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>{c.weight}×</span>
                  <span onClick={() => setCriteria(criteria.filter((_, j) => j !== i))} style={{ color: 'var(--text-sub)', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>×</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <input style={{ ...inp, flex: 1 }} value={newCritName} onChange={e => setNewCritName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCriteria()} placeholder="Novo critério..." />
                <select style={{ ...inp, width: 64 }} value={newCritWeight} onChange={e => setNewCritWeight(Number(e.target.value))}>
                  <option value={1}>1×</option><option value={2}>2×</option><option value={3}>3×</option>
                </select>
                <button onClick={addCriteria} style={{ width: 38, height: 38, border: '1px solid var(--border)', borderRadius: 9, background: 'var(--bg-content)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>+</button>
              </div>
            </div>
          </div>

          {/* 4. MODO */}
          <div style={section}>
            <div style={secLabel}><Tooltip text="Individual: avalia um aluno por vez. Lote: envie vários arquivos e avalie todos de uma só vez.">Modo de Avaliação</Tooltip></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div onClick={() => setEvalMode('individual')} style={{
                padding: '12px 10px', border: `1px solid ${evalMode === 'individual' ? '#0081f0' : 'var(--border)'}`,
                borderRadius: 10, background: evalMode === 'individual' ? 'var(--selected-bg)' : 'var(--bg-content)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={evalMode === 'individual' ? '#0081f0' : 'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: evalMode === 'individual' ? 700 : 500, color: evalMode === 'individual' ? '#0081f0' : 'var(--text-muted)' }}>Individual</div>
                  <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 2 }}>Avalia um aluno por vez</div>
                </div>
              </div>
              <div onClick={() => setEvalMode('lote')} style={{
                padding: '12px 10px', border: `1px solid ${evalMode === 'lote' ? '#0081f0' : 'var(--border)'}`,
                borderRadius: 10, background: evalMode === 'lote' ? 'var(--selected-bg)' : 'var(--bg-content)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={evalMode === 'lote' ? '#0081f0' : 'var(--text-muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: evalMode === 'lote' ? 700 : 500, color: evalMode === 'lote' ? '#0081f0' : 'var(--text-muted)' }}>Lote</div>
                  <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 2 }}>Múltiplos alunos de uma vez</div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. TOM */}
          <div style={section}>
            <div style={secLabel}><Tooltip text="Define o estilo do texto gerado pela IA — do mais técnico e direto ao mais encorajador e didático.">Tom do Feedback</Tooltip></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {TONES.map(t => (
                <div key={t.id} onClick={() => setTone(t.id)} style={{
                  padding: '9px 10px', border: `1px solid ${tone === t.id ? '#0081f0' : 'var(--border)'}`,
                  borderRadius: 9, background: tone === t.id ? 'var(--selected-bg)' : 'var(--bg-content)',
                  fontSize: 12, fontWeight: tone === t.id ? 700 : 500,
                  color: tone === t.id ? '#0081f0' : 'var(--text-muted)', cursor: 'pointer', textAlign: 'center',
                }}>
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {/* 6. ALUNO & ARQUIVO */}
          <div style={section}>
            <div style={secLabel}><Tooltip text="Informe os dados do aluno e envie o arquivo do trabalho para ser avaliado pela IA.">Aluno & Arquivo</Tooltip></div>

            {evalMode === 'individual' ? (
              <>
                {/* Nome do Aluno */}
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}>
                    <Tooltip text="Nome do aluno que aparece no relatório. Pode ser deixado vazio se estiver no nome do arquivo.">Nome do Aluno</Tooltip>
                    {TYPES[selectedType]?.input !== 'text' && (
                      <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-sub)', marginLeft: 6 }}>extraído do arquivo se vazio</span>
                    )}
                  </label>
                  <input style={inp} value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Ex: João Silva — ou deixe vazio" />
                </div>

                {/* Matrícula — só para tipos de arquivo */}
                {TYPES[selectedType]?.input !== 'text' && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={lbl}>
                      <Tooltip text="Número de matrícula do aluno. Opcional — aparece no relatório se preenchido.">Matrícula</Tooltip> <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-sub)' }}>opcional</span>
                    </label>
                    <input style={inp} value={studentMatricula} onChange={e => setStudentMatricula(e.target.value)} placeholder="Ex: 2023001234" />
                  </div>
                )}

                {TYPES[selectedType]?.input === 'text' ? (
                  <>
                    <div>
                      <label style={lbl}><Tooltip text="Cole aqui o trabalho escrito ou código do aluno para a IA analisar e avaliar.">Texto / Código do Aluno</Tooltip></label>
                      <textarea style={{ ...inp, minHeight: 90, resize: 'vertical' }} value={studentWork} onChange={e => setStudentWork(e.target.value)} placeholder="Cole aqui o texto ou código do aluno..." />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <label style={lbl}>
                        <Tooltip text="Envie imagens ou arquivos .txt como contexto adicional. Útil para enviar prints, diagramas ou anexos do trabalho.">Imagens e arquivos adicionais</Tooltip> <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-sub)' }}>opcional</span>
                      </label>
                      <input ref={extraFilesRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,.txt" style={{ display: 'none' }} onChange={e => setExtraFiles(prev => [...prev, ...Array.from(e.target.files)].slice(0, 5))} />
                      {extraFiles.length > 0 ? (
                        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                          {extraFiles.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: i < extraFiles.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 12 }}>
                              <span style={{ flex: 1, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                              <span onClick={() => setExtraFiles(extraFiles.filter((_, j) => j !== i))} style={{ color: 'var(--text-sub)', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>×</span>
                            </div>
                          ))}
                          {extraFiles.length < 5 && (
                            <div onClick={() => extraFilesRef.current?.click()} style={{ padding: '8px 12px', fontSize: 12, color: '#0081f0', cursor: 'pointer', borderTop: '1px solid var(--border)', textAlign: 'center', fontWeight: 500 }}>+ Adicionar mais</div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => extraFilesRef.current?.click()}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#0081f0'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                          style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-content)', transition: 'border-color .15s' }}
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 6px', display: 'block' }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>Clique ou arraste</div>
                          <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>Imagens (JPG, PNG, WEBP) ou texto (.txt) · até 5</div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Drop zone principal */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ ...lbl, marginBottom: 8 }}>
                        <Tooltip text="Envie o arquivo do trabalho do aluno: imagem, render ou arquivo .obj 3D.">Arquivo {TYPES[selectedType]?.input === 'obj' ? '.obj' : ''} do aluno</Tooltip>
                      </label>
                      <input ref={studentFileRef} type="file" accept={TYPES[selectedType]?.input === 'obj' ? '.obj' : 'image/*'} style={{ display: 'none' }} onChange={e => setStudentFile(e.target.files[0] || null)} />
                      {studentFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--selected-bg)', border: '1px solid #0081f033', borderRadius: 10 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0081f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <span style={{ flex: 1, fontSize: 12, color: '#0081f0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{studentFile.name}</span>
                          <span onClick={() => setStudentFile(null)} style={{ color: '#0081f0', cursor: 'pointer', fontSize: 16, opacity: 0.7, lineHeight: 1 }}>×</span>
                        </div>
                      ) : (
                        <div
                          onClick={() => studentFileRef.current?.click()}
                          onMouseEnter={e => { if (dragZone !== 'student') e.currentTarget.style.borderColor = '#0081f0'; }}
                          onMouseLeave={e => { if (dragZone !== 'student') e.currentTarget.style.borderColor = 'var(--border)'; }}
                          onDragOver={e => { e.preventDefault(); setDragZone('student'); }}
                          onDragLeave={() => setDragZone(null)}
                          onDrop={e => { e.preventDefault(); setDragZone(null); const f = e.dataTransfer.files[0]; if (f) setStudentFile(f); }}
                          style={{ border: `2px dashed ${dragZone === 'student' ? '#0081f0' : 'var(--border)'}`, borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer', background: dragZone === 'student' ? 'var(--selected-bg)' : 'var(--bg-content)', transition: 'all .15s' }}
                        >
                          {TYPES[selectedType]?.input === 'obj' ? (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px', display: 'block' }}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                          ) : (
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px', display: 'block' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                          )}
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>Clique ou arraste</div>
                          <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>{TYPES[selectedType]?.input === 'obj' ? '.obj do aluno' : 'imagem do trabalho'}</div>
                        </div>
                      )}

                      {/* Câmera — só para img, aparece em todos os devices mas funciona melhor no mobile */}
                      {TYPES[selectedType]?.input === 'img' && (
                        <>
                          <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => setStudentFile(e.target.files[0] || null)} />
                          <button
                            onClick={() => cameraRef.current?.click()}
                            style={{ width: '100%', marginTop: 8, padding: '9px', border: '1px solid var(--border)', borderRadius: 9, background: 'var(--bg-content)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            Tirar foto com a câmera
                          </button>
                        </>
                      )}
                    </div>

                    {/* Referência para Correção */}
                    <div>
                      <label style={lbl}>
                        <Tooltip text="Envie um gabarito ou imagens de referência. A IA compara com o trabalho do aluno para avaliar melhor.">Referência para Correção</Tooltip> <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-sub)' }}>opcional</span>
                      </label>
                      <div style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: 8, lineHeight: 1.5 }}>
                        Envie o .obj gabarito e/ou imagens de concept (até 4). A IA usa tudo como referência visual e técnica.
                      </div>
                      <input ref={referenceFilesRef} type="file" multiple accept=".obj,image/*" style={{ display: 'none' }} onChange={e => setReferenceFiles(Array.from(e.target.files).slice(0, 4))} />
                      {referenceFiles.length > 0 ? (
                        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                          {referenceFiles.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: i < referenceFiles.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 12 }}>
                              <span style={{ flex: 1, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                              <span onClick={() => setReferenceFiles(referenceFiles.filter((_, j) => j !== i))} style={{ color: 'var(--text-sub)', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>×</span>
                            </div>
                          ))}
                          {referenceFiles.length < 4 && (
                            <div onClick={() => referenceFilesRef.current?.click()} style={{ padding: '8px 12px', fontSize: 12, color: '#0081f0', cursor: 'pointer', borderTop: '1px solid var(--border)', textAlign: 'center', fontWeight: 500 }}>+ Adicionar mais</div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => referenceFilesRef.current?.click()}
                          onMouseEnter={e => { if (dragZone !== 'ref') e.currentTarget.style.borderColor = '#0081f0'; }}
                          onMouseLeave={e => { if (dragZone !== 'ref') e.currentTarget.style.borderColor = 'var(--border)'; }}
                          onDragOver={e => { e.preventDefault(); setDragZone('ref'); }}
                          onDragLeave={() => setDragZone(null)}
                          onDrop={e => { e.preventDefault(); setDragZone(null); setReferenceFiles(Array.from(e.dataTransfer.files).slice(0, 4)); }}
                          style={{ border: `2px dashed ${dragZone === 'ref' ? '#0081f0' : 'var(--border)'}`, borderRadius: 12, padding: '16px', textAlign: 'center', cursor: 'pointer', background: dragZone === 'ref' ? 'var(--selected-bg)' : 'var(--bg-content)', transition: 'all .15s' }}
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 6px', display: 'block' }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 2 }}>Clique ou arraste</div>
                          <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>.obj + imagens de concept</div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Lote */
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={lbl}><Tooltip text="Informe como os arquivos dos alunos estão nomeados. O sistema extrai nome e matrícula automaticamente.">Padrão do nome do arquivo</Tooltip></label>
                  <select style={inp} value={filePattern} onChange={e => setFilePattern(e.target.value)}>
                    <option value="nome_matricula">nome_matricula · ex: joao_silva_2023001.obj</option>
                    <option value="matricula_nome">matricula_nome · ex: 2023001_joao_silva.obj</option>
                    <option value="nome">nome · ex: joao_silva.obj</option>
                  </select>
                  <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 4 }}>Separadores aceitos: _ - · - espaço</div>
                </div>
                <input ref={batchFilesRef} type="file" multiple accept=".obj,image/*,.txt" style={{ display: 'none' }} onChange={e => setBatchFiles(Array.from(e.target.files))} />
                {batchFiles.length > 0 ? (
                  <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ padding: '8px 12px', background: 'var(--bg-content)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{batchFiles.length} arquivo{batchFiles.length > 1 ? 's' : ''}</span>
                      <span onClick={() => setBatchFiles([])} style={{ color: 'var(--text-sub)', cursor: 'pointer', fontSize: 11, fontWeight: 400 }}>Limpar tudo</span>
                    </div>
                    <div style={{ maxHeight: 160, overflowY: 'auto' }}>
                      {batchFiles.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderBottom: i < batchFiles.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 12, color: 'var(--text-main)' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                        </div>
                      ))}
                    </div>
                    <div onClick={() => batchFilesRef.current?.click()} style={{ padding: '8px 12px', fontSize: 12, color: '#0081f0', cursor: 'pointer', borderTop: '1px solid var(--border)', textAlign: 'center', fontWeight: 500 }}>+ Adicionar mais arquivos</div>
                  </div>
                ) : (
                  <div
                    onClick={() => batchFilesRef.current?.click()}
                    onMouseEnter={e => { if (dragZone !== 'batch') e.currentTarget.style.borderColor = '#0081f0'; }}
                    onMouseLeave={e => { if (dragZone !== 'batch') e.currentTarget.style.borderColor = 'var(--border)'; }}
                    onDragOver={e => { e.preventDefault(); setDragZone('batch'); }}
                    onDragLeave={() => setDragZone(null)}
                    onDrop={e => { e.preventDefault(); setDragZone(null); setBatchFiles(Array.from(e.dataTransfer.files)); }}
                    style={{ border: `2px dashed ${dragZone === 'batch' ? '#0081f0' : 'var(--border)'}`, borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: dragZone === 'batch' ? 'var(--selected-bg)' : 'var(--bg-content)', transition: 'all .15s' }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px', display: 'block' }}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Clique ou arraste vários arquivos de uma vez</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>Aceita .obj, imagens e .txt</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* BOTÃO */}
          <div style={{ padding: '20px 24px' }}>
            {evalError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #EF444433', color: '#EF4444', borderRadius: 8, padding: '8px 12px', marginBottom: 10, fontSize: 13 }}>{evalError}</div>
            )}
            <button
              onClick={runEvaluation}
              disabled={!canEval || generating}
              style={{
                width: '100%', padding: '13px', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                background: !canEval || generating ? 'var(--border)' : 'linear-gradient(135deg, #0081f0, #0033ad)',
                color: !canEval || generating ? 'var(--text-sub)' : '#fff',
                cursor: canEval && !generating ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {generating ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  Gerando avaliação...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3z"/></svg>
                  Gerar Avaliação com IA
                </>
              )}
            </button>
            {!hasQuota && (
              <div style={{ background: '#FEF2F2', border: '1px solid #EF444433', color: '#EF4444', borderRadius: 8, padding: '10px 12px', marginTop: 10, fontSize: 13, textAlign: 'center' }}>
                Você não tem avaliações disponíveis. <a href="/conta" style={{ color: '#EF4444', fontWeight: 700, textDecoration: 'underline' }}>Comprar mais</a>
              </div>
            )}
            {!canEval && hasQuota && <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-sub)', marginTop: 8 }}>Preencha o nome do exercício para continuar</p>}
          </div>
        </div>

        {/* COLUNA DIREITA — Resultado */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 16, overflow: 'hidden', minHeight: 480 }}>

          {!result && !generating && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '64px 40px', textAlign: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3z"/></svg>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Nenhuma avaliação gerada</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, lineHeight: 1.7 }}>Configure o perfil, tipo de trabalho e exercício<br/>ao lado e clique em <strong>Gerar Avaliação com IA</strong>.</p>
            </div>
          )}

          {generating && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '64px 40px' }}>
              <div style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTop: '3px solid #0081f0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>A IA está avaliando o trabalho...</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Analisando critérios e gerando feedback personalizado</p>
            </div>
          )}

          {result && !generating && (
            <div style={{ padding: 28 }}>
              {/* Cabeçalho do resultado */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Resultado</p>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>{studentName || 'Aluno'}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {TYPES[selectedType]?.label || selectedType} · {exerciseName}
                    {profTurma ? ` · ${profTurma}` : ''}{profName ? ` · ${profName}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {!saved ? (
                    <button onClick={saveResult} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      Salvar
                    </button>
                  ) : (
                    <span style={{ padding: '9px 18px', background: '#ECFDF5', border: '1px solid #10B98133', color: '#10B981', borderRadius: 9, fontSize: 13, fontWeight: 600 }}>✓ Salvo</span>
                  )}
                  <button onClick={novaAvaliacao} style={{ padding: '9px 16px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-muted)' }}>↺ Nova</button>
                </div>
              </div>

              {/* Score */}
              <div style={{ border: '1px solid var(--border-card)', borderRadius: 14, padding: 24, marginBottom: 16, display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24 }}>
                <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-card)', paddingRight: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 48, lineHeight: 1, fontWeight: 800, color: sc.text }}>{result.score.toFixed(1)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>/ 10</div>
                  <div style={{ marginTop: 10, padding: '3px 14px', borderRadius: 20, fontSize: 14, fontWeight: 800, background: sc.bg, color: sc.text }}>{scoreToGrade(result.score)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                  {(result.criteriaScores || []).map((c, i) => {
                    const cc = scoreColor(c.score || 0);
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 13, color: 'var(--text-main)', flex: 1 }}>{c.name}</div>
                        <div style={{ width: 100, height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
                          <div style={{ width: `${(c.score || 0) * 10}%`, height: '100%', background: cc.text, borderRadius: 99, transition: 'width 0.8s ease' }} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: cc.text, width: 30, textAlign: 'right', flexShrink: 0 }}>{(c.score || 0).toFixed(1)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feedback */}
              <div style={{ border: '1px solid var(--border-card)', borderRadius: 14, padding: 24 }}>
                <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border-card)' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>Feedback</p>
                  <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>Tom: {TONES.find(t => t.id === tone)?.label}{profName ? ` · ${profName}` : ''}</p>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>{result.feedback}</div>
              </div>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
