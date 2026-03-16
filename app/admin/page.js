'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/AppLayout';

const StatCard = ({ label, value, sub, color = 'var(--text-main)' }) => (
  <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '24px 28px', border: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', gap: 6 }}>
    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
    <p style={{ fontSize: 36, fontWeight: 800, color, letterSpacing: '-1px', lineHeight: 1 }}>{value ?? '—'}</p>
    {sub && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{sub}</p>}
  </div>
);

const planLabel = { gratuito: 'Gratuito', essencial: 'Essencial', pro: 'Pro', premium: 'Premium' };
const planColor = { gratuito: '#9ca3af', essencial: '#0081f0', pro: '#810cfa', premium: '#f59e0b' };

export default function AdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  function token() { return localStorage.getItem('token'); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (!u.is_admin) { router.push('/inicio'); return; }
      if (u.name) setUserName(u.name);
    } catch { router.push('/inicio'); return; }

    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const paid = stats ? stats.byPlan.essencial + stats.byPlan.pro + stats.byPlan.premium : 0;

  return (
    <AppLayout userName={userName}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Painel Administrativo</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Administração</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Visão geral do negócio e gestão de usuários.</p>
        </div>
        <button
          onClick={() => router.push('/admin/usuarios')}
          style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          Gerenciar Usuários
        </button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>}

      {!loading && stats && (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard label="Total de Usuários" value={stats.totalUsers} sub="excluindo admins" color="var(--text-main)" />
            <StatCard label="Novos este mês" value={stats.newThisMonth} color="#0081f0" />
            <StatCard label="Avaliações geradas" value={stats.totalEvaluations} color="#810cfa" />
            <StatCard label="Planos pagos" value={paid} sub="essencial + pro + premium" color="#10b981" />
          </div>

          {/* Distribuição por plano */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: '24px 28px', marginBottom: 32 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>Distribuição por Plano</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
              {Object.entries(stats.byPlan).map(([plan, count]) => (
                <div key={plan} style={{ textAlign: 'center', padding: '16px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-content)' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: planColor[plan], letterSpacing: '-1px', lineHeight: 1, marginBottom: 4 }}>{count}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{planLabel[plan]}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Acesso rápido */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { title: 'Gerenciar Usuários', desc: 'Busque por email, altere planos, adicione cotas e gerencie contas.', href: '/admin/usuarios' },
              { title: 'Configurar Chatbot', desc: 'Ajuste o nome, boas-vindas, modelo de IA e prompt do assistente virtual.', href: '/admin/chatbot' },
            ].map(({ title, desc, href }) => (
              <div key={href} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>{title}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{desc}</p>
                </div>
                <button
                  onClick={() => router.push(href)}
                  style={{ padding: '9px 20px', border: '1px solid var(--border)', borderRadius: 9, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', fontFamily: 'inherit' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  Abrir →
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </AppLayout>
  );
}
