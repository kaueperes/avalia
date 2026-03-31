'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FORMSPREE_ID = 'xqeyqlly';

const inputBase = {
  width: '100%',
  padding: '13px 16px',
  fontSize: 14,
  color: '#111827',
  background: 'white',
  border: '1.5px solid #E5E7EB',
  borderRadius: 10,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color .15s, box-shadow .15s',
};

export default function PortfolioContato() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: '', email: '', empresa: '', mensagem: '' });
  const [status, setStatus] = useState('idle');
  const [focused, setFocused] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...form, _subject: 'Contato via Portfolio - KriterIA' }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const field = name => ({
    ...inputBase,
    borderColor: focused === name ? '#0081f0' : '#E5E7EB',
    boxShadow: focused === name ? '0 0 0 3px rgba(0,129,240,0.1)' : 'none',
  });

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: 'white', color: '#111827', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ cursor: 'pointer' }} onClick={() => router.push('/portfolio')}>
            <img src="/imagens/logo_kriteria.svg" alt="KriterIA" style={{ height: 32, width: 'auto' }} />
          </div>
          <button onClick={() => router.push('/portfolio')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Voltar ao portfolio
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '140px 32px 72px', background: 'linear-gradient(145deg, #0a0c18 0%, #0d1230 55%, #1a0530 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,12,250,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 560, margin: '0 auto', position: 'relative' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #0081f0, #810cfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 26, fontWeight: 800, margin: '0 auto 24px' }}>K</div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 16 }}>Vamos conversar</p>
          <h1 style={{ fontSize: 44, fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 16 }}>Entre em contato</h1>
          <p style={{ fontSize: 17, color: '#94A3B8', lineHeight: 1.65 }}>Tem interesse em conversar sobre o projeto ou sobre oportunidades? Preencha o formulário e responderei em breve.</p>
        </div>
      </section>

      {/* Form + info */}
      <section style={{ padding: '72px 32px 96px', background: '#F9FAFB' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 48, alignItems: 'start' }}>

          {/* Info lateral */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E6F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>✉️</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>E-mail</h3>
              <a href="mailto:kaue.peres@hotmail.com" style={{ fontSize: 13, color: '#0081f0', textDecoration: 'none', fontWeight: 500 }}>kaue.peres@hotmail.com</a>
            </div>

            <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>📍</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Localização</h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>São Paulo, Brasil</p>
            </div>

            <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>⏱️</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Tempo de resposta</h3>
              <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Respondo em até 24 horas</p>
            </div>

            <a href="/portfolio" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 20, padding: 28, border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', textDecoration: 'none' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>📁</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>Ver portfolio</p>
                <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Case completo do KriterIA →</p>
              </div>
            </a>
          </div>

          {/* Formulário */}
          <div style={{ background: 'white', borderRadius: 20, padding: '40px', border: '1px solid #E5E7EB', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>

            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #0081f0, #810cfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 28, color: 'white' }}>✓</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 12 }}>Mensagem enviada!</h3>
                <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.65, marginBottom: 32 }}>
                  Obrigado pelo contato. Responderei em até 24 horas no e-mail informado.
                </p>
                <button
                  onClick={() => { setStatus('idle'); setForm({ nome: '', email: '', empresa: '', mensagem: '' }); }}
                  style={{ background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#00173f', marginBottom: 6 }}>Envie uma mensagem</h2>
                  <p style={{ fontSize: 14, color: '#9CA3AF' }}>Preencha o formulário e entrarei em contato.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Nome</label>
                      <input
                        name="nome" value={form.nome} onChange={handleChange} required
                        placeholder="Seu nome"
                        style={field('nome')}
                        onFocus={() => setFocused('nome')}
                        onBlur={() => setFocused(null)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>E-mail</label>
                      <input
                        name="email" type="email" value={form.email} onChange={handleChange} required
                        placeholder="seu@email.com"
                        style={field('email')}
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused(null)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Empresa <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(opcional)</span></label>
                    <input
                      name="empresa" value={form.empresa} onChange={handleChange}
                      placeholder="Ex: Ernst & Young, Google..."
                      style={field('empresa')}
                      onFocus={() => setFocused('empresa')}
                      onBlur={() => setFocused(null)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Mensagem</label>
                    <textarea
                      name="mensagem" value={form.mensagem} onChange={handleChange} required
                      placeholder="Conte um pouco sobre a oportunidade ou o que gostaria de conversar..."
                      rows={5}
                      style={{ ...field('mensagem'), resize: 'vertical', minHeight: 130 }}
                      onFocus={() => setFocused('mensagem')}
                      onBlur={() => setFocused(null)}
                    />
                  </div>

                  {status === 'error' && (
                    <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA', fontSize: 13, color: '#DC2626' }}>
                      Ocorreu um erro ao enviar. Tente novamente ou envie diretamente para kaue.peres@hotmail.com
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    style={{ background: status === 'sending' ? '#9CA3AF' : 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', borderRadius: 10, padding: '15px', fontSize: 15, fontWeight: 600, cursor: status === 'sending' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity .2s' }}
                  >
                    {status === 'sending' ? 'Enviando...' : <>Enviar mensagem <span>→</span></>}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#00173f', padding: '24px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: '#4B5563', margin: 0 }}>
          Portfolio de Kauê Rodrigues Peres · <a href="/portfolio" style={{ color: '#4B5563' }}>Voltar ao portfolio</a>
        </p>
      </footer>

    </div>
  );
}
