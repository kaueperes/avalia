'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError('Erro ao enviar. Tente novamente.');
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
            Esqueceu sua senha?<br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sem problema.
            </span>
          </h2>
          <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.6, maxWidth: 360 }}>
            Enviaremos um link para o seu email para você criar uma nova senha em segundos.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ width: 440, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ width: '100%' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 10 }}>Email enviado!</h2>
              <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 28 }}>
                Se existe uma conta com o email <strong>{email}</strong>, você receberá um link para redefinir sua senha em breve.
                Verifique também a caixa de spam.
              </p>
              <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '11px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', textDecoration: 'none' }}>
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, letterSpacing: '-0.3px' }}>Redefinir senha</h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Digite seu email e enviaremos um link de redefinição</p>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 20 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#0081f0'} onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: 12, borderRadius: 10, fontSize: 15, fontWeight: 600,
                  background: loading ? '#E5E7EB' : 'linear-gradient(135deg, #0081f0, #810cfa)',
                  color: loading ? '#9CA3AF' : 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(0,129,240,0.25)',
                }}>
                  {loading ? 'Enviando...' : 'Enviar link de redefinição'}
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
