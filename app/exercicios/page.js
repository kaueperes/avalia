'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TYPES, CATEGORIES } from '@/lib/types';
import AppLayout from '../components/AppLayout';
import Tooltip from '../components/Tooltip';

const BLANK = { name: '', type: 'modelagem', disciplina: '', context: '', criteria: [] };

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1px solid var(--border-input)', borderRadius: 10,
  fontSize: 14, outline: 'none',
  background: 'var(--bg-card)', color: 'var(--text-main)',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

const Field = ({ label, hint, tooltip, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
      {tooltip ? <Tooltip text={tooltip}>{label}</Tooltip> : label}
      {hint && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-sub)' }}> {hint}</span>}
    </label>
    {children}
  </div>
);

export default function ExerciciosPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Professor');
  const [exercises, setExercises] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  function token() { return localStorage.getItem('token'); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); if (u.name) setUserName(u.name); } catch {}
    load();
    const def = (TYPES['modelagem']?.criteria || []).map(c => ({ name: c.name, weight: c.w }));
    setForm(f => ({ ...f, criteria: def }));
  }, [router]);

  async function load() {
    const r = await fetch('/api/exercises', { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) setExercises(await r.json());
  }

  function onTypeChange(type) {
    const def = (TYPES[type]?.criteria || []).map(c => ({ name: c.name, weight: c.w }));
    setForm(f => ({ ...f, type, criteria: def }));
  }

  async function save() {
    if (!form.name) { setMsg({ text: 'Nome do exercício é obrigatório', ok: false }); return; }
    setLoading(true);
    try {
      const url = editingId ? `/api/exercises/${editingId}` : '/api/exercises';
      const method = editingId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (r.ok) {
        setMsg({ text: editingId ? 'Exercício atualizado!' : 'Exercício salvo!', ok: true });
        setForm(BLANK); setEditingId(null); load();
      } else {
        const d = await r.json(); setMsg({ text: d.error || 'Erro ao salvar', ok: false });
      }
    } finally { setLoading(false); setTimeout(() => setMsg({ text: '', ok: true }), 3000); }
  }

  async function del(id) {
    if (!confirm('Excluir este exercício?')) return;
    await fetch(`/api/exercises/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    load();
  }

  function startEdit(ex) {
    setForm({ name: ex.name, type: ex.type, disciplina: ex.disciplina || '', context: ex.context || '', criteria: ex.criteria || [] });
    setEditingId(ex.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function generateContext() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const r = await fetch('/api/exercises/generate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseName: form.name, exerciseType: form.type, briefDescription: aiPrompt }),
      });
      const d = await r.json();
      if (d.context) {
        setForm(f => ({ ...f, context: d.context }));
        setShowAiPrompt(false);
        setAiPrompt('');
      }
    } finally { setAiLoading(false); }
  }

  function cancelEdit() {
    const def = (TYPES['modelagem']?.criteria || []).map(c => ({ name: c.name, weight: c.w }));
    setForm({ ...BLANK, criteria: def });
    setEditingId(null);
  }

  return (
    <AppLayout userName={userName}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Biblioteca</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Gerenciar Exercícios</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Configure exercícios uma vez e reutilize em qualquer turma ou semestre.</p>
      </div>

      {/* Mensagem */}
      {msg.text && (
        <div style={{
          background: msg.ok ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${msg.ok ? '#10B98133' : '#EF444433'}`,
          color: msg.ok ? '#10B981' : '#EF4444',
          borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14, fontWeight: 500,
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: exercises.length > 0 ? '1fr 1.2fr' : '1fr', gap: 24, alignItems: 'start', minWidth: 0, overflow: 'hidden' }}>

        {/* Lista */}
        {exercises.length > 0 && (
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>Exercícios criados</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {exercises.map(ex => (
                <div key={ex.id} style={{
                  background: 'var(--bg-card)', border: `1px solid ${editingId === ex.id ? '#0081f0' : 'var(--border-card)'}`,
                  borderRadius: 12, padding: '16px 20px', overflow: 'hidden',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', overflow: 'hidden' }}>
                    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                        {TYPES[ex.type]?.label || ex.type} · {ex.criteria?.length || 0} critérios{ex.disciplina ? ` · ${ex.disciplina}` : ''}
                      </p>
                      {ex.context && (
                        <p style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ex.context}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                      <button
                        onClick={() => startEdit(ex)}
                        style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)' }}>
                        Editar
                      </button>
                      <button
                        onClick={() => del(ex.id)}
                        style={{ padding: '5px 9px', border: '1px solid #EF444433', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'transparent', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulário */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '28px 28px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 24 }}>
            {editingId ? 'Editar exercício' : 'Novo exercício'}
          </h2>

          <div className="form-grid">
            <Field label="Nome do Exercício *" tooltip="Nome do exercício. Aparece nos relatórios e pode ser reutilizado em qualquer turma.">
              <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Modelagem de Personagem" />
            </Field>
            <Field label="Tipo de Trabalho" tooltip="Define a categoria do trabalho. A IA usa isso para escolher os critérios certos de avaliação.">
              <select style={inputStyle} value={form.type} onChange={e => onTypeChange(e.target.value)}>
                {Object.entries(CATEGORIES).map(([catKey, cat]) => (
                  <optgroup key={catKey} label={cat.label}>
                    {Object.entries(TYPES).filter(([, v]) => v.cat === catKey).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Disciplina" hint="(opcional)" tooltip="Matéria escolar deste exercício. Usado para filtrar na página inicial. Ex: Português, Matemática, Modelagem 3D.">
            <input style={inputStyle} value={form.disciplina} onChange={e => setForm(f => ({ ...f, disciplina: e.target.value }))} placeholder="Ex: Português, Matemática, Modelagem 3D..." />
          </Field>

          <div className="form-grid">
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                  <Tooltip text="Descreva o objetivo e os requisitos do exercício. Quanto mais detalhado, mais precisa será a avaliação da IA.">Enunciado / Descrição</Tooltip>
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-sub)' }}> (opcional)</span>
                </label>
                <button
                  onClick={() => setShowAiPrompt(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', border: '1px solid #0081f033', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'var(--selected-bg)', color: '#0081f0' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/><path d="M18 2v4h4"/></svg>
                  Criar com IA
                </button>
              </div>
              {showAiPrompt && (
                <div style={{ marginBottom: 10, padding: '12px 14px', background: 'var(--selected-bg)', border: '1px solid #0081f033', borderRadius: 10 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Descreva o exercício em poucas palavras e a IA gera o enunciado completo:</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      style={{ ...inputStyle, flex: 1, fontSize: 13, padding: '8px 12px' }}
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && generateContext()}
                      placeholder="Ex: modelagem de personagem low poly para game, foco em otimização..."
                      autoFocus
                    />
                    <button
                      onClick={generateContext}
                      disabled={aiLoading || !aiPrompt.trim()}
                      style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: aiLoading ? 'wait' : 'pointer', opacity: !aiPrompt.trim() ? 0.5 : 1, flexShrink: 0 }}
                    >
                      {aiLoading ? 'Gerando...' : 'Gerar'}
                    </button>
                  </div>
                </div>
              )}
              <textarea
                style={{ ...inputStyle, minHeight: 160, resize: 'vertical', lineHeight: 1.6 }}
                value={form.context}
                onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
                placeholder="Descreva o objetivo, requisitos e restrições. Quanto mais detalhado, mais precisa será a avaliação."
              />
            </div>

            <div>
              <Field label="Critérios de Avaliação" tooltip="Cada critério recebe nota de 0 a 10. O peso (×) define a importância do critério na nota final.">
                {form.criteria.map((c, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 12px', background: 'var(--bg-content)',
                    border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8,
                  }}>
                    <span style={{ fontSize: 10, background: '#0081f022', color: '#0081f0', border: '1px solid #0081f033', borderRadius: 4, padding: '2px 6px', fontWeight: 700, flexShrink: 0 }}>{c.weight}×</span>
                    <input
                      style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, outline: 'none', color: 'var(--text-main)', fontFamily: 'inherit' }}
                      value={c.name}
                      onChange={e => { const cr = [...form.criteria]; cr[i] = { ...cr[i], name: e.target.value }; setForm(f => ({ ...f, criteria: cr })); }}
                      placeholder="Nome do critério"
                    />
                    <select
                      style={{ width: 60, padding: '4px 6px', fontSize: 12, background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}
                      value={c.weight}
                      onChange={e => { const cr = [...form.criteria]; cr[i] = { ...cr[i], weight: Number(e.target.value) }; setForm(f => ({ ...f, criteria: cr })); }}
                    >
                      {[1, 2, 3].map(w => <option key={w} value={w}>{w}×</option>)}
                    </select>
                    <button
                      onClick={() => setForm(f => ({ ...f, criteria: f.criteria.filter((_, j) => j !== i) }))}
                      style={{ border: 'none', background: 'transparent', color: 'var(--text-sub)', cursor: 'pointer', fontSize: 18, lineHeight: 1, flexShrink: 0, padding: '0 2px' }}>
                      ×
                    </button>
                  </div>
                ))}
              </Field>
              <button
                onClick={() => setForm(f => ({ ...f, criteria: [...f.criteria, { name: '', weight: 2 }] }))}
                style={{ padding: '7px 14px', border: '1px dashed var(--border)', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)', marginBottom: 8 }}
              >
                + Adicionar critério
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={save} disabled={loading}
              style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar exercício'}
            </button>
            {editingId && (
              <button
                onClick={cancelEdit}
                style={{ padding: '11px 20px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
