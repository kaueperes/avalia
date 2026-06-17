'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../../components/AppLayout';

export default function OrgDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  function token() { return localStorage.getItem('token'); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (!u.org_id || u.org_role !== 'admin') { router.push('/inicio'); return; }
      if (u.name) setUserName(u.name);
    } catch { router.push('/inicio'); return; }

    fetch('/api/org/dashboard', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const quotaLeft = data ? (data.org?.quota_pool || 0) - (data.org?.quota_used || 0) : 0;
  const pct = data?.org?.quota_pool > 0 ? Math.round((data.org.quota_used / data.org.quota_pool) * 100) : 0;

  return (
    <AppLayout userName={userName}>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#0081f0', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Institucional</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
          {data?.org?.name || 'Minha Instituição'}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Visão geral da sua organização.</p>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>}

      {!loading && data && (
        <>
          {/* Cards de estatísticas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '24px 28px', border: '1px solid var(--border-card)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Avaliações disponíveis</p>
              <p style={{ fontSize: 36, fontWeight: 800, color: quotaLeft <= 20 ? '#ef4444' : '#0081f0', letterSpacing: '-1px', lineHeight: 1 }}>{quotaLeft}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>de {data.org?.quota_pool || 0} no pool</p>
            </div>
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '24px 28px', border: '1px solid var(--border-card)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Professores</p>
              <p style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-1px', lineHeight: 1 }}>{data.memberCount}</p>
              {data.pendingInvites > 0 && <p style={{ fontSize: 13, color: '#d97706', marginTop: 4 }}>{data.pendingInvites} convite{data.pendingInvites > 1 ? 's' : ''} pendente{data.pendingInvites > 1 ? 's' : ''}</p>}
            </div>
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '24px 28px', border: '1px solid var(--border-card)' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Avaliações este mês</p>
              <p style={{ fontSize: 36, fontWeight: 800, color: '#810cfa', letterSpacing: '-1px', lineHeight: 1 }}>{data.evalThisMonth}</p>
            </div>
          </div>

          {/* Barra de uso do pool */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '24px 28px', border: '1px solid var(--border-card)', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Uso do pool de avaliações</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{data.org?.quota_used || 0} / {data.org?.quota_pool || 0} usadas</p>
            </div>
            <div style={{ height: 10, background: 'var(--bg-content)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct >= 90 ? '#ef4444' : pct >= 70 ? '#d97706' : '#0081f0', borderRadius: 99, transition: 'width .3s' }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{pct}% utilizado</p>
          </div>

          {/* Ações rápidas */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/org/professores')}
              style={{ padding: '11px 24px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Gerenciar Professores
            </button>
            <button
              onClick={() => router.push('/org/avaliacoes')}
              style={{ padding: '11px 24px', background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Ver Avaliações
            </button>
          </div>
        </>
      )}
    </AppLayout>
  );
}
