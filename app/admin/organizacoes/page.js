'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

export default function AdminOrganizacoesPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', quotaPool: '' });
  const [editing, setEditing] = useState(null); // { id, name, quotaPool, active }
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', ok: true });

  function token() { return localStorage.getItem('token'); }
  function flash(text, ok = true) { setMsg({ text, ok }); setTimeout(() => setMsg({ text: '', ok: true }), 3500); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (!u.is_admin) { router.push('/inicio'); return; }
      if (u.name) setUserName(u.name);
    } catch { router.push('/inicio'); return; }
    load();
  }, [router]);

  async function load() {
    const r = await fetch('/api/admin/organizations', { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) setOrgs(await r.json());
    setLoading(false);
  }

  async function create() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const r = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ name: form.name.trim(), quotaPool: Number(form.quotaPool) || 0 }),
      });
      const d = await r.json();
      if (r.ok) { flash('Organização criada!'); setForm({ name: '', quotaPool: '' }); load(); }
      else flash(d.error || 'Erro ao criar', false);
    } finally { setSaving(false); }
  }

  async function saveEdit() {
    if (!editing?.name?.trim()) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/organizations/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ name: editing.name.trim(), quotaPool: Number(editing.quotaPool) || 0, active: editing.active }),
      });
      if (r.ok) { flash('Atualizado!'); setEditing(null); load(); }
      else flash('Erro ao atualizar', false);
    } finally { setSaving(false); }
  }

  async function deleteOrg(id, name) {
    if (!confirm(`Excluir "${name}"? Todos os professores serão desvinculados e voltarão ao plano gratuito.`)) return;
    const r = await fetch(`/api/admin/organizations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) { flash('Organização excluída.'); load(); }
    else flash('Erro ao excluir', false);
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--border-input)', borderRadius: 10, fontSize: 14, outline: 'none', background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box' };

  return (
    <AppLayout userName={userName}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Painel Administrativo</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Organizações</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Crie e gerencie as organizações contratantes.</p>
      </div>

      {msg.text && (
        <div style={{ background: msg.ok ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${msg.ok ? '#10B98133' : '#EF444433'}`, color: msg.ok ? '#10B981' : '#EF4444', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14 }}>
          {msg.text}
        </div>
      )}

      {/* Criar nova org */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '24px 28px', marginBottom: 28 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 16 }}>Nova organização</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>Nome da organização *</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Universidade Federal..." />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>Pool de avaliações</label>
            <input type="number" min="0" style={{ ...inputStyle, width: 140 }} value={form.quotaPool} onChange={e => setForm(f => ({ ...f, quotaPool: e.target.value }))} placeholder="Ex: 500" />
          </div>
          <button onClick={create} disabled={saving || !form.name.trim()}
            style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: !form.name.trim() ? 0.5 : 1, height: 42 }}>
            {saving ? 'Criando...' : 'Criar'}
          </button>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>}

      {!loading && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{orgs.length} organização{orgs.length !== 1 ? 'ões' : ''}</p>
          </div>
          {orgs.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Nenhuma organização cadastrada.</div>
          ) : (
            orgs.map(org => (
              <div key={org.id} style={{ borderTop: '1px solid var(--border)', padding: '16px 24px' }}>
                {editing?.id === org.id ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 10, alignItems: 'center' }}>
                    <input style={{ ...inputStyle, marginBottom: 0 }} value={editing.name} onChange={e => setEditing(v => ({ ...v, name: e.target.value }))} autoFocus />
                    <input type="number" min="0" style={{ ...inputStyle, width: 120, marginBottom: 0 }} value={editing.quotaPool} onChange={e => setEditing(v => ({ ...v, quotaPool: e.target.value }))} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      <input type="checkbox" checked={editing.active} onChange={e => setEditing(v => ({ ...v, active: e.target.checked })} style={{ width: 14, height: 14 }} />
                      Ativa
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={saveEdit} disabled={saving} style={{ padding: '7px 16px', background: '#0081f0', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Salvar</button>
                      <button onClick={() => setEditing(null)} style={{ padding: '7px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>{org.name}</p>
                        {!org.active && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}>Inativa</span>}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {org.memberCount} professor{org.memberCount !== 1 ? 'es' : ''} · Pool: {org.quota_used}/{org.quota_pool} usadas
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => setEditing({ id: org.id, name: org.name, quotaPool: org.quota_pool, active: org.active })}
                        style={{ padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)' }}>
                        Editar
                      </button>
                      <button onClick={() => deleteOrg(org.id, org.name)}
                        style={{ padding: '6px 9px', border: '1px solid #EF444433', borderRadius: 8, cursor: 'pointer', background: 'transparent', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </AppLayout>
  );
}
