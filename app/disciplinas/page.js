'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TYPES, CATEGORIES } from '@/lib/types';
import AppLayout from '../components/AppLayout';
import Tooltip from '../components/Tooltip';
import WorkTypeSelector from '../components/WorkTypeSelector';

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

  const [showTypeModal, setShowTypeModal] = useState(false);

  // AI
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [msg, setMsg] = useState({ text: '', ok: true });

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
        flash(editingDiscId ? 'Disciplina atualizada!' : 'Disciplina criada!');
        setFormDisc({ subject: '' }); setEditingDiscId(null);
        await loadDisciplines();
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

  function onTypeChange(type) {
    const def = (TYPES[type]?.criteria || []).map(c => ({ name: c.name, weight: c.w }));
    setExerciseForm(f => ({ ...f, type, criteria: def }));
  }

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

  async function generateContext(disciplineId) {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const r = await fetch('/api/exercises/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseName: exerciseForm.name, exerciseType: exerciseForm.type, briefDescription: aiPrompt }),
      });
      const d = await r.json();
      if (d.context) { setExerciseForm(f => ({ ...f, context: d.context })); setShowAiPrompt(false); setAiPrompt(''); }
    } finally { setAiLoading(false); }
  }

  return (
    <AppLayout userName={userName}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Cadastro</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Cadastro de Disciplinas</h1>
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
                          style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: isExpanded ? 'rgba(0,129,240,0.08)' : 'var(--bg-content)', color: isExpanded ? '#0081f0' : 'var(--text-main)', borderColor: isExpanded ? '#0081f0' : 'var(--border)' }}>
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
                                  <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>{TYPES[ex.type]?.label || ex.type} · {ex.criteria?.length || 0} critérios</p>
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
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>Nome do Exercício *</label>
                              <input style={inputStyle} value={exerciseForm.name} onChange={e => setExerciseForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Redação Descritiva, Prova P1..." />
                            </div>

                            <div style={{ marginBottom: 12 }}>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginBottom: 5 }}>Tipo de Trabalho</label>
                              <button
                                type="button"
                                onClick={() => setShowTypeModal(true)}
                                style={{ ...inputStyle, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                              >
                                <span>{TYPES[exerciseForm.type]?.label || exerciseForm.type}</span>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
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

                            {/* Enunciado */}
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>
                                  Enunciado
                                </label>
                                <button onClick={() => setShowAiPrompt(v => !v)}
                                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', border: '1px solid #0081f033', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', background: 'var(--selected-bg)', color: '#0081f0' }}>
                                  Gerar automaticamente
                                </button>
                              </div>
                              {showAiPrompt && (
                                <div style={{ marginBottom: 8, padding: '10px 12px', background: 'var(--selected-bg)', border: '1px solid #0081f033', borderRadius: 8 }}>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <input style={{ ...inputStyle, flex: 1, fontSize: 13, padding: '7px 10px' }} value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && generateContext(disc.id)} placeholder="Descreva brevemente o exercício..." autoFocus />
                                    <button onClick={() => generateContext(disc.id)} disabled={aiLoading || !aiPrompt.trim()}
                                      style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: aiLoading ? 'wait' : 'pointer', opacity: !aiPrompt.trim() ? 0.5 : 1, flexShrink: 0 }}>
                                      {aiLoading ? '...' : 'Gerar'}
                                    </button>
                                  </div>
                                </div>
                              )}
                              <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical', lineHeight: 1.6 }} value={exerciseForm.context} onChange={e => setExerciseForm(f => ({ ...f, context: e.target.value }))} placeholder="Descreva o objetivo e requisitos..." />
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => saveExercise(disc.id)} disabled={loadingExercise}
                                style={{ padding: '9px 20px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: loadingExercise ? 'not-allowed' : 'pointer', opacity: loadingExercise ? 0.6 : 1 }}>
                                {loadingExercise ? 'Salvando...' : editingExerciseId ? 'Salvar alterações' : 'Criar exercício'}
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

      {/* Modal seletor de tipo */}
      {showTypeModal && (
        <div
          onClick={() => setShowTypeModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-card)', width: '100%', maxWidth: 620, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-card)' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>Tipo de Trabalho</p>
              <button onClick={() => setShowTypeModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <WorkTypeSelector
                value={exerciseForm.type}
                onChange={type => { onTypeChange(type); setShowTypeModal(false); }}
              />
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
