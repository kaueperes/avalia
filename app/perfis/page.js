'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TONES } from '@/lib/types';
import AppHeader from '@/components/AppHeader';

const BLANK = { name: '', discipline: '', turma: '', tone: 'neutro', writingSample: '' };

export default function PerfisPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  function token() { return localStorage.getItem('token'); }
  function logout() { localStorage.clear(); router.push('/login'); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    load();
  }, [router]);

  async function load() {
    const r = await fetch('/api/profiles', { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) setProfiles(await r.json());
  }

  async function save() {
    if (!form.name || !form.discipline) { setMsg('Nome e disciplina são obrigatórios'); return; }
    setLoading(true);
    try {
      const url = editingId ? `/api/profiles/${editingId}` : '/api/profiles';
      const method = editingId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (r.ok) { setMsg(editingId ? 'Perfil atualizado!' : 'Perfil criado!'); setForm(BLANK); setEditingId(null); load(); }
      else { const d = await r.json(); setMsg(d.error || 'Erro ao salvar'); }
    } finally { setLoading(false); setTimeout(() => setMsg(''), 3000); }
  }

  async function del(id) {
    if (!confirm('Deletar este perfil?')) return;
    await fetch(`/api/profiles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    load();
  }

  function startEdit(p) {
    setForm({ name: p.name, discipline: p.discipline, turma: p.turma || '', tone: p.tone || 'neutro', writingSample: p.writingSample || '' });
    setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() { setForm(BLANK); setEditingId(null); }

  const inp = { width: '100%', padding: '9px 10px', border: '1px solid #dddbd6', borderRadius: 10, fontSize: 14, outline: 'none', background: '#f0eeea', fontFamily: 'Inter, sans-serif', color: '#1a1814', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 14, fontWeight: 700, color: '#4a4740', marginBottom: 8 };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'Inter, sans-serif' }}>
      <AppHeader active="/perfis" />

      <main style={{ padding: '28px 32px' }}>
        {/* Título */}
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1814', marginBottom: 4 }}>Perfil do Professor</h1>
        <p style={{ fontSize: 12, color: '#8a8680', marginBottom: 20 }}>Configurações reutilizáveis por disciplina</p>

        {profiles.length === 0 && !editingId && (
          <p style={{ fontSize: 13, color: '#8a8680', marginBottom: 20 }}>Nenhum perfil criado ainda.</p>
        )}

        {/* Perfis existentes */}
        {profiles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {profiles.map(p => (
              <div key={p.id} style={{ background: '#fff', border: '1px solid #dddbd6', borderRadius: 10, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1814' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#8a8680', marginTop: 3 }}>{p.discipline}{p.turma ? ` · ${p.turma}` : ''} · Tom: {TONES.find(t => t.id === p.tone)?.label || p.tone}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => startEdit(p)} style={{ padding: '6px 14px', border: '1px solid #dddbd6', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: '#fff', color: '#4a4740' }}>Editar</button>
                  <button onClick={() => del(p.id)} style={{ padding: '6px 14px', border: '1px solid rgba(217,79,79,.3)', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: '#fff', color: '#d94f4f' }}>Excluir</button>
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
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1814', marginBottom: 24 }}>{editingId ? 'Editar Perfil' : 'Novo Perfil'}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={lbl}>Nome do Professor *</label>
              <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Prof. Dr. Fulano" />
            </div>
            <div>
              <label style={lbl}>Disciplina *</label>
              <input style={inp} value={form.discipline} onChange={e => setForm(f => ({ ...f, discipline: e.target.value }))} placeholder="Design Gráfico" />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Turma</label>
            <input style={inp} value={form.turma} onChange={e => setForm(f => ({ ...f, turma: e.target.value }))} placeholder="Turma B" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Tom padrão</label>
            <select style={inp} value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}>
              {TONES.map(t => <option key={t.id} value={t.id}>{t.label} — {t.desc}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={lbl}>Amostra de escrita <span style={{ fontSize: 11, color: '#8a8680', fontWeight: 400 }}>(opcional)</span></label>
            <textarea
              style={{ ...inp, minHeight: 100, resize: 'vertical', lineHeight: 1.6 }}
              value={form.writingSample}
              onChange={e => setForm(f => ({ ...f, writingSample: e.target.value }))}
              placeholder={'Cole aqui um trecho de feedback que você mesmo escreveria a um aluno — algumas frases são suficientes. A IA vai imitar seu estilo, vocabulário e forma de se expressar.'}
            />
            <div style={{ fontSize: 11, color: '#8a8680', marginTop: 6, fontStyle: 'italic' }}>
              Ex: "O trabalho demonstra domínio técnico, mas a topologia precisa de atenção especial nas regiões de curvatura. Recomendo revisar os edge loops antes da entrega final."
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={save} disabled={loading} style={{ padding: '10px 20px', background: '#2a7fd4', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Salvar Perfil'}
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
