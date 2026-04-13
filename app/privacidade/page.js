'use client';
import { useRouter } from 'next/navigation';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 48 }}>
    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#00173f', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #F3F4F6' }}>{title}</h2>
    <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.8 }}>{children}</div>
  </div>
);

const P = ({ children }) => <p style={{ marginBottom: 14 }}>{children}</p>;
const Li = ({ children }) => <li style={{ marginBottom: 8, paddingLeft: 8 }}>{children}</li>;

export default function Privacidade() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: 'white', color: '#111827', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/imagens/logo_kriteria.svg" alt="Kriteria" style={{ height: 36, width: 'auto' }} />
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <a href="/#funcionalidades" style={{ textDecoration: 'none', fontSize: 15, fontWeight: 450, color: '#6B7280' }}>Funcionalidades</a>
            <a href="/#disciplinas" style={{ textDecoration: 'none', fontSize: 15, fontWeight: 450, color: '#6B7280' }}>Tipos de Trabalho</a>
            <a href="/#coordenadores" style={{ textDecoration: 'none', fontSize: 15, fontWeight: 450, color: '#6B7280' }}>Para Coordenadores</a>
            <a href="/#planos" style={{ textDecoration: 'none', fontSize: 15, fontWeight: 450, color: '#6B7280' }}>Planos</a>
            <a href="/central-de-ajuda" style={{ textDecoration: 'none', fontSize: 15, fontWeight: 450, color: '#6B7280' }}>Ajuda</a>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', color: '#374151', fontWeight: 500, fontSize: 15, cursor: 'pointer', padding: '8px 14px', borderRadius: 8 }}>Entrar</button>
            <button onClick={() => router.push('/signup')} style={{ background: '#0081f0', color: 'white', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Começar grátis</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '140px 32px 64px', background: 'linear-gradient(145deg, #0a0c18 0%, #0d1230 55%, #1a0530 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 16 }}>Legal</p>
          <h1 style={{ fontSize: 52, fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>Política de Privacidade</h1>
          <p style={{ fontSize: 15, color: '#64748B' }}>Última atualização: março de 2025</p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '80px 32px 96px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          <div style={{ background: '#F0F9FF', borderRadius: 14, padding: '20px 24px', marginBottom: 48, border: '1px solid #BAE6FD', display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>ℹ️</span>
            <p style={{ fontSize: 14, color: '#0369A1', lineHeight: 1.65, margin: 0 }}>
              Esta política descreve como o Kriteria coleta, usa e protege suas informações. Nos comprometemos a manter seus dados seguros e a ser transparentes sobre como os utilizamos.
            </p>
          </div>

          <Section title="1. Quem somos">
            <P>O Kriteria é uma plataforma SaaS de avaliação educacional com inteligência artificial, desenvolvida para auxiliar professores na correção e análise de trabalhos de alunos.</P>
            <P>Para dúvidas sobre esta política, entre em contato pelo e-mail: <a href="mailto:contato@avalia.education" style={{ color: '#0081f0' }}>contato@avalia.education</a></P>
          </Section>

          <Section title="2. Dados que coletamos">
            <P>Coletamos apenas os dados necessários para o funcionamento da plataforma:</P>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              <Li>• <strong>Dados de cadastro:</strong> nome, e-mail e senha (armazenada de forma criptografada)</Li>
              <Li>• <strong>Dados de uso:</strong> exercícios criados, avaliações realizadas, perfis configurados</Li>
              <Li>• <strong>Dados de pagamento:</strong> processados exclusivamente pelo Stripe — não armazenamos dados de cartão</Li>
            </ul>
          </Section>

          <Section title="3. Dados dos alunos">
            <P>Os textos enviados para avaliação são transmitidos à API da Anthropic (Claude) para processamento e <strong>não são armazenados em nossos servidores</strong> após o processamento.</P>
            <P>O Kriteria não coleta nomes completos, documentos, dados biométricos ou qualquer dado sensível de alunos. Os resultados das avaliações (notas e feedbacks) são salvos associados apenas ao professor responsável.</P>
            <P>Recomendamos que professores não incluam dados pessoais identificáveis de alunos nos textos enviados para avaliação.</P>
          </Section>

          <Section title="4. Como usamos seus dados">
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              <Li>• Fornecer e melhorar os serviços da plataforma</Li>
              <Li>• Gerenciar sua assinatura e cobranças</Li>
              <Li>• Enviar comunicações sobre a conta (nunca marketing sem consentimento)</Li>
              <Li>• Analisar métricas agregadas de uso para melhorar a experiência</Li>
            </ul>
          </Section>

          <Section title="5. Compartilhamento de dados">
            <P>Não vendemos seus dados. Compartilhamos informações apenas com:</P>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              <Li>• <strong>Anthropic:</strong> para processamento dos textos via API (sujeito à política de privacidade da Anthropic)</Li>
              <Li>• <strong>Stripe:</strong> para processamento de pagamentos</Li>
              <Li>• <strong>Supabase:</strong> para armazenamento seguro dos dados</Li>
            </ul>
          </Section>

          <Section title="6. Segurança">
            <P>Utilizamos conexões criptografadas (HTTPS/TLS), autenticação segura via JWT e armazenamento em banco de dados com controle de acesso por usuário. Senhas são armazenadas com hash seguro e nunca em texto simples.</P>
          </Section>

          <Section title="7. Seus direitos">
            <P>Você tem direito a:</P>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              <Li>• Acessar os dados que temos sobre você</Li>
              <Li>• Corrigir dados incorretos</Li>
              <Li>• Solicitar a exclusão da sua conta e todos os dados associados</Li>
              <Li>• Exportar seus dados (avaliações e exercícios)</Li>
            </ul>
            <P>Para exercer qualquer um desses direitos, entre em contato: <a href="mailto:contato@avalia.education" style={{ color: '#0081f0' }}>contato@avalia.education</a></P>
          </Section>

          <Section title="8. Cookies">
            <P>Utilizamos apenas cookies essenciais para manter sua sessão ativa. Não utilizamos cookies de rastreamento ou publicidade.</P>
          </Section>

          <Section title="9. Alterações nesta política">
            <P>Podemos atualizar esta política periodicamente. Em caso de mudanças significativas, notificaremos por e-mail com pelo menos 15 dias de antecedência.</P>
          </Section>

        </div>
      </section>

      {/* Footer simples */}
      <footer style={{ background: '#00173f', padding: '32px', textAlign: 'center' }}>
        <div style={{ cursor: 'pointer', display: 'inline-block', marginBottom: 12 }} onClick={() => router.push('/')}>
          <img src="/imagens/logo_kriteria.svg" alt="Kriteria" style={{ height: 28, width: 'auto', filter: 'brightness(0) invert(1)' }} />
        </div>
        <p style={{ fontSize: 13, color: '#4B5563' }}>© 2025 Kriteria · Todos os direitos reservados</p>
      </footer>

    </div>
  );
}
