'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function OrgProfessoresPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', ok: true });
  const [editingLimit, setEditingLimit] = useState(null); // { memberId, value }

  function token() { return localStorage.getItem('token'); }
  function flash(text, ok = true) { setMsg({ text, ok }); setTimeout(() => setMsg({ text: '', ok: true }), 3500); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (!u.org_id || u.org_role !== 'admin') { router.push('/inicio'); return; }
      if (u.name) setUserName(u.name);
    } catch { router.push('/inicio'); return; }
    load();
  }, [router]);

  async function load() {
    const [mRes, iRes] = await Promise.all([
      fetch('/api/org/members', { headers: { Authorization: `Bearer ${token()}` } }),
      fetch('/api/org/invites', { headers: { Authorization: `Bearer ${token()}` } }),
    ]);
    if (mRes.ok) setMembers(await mRes.json());
    if (iRes.ok) setInvites(await iRes.json());
    setLoading(false);
  }

  async function sendInvite() {
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      const r = await fetch('/api/org/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      const d = await r.json();
      if (r.ok) { flash('Convite enviado!'); setInviteEmail(''); load(); }
      else flash(d.error || 'Erro ao enviar convite', false);
    } finally { setInviteLoading(false); }
  }

  async function cancelInvite(id) {
    await fetch(`/api/org/invites?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    flash('Convite cancelado');
    load();
  }

  async function removeMember(memberId, name) {
    if (!confirm(`Remover ${name} da organização? Ele voltará ao plano gratuito.`)) return;
    const r = await fetch(`/api/org/members?memberId=${memberId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) { flash(`${name} removido.`); load(); }
    else { const d = await r.json(); flash(d.error || 'Erro ao remover', false); }
  }

  async function saveLimit(memberId, value) {
    const limit = value === '' ? null : Number(value);
    const r = await fetch('/api/org/members', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ memberId, orgQuotaLimit: limit }),
    });
    if (r.ok) { flash('Limite atualizado!'); setEditingLimit(null); load(); }
    else flash('Erro ao atualizar limite', false);
  }

  const pendingInvites = invites.filter(i => i.status === 'pending');

  return (
    <AppLayout userName={userName}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Institucional</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Professores</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Gerencie os professores da sua organização.</p>
      </div>

      {msg.text && (
        <div style={{ background: msg.ok ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${msg.ok ? '#10B98133' : '#EF444433'}`, color: msg.ok ? '#10B981' : '#EF4444', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 14 }}>
          {msg.text}
        </div>
      )}

      {/* Convidar */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '24px 28px', marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>Convidar professor por email</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="email"
            placeholder="email@escola.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendInvite()}
            style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--border-input)', borderRadius: 10, fontSize: 14, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit', outline: 'none' }}
          />
          <button
            onClick={sendInvite}
            disabled={inviteLoading || !inviteEmail.trim()}
            style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: inviteLoading ? 'wait' : 'pointer', opacity: !inviteEmail.trim() ? 0.5 : 1, flexShrink: 0 }}
          >
            {inviteLoading ? 'Enviando...' : 'Enviar convite'}
          </button>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>}

      {!loading && (
        <>
          {/* Membros */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Professores ativos ({members.length})</p>
            </div>
            {members.length === 0 ? (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Nenhum professor na organização ainda.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-content)' }}>
                    {['Professor', 'Email', 'Membro desde', 'Avaliações', 'Limite', ''].map(h => (
                      <th key={h} style={{ padding: '10px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>
                        {m.name}
                        {m.org_role === 'admin' && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#eff6ff', color: '#0081f0', border: '1px solid #bfdbfe' }}>Admin</span>}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{m.email}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-muted)' }}>{fmt(m.org_joined_at)}</td>
                      <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{m.org_quota_used || 0}</td>
                      <td style={{ padding: '14px 20px' }}>
                        {editingLimit?.memberId === m.id ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                              type="number"
                              min="0"
                              value={editingLimit.value}
                              onChange={e => setEditingLimit(l => ({ ...l, value: e.target.value }))}
                              style={{ width: 70, padding: '4px 8px', border: '1px solid var(--border-input)', borderRadius: 6, fontSize: 13, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit', outline: 'none' }}
                              autoFocus
                            />
                            <button onClick={() => saveLimit(m.id, editingLimit.value)} style={{ padding: '4px 10px', background: '#0081f0', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>OK</button>
                            <button onClick={() => setEditingLimit(null)} style={{ padding: '4px 8px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
                          </div>
                        ) : (
                          <button onClick={() => setEditingLimit({ memberId: m.id, value: m.org_quota_limit ?? '' })}
                            style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--text-muted)' }}>
                            {m.org_quota_limit != null ? `${m.org_quota_limit} máx` : 'Sem limite'}
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {m.org_role !== 'admin' && (
                          <button onClick={() => removeMember(m.id, m.name)}
                            style={{ padding: '5px 8px', border: '1px solid #EF444433', borderRadius: 6, cursor: 'pointer', background: 'transparent', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                            <TrashIcon />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Convites pendentes */}
          {pendingInvites.length > 0 && (
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Convites pendentes ({pendingInvites.length})</p>
              </div>
              {pendingInvites.map(inv => (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>{inv.email}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enviado em {fmt(inv.created_at)}</p>
                  </div>
                  <button onClick={() => cancelInvite(inv.id)}
                    style={{ padding: '5px 12px', border: '1px solid #EF444433', borderRadius: 7, cursor: 'pointer', background: 'transparent', color: '#EF4444', fontSize: 12 }}>
                    Cancelar
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
