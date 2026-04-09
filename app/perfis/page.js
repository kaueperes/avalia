'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TONES } from '@/lib/types';
import AppLayout from '../components/AppLayout';
import Tooltip from '../components/Tooltip';

const BLANK = { name: '', tone: 'neutro', writingSample: '', isDefault: false };

const Field = ({ label, hint, tooltip, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>
      {tooltip ? <Tooltip text={tooltip}>{label}</Tooltip> : label}
      {hint && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-sub)' }}> {hint}</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1px solid var(--border-input)', borderRadius: 10,
  fontSize: 14, outline: 'none',
  background: 'var(--bg-card)', color: 'var(--text-main)',
  fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color .15s',
};

export default function PerfisPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Professor');
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', ok: true });

  function token() { return localStorage.getItem('token'); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); if (u.name) setUserName(u.name); } catch {}
    load();
  }, [router]);

  async function load() {
    const r = await fetch('/api/profiles', { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) setProfiles(await r.json());
  }

  async function save() {
    if (!form.name) { setMsg({ text: 'Nome do professor é obrigatório', ok: false }); return; }
    setLoading(true);
    try {
      const url = editingId ? `/api/profiles/${editingId}` : '/api/profiles';
      const method = editingId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (r.ok) {
        setMsg({ text: editingId ? 'Perfil atualizado!' : 'Perfil criado!', ok: true });
        setForm(BLANK); setEditingId(null); load();
      } else {
        const d = await r.json(); setMsg({ text: d.error || 'Erro ao salvar', ok: false });
      }
    } finally { setLoading(false); setTimeout(() => setMsg({ text: '', ok: true }), 3000); }
  }

  async function del(id) {
    if (!confirm('Deletar este perfil?')) return;
    await fetch(`/api/profiles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    load();
  }

  async function setDefault(id) {
    const r = await fetch(`/api/profiles/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profiles.find(p => p.id === id), isDefault: true }),
    });
    if (r.ok) { load(); setMsg({ text: 'Perfil padrão definido!', ok: true }); setTimeout(() => setMsg({ text: '', ok: true }), 3000); }
  }

  function startEdit(p) {
    setForm({ name: p.name, tone: p.tone || 'neutro', writingSample: p.writingSample || '', isDefault: p.isDefault || false });
    setEditingId(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() { setForm(BLANK); setEditingId(null); }

  return (
    <AppLayout userName={userName}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Cadastro</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Perfil do Professor</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Configure seu nome, tom de feedback e amostra de escrita. O perfil padrão é usado automaticamente nas avaliações.</p>
      </div>

      {msg.text && (
        <div style={{ background: msg.ok ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${msg.ok ? '#10B98133' : '#EF444433'}`, color: msg.ok ? '#10B981' : '#EF4444', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14, fontWeight: 500 }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: profiles.length > 0 ? '1fr 1.2fr' : '1fr', gap: 24, alignItems: 'start', minWidth: 0, overflow: 'hidden' }}>

        {/* Lista de perfis */}
        {profiles.length > 0 && (
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>Perfis criados</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {profiles.map(p => (
                <div key={p.id} style={{ background: 'var(--bg-card)', border: `1px solid ${editingId === p.id ? '#0081f0' : p.isDefault ? '#10B98133' : 'var(--border-card)'}`, borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', overflow: 'hidden' }}>
                    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                        {p.isDefault && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: '#10B98122', color: '#10B981', flexShrink: 0 }}>Padrão</span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                        {TONES.find(t => t.id === p.tone)?.label || p.tone}
                        {p.writingSample ? ' · Com amostra de escrita' : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 12 }}>
                      {!p.isDefault && (
                        <button onClick={() => setDefault(p.id)}
                          style={{ padding: '5px 12px', border: '1px solid #10B98133', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: '#10B981' }}>
                          Definir padrão
                        </button>
                      )}
                      <button onClick={() => startEdit(p)}
                        style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)' }}>
                        Editar
                      </button>
                      <button onClick={() => del(p.id)}
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
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
            {editingId ? 'Editar perfil' : 'Novo perfil'}
          </h2>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '28px 28px' }}>

          <Field label="Nome do Professor *" tooltip="Seu nome completo. Aparece como assinatura nos relatórios e PDFs gerados.">
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Prof. Dr. Fulano de Tal" />
          </Field>

          <Field label="Tom de Feedback" tooltip="Define o estilo do texto nos feedbacks — do mais técnico ao mais encorajador.">
            <select style={inputStyle} value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}>
              {TONES.map(t => <option key={t.id} value={t.id}>{t.label} — {t.desc}</option>)}
            </select>
          </Field>

          <Field label="Amostra de Escrita" hint="(opcional)" tooltip="Cole um trecho do seu jeito de escrever feedback. A avaliação vai imitar seu estilo e vocabulário.">
            <textarea
              style={{ ...inputStyle, minHeight: 140, resize: 'vertical', lineHeight: 1.6 }}
              value={form.writingSample}
              onChange={e => setForm(f => ({ ...f, writingSample: e.target.value }))}
              placeholder="Cole aqui um trecho de feedback que você mesmo escreveria a um aluno. Ex: 'O trabalho demonstra domínio técnico, mas a topologia precisa de atenção especial...'"
            />
          </Field>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <input type="checkbox" id="is-default" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#0081f0' }} />
            <label htmlFor="is-default" style={{ fontSize: 14, color: 'var(--text-main)', cursor: 'pointer', userSelect: 'none' }}>
              <Tooltip text="O perfil padrão é carregado automaticamente ao abrir uma nova avaliação. Você pode trocar na hora se precisar.">Usar como perfil padrão nas avaliações</Tooltip>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={save} disabled={loading}
              style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar perfil'}
            </button>
            {editingId && (
              <button onClick={cancelEdit}
                style={{ padding: '11px 20px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                Cancelar
              </button>
            )}
          </div>
        </div>
        </div>
      </div>
    </AppLayout>
  );
}
