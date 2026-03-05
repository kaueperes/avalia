'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TYPES, CATEGORIES, TONES, scoreToGrade, scoreColor } from '@/lib/types';
import AppHeader from '@/components/AppHeader';

const TYPE_ICONS = {
  modelagem:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  animacao:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  render:          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
  iluminacao:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  rigging:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 10c.7-.7 1.69-.7 2.5 0a1.77 1.77 0 0 1 0 2.5c-.7.7-1.69.7-2.5 0L7 3c-.7-.7-.7-1.69 0-2.5a1.77 1.77 0 0 1 2.5 0c.7.7.7 1.69 0 2.5"/><path d="M7 14c-.7.7-1.69.7-2.5 0a1.77 1.77 0 0 1 0-2.5c.7-.7 1.69-.7 2.5 0L17 21c.7.7.7 1.69 0 2.5a1.77 1.77 0 0 1-2.5 0c-.7-.7-.7-1.69 0-2.5"/></svg>,
  texturizacao:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
  design_grafico:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>,
  fotografia:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  ilustracao:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  storyboard:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>,
  ux_ui:           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  moda:            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  redacao:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  roteiro:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 3H8.5a2.5 2.5 0 0 0 0 5H12"/></svg>,
  game_design:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>,
  tcc:             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  musica_partitura:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  programacao:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>,
  web:             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  shader:          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3z"/><path d="M5 3v4M19 17v4M3 5h4M17 19h4"/></svg>,
  arquitetura_img: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a8 8 0 0 1 16 0v3"/></svg>,
  maquete:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5z"/><path d="m9 9 5 5"/><path d="M14 9h1"/><path d="M14 12h1"/><path d="M14 15h1"/></svg>,
  produto:         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.89 1.45 8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"/><polyline points="2.32 6.16 12 11 21.68 6.16"/><line x1="12" y1="22.76" x2="12" y2="11"/></svg>,
};

function token() { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; }

