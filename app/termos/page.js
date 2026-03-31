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

export default function Termos() {
  const router = useRouter();

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: 'white', color: '#111827', minHeight: '100vh' }}>

      {/* Navbar */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(0,0,0,0.07)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
            <img src="/imagens/logo_kriteria.svg" alt="KriterIA" style={{ height: 36, width: 'auto' }} />
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
          <h1 style={{ fontSize: 52, fontWeight: 800, color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>Termos de Uso</h1>
          <p style={{ fontSize: 15, color: '#64748B' }}>Última atualização: março de 2025</p>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '80px 32px 96px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          <div style={{ background: '#FFFBEB', borderRadius: 14, padding: '20px 24px', marginBottom: 48, border: '1px solid #FDE68A', display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: 14, color: '#92400E', lineHeight: 1.65, margin: 0 }}>
              Ao criar uma conta e usar o KriterIA, você concorda com estes termos. Leia com atenção antes de utilizar a plataforma.
            </p>
          </div>

          <Section title="1. Descrição do serviço">
            <P>O KriterIA é uma plataforma de avaliação educacional que utiliza inteligência artificial para auxiliar professores na correção de trabalhos e análise do desempenho de turmas.</P>
            <P>O serviço é fornecido como SaaS (Software as a Service), acessível via navegador mediante assinatura mensal ou uso do plano gratuito.</P>
          </Section>

          <Section title="2. Elegibilidade">
            <P>Para usar o KriterIA você deve:</P>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              <Li>• Ter pelo menos 18 anos de idade</Li>
              <Li>• Ser professor, coordenador ou profissional da educação</Li>
              <Li>• Fornecer informações verdadeiras no cadastro</Li>
              <Li>• Não usar a plataforma para fins ilegais ou não autorizados</Li>
            </ul>
          </Section>

          <Section title="3. Uso aceitável">
            <P>Você concorda em usar o KriterIA apenas para fins educacionais legítimos. É <strong>proibido</strong>:</P>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              <Li>• Enviar conteúdo ilegal, ofensivo ou que viole direitos de terceiros</Li>
              <Li>• Usar a plataforma para fazer o trabalho dos alunos por eles (a plataforma é para avaliação, não para geração de trabalhos)</Li>
              <Li>• Tentar acessar contas de outros usuários ou comprometer a segurança da plataforma</Li>
              <Li>• Revender ou redistribuir o acesso sem autorização</Li>
              <Li>• Realizar engenharia reversa ou copiar o sistema</Li>
            </ul>
          </Section>

          <Section title="4. Planos e pagamentos">
            <P>O KriterIA oferece um plano gratuito com recursos limitados e planos pagos com funcionalidades adicionais. Os preços e limites de cada plano estão disponíveis na página de planos.</P>
            <P><strong>Assinaturas:</strong> são cobradas mensalmente via cartão de crédito, processadas pelo Stripe. O acesso é renovado automaticamente a cada ciclo.</P>
            <P><strong>Cancelamento:</strong> você pode cancelar a qualquer momento. O acesso continua ativo até o fim do período já pago. Não há reembolso proporcional para períodos parciais.</P>
            <P><strong>Mudança de plano:</strong> upgrades têm efeito imediato; downgrades têm efeito no próximo ciclo de cobrança.</P>
          </Section>

          <Section title="5. Cotas de avaliação">
            <P>Cada plano possui um número máximo de avaliações por ciclo mensal. As cotas são renovadas automaticamente a cada período de cobrança. Avaliações extras adquiridas separadamente não expiram e são consumidas após o esgotamento da cota do plano.</P>
          </Section>

          <Section title="6. Propriedade intelectual">
            <P>O KriterIA e todo o seu conteúdo (código, design, textos, marca) são propriedade de seus criadores e protegidos por leis de propriedade intelectual.</P>
            <P>O conteúdo que você cria na plataforma (exercícios, perfis, avaliações) permanece de sua propriedade. Você nos concede licença para processar esse conteúdo com o único objetivo de fornecer o serviço.</P>
          </Section>

          <Section title="7. Disponibilidade do serviço">
            <P>Buscamos manter o KriterIA disponível 24/7, mas não garantimos disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência quando possível.</P>
            <P>Não nos responsabilizamos por perdas decorrentes de indisponibilidade temporária do serviço.</P>
          </Section>

          <Section title="8. Limitação de responsabilidade">
            <P>O KriterIA é uma ferramenta de apoio pedagógico. Os feedbacks e notas gerados pela IA são sugestões e não substituem o julgamento profissional do professor.</P>
            <P>Não nos responsabilizamos por decisões pedagógicas tomadas com base exclusivamente nos resultados gerados pela plataforma.</P>
          </Section>

          <Section title="9. Encerramento de conta">
            <P>Podemos suspender ou encerrar contas que violem estes termos. Você pode solicitar a exclusão da sua conta a qualquer momento pelo e-mail <a href="mailto:contato@avalia.education" style={{ color: '#0081f0' }}>contato@avalia.education</a>.</P>
          </Section>

          <Section title="10. Alterações nos termos">
            <P>Podemos atualizar estes termos. Em caso de mudanças relevantes, notificaremos por e-mail com pelo menos 15 dias de antecedência. O uso continuado após a vigência das alterações implica aceitação.</P>
          </Section>

          <Section title="11. Lei aplicável">
            <P>Estes termos são regidos pelas leis brasileiras. Eventuais disputas serão resolvidas no foro da comarca de São Paulo, SP.</P>
          </Section>

          <div style={{ marginTop: 48, padding: '24px 28px', background: '#F9FAFB', borderRadius: 14, border: '1px solid #F3F4F6', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>Dúvidas sobre estes termos?</p>
            <a href="mailto:contato@avalia.education" style={{ color: '#0081f0', fontWeight: 600, fontSize: 15 }}>contato@avalia.education</a>
          </div>

        </div>
      </section>

      {/* Footer simples */}
      <footer style={{ background: '#00173f', padding: '32px', textAlign: 'center' }}>
        <div style={{ cursor: 'pointer', display: 'inline-block', marginBottom: 12 }} onClick={() => router.push('/')}>
          <img src="/imagens/logo_kriteria.svg" alt="KriterIA" style={{ height: 28, width: 'auto', filter: 'brightness(0) invert(1)' }} />
        </div>
        <p style={{ fontSize: 13, color: '#4B5563' }}>© 2025 KriterIA · Todos os direitos reservados</p>
      </footer>

    </div>
  );
}
