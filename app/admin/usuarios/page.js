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

  // Modals
  const [addQuotaModal, setAddQuotaModal] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [addType, setAddType] = useState('eval');

  const [evalsModal, setEvalsModal] = useState(null); // { user }
  const [evals, setEvals] = useState([]);
  const [evalsLoading, setEvalsLoading] = useState(false);

  const [tempPassModal, setTempPassModal] = useState(null); // { email, password }

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

  async function toggleBlock(userId, blocked) {
    setSaving(userId + '_block');
    await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, blocked }),
    });
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked } : u));
    setSaving(null);
  }

  async function resetPassword(userId, email) {
    if (!confirm(`Resetar senha de ${email}?`)) return;
    setSaving(userId + '_reset');
    const res = await fetch('/api/admin/usuarios', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, resetPassword: true }),
    });
    const data = await res.json();
    setSaving(null);
    if (data.tempPassword) setTempPassModal({ email, password: data.tempPassword });
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

  async function openEvals(user) {
    setEvalsModal(user);
    setEvals([]);
    setEvalsLoading(true);
    const res = await fetch(`/api/admin/usuarios/${user.id}/avaliacoes`, { headers: { Authorization: `Bearer ${token()}` } });
    const data = await res.json();
    setEvals(Array.isArray(data) ? data : []);
    setEvalsLoading(false);
  }

  const inpStyle = {
    padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 9,
    fontSize: 13, outline: 'none', background: 'var(--bg-card)',
    color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  const btnStyle = (color = 'var(--text-main)') => ({
    padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'none',
    cursor: 'pointer', fontSize: 12, fontWeight: 600, color, fontFamily: 'inherit', whiteSpace: 'nowrap',
  });

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
          style={{ ...btnStyle(), padding: '9px 18px', fontSize: 13 }}
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
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none', opacity: u.blocked ? 0.6 : 1 }}>
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 14 }}>{u.name || '—'}</div>
                      {u.blocked && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 5, background: '#fee2e2', color: '#dc2626' }}>BLOQUEADO</span>}
                      {u.is_admin && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 5, background: '#fef3c7', color: '#d97706' }}>ADMIN</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{u.email}</div>
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
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => openEvals(u)}
                          style={btnStyle()}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          Avaliações
                        </button>
                        <button
                          onClick={() => { setAddQuotaModal(u.id); setAddAmount(''); setAddType('eval'); }}
                          style={btnStyle()}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          + Cotas
                        </button>
                        <button
                          onClick={() => resetPassword(u.id, u.email)}
                          disabled={saving === u.id + '_reset'}
                          style={btnStyle('#0081f0')}
                          onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          {saving === u.id + '_reset' ? '...' : 'Reset Senha'}
                        </button>
                        <button
                          onClick={() => toggleBlock(u.id, !u.blocked)}
                          disabled={saving === u.id + '_block'}
                          style={btnStyle(u.blocked ? '#16a34a' : '#dc2626')}
                          onMouseEnter={e => e.currentTarget.style.background = u.blocked ? '#f0fdf4' : '#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          {saving === u.id + '_block' ? '...' : u.blocked ? 'Desbloquear' : 'Bloquear'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Adicionar cotas */}
      {addQuotaModal && (
        <div onClick={() => setAddQuotaModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-card)', width: '100%', maxWidth: 380, padding: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>Adicionar Cotas</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{users.find(u => u.id === addQuotaModal)?.email}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <select value={addType} onChange={e => setAddType(e.target.value)} style={inpStyle}>
                <option value="eval">Avaliações</option>
                <option value="rel">Relatórios</option>
              </select>
              <input type="number" min="1" placeholder="Quantidade" value={addAmount} onChange={e => setAddAmount(e.target.value)} style={inpStyle} onKeyDown={e => e.key === 'Enter' && addQuotas()} />
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={() => setAddQuotaModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 9, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'inherit' }}>Cancelar</button>
                <button onClick={addQuotas} disabled={!addAmount || saving === addQuotaModal + '_quota'} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: !addAmount ? 0.5 : 1, fontFamily: 'inherit' }}>
                  {saving === addQuotaModal + '_quota' ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Avaliações do usuário */}
      {evalsModal && (
        <div onClick={() => setEvalsModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border-card)', maxWidth: 720, width: '100%', maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)' }}>{evalsModal.name || evalsModal.email}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{evalsModal.email} · {evals.length} avaliações</div>
              </div>
              <button onClick={() => setEvalsModal(null)} style={{ padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)', lineHeight: 1, fontFamily: 'inherit' }}>×</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {evalsLoading && <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>}
              {!evalsLoading && evals.length === 0 && (
                <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>Nenhuma avaliação encontrada.</div>
              )}
              {!evalsLoading && evals.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-content)' }}>
                      {['Aluno', 'Exercício', 'Turma', 'Nota', 'Data'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {evals.map((e, i) => (
                      <tr key={e.id} style={{ borderBottom: i < evals.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14, color: 'var(--text-main)' }}>{e.student_name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-sub)' }}>{e.exercise_name || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-sub)' }}>{e.turma || '—'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: 13, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
                            color: e.score >= 8 ? '#16a34a' : e.score >= 6 ? '#d97706' : '#dc2626',
                            background: e.score >= 8 ? '#f0fdf4' : e.score >= 6 ? '#fffbeb' : '#fef2f2',
                            border: `1px solid ${e.score >= 8 ? '#bbf7d0' : e.score >= 6 ? '#fde68a' : '#fecaca'}`,
                          }}>
                            {typeof e.score === 'number' ? e.score.toFixed(1) : e.score}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {new Date(e.created_at).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Senha temporária */}
      {tempPassModal && (
        <div onClick={() => setTempPassModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-card)', width: '100%', maxWidth: 400, padding: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)', marginBottom: 4 }}>Senha Resetada</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>{tempPassModal.email}</p>
            <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 8 }}>Senha temporária — anote e envie ao usuário:</p>
            <div style={{ padding: '14px 18px', background: 'var(--bg-content)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 18, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 2, color: 'var(--text-main)', textAlign: 'center', marginBottom: 20 }}>
              {tempPassModal.password}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>O usuário deve trocar a senha após o primeiro acesso.</p>
            <button
              onClick={() => { navigator.clipboard?.writeText(tempPassModal.password); }}
              style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8 }}
            >
              Copiar senha
            </button>
            <button
              onClick={() => setTempPassModal(null)}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: 9, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'inherit' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
