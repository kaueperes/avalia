'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/AppLayout';

// ── Plan config ──────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: 'free',
    label: 'Gratuito',
    price: 'R$ 0',
    color: '#6B7280',
    features: ['5 avaliações/mês', '1 perfil de professor', 'Exportação básica', 'Suporte por email'],
  },
  {
    id: 'essencial',
    label: 'Essencial',
    price: 'R$ 29,90/mês',
    color: '#0081f0',
    features: ['100 avaliações/mês', '3 perfis de professor', 'Exportação PDF e CSV', 'Chatbot assistente', 'Suporte prioritário'],
  },
  {
    id: 'pro',
    label: 'Pro',
    price: 'R$ 59,90/mês',
    color: '#810cfa',
    gradient: true,
    features: ['Avaliações ilimitadas', 'Perfis ilimitados', 'Exportação completa', 'Chatbot assistente', 'IA avançada (Sonnet)', 'Suporte dedicado'],
  },
];

// ── Section card ─────────────────────────────────────────────────────────────

const Section = ({ title, subtitle, children }) => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: '28px 32px', marginBottom: 20 }}>
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const Input = ({ value, onChange, type = 'text', placeholder, disabled }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    style={{
      width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
      border: '1px solid var(--border)', background: disabled ? 'var(--bg-content)' : 'var(--bg-card)',
      color: disabled ? 'var(--text-muted)' : 'var(--text-main)',
      outline: 'none', boxSizing: 'border-box', cursor: disabled ? 'not-allowed' : 'text',
    }}
  />
);

