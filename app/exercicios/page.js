'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TYPES, CATEGORIES } from '@/lib/types';
import AppHeader from '@/components/AppHeader';

const BLANK = { name: '', type: 'modelagem', context: '', criteria: [] };

export default function ExerciciosPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  function token() { return localStorage.getItem('token'); }
  function logout() { localStorage.clear(); router.push('/login'); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    loadExercises();
    // init default criteria
    const def = (TYPES['modelagem']?.criteria || []).map(c => ({ name: c.name, weight: c.w }));
    setForm(f => ({ ...f, criteria: def }));
  }, [router]);

  async function loadExercises() {
    const r = await fetch('/api/exercises', { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) setExercises(await r.json());
  }

  function onTypeChange(type) {
    const def = (TYPES[type]?.criteria || []).map(c => ({ name: c.name, weight: c.w }));
    setForm(f => ({ ...f, type, criteria: def }));
  }

  async function save() {
    if (!form.name) { setMsg('Nome do exercício é obrigatório'); return; }
    setLoading(true);
    try {
      const url = editingId ? `/api/exercises/${editingId}` : '/api/exercises';
      const method = editingId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (r.ok) { setMsg(editingId ? 'Exercício atualizado!' : 'Exercício salvo!'); setForm(BLANK); setEditingId(null); loadExercises(); }
      else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar'); }
    } finally { setLoading(false); setTimeout(() => setMsg(''), 3000); }
  }

  async function del(id) {
    if (!confirm('Excluir este exercício?')) return;
    await fetch(`/api/exercises/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    loadExercises();
  }

  function startEdit(ex) {
    setForm({ name: ex.name, type: ex.type, context: ex.context || '', criteria: ex.criteria || [] });
    setEditingId(ex.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    const def = (TYPES['modelagem']?.criteria || []).map(c => ({ name: c.name, weight: c.w }));
    setForm({ ...BLANK, criteria: def });
    setEditingId(null);
  }

  const inp = { width: '100%', padding: '9px 10px', border: '1px solid #dddbd6', borderRadius: 10, fontSize: 14, outline: 'none', background: '#f0eeea', fontFamily: 'Inter, sans-serif', color: '#1a1814', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 14, fontWeight: 700, color: '#4a4740', marginBottom: 8 };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'Inter, sans-serif' }}>
      <AppHeader active="/exercicios" />

      <main style={{ padding: '28px 32px' }}>
        {/* Título */}
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1814', marginBottom: 4 }}>Exercícios</h1>
        <p style={{ fontSize: 12, color: '#8a8680', marginBottom: 20 }}>Modelos reutilizáveis por exercício — configure uma vez, use em qualquer turma ou semestre</p>

        {exercises.length === 0 && !editingId && (
          <p style={{ fontSize: 13, color: '#8a8680', marginBottom: 20 }}>Nenhum exercício criado ainda.</p>
        )}

        {/* Lista de exercícios */}
        {exercises.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {exercises.map(ex => (
              <div key={ex.id} style={{ background: '#fff', border: '1px solid #dddbd6', borderRadius: 10, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{ex.name}</div>
                  <div style={{ fontSize: 12, color: '#8a8680', marginTop: 3 }}>{TYPES[ex.type]?.label || ex.type} · {ex.criteria?.length || 0} critérios</div>
                  {ex.context && <div style={{ fontSize: 11, color: '#8a8680', marginTop: 2, maxWidth: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ex.context}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(ex)} style={{ padding: '6px 14px', border: '1px solid #dddbd6', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: '#fff', color: '#4a4740' }}>Editar</button>
                  <button onClick={() => del(ex.id)} style={{ padding: '6px 14px', border: '1px solid rgba(217,79,79,.3)', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: '#fff', color: '#d94f4f' }}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {msg && (
          <div style={{ background: msg.includes('obrigatório') || msg.includes('Erro') ? '#fee2e2' : '#dcfce7', border: `1px solid ${msg.includes('obrigatório') || msg.includes('Erro') ? '#fca5a5' : '#bbf7d0'}`, color: msg.includes('obrigatório') || msg.includes('Erro') ? '#dc2626' : '#16a34a', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>{msg}</div>
        )}

        {/* Formulário */}
        <div style={{ background: '#fff', border: '1px solid #dddbd6', borderRadius: 12, padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1814', marginBottom: 24 }}>{editingId ? 'Editar Exercício' : 'Novo Exercício'}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={lbl}>Nome do Exercício *</label>
              <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Exercício 3 — Modelagem de Person..." />
            </div>
            <div>
              <label style={lbl}>Tipo de Trabalho</label>
              <select style={inp} value={form.type} onChange={e => onTypeChange(e.target.value)}>
                {Object.entries(CATEGORIES).map(([catKey, cat]) => (
                  <optgroup key={catKey} label={cat.label}>
                    {Object.entries(TYPES).filter(([, v]) => v.cat === catKey).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Enunciado / Descrição <span style={{ fontSize: 11, color: '#8a8680', fontWeight: 400 }}>(opcional)</span></label>
            <textarea
              style={{ ...inp, minHeight: 88, resize: 'vertical', lineHeight: 1.6 }}
              value={form.context}
              onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
              placeholder="Descreva o objetivo, requisitos e restrições do exercício. Quanto mais detalhado, mais precisa será a avaliação."
            />
          </div>

          {form.criteria.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Critérios de Avaliação</label>
              {form.criteria.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#f0eeea', border: '1px solid #dddbd6', borderRadius: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, background: 'rgba(42,127,212,.12)', color: '#2a7fd4', border: '1px solid rgba(42,127,212,.2)', borderRadius: 3, padding: '2px 6px', fontWeight: 600, flexShrink: 0 }}>{c.weight}×</span>
                  <input
                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, outline: 'none', color: '#1a1814', fontFamily: 'Inter, sans-serif' }}
                    value={c.name}
                    onChange={e => { const cr = [...form.criteria]; cr[i] = { ...cr[i], name: e.target.value }; setForm(f => ({ ...f, criteria: cr })); }}
                    placeholder="Nome do critério"
                  />
                  <select
                    style={{ width: 64, padding: '4px 6px', fontSize: 12, background: '#f0eeea', border: '1px solid #dddbd6', borderRadius: 6, color: '#4a4740', outline: 'none', cursor: 'pointer' }}
                    value={c.weight}
                    onChange={e => { const cr = [...form.criteria]; cr[i] = { ...cr[i], weight: Number(e.target.value) }; setForm(f => ({ ...f, criteria: cr })); }}
                  >
                    {[1, 2, 3].map(w => <option key={w} value={w}>{w}×</option>)}
                  </select>
                  <button onClick={() => setForm(f => ({ ...f, criteria: f.criteria.filter((_, j) => j !== i) }))} style={{ border: 'none', background: 'transparent', color: '#8a8680', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0, padding: '0 4px' }}>×</button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setForm(f => ({ ...f, criteria: [...f.criteria, { name: '', weight: 2 }] }))}
            style={{ padding: '7px 14px', border: '1px dashed #dddbd6', borderRadius: 7, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#4a4740', marginBottom: 24 }}
          >
            + Adicionar critério
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={save} disabled={loading} style={{ padding: '10px 20px', background: '#2a7fd4', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Salvar Exercício'}
            </button>
            {editingId && (
              <button onClick={cancelEdit} style={{ padding: '10px 20px', border: '1px solid #dddbd6', borderRadius: 8, fontSize: 14, cursor: 'pointer', background: '#fff', color: '#4a4740' }}>Cancelar</button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
