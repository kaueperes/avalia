'use client';
import { useRouter } from 'next/navigation';

export default function Contato() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: 'white', color: '#111827', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/imagens/logo.svg" alt="AvaliA" style={{ height: 36, width: 'auto' }} />
          </div>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
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

      {/* Content */}
      <section style={{ padding: '80px 32px', background: '#F9FAFB' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>

          {/* Email */}
          <div style={{ background: 'white', borderRadius: 20, padding: '36px 32px', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#E6F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>
              ✉️
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>E-mail</h3>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 1.6 }}>Respondemos em até 24 horas úteis.</p>
            <a href="mailto:contato@avalia.education" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0081f0', color: 'white', padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none', transition: 'background .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0033ad'}
              onMouseLeave={e => e.currentTarget.style.background = '#0081f0'}>
              contato@avalia.education
            </a>
          </div>

          {/* Ajuda */}
          <div style={{ background: 'white', borderRadius: 20, padding: '36px 32px', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>
              📖
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Central de Ajuda</h3>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 1.6 }}>Tutoriais e respostas para as dúvidas mais comuns.</p>
            <button onClick={() => router.push('/ajuda')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#374151', border: '1.5px solid #E5E7EB', padding: '12px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'border-color .2s, background .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.background = '#F9FAFB'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = 'white'; }}>
              Acessar Central de Ajuda
            </button>
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