const SaveBtn = ({ onClick, loading, children = 'Salvar alterações' }) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
      background: loading ? 'var(--border)' : 'linear-gradient(135deg, #0081f0, #810cfa)',
      color: loading ? 'var(--text-muted)' : 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
    }}
  >
    {loading ? 'Salvando...' : children}
  </button>
);

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ContaPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Professor');
  const [userEmail, setUserEmail] = useState('');
  const [userPlan, setUserPlan] = useState('free');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  // UI states
  const [quotaCiclo, setQuotaCiclo] = useState(null);
  const [quotaExtra, setQuotaExtra] = useState(null);
  const [quotaResetDate, setQuotaResetDate] = useState(null);

  // UI states
  const [infoMsg, setInfoMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        setUserName(u.name || 'Professor');
        setUserEmail(u.email || '');
        setUserPlan(u.plan || 'free');
        setName(u.name || '');
        setEmail(u.email || '');
        if (u.quota_ciclo !== undefined) setQuotaCiclo(u.quota_ciclo);
        if (u.quota_extra !== undefined) setQuotaExtra(u.quota_extra);
        if (u.quota_reset_date) setQuotaResetDate(u.quota_reset_date);
      } else {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserEmail(payload.email || '');
        setEmail(payload.email || '');
      }
    } catch {}
  }, [router]);

  function showMsg(setter, type, text) {
    setter({ type, text });
    setTimeout(() => setter(null), 4000);
  }

  async function saveInfo() {
    if (!name.trim()) return showMsg(setInfoMsg, 'error', 'O nome não pode estar vazio.');
    setInfoLoading(true);
    await new Promise(r => setTimeout(r, 600)); // placeholder — connect to API when ready
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    const updated = { ...stored, name: name.trim(), email: email.trim() };
    localStorage.setItem('user', JSON.stringify(updated));
    setUserName(name.trim());
    setUserEmail(email.trim());
    setInfoLoading(false);
    showMsg(setInfoMsg, 'success', 'Informações atualizadas com sucesso.');
  }

  async function savePassword() {
    if (!currentPw || !newPw || !confirmPw) return showMsg(setPwMsg, 'error', 'Preencha todos os campos.');
    if (newPw.length < 6) return showMsg(setPwMsg, 'error', 'A nova senha deve ter ao menos 6 caracteres.');
    if (newPw !== confirmPw) return showMsg(setPwMsg, 'error', 'As senhas não coincidem.');
    setPwLoading(true);
    await new Promise(r => setTimeout(r, 600)); // placeholder — connect to API when ready
    setPwLoading(false);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    showMsg(setPwMsg, 'success', 'Senha alterada com sucesso.');
  }

  const planLabel = { free: 'Gratuito', essencial: 'Essencial', pro: 'Pro' }[userPlan] || 'Gratuito';

  return (
    <AppLayout userName={userName} userEmail={userEmail} userPlan={userPlan}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Conta</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Configurações da Conta</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Gerencie suas informações pessoais, segurança e plano.</p>
      </div>

      {/* ── Informações pessoais ── */}
      <Section title="Informações pessoais" subtitle="Seu nome e e-mail de acesso à plataforma.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <Field label="Nome completo">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
          </Field>
          <Field label="E-mail">
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" type="email" />
          </Field>
        </div>
        {infoMsg && (
          <p style={{ fontSize: 13, color: infoMsg.type === 'success' ? '#10B981' : '#EF4444', marginBottom: 14 }}>{infoMsg.text}</p>
        )}
        <SaveBtn onClick={saveInfo} loading={infoLoading} />
      </Section>

      {/* ── Segurança ── */}
      <Section title="Segurança" subtitle="Altere sua senha de acesso.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          <Field label="Senha atual">
            <Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" />
          </Field>
          <Field label="Nova senha">
            <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" />
          </Field>
          <Field label="Confirmar nova senha">
            <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" />
          </Field>
        </div>
        {pwMsg && (
          <p style={{ fontSize: 13, color: pwMsg.type === 'success' ? '#10B981' : '#EF4444', marginBottom: 14 }}>{pwMsg.text}</p>
        )}
        <SaveBtn onClick={savePassword} loading={pwLoading} children="Alterar senha" />
      </Section>

      {/* ── Plano atual ── */}
      <Section title="Plano" subtitle="Seu plano atual e opções de upgrade.">
        {/* Current plan highlight */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 10, background: 'var(--bg-content)', border: '1px solid var(--border)', marginBottom: 24 }}>
          <div style={{
            padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: userPlan === 'pro' ? 'linear-gradient(135deg, #0081f0, #810cfa)' : userPlan === 'essencial' ? '#EBF4FF' : 'var(--border)',
            color: userPlan === 'pro' ? 'white' : userPlan === 'essencial' ? '#0081f0' : 'var(--text-muted)',
          }}>
            {userPlan === 'pro' ? '★ ' : ''}{planLabel}
          </div>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {userPlan === 'free' ? 'Você está no plano gratuito.' : `Você está no Plano ${planLabel}.`}
          </span>
        </div>

        {/* Quota details */}
        {quotaCiclo !== null && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div style={{ padding: '16px 20px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-content)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Avaliações do plano</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: quotaCiclo === 0 ? '#EF4444' : 'var(--text-main)', letterSpacing: '-1px', lineHeight: 1, marginBottom: 6 }}>
                {quotaCiclo}
              </p>
              {quotaResetDate ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Renova em {new Date(quotaResetDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                </p>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Renova a cada ciclo de pagamento</p>
              )}
            </div>
            <div style={{ padding: '16px 20px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-content)' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Avaliações extras</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-1px', lineHeight: 1, marginBottom: 6 }}>
                {quotaExtra ?? 0}
              </p>
              <p style={{ fontSize: 12, color: '#10B981', fontWeight: 500 }}>Não expiram</p>
            </div>
          </div>
        )}

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {PLANS.map(plan => {
            const isCurrent = plan.id === userPlan;
            return (
              <div key={plan.id} style={{
                border: isCurrent ? `2px solid ${plan.color}` : '1px solid var(--border)',
                borderRadius: 12, padding: '20px 20px 18px', position: 'relative',
                background: isCurrent ? (plan.gradient ? 'linear-gradient(135deg, #0081f010, #810cfa10)' : `${plan.color}08`) : 'var(--bg-content)',
              }}>
                {isCurrent && (
                  <div style={{ position: 'absolute', top: -11, left: 16, fontSize: 11, fontWeight: 700, background: plan.gradient ? 'linear-gradient(135deg, #0081f0, #810cfa)' : plan.color, color: 'white', padding: '2px 10px', borderRadius: 20 }}>
                    Plano atual
                  </div>
                )}
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>{plan.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: plan.gradient ? '#810cfa' : plan.color, marginBottom: 14 }}>{plan.price}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ color: plan.gradient ? '#810cfa' : plan.color, fontSize: 15, lineHeight: 1 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && plan.id !== 'free' && (
                  <button style={{
                    width: '100%', padding: '9px 0', borderRadius: 9, fontSize: 13, fontWeight: 600,
                    background: plan.gradient ? 'linear-gradient(135deg, #0081f0, #810cfa)' : plan.color,
                    color: 'white', border: 'none', cursor: 'pointer',
                  }}>
                    Fazer upgrade
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Zona de perigo ── */}
      <Section title="Zona de perigo" subtitle="Ações irreversíveis. Proceda com cuidado.">
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'none', color: '#EF4444', border: '1px solid #EF444466', cursor: 'pointer' }}
          >
            Excluir minha conta
          </button>
        ) : (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '18px 20px' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#DC2626', marginBottom: 6 }}>Tem certeza? Esta ação não pode ser desfeita.</p>
            <p style={{ fontSize: 13, color: '#EF4444', marginBottom: 16 }}>Todos os seus dados, avaliações e exercícios serão permanentemente excluídos.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleteConfirm(false)}
                style={{ padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: 'white', color: '#374151', border: '1px solid #D1D5DB', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => { localStorage.clear(); router.push('/login'); }}
                style={{ padding: '9px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600, background: '#EF4444', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                Sim, excluir minha conta
              </button>
            </div>
          </div>
        )}
      </Section>
    </AppLayout>
  );
}
