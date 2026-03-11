'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────────────────────
// Substitua FORMSPREE_ID pelo ID do seu formulário em formspree.io
// Exemplo: se a URL for https://formspree.io/f/xabc1234, o ID é "xabc1234"
const FORMSPREE_ID = 'xqeyqlly';
// ─────────────────────────────────────────────────────────────────────────────

const inputStyle = {
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
  transition: 'border-color .15s',
};

export default function Contato() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: '', email: '', assunto: '', mensagem: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (FORMSPREE_ID === 'SEU_ID_AQUI') {
      setStatus('success'); // modo demo para portfólio
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const fieldStyle = name => ({
    ...inputStyle,
    borderColor: focusedField === name ? '#0081f0' : '#E5E7EB',
    boxShadow: focusedField === name ? '0 0 0 3px rgba(0,129,240,0.1)' : 'none',
  });

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: 'white', color: '#111827', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/imagens/logo.svg" alt="AvaliA" style={{ height: 36, width: 'auto' }} />
          </div>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 14, cursor: 'pointer' }}>
            ← Voltar ao início
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '140px 32px 64px', background: 'linear-gradient(145deg, #0a0c18 0%, #0d1230 55%, #1a0530 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 16 }}>Suporte</p>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>Fale conosco</h1>
          <p style={{ fontSize: 18, color: '#94A3B8', lineHeight: 1.65 }}>Tem alguma dúvida, sugestão ou problema? Estamos aqui para ajudar.</p>
        </div>
      </section>

      {/* Main content */}
      <section style={{ padding: '80px 32px 96px', background: '#F9FAFB' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 48, alignItems: 'start' }}>

          {/* Sidebar info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: 'white', borderRadius: 20, padding: '28px', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#E6F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>✉️</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>E-mail direto</h3>
              <a href="mailto:contato@avalia.education" style={{ fontSize: 13, color: '#0081f0', textDecoration: 'none', fontWeight: 500 }}>contato@avalia.education</a>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>Respondemos em até 24h úteis</p>
            </div>

            <div style={{ background: 'white', borderRadius: 20, padding: '28px', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>📖</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Central de Ajuda</h3>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 14 }}>Tutoriais e respostas para as dúvidas mais comuns.</p>
              <button onClick={() => router.push('/ajuda')} style={{ fontSize: 13, fontWeight: 600, color: '#810cfa', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Acessar →
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: 20, padding: '28px', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 12 }}>Horário de atendimento</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.8 }}>
                <div>Segunda a sexta</div>
                <div style={{ fontWeight: 600, color: '#374151' }}>9h às 18h (horário de Brasília)</div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: 'white', borderRadius: 20, padding: '40px', border: '1px solid #E5E7EB', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>

            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F0FDF4', border: '2px solid #D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>✓</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 12 }}>Mensagem enviada!</h3>
                <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.65, marginBottom: 32 }}>
                  Recebemos sua mensagem e responderemos em até 24 horas úteis no e-mail informado.
                </p>
                <button onClick={() => { setStatus('idle'); setForm({ nome: '', email: '', assunto: '', mensagem: '' }); }}
                  style={{ background: '#0081f0', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#00173f', marginBottom: 6 }}>Envie uma mensagem</h2>
                  <p style={{ fontSize: 14, color: '#9CA3AF' }}>Preencha o formulário e entraremos em contato.</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Nome</label>
                      <input
                        name="nome" value={form.nome} onChange={handleChange} required
                        placeholder="Seu nome"
                        style={fieldStyle('nome')}
                        onFocus={() => setFocusedField('nome')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>E-mail</label>
                      <input
                        name="email" type="email" value={form.email} onChange={handleChange} required
                        placeholder="seu@email.com"
                        style={fieldStyle('email')}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Assunto</label>
                    <select
                      name="assunto" value={form.assunto} onChange={handleChange} required
                      style={{ ...fieldStyle('assunto'), appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 40 }}
                      onFocus={() => setFocusedField('assunto')}
                      onBlur={() => setFocusedField(null)}
                    >
                      <option value="">Selecione um assunto</option>
                      <option value="Dúvida sobre a plataforma">Dúvida sobre a plataforma</option>
                      <option value="Problema técnico">Problema técnico</option>
                      <option value="Dúvida sobre planos e pagamentos">Dúvida sobre planos e pagamentos</option>
                      <option value="Sugestão de melhoria">Sugestão de melhoria</option>
                      <option value="Parceria ou institucional">Parceria ou institucional</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Mensagem</label>
                    <textarea
                      name="mensagem" value={form.mensagem} onChange={handleChange} required
                      placeholder="Descreva sua dúvida ou mensagem com o máximo de detalhes possível..."
                      rows={5}
                      style={{ ...fieldStyle('mensagem'), resize: 'vertical', minHeight: 130 }}
                      onFocus={() => setFocusedField('mensagem')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>

                  {status === 'error' && (
                    <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA', fontSize: 13, color: '#DC2626' }}>
                      Ocorreu um erro ao enviar. Tente novamente ou envie diretamente para contato@avalia.education
                    </div>
                  )}

                  <button type="submit" disabled={status === 'sending'}
                    style={{ background: status === 'sending' ? '#9CA3AF' : 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', borderRadius: 10, padding: '15px', fontSize: 15, fontWeight: 600, cursor: status === 'sending' ? 'not-allowed' : 'pointer', transition: 'opacity .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {status === 'sending' ? 'Enviando...' : 'Enviar mensagem'}
                    {status !== 'sending' && <span>→</span>}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </section>

      {/* FAQ rápido */}
      <section style={{ padding: '0 32px 96px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#00173f', marginBottom: 32, textAlign: 'center' }}>Dúvidas frequentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { q: 'Posso cancelar minha assinatura a qualquer momento?', a: 'Sim. Você pode cancelar quando quiser, sem multa. O acesso continua até o fim do período pago.' },
              { q: 'Os dados dos meus alunos ficam armazenados?', a: 'Os textos enviados para avaliação são processados pela IA e não ficam armazenados em nossos servidores. Apenas o resultado da avaliação (nota e feedback) é salvo.' },
              { q: 'Como funciona o plano gratuito?', a: 'O plano gratuito oferece 5 avaliações por mês, 1 perfil de professor e 3 exercícios salvos — sem necessidade de cartão de crédito.' },
              { q: 'Posso mudar de plano depois?', a: 'Sim. Você pode fazer upgrade ou downgrade do seu plano a qualquer momento diretamente na página da sua conta.' },
            ].map(({ q, a }) => (
              <div key={q} style={{ background: '#F9FAFB', borderRadius: 14, padding: '24px 28px', border: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 10 }}>{q}</div>
                <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer simples */}
      <footer style={{ background: '#00173f', padding: '32px', textAlign: 'center' }}>
        <div style={{ cursor: 'pointer', display: 'inline-block', marginBottom: 12 }} onClick={() => router.push('/')}>
          <img src="/imagens/logo.svg" alt="AvaliA" style={{ height: 28, width: 'auto', filter: 'brightness(0) invert(1)' }} />
        </div>
        <p style={{ fontSize: 13, color: '#4B5563' }}>© 2025 AvaliA · Todos os direitos reservados</p>
      </footer>

    </div>
  );
}
