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
  const [editingLimit, setEditingLimit] = useState(null); // { memberId, type: 'avaliacoes' | 'relatorios', value }

  // Equipes
  const [teams, setTeams] = useState([]);
  const [orgDisciplines, setOrgDisciplines] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [addingMember, setAddingMember] = useState(null); // { teamId, userId, disciplineId }
  const [savingTeamMember, setSavingTeamMember] = useState(false);

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
    const [mRes, iRes, tRes, dRes] = await Promise.all([
      fetch('/api/org/members', { headers: { Authorization: `Bearer ${token()}` } }),
      fetch('/api/org/invites', { headers: { Authorization: `Bearer ${token()}` } }),
      fetch('/api/org/teams', { headers: { Authorization: `Bearer ${token()}` } }),
      fetch('/api/disciplines', { headers: { Authorization: `Bearer ${token()}` } }),
    ]);
    if (mRes.ok) setMembers(await mRes.json());
    if (iRes.ok) setInvites(await iRes.json());
    if (tRes.ok) setTeams(await tRes.json());
    if (dRes.ok) setOrgDisciplines((await dRes.json()).filter(d => d.orgId));
    setLoading(false);
  }

  async function createTeam() {
    if (!newTeamName.trim()) return;
    setCreatingTeam(true);
    try {
      const r = await fetch('/api/org/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ name: newTeamName.trim() }),
      });
      if (r.ok) { flash('Equipe criada!'); setNewTeamName(''); load(); }
      else { const d = await r.json(); flash(d.error || 'Erro ao criar equipe', false); }
    } finally { setCreatingTeam(false); }
  }

  async function deleteTeam(id, name) {
    if (!confirm(`Excluir a equipe "${name}"? Os vínculos de professores com ela serão removidos.`)) return;
    await fetch(`/api/org/teams/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    flash('Equipe excluída');
    load();
  }

  async function addTeamMember(teamId) {
    if (!addingMember?.userId || !addingMember?.disciplineId) return;
    setSavingTeamMember(true);
    try {
      const r = await fetch(`/api/org/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ userId: addingMember.userId, disciplineId: addingMember.disciplineId }),
      });
      const d = await r.json();
      if (r.ok) { setAddingMember(null); load(); }
      else flash(d.error || 'Erro ao adicionar à equipe', false);
    } finally { setSavingTeamMember(false); }
  }

  async function removeTeamMember(teamId, memberId) {
    await fetch(`/api/org/teams/${teamId}/members?memberId=${memberId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    load();
  }

  async function setCoordinator(teamId, coordinatorId) {
    const r = await fetch(`/api/org/teams/${teamId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ coordinatorId: coordinatorId || null }),
    });
    if (r.ok) load();
    else { const d = await r.json(); flash(d.error || 'Erro ao definir coordenador', false); }
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

  async function saveLimit(memberId, type, value) {
    const limit = value === '' ? null : Number(value);
    const body = type === 'relatorios'
      ? { memberId, orgQuotaRelatoriosLimit: limit }
      : { memberId, orgQuotaLimit: limit };
    const r = await fetch('/api/org/members', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(body),
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
                    {['Professor', 'Email', 'Membro desde', 'Avaliações', 'Limite', 'Relatórios', 'Limite', ''].map((h, i) => (
                      <th key={i} style={{ padding: '10px 20px', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'left' }}>{h}</th>
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
                        {editingLimit?.memberId === m.id && editingLimit.type === 'avaliacoes' ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                              type="number"
                              min="0"
                              value={editingLimit.value}
                              onChange={e => setEditingLimit(l => ({ ...l, value: e.target.value }))}
                              style={{ width: 70, padding: '4px 8px', border: '1px solid var(--border-input)', borderRadius: 6, fontSize: 13, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit', outline: 'none' }}
                              autoFocus
                            />
                            <button onClick={() => saveLimit(m.id, 'avaliacoes', editingLimit.value)} style={{ padding: '4px 10px', background: '#0081f0', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>OK</button>
                            <button onClick={() => setEditingLimit(null)} style={{ padding: '4px 8px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
                          </div>
                        ) : (
                          <button onClick={() => setEditingLimit({ memberId: m.id, type: 'avaliacoes', value: m.org_quota_limit ?? '' })}
                            style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--text-muted)' }}>
                            {m.org_quota_limit != null ? `${m.org_quota_limit} máx` : 'Sem limite'}
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{m.org_quota_relatorios_used || 0}</td>
                      <td style={{ padding: '14px 20px' }}>
                        {editingLimit?.memberId === m.id && editingLimit.type === 'relatorios' ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                              type="number"
                              min="0"
                              value={editingLimit.value}
                              onChange={e => setEditingLimit(l => ({ ...l, value: e.target.value }))}
                              style={{ width: 70, padding: '4px 8px', border: '1px solid var(--border-input)', borderRadius: 6, fontSize: 13, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit', outline: 'none' }}
                              autoFocus
                            />
                            <button onClick={() => saveLimit(m.id, 'relatorios', editingLimit.value)} style={{ padding: '4px 10px', background: '#0081f0', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>OK</button>
                            <button onClick={() => setEditingLimit(null)} style={{ padding: '4px 8px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
                          </div>
                        ) : (
                          <button onClick={() => setEditingLimit({ memberId: m.id, type: 'relatorios', value: m.org_quota_relatorios_limit ?? '' })}
                            style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, cursor: 'pointer', color: 'var(--text-muted)' }}>
                            {m.org_quota_relatorios_limit != null ? `${m.org_quota_relatorios_limit} máx` : 'Sem limite'}
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

          {/* Equipes */}
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px', marginBottom: 6 }}>Equipes</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 14 }}>
              Uma equipe representa um curso — um professor pode estar em várias, cada uma com sua própria disciplina e coordenador.
            </p>

            <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  placeholder="Nome da equipe (ex: Curso de Engenharia)"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createTeam()}
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--border-input)', borderRadius: 10, fontSize: 14, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit', outline: 'none' }}
                />
                <button onClick={createTeam} disabled={creatingTeam || !newTeamName.trim()}
                  style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: !newTeamName.trim() ? 0.5 : 1, flexShrink: 0 }}>
                  {creatingTeam ? 'Criando...' : 'Criar equipe'}
                </button>
              </div>
            </div>

            {teams.length === 0 ? (
              <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                Nenhuma equipe criada ainda.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {teams.map(team => (
                  <div key={team.id} style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '18px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>{team.name}</p>
                      <button onClick={() => deleteTeam(team.id, team.name)}
                        style={{ padding: '5px 8px', border: '1px solid #EF444433', borderRadius: 6, cursor: 'pointer', background: 'transparent', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                        <TrashIcon />
                      </button>
                    </div>

                    {team.members.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                        {team.members.map(m => (
                          <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 8 }}>
                            <span style={{ fontSize: 13, color: 'var(--text-main)' }}>
                              {m.userName} — {m.disciplineName}
                              {team.coordinatorId === m.userId && <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#eff6ff', color: '#0081f0', border: '1px solid #bfdbfe' }}>★ Coordenador</span>}
                            </span>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              {team.coordinatorId !== m.userId && (
                                <button onClick={() => setCoordinator(team.id, m.userId)}
                                  style={{ padding: '3px 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                                  Definir coordenador
                                </button>
                              )}
                              <button onClick={() => removeTeamMember(team.id, m.id)}
                                style={{ padding: '3px 6px', border: '1px solid #EF444433', borderRadius: 6, cursor: 'pointer', background: 'transparent', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                                <TrashIcon />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {addingMember?.teamId === team.id ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingTop: 10, borderTop: '1px dashed var(--border)' }}>
                        <select value={addingMember.userId} onChange={e => setAddingMember(v => ({ ...v, userId: e.target.value }))}
                          style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--border-input)', borderRadius: 8, fontSize: 13, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit' }}>
                          <option value="">Selecione o professor</option>
                          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                        <select value={addingMember.disciplineId} onChange={e => setAddingMember(v => ({ ...v, disciplineId: e.target.value }))}
                          style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--border-input)', borderRadius: 8, fontSize: 13, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit' }}>
                          <option value="">Selecione a disciplina</option>
                          {orgDisciplines.map(d => <option key={d.id} value={d.id}>{d.subject}</option>)}
                        </select>
                        <button onClick={() => addTeamMember(team.id)} disabled={savingTeamMember || !addingMember.userId || !addingMember.disciplineId}
                          style={{ padding: '8px 16px', background: '#0081f0', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                          Adicionar
                        </button>
                        <button onClick={() => setAddingMember(null)} style={{ padding: '8px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>×</button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingMember({ teamId: team.id, userId: '', disciplineId: '' })}
                        style={{ padding: '6px 14px', border: '1px dashed var(--border)', borderRadius: 8, fontSize: 12, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                        + Adicionar professor
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
}