function generateMockEvaluation(type, tone, criteria, studentName) {
  const typeInfo = TYPES[type] || {};
  const criteriaScores = criteria.map(c => ({
    ...c,
    score: Math.round((5.5 + Math.random() * 4) * 10) / 10,
  }));
  const totalWeight = criteriaScores.reduce((s, c) => s + (c.weight || 1), 0);
  const weightedSum = criteriaScores.reduce((s, c) => s + c.score * (c.weight || 1), 0);
  const score = Math.round((weightedSum / totalWeight) * 10) / 10;
  const grade = scoreToGrade(score);
  const strong = criteriaScores.filter(c => c.score >= 7).map(c => c.name);
  const weak = criteriaScores.filter(c => c.score < 6).map(c => c.name);

  const feedbackMap = {
    neutro:      `O trabalho de ${studentName} em ${typeInfo.label || type} apresenta resultado ${score >= 7 ? 'satisfatório' : 'regular'}, com nota ${score}/10 (conceito ${grade}).${strong.length ? ` Pontos fortes: ${strong.join(', ')}.` : ''}${weak.length ? ` Áreas de melhoria: ${weak.join(', ')}.` : ''}`,
    construtivo: `${studentName} demonstrou ${score >= 7 ? 'boa evolução' : 'esforço visível'} neste trabalho de ${typeInfo.label || type}. Nota: ${score}/10 (${grade}).${strong.length ? ` Destaque positivo: ${strong.join(', ')}.` : ''} Para os próximos trabalhos, foque em: ${weak.length ? weak.join(', ') : 'manter a qualidade e aprofundar os detalhes'}. Continue evoluindo!`,
    encorajador: `Parabéns, ${studentName}! Este trabalho mostra ${score >= 7 ? 'um ótimo resultado' : 'que você está no caminho certo'}. Nota ${score}/10 — ${score >= 7 ? 'excelente!' : 'você consegue ir ainda mais longe!'}${strong.length ? ` Você arrasou em: ${strong.join(', ')}.` : ''} ${weak.length ? `Nas próximas tentativas, dê atenção a ${weak.join(' e ')}.` : 'Continue assim!'} Seu potencial é visível!`,
    rigoroso:    `Avaliação de ${typeInfo.label || type} — ${studentName}. Nota: ${score}/10 (${grade}). ${score >= 7 ? 'Atende aos critérios estabelecidos.' : 'Não atinge o padrão mínimo esperado.'}${strong.length ? ` Satisfatório: ${strong.join('; ')}.` : ''}${weak.length ? ` Insatisfatório: ${weak.join('; ')}. Exige revisão imediata.` : ''} Expectativa mínima para reentrega: 7,0.`,
    didatico:    `Vamos analisar o trabalho de ${studentName} em ${typeInfo.label || type}:\n\nNota final: ${score}/10 (${grade}).\n${strong.length ? `\n✓ O que foi bem: ${strong.join(', ')} — demonstra compreensão sólida.` : ''}\n${weak.length ? `\n✗ O que precisa melhorar: ${weak.join(', ')} — revise os fundamentos e pratique exercícios específicos.` : ''}\n\nDica: ${weak.length ? `Foque em "${weak[0]}" — é fundamental para essa área.` : 'Mantenha a consistência e aprofunde seus conhecimentos.'}`,
    informal:    `E aí, ${studentName}! Olhei seu trabalho de ${typeInfo.label || type} e a nota ficou ${score}/10, conceito ${grade}.${strong.length ? ` Maneiro demais: ${strong.join(', ')}.` : ''} ${weak.length ? `Mas precisa dar uma reforçada em ${weak.join(' e ')}, tá?` : 'Tudo certo por aqui!'} ${score >= 7 ? 'Bom trabalho!' : 'Na próxima vai! Vai praticando.'}`,
    formal:      `PARECER DE AVALIAÇÃO — ${typeInfo.label?.toUpperCase() || type.toUpperCase()}\n\nDiscente: ${studentName}\nNota: ${score}/10 | Conceito: ${grade}\n\n${score >= 7 ? 'O trabalho atende aos requisitos curriculares.' : 'O trabalho requer atenção aos requisitos curriculares.'}${strong.length ? ` Aspectos de destaque: ${strong.join('; ')}.` : ''}${weak.length ? ` Aspectos a aprimorar: ${weak.join('; ')}.` : ''}`,
  };

  return { score, grade, criteriaScores, feedback: feedbackMap[tone] || feedbackMap.neutro };
}

