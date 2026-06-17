'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ConvitePage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  const [invite, setInvite] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error | accepted | used
  const [errorMsg, setErrorMsg] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [loggedEmail, setLoggedEmail] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!token) { setStatus('error'); setErrorMsg('Token inválido.'); return; }

    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.email) setLoggedEmail(u.email);
      if (localStorage.getItem('token')) setIsLoggedIn(true);
    } catch {}

    fetch(`/api/org/accept-invite?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          if (d.status === 'accepted') setStatus('used');
          else { setStatus('error'); setErrorMsg(d.error); }
        } else {
          setInvite(d);
          setStatus('ready');
        }
      })
      .catch(() => { setStatus('error'); setErrorMsg('Erro ao carregar convite.'); });
  }, [token]);

  async function accept() {
    setAccepting(true);
    try {
      const storedToken = localStorage.getItem('token');
      const r = await fetch('/api/org/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${storedToken}` },
        body: JSON.stringify({ token }),
      });
      const d = await r.json();
      if (r.ok) {
        // Atualizar localStorage com novos dados
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          u.plan = 'org';
          localStorage.setItem('user', JSON.stringify(u));
        } catch {}
        setStatus('accepted');
      } else {
        setErrorMsg(d.error || 'Erro ao aceitar convite.');
        setStatus('error');
      }
    } finally { setAccepting(false); }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', maxWidth: 460, width: '100%', boxShadow: '0 4px 40px rgba(0,0,0,0.10)', textAlign: 'center' }}>
        {/* Logo */}
        <p style={{ fontSize: 24, fontWeight: 900, color: '#111827', marginBottom: 32, letterSpacing: '-0.5px' }}>
          Aval<span style={{ color: '#0081f0' }}>iA</span>
        </p>

        {status === 'loading' && (
          <p style={{ fontSize: 15, color: '#6b7280' }}>Carregando convite...</p>
        )}

        {status === 'used' && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#0081f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Convite já aceito</h2>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 28, lineHeight: 1.6 }}>Este convite já foi utilizado. Faça login para acessar sua conta institucional.</p>
            <button onClick={() => router.push('/login')} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
              Fazer login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Convite inválido</h2>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 28 }}>{errorMsg}</p>
            <button onClick={() => router.push('/login')} style={{ padding: '12px 28px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
              Voltar ao início
            </button>
          </>
        )}

        {status === 'accepted' && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Bem-vindo à {invite?.orgName}!</h2>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 28, lineHeight: 1.6 }}>Você agora faz parte da organização. Suas cotas de avaliação são gerenciadas pela instituição.</p>
            <button onClick={() => router.push('/inicio')} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
              Ir para o início
            </button>
          </>
        )}

        {status === 'ready' && invite && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 8 }}>Convite para {invite.orgName}</h2>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 28, lineHeight: 1.6 }}>
              Você foi convidado para fazer parte de <strong>{invite.orgName}</strong> no Kriteria.
              <br /><br />
              Convite enviado para: <strong>{invite.email}</strong>
            </p>

            {!isLoggedIn ? (
              <>
                <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>Para aceitar o convite, faça login ou crie uma conta com o email <strong>{invite.email}</strong>.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => router.push(`/login?redirect=/convite?token=${token}`)} style={{ flex: 1, padding: '12px 20px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    Fazer login
                  </button>
                  <button onClick={() => router.push(`/signup?redirect=/convite?token=${token}`)} style={{ flex: 1, padding: '12px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Criar conta
                  </button>
                </div>
              </>
            ) : loggedEmail && loggedEmail.toLowerCase() !== invite.email.toLowerCase() ? (
              <>
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '14px 16px', marginBottom: 20, fontSize: 14, color: '#dc2626' }}>
                  Você está logado como <strong>{loggedEmail}</strong>, mas este convite é para <strong>{invite.email}</strong>.<br />Faça login com o email correto.
                </div>
                <button onClick={() => { localStorage.clear(); router.push(`/login?redirect=/convite?token=${token}`); }}
                  style={{ padding: '12px 28px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                  Trocar conta
                </button>
              </>
            ) : (
              <button onClick={accept} disabled={accepting}
                style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: accepting ? 'wait' : 'pointer', width: '100%' }}>
                {accepting ? 'Aceitando...' : `Entrar na ${invite.orgName}`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ConvitePageWrapper() {
  return (
    <Suspense fallback={null}>
      <ConvitePage />
    </Suspense>
  );
}
