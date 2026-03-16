'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';

const PLANS = ['gratuito', 'essencial', 'pro', 'premium'];
const planLabel = { gratuito: 'Gratuito', essencial: 'Essencial', pro: 'Pro', premium: 'Premium' };
const planColor = { gratuito: '#9ca3af', essencial: '#0081f0', pro: '#810cfa', premium: '#f59e0b' };

export default function AdminUsuariosPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);
  const [addQuotaModal, setAddQuotaModal] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [addType, setAddType] = useState('eval');

  function token() { return localStorage.getItem('token'); }

  const load = useCallback((q = '') => {
    setLoading(true);
    fetch(`/api/admin/usuarios${q ? `?q=${encodeURIComponent(q)}` : ''}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (!u.is_admin) { router.push('/inicio'); return; }
      if (u.name) setUserName(u.name);
    } catch { router.push('/inicio'); return; }
    load();
  }, [router, load]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search, load]);

  async function changePlan(userId, plan) {
    setSaving(userId + '_plan');
    await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan }),
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan } : u));
    setSaving(null);
  }

  async function addQuotas() {
    const amount = parseInt(addAmount, 10);
    if (!amount || amount <= 0) return;
    setSaving(addQuotaModal + '_quota');
    const body = { userId: addQuotaModal };
    if (addType === 'eval') body.addQuota = amount;
    else body.addQuotaRel = amount;
    await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setUsers(prev => prev.map(u => {
      if (u.id !== addQuotaModal) return u;
      if (addType === 'eval') return { ...u, quota_ciclo: (u.quota_ciclo ?? 0) + amount };
      return { ...u, quota_relatorios_ciclo: (u.quota_relatorios_ciclo ?? 0) + amount };
    }));
    setSaving(null);
    setAddQuotaModal(null);
    setAddAmount('');
  }

  const inpStyle = {
    padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 9,
    fontSize: 13, outline: 'none', background: 'var(--bg-card)',
    color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <AppLayout userName={userName}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Painel Administrativo</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Usuários</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Gerencie planos, cotas e contas de todos os usuários.</p>
        </div>
        <button
          onClick={() => router.push('/admin')}
          style={{ padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 9, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          ← Voltar
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          style={{ ...inpStyle, width: '100%', maxWidth: 380 }}
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>}

      {!loading && users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 32px', border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg-card)' }}>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>Nenhum usuário encontrado.</p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-content)' }}>
                {['Usuário', 'Plano', 'Avaliações', 'Relatórios', 'Cadastro', 'Ações'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 14 }}>{u.name || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{u.email}</div>
                    {u.is_admin && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 5, background: '#fef3c7', color: '#d97706', marginTop: 2, display: 'inline-block' }}>ADMIN</span>}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {u.is_admin ? (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                    ) : (
                      <select
                        value={u.plan || 'gratuito'}
                        onChange={e => changePlan(u.id, e.target.value)}
                        disabled={saving === u.id + '_plan'}
                        style={{ ...inpStyle, padding: '5px 8px', fontSize: 12, fontWeight: 600, color: planColor[u.plan] || '#9ca3af', cursor: 'pointer' }}
                      >
                        {PLANS.map(p => <option key={p} value={p}>{planLabel[p]}</option>)}
                      </select>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text-main)', fontWeight: 500 }}>
                    {u.is_admin ? '—' : (
                      <span>
                        {u.quota_ciclo ?? 0}
                        {(u.quota_extra ?? 0) > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> +{u.quota_extra}</span>}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text-main)', fontWeight: 500 }}>
                    {u.is_admin ? '—' : (
                      <span>
                        {u.quota_relatorios_ciclo ?? 0}
                        {(u.quota_relatorios_extra ?? 0) > 0 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> +{u.quota_relatorios_extra}</span>}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px', color: 'var(--text-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    {!u.is_admin && (
                      <button
                        onClick={() => { setAddQuotaModal(u.id); setAddAmount(''); setAddType('eval'); }}
                        style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        + Cotas
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal adicionar cotas */}
      {addQuotaModal && (
        <div
          onClick={() => setAddQuotaModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-card)', width: '100%', maxWidth: 380, padding: 28 }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>Adicionar Cotas</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
              {users.find(u => u.id === addQuotaModal)?.email}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <select
                value={addType}
                onChange={e => setAddType(e.target.value)}
                style={{ ...inpStyle }}
              >
                <option value="eval">Avaliações</option>
                <option value="rel">Relatórios</option>
              </select>
              <input
                type="number"
                min="1"
                placeholder="Quantidade"
                value={addAmount}
                onChange={e => setAddAmount(e.target.value)}
                style={{ ...inpStyle }}
                onKeyDown={e => e.key === 'Enter' && addQuotas()}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  onClick={() => setAddQuotaModal(null)}
                  style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 9, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'inherit' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={addQuotas}
                  disabled={!addAmount || saving === addQuotaModal + '_quota'}
                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: !addAmount ? 0.5 : 1, fontFamily: 'inherit' }}
                >
                  {saving === addQuotaModal + '_quota' ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
