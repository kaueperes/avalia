'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push(data.user.onboarding_done ? '/inicio' : '/onboarding');
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

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
          <img src="/imagens/logo_kriteria_branco.svg" alt="Kriteria" style={{ height: 32, marginBottom: 48 }} />
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 20, letterSpacing: '-0.5px' }}>
            Avalie trabalhos com<br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              qualidade e consistência!
            </span>
          </h2>
          <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.6, marginBottom: 40, maxWidth: 360 }}>
            Poupe horas de trabalho com correções detalhadas, feedback personalizado e relatórios automáticos.
          </p>
          {['Correção automatizada com critérios personalizados', 'Feedback individualizado por aluno', 'Relatórios de turma e desempenho'].map(f => (
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
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, letterSpacing: '-0.3px' }}>Bem-vindo de volta</h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Entre com suas credenciais para acessar</p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#0081f0'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#0081f0'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <Link href="/esqueci-senha" style={{ fontSize: 12, color: '#0081f0', textDecoration: 'none', fontWeight: 500 }}>Esqueci minha senha</Link>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: 12, borderRadius: 10, fontSize: 15, fontWeight: 600,
              background: loading ? '#E5E7EB' : 'linear-gradient(135deg, #0081f0, #810cfa)',
              color: loading ? '#9CA3AF' : 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(0,129,240,0.25)',
            }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9CA3AF' }}>
            Não tem conta?{' '}
            <Link href="/signup" style={{ color: '#0081f0', fontWeight: 600, textDecoration: 'none' }}>Criar conta grátis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
