import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f4f0 0%, #edecea 100%)' }}>
      {/* HEADER */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #dddbd6', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#1a1814' }}>AvalIA</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #dddbd6', color: '#4a4740', fontWeight: 500, textDecoration: 'none', fontSize: 14 }}>
            Entrar
          </Link>
          <Link href="/signup" style={{ padding: '8px 20px', borderRadius: 8, background: '#2a7fd4', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
            Criar conta
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.2, marginBottom: 20, color: '#1a1814' }}>
          Avaliação educacional<br />com <span style={{ color: '#2a7fd4' }}>inteligência artificial</span>
        </h1>
        <p style={{ fontSize: 18, color: '#4a4740', marginBottom: 40, lineHeight: 1.6 }}>
          Avalie trabalhos de alunos, gere feedbacks personalizados no seu estilo e acompanhe o desempenho da turma.
        </p>
        <Link href="/signup" style={{ display: 'inline-block', padding: '14px 36px', borderRadius: 10, background: '#2a7fd4', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: 16 }}>
          Começar grátis →
        </Link>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 32px 80px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {[
          { icon: '✨', title: 'Feedback com IA', desc: 'Claude gera feedbacks personalizados no seu tom de voz em segundos' },
          { icon: '👤', title: 'Perfis de professor', desc: 'Crie múltiplos perfis com tom, disciplina e estilo de escrita diferentes' },
          { icon: '📊', title: 'Painel de desempenho', desc: 'Acompanhe notas, médias e progresso da turma com relatórios' },
          { icon: '📁', title: '25+ tipos de trabalho', desc: '3D, Design, Código, Redação, Fotografia e muito mais' },
          { icon: '💾', title: 'Exercícios salvos', desc: 'Salve critérios e enunciados para reutilizar em avaliações futuras' },
          { icon: '📄', title: 'Export PDF e CSV', desc: 'Exporte resultados individuais e relatórios de turma' },
        ].map(f => (
          <div key={f.title} style={{ background: '#fff', border: '1px solid #dddbd6', borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#1a1814' }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: '#8a8680', lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      <footer style={{ borderTop: '1px solid #dddbd6', padding: '24px 32px', textAlign: 'center', color: '#8a8680', fontSize: 13 }}>
        © 2025 AvalIA — Desenvolvido por Kaue Peres
      </footer>
    </div>
  );
}
