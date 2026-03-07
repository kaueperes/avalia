'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Link inválido. Solicite um novo.');
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('As senhas não coincidem'); return; }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao redefinir senha');
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
          <img src="/imagens/logo_branco100.svg" alt="AvaliA" style={{ height: 32, marginBottom: 48 }} />
          <h2 style={{ fontSize: 28, fontWeight: 800, color: 'white', lineHeight: 1.3, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Crie uma{' '}
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              nova senha
            </span>
          </h2>
          <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.6, maxWidth: 360 }}>
            Escolha uma senha segura com pelo menos 6 caracteres.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ width: 440, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ width: '100%' }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Senha redefinida!</h2>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                Sua senha foi alterada com sucesso. Redirecionando para o login...
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, letterSpacing: '-0.3px' }}>Nova senha</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Digite e confirme sua nova senha</p>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 20 }}>
                  {error}
                  {!token && (
                    <span> <Link href="/esqueci-senha" style={{ color: '#DC2626', fontWeight: 600 }}>Solicitar novo link</Link></span>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nova senha</label>
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                    disabled={!token}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0081f0'} onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Confirmar senha</label>
                  <input
                    type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="••••••••"
                    disabled={!token}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0081f0'} onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
                <button type="submit" disabled={loading || !token} style={{
                  width: '100%', padding: 12, borderRadius: 10, fontSize: 15, fontWeight: 600,
                  background: (loading || !token) ? '#E5E7EB' : 'linear-gradient(135deg, #0081f0, #810cfa)',
                  color: (loading || !token) ? '#9CA3AF' : 'white', border: 'none', cursor: (loading || !token) ? 'not-allowed' : 'pointer',
                  boxShadow: (loading || !token) ? 'none' : '0 4px 16px rgba(0,129,240,0.25)',
                }}>
                  {loading ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9CA3AF' }}>
                <Link href="/login" style={{ color: '#0081f0', fontWeight: 600, textDecoration: 'none' }}>Voltar para o login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense>
      <RedefinirSenhaForm />
    </Suspense>
  );
}
