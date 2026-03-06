'use client';

// ── Opção A: Light limpo ──────────────────────────────────────────────────────

function LoginA() {
  return (
    <div style={{
      minHeight: '100vh', background: '#F8FAFC',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/imagens/logo.svg" alt="AvaliA" style={{ height: 34, width: 'auto', marginBottom: 14 }} />
          <p style={{ color: '#6B7280', fontSize: 14, margin: 0 }}>Entre na sua conta</p>
        </div>
        <div style={{
          background: 'white', borderRadius: 16, padding: '32px 32px 28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 32px rgba(0,129,240,0.06)',
          border: '1px solid #E5E7EB',
        }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
            <input type="email" placeholder="seu@email.com" defaultValue="kaue.peres@hotmail.com"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Senha</label>
            <input type="password" placeholder="••••••••" defaultValue="password"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button style={{
            width: '100%', padding: 12, borderRadius: 10, fontSize: 15, fontWeight: 600,
            background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', cursor: 'pointer',
          }}>
            Entrar
          </button>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9CA3AF' }}>
            Não tem conta? <span style={{ color: '#0081f0', fontWeight: 600, cursor: 'pointer' }}>Criar conta</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Opção B: Split screen ─────────────────────────────────────────────────────

function LoginB() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left — branding */}
      <div style={{
        flex: 1, background: 'linear-gradient(145deg, #0a0c18 0%, #0d1230 50%, #1a0530 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 56px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '20%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,129,240,0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,12,250,0.14) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <img src="/imagens/logo_branco.svg" alt="AvaliA" style={{ height: 32, marginBottom: 48 }} />
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 20, letterSpacing: '-0.5px' }}>
            Avalie trabalhos com<br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              inteligência artificial
            </span>
          </h2>
          <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.6, marginBottom: 40, maxWidth: 360 }}>
            Poupe horas de trabalho com correções detalhadas, feedback personalizado e relatórios automáticos.
          </p>
          {[
            'Correção automática com IA',
            'Feedback individualizado por aluno',
            'Relatórios de turma e desempenho',
          ].map(f => (
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
      <div style={{
        width: 440, background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px',
      }}>
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6, letterSpacing: '-0.3px' }}>Bem-vindo de volta</h2>
          <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Entre com suas credenciais para acessar</p>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
            <input type="email" placeholder="seu@email.com" defaultValue="kaue.peres@hotmail.com"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Senha</label>
            <input type="password" placeholder="••••••••" defaultValue="password"
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, border: '1.5px solid #E5E7EB', background: '#F9FAFB', color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button style={{
            width: '100%', padding: 12, borderRadius: 10, fontSize: 15, fontWeight: 600,
            background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,129,240,0.25)',
          }}>
            Entrar
          </button>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#9CA3AF' }}>
            Não tem conta? <span style={{ color: '#0081f0', fontWeight: 600, cursor: 'pointer' }}>Criar conta grátis</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Página de comparação ──────────────────────────────────────────────────────

export default function TestePage() {
  return (
    <div>
      {/* Label A */}
      <div style={{ background: '#1e293b', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ background: '#0081f0', color: 'white', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>OPÇÃO A</span>
        <span style={{ color: '#94A3B8', fontSize: 13 }}>Light limpo — fundo claro, card branco</span>
      </div>
      <LoginA />

      {/* Divider + Label B */}
      <div style={{ background: '#1e293b', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ background: '#810cfa', color: 'white', fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>OPÇÃO B</span>
        <span style={{ color: '#94A3B8', fontSize: 13 }}>Split screen — esquerda escura com branding, direita clara com formulário</span>
      </div>
      <LoginB />
    </div>
  );
}