export default function AvaliarPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [exercises, setExercises] = useState([]);

  const [profName, setProfName] = useState('');
  const [profDisc, setProfDisc] = useState('');
  const [profTurma, setProfTurma] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');

  const [activeCat, setActiveCat] = useState('3d');
  const [selectedType, setSelectedType] = useState('modelagem');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseContext, setExerciseContext] = useState('');
  const [criteria, setCriteria] = useState([]);
  const [newCritName, setNewCritName] = useState('');
  const [newCritWeight, setNewCritWeight] = useState(2);

  const [tone, setTone] = useState('neutro');
  const [studentName, setStudentName] = useState('');
  const [studentWork, setStudentWork] = useState('');

  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const HEADER_H = 64;

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    Promise.all([
      fetch('/api/profiles', { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.ok ? r.json() : []),
      fetch('/api/exercises', { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.ok ? r.json() : []),
    ]).then(([p, e]) => {
      setProfiles(p);
      setExercises(e);
      // init criteria for default type
      const def = (TYPES['modelagem']?.criteria || []).map(c => ({ name: c.name, weight: c.w }));
      setCriteria(def);
    });
  }, [router]);

  function loadProfile(id) {
    setSelectedProfileId(id);
    if (!id) { setProfName(''); setProfDisc(''); setProfTurma(''); setTone('neutro'); return; }
    const p = profiles.find(p => p.id === id);
    if (!p) return;
    setProfName(p.name || '');
    setProfDisc(p.discipline || '');
    setProfTurma(p.class || '');
    if (p.tone) setTone(p.tone);
  }

  function switchType(type) {
    setSelectedType(type);
    setSelectedExerciseId('');
    const def = (TYPES[type]?.criteria || []).map(c => ({ name: c.name, weight: c.w }));
    setCriteria(def);
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
    setNewCritName('');
    setNewCritWeight(2);
  }

  async function runEvaluation() {
    if (!exerciseName.trim()) return;
    setGenerating(true);
    setSaved(false);
    await new Promise(r => setTimeout(r, 1400));
    const res = generateMockEvaluation(selectedType, tone, criteria, studentName || 'Aluno');
    setResult(res);
    setGenerating(false);
  }

  async function saveResult() {
    if (!result || saved) return;
    const body = {
      studentName: studentName || 'Aluno',
      type: TYPES[selectedType]?.label || selectedType,
      score: result.score,
      feedback: result.feedback,
      criteria: result.criteriaScores,
      profileName: profName || '',
    };
    const r = await fetch('/api/evaluations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (r.ok) setSaved(true);
  }

  function novaAvaliacao() {
    setResult(null);
    setSaved(false);
    setStudentName('');
    setStudentWork('');
  }

  const canEval = exerciseName.trim().length > 0;
  const sc = result ? scoreColor(result.score) : null;

  const inp = {
    width: '100%', padding: '9px 10px', border: '1px solid var(--border, #dddbd6)',
    borderRadius: 10, fontSize: 14, outline: 'none', background: '#f0eeea',
    fontFamily: 'Inter, sans-serif', color: '#1a1814', boxSizing: 'border-box',
  };

  const secLabel = {
    fontSize: 20, fontWeight: 700, color: '#1a1814', marginBottom: 20,
    display: 'flex', alignItems: 'center', gap: 12, letterSpacing: '-0.3px',
  };

  const configSection = {
    padding: '28px 30px', borderBottom: '1px solid #dddbd6',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'Inter, sans-serif' }}>
      <AppHeader active="/avaliar" />

      {/* APP LAYOUT */}
      <div style={{ display: 'flex' }}>

        {/* SIDEBAR */}
        <aside style={{
          width: 420, flexShrink: 0, borderRight: '1px solid #dddbd6', background: '#fff',
          display: 'flex', flexDirection: 'column',
          height: `calc(100vh - ${HEADER_H}px)`, overflowY: 'auto',
          position: 'sticky', top: HEADER_H,
        }}>

          {/* 1. PERFIL DO PROFESSOR */}
          <div style={configSection}>
            <div style={secLabel}>
              Perfil do Professor
              <span style={{ flex: 1, height: 1, background: '#dddbd6', opacity: 0.6 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#4a4740', marginBottom: 8 }}>Perfil salvo</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select style={{ ...inp, flex: 1 }} value={selectedProfileId} onChange={e => loadProfile(e.target.value)}>
                  <option value="">— Sem perfil —</option>
                  {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <Link href="/perfis" style={{ width: 40, height: 38, border: '1px solid #dddbd6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a4740', textDecoration: 'none', fontSize: 20, background: '#f0eeea', flexShrink: 0 }}>+</Link>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#4a4740', marginBottom: 8 }}>Nome do Professor</label>
              <input style={inp} value={profName} onChange={e => setProfName(e.target.value)} placeholder="Prof. Dr. Fulano de Tal" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#4a4740', marginBottom: 8 }}>Disciplina</label>
                <input style={inp} value={profDisc} onChange={e => setProfDisc(e.target.value)} placeholder="Design Gráfico" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#4a4740', marginBottom: 8 }}>Turma</label>
                <input style={inp} value={profTurma} onChange={e => setProfTurma(e.target.value)} placeholder="Turma B" />
              </div>
            </div>
          </div>

          {/* 2. TIPO DE TRABALHO */}
          <div style={configSection}>
            <div style={secLabel}>
              Tipo de Trabalho
              <span style={{ flex: 1, height: 1, background: '#dddbd6', opacity: 0.6 }} />
            </div>

            {/* Category tabs */}
            <div style={{ display: 'flex', border: '1px solid #dddbd6', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
              {Object.entries(CATEGORIES).map(([catKey, cat]) => (
                <div
                  key={catKey}
                  onClick={() => setActiveCat(catKey)}
                  style={{
                    flex: 1, padding: '8px 4px', fontSize: 12, fontWeight: 500, textAlign: 'center',
                    cursor: 'pointer', background: activeCat === catKey ? 'rgba(42,127,212,.12)' : '#f0eeea',
                    color: activeCat === catKey ? '#2a7fd4' : '#8a8680', fontWeight: activeCat === catKey ? 600 : 500,
                    borderRight: '1px solid #dddbd6',
                  }}
                >
                  {cat.label}
                </div>
              ))}
            </div>

            {/* Type grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
              {Object.entries(TYPES)
                .filter(([, v]) => v.cat === activeCat)
                .map(([k, v]) => (
                  <div
                    key={k}
                    onClick={() => switchType(k)}
                    style={{
                      padding: '10px 4px', border: `1px solid ${selectedType === k ? '#2a7fd4' : '#dddbd6'}`,
                      borderRadius: 10, background: selectedType === k ? 'rgba(42,127,212,.06)' : '#f0eeea',
                      fontSize: 11, fontWeight: selectedType === k ? 600 : 500,
                      color: selectedType === k ? '#2a7fd4' : '#8a8680',
                      cursor: 'pointer', textAlign: 'center', lineHeight: 1.3,
                    }}
                  >
                    <div style={{ width: 20, height: 20, margin: '0 auto 5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {TYPE_ICONS[k]?.props?.children}
                      </svg>
                    </div>
                    {v.label}
                  </div>
                ))}
            </div>

            {TYPES[selectedType] && (
              <div style={{ fontSize: 12, color: '#8a8680', padding: '6px 8px', background: '#f0eeea', borderRadius: 4, lineHeight: 1.5 }}>
                {TYPES[selectedType].input === 'obj' && 'Arquivo .obj com análise automática de vértices, faces, quads e n-gons.'}
                {TYPES[selectedType].input === 'img' && 'Imagem do trabalho: render, foto, screenshot ou digitalização.'}
                {TYPES[selectedType].input === 'text' && 'Texto, código ou documento: cole o conteúdo diretamente.'}
              </div>
            )}
          </div>

          {/* 3. EXERCÍCIO & CRITÉRIOS */}
          <div style={configSection}>
            <div style={secLabel}>
              Exercício & Critérios
              <span style={{ flex: 1, height: 1, background: '#dddbd6', opacity: 0.6 }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#4a4740', marginBottom: 8 }}>Exercício salvo</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select style={{ ...inp, flex: 1 }} value={selectedExerciseId} onChange={e => loadExercise(e.target.value)}>
                  <option value="">— Sem exercício —</option>
                  {exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                <Link href="/exercicios" style={{ width: 40, height: 38, border: '1px solid #dddbd6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a4740', textDecoration: 'none', fontSize: 20, background: '#f0eeea', flexShrink: 0 }}>+</Link>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#4a4740', marginBottom: 8 }}>Nome do Exercício</label>
              <input style={inp} value={exerciseName} onChange={e => setExerciseName(e.target.value)} placeholder="Ex: Exercício 3 — Modelagem de Personagem" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#4a4740', marginBottom: 8 }}>Enunciado / Descrição</label>
              <textarea style={{ ...inp, minHeight: 72, resize: 'vertical' }} value={exerciseContext} onChange={e => setExerciseContext(e.target.value)} placeholder="Descreva o objetivo, requisitos e restrições do exercício..." />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#4a4740', marginBottom: 8 }}>Critérios de Avaliação</label>
              {criteria.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 12px', background: '#f0eeea', border: '1px solid #dddbd6', borderRadius: 10, marginBottom: 8, fontSize: 14 }}>
                  <span style={{ flex: 1, color: '#4a4740' }}>{c.name}</span>
                  <span style={{ fontSize: 10, background: 'rgba(42,127,212,.12)', color: '#2a7fd4', border: '1px solid rgba(42,127,212,.2)', borderRadius: 3, padding: '2px 7px', flexShrink: 0 }}>{c.weight}×</span>
                  <span onClick={() => setCriteria(criteria.filter((_, j) => j !== i))} style={{ color: '#8a8680', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0 }}>×</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
              <input
                style={{ ...inp, flex: 1 }}
                value={newCritName}
                onChange={e => setNewCritName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCriteria()}
                placeholder="Novo critério..."
              />
              <select style={{ ...inp, width: 72 }} value={newCritWeight} onChange={e => setNewCritWeight(Number(e.target.value))}>
                <option value={1}>1×</option>
                <option value={2}>2×</option>
                <option value={3}>3×</option>
              </select>
              <button onClick={addCriteria} style={{ width: 40, height: 38, border: '1px solid #dddbd6', borderRadius: 10, background: '#f0eeea', color: '#4a4740', cursor: 'pointer', fontSize: 20, flexShrink: 0 }}>+</button>
            </div>
          </div>

          {/* 4. TOM DO FEEDBACK */}
          <div style={configSection}>
            <div style={secLabel}>
              Tom do Feedback
              <span style={{ flex: 1, height: 1, background: '#dddbd6', opacity: 0.6 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
              {TONES.map(t => (
                <div
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  style={{
                    padding: '10px 8px', border: `1px solid ${tone === t.id ? '#2a7fd4' : '#dddbd6'}`,
                    borderRadius: 10, background: tone === t.id ? 'rgba(42,127,212,.06)' : '#f0eeea',
                    fontSize: 12, fontWeight: tone === t.id ? 600 : 500,
                    color: tone === t.id ? '#2a7fd4' : '#8a8680', cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {/* 5. ALUNO */}
          <div style={configSection}>
            <div style={secLabel}>
              Aluno & Trabalho
              <span style={{ flex: 1, height: 1, background: '#dddbd6', opacity: 0.6 }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#4a4740', marginBottom: 8 }}>
                Nome do Aluno <span style={{ fontSize: 10, color: '#8a8680', fontWeight: 400 }}>(opcional)</span>
              </label>
              <input style={inp} value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Ex: João Silva — ou deixe vazio" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#4a4740', marginBottom: 8 }}>
                {TYPES[selectedType]?.input === 'text' ? 'Texto / Código do Aluno' : 'Observações sobre o trabalho'}
              </label>
              <textarea
                style={{ ...inp, minHeight: 100, resize: 'vertical' }}
                value={studentWork}
                onChange={e => setStudentWork(e.target.value)}
                placeholder={TYPES[selectedType]?.input === 'text' ? 'Cole aqui o texto ou código do aluno...' : 'Descreva o trabalho, anote observações sobre a imagem/projeto...'}
              />
            </div>
          </div>

          {/* BOTÃO FIXO */}
          <div style={{ padding: '20px 30px', background: '#fff', borderTop: '1px solid #dddbd6', position: 'sticky', bottom: 0 }}>
            <button
              onClick={runEvaluation}
              disabled={!canEval || generating}
              style={{
                width: '100%', padding: 11, background: !canEval || generating ? 'rgba(42,127,212,.3)' : '#2a7fd4',
                color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600,
                cursor: canEval && !generating ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {generating ? 'Gerando avaliação...' : 'Gerar Avaliação ✦'}
            </button>
            {!canEval && <div style={{ textAlign: 'center', fontSize: 11, color: '#8a8680', marginTop: 6 }}>Preencha o nome do exercício para habilitar</div>}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, background: '#f5f4f0', overflowY: 'auto', minHeight: `calc(100vh - ${HEADER_H}px)` }}>
          {!result && !generating && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, color: '#8a8680', padding: 60, textAlign: 'center', minHeight: `calc(100vh - ${HEADER_H}px)` }}>
              <div style={{ fontSize: 40, opacity: 0.12, lineHeight: 1 }}>◈</div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#4a4740' }}>Nenhuma avaliação gerada</h2>
              <p style={{ fontSize: 12, color: '#8a8680', lineHeight: 1.7 }}>Selecione o tipo de trabalho, configure o perfil<br />e preencha o nome do exercício.</p>
            </div>
          )}

          {generating && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 60, minHeight: `calc(100vh - ${HEADER_H}px)` }}>
              <div style={{ fontSize: 36, opacity: 0.4 }}>✦</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#4a4740' }}>Gerando avaliação...</div>
              <div style={{ fontSize: 13, color: '#8a8680' }}>Analisando critérios e gerando feedback personalizado</div>
            </div>
          )}

          {result && !generating && (
            <div style={{ padding: '28px 32px' }}>
              {/* Result header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>{studentName || 'Aluno'}</div>
                  <div style={{ fontSize: 11, color: '#8a8680', marginTop: 4, fontFamily: 'monospace' }}>
                    {exerciseName} · {TYPES[selectedType]?.label} · {new Date().toLocaleDateString('pt-BR')}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, fontSize: 10, border: '1px solid currentColor', marginTop: 6, color: '#8a8680', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {TYPES[selectedType]?.icon} {TYPES[selectedType]?.label}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 7, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {!saved ? (
                    <button onClick={saveResult} style={{ padding: '8px 16px', border: '1px solid #dddbd6', borderRadius: 10, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#4a4740', fontWeight: 500 }}>Salvar</button>
                  ) : (
                    <span style={{ padding: '8px 16px', background: 'rgba(26,158,110,.1)', border: '1px solid rgba(26,158,110,.25)', color: '#1a9e6e', borderRadius: 10, fontSize: 13, fontWeight: 500 }}>✓ Salvo</span>
                  )}
                  <button onClick={novaAvaliacao} style={{ padding: '8px 16px', border: '1px solid #dddbd6', borderRadius: 10, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#4a4740', fontWeight: 500 }}>↺ Nova Avaliação</button>
                </div>
              </div>

              {/* Score card */}
              <div style={{ background: '#fff', border: '1px solid #dddbd6', borderRadius: 10, padding: 20, marginBottom: 14, display: 'grid', gridTemplateColumns: '140px 1fr', gap: 24 }}>
                <div style={{ textAlign: 'center', borderRight: '1px solid #dddbd6', paddingRight: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 48, lineHeight: 1, fontWeight: 700, color: sc.text }}>{result.score.toFixed(1)}</div>
                  <div style={{ fontSize: 14, color: '#8a8680', fontWeight: 400, marginTop: 2 }}>/ 10</div>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8a8680', marginTop: 8 }}>Nota Final</div>
                  <div style={{ marginTop: 10, padding: '3px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', border: `1px solid ${sc.text}`, color: sc.text }}>{result.grade}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, justifyContent: 'center' }}>
                  {result.criteriaScores.map((c, i) => {
                    const cc = scoreColor(c.score);
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ fontSize: 12, color: '#4a4740', width: 165, flexShrink: 0 }}>{c.name}</div>
                          <div style={{ flex: 1, height: 3, background: '#f0eeea', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ width: `${c.score * 10}%`, height: '100%', background: cc.text, borderRadius: 99, transition: 'width 1s cubic-bezier(.16,1,.3,1)' }} />
                          </div>
                          <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 500, width: 22, textAlign: 'right', color: cc.text, flexShrink: 0 }}>{c.score.toFixed(1)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feedback card */}
              <div style={{ background: '#fff', border: '1px solid #dddbd6', borderRadius: 10, padding: 20, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #dddbd6' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>Feedback</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a8680' }}>Tom: {TONES.find(t => t.id === tone)?.label}{profName ? ` · ${profName}` : ''}</div>
                  </div>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-wrap', color: '#4a4740' }}>{result.feedback}</div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
