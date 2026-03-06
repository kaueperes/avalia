'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
    border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#111827',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left — branding */}
      <div style={{
        flex: 1, background: 'linear-gradient(145deg, #0a0c18 0%, #0d1230 50%, #1a0530 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 56px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '30%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,129,240,0.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,12,250,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <img src="/imagens/logo_branco100.svg" alt="AvaliA" style={{ height: 32, marginBottom: 48 }} />
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 20, letterSpacing: '-0.5px' }}>
            Comece a avaliar<br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              de forma inteligente
            </span>
          </h2>
          <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.6, marginBottom: 40, maxWidth: 360 }}>
            Crie sua conta grátis e comece a usar o poder da IA para corrigir trabalhos em segundos.
          </p>
          {['5 avaliações gratuitas por mês', 'Sem cartão de crédito necessário', 'Cancele quando quiser'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, #0081f0, #810cfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>✓</span>
              </div>
              <span style={{ fontSize: 14, color: '#CBD5E1' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div style={{ width: 440, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, letterSpacing: '-0.3px' }}>Criar conta grátis</h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Preencha os dados para começar</p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nome</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Seu nome" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0081f0'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0081f0'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#0081f0'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: 12, borderRadius: 10, fontSize: 15, fontWeight: 600,
              background: loading ? '#E5E7EB' : 'linear-gradient(135deg, #0081f0, #810cfa)',
              color: loading ? '#9CA3AF' : 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(0,129,240,0.25)',
            }}>
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9CA3AF' }}>
            Já tem conta?{' '}
            <Link href="/login" style={{ color: '#0081f0', fontWeight: 600, textDecoration: 'none' }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
