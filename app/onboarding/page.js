'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const DEMO_TEXT = `A Revolução Industrial foi um período de grandes transformações que ocorreu entre os séculos XVIII e XIX, principalmente na Inglaterra. Esse processo mudou a forma de produção, que passou a ser feita em fábricas com o uso de máquinas a vapor. Antes disso, a produção era artesanal e realizada nas próprias casas das pessoas.

Com a Revolução Industrial, houve um aumento grande na produção de mercadorias, o que barateou os produtos. Porém, as condições de trabalho eram muito ruins: jornadas longas, salários baixos e trabalho infantil eram comuns. Isso gerou descontentamento e levou ao surgimento de movimentos operários que lutavam por melhores condições.

A industrialização se espalhou por outros países europeus e pelos Estados Unidos ao longo do século XIX, transformando a economia mundial e acelerando o processo de urbanização.`;

const DEMO_RESULT = {
  nota: 7.5,
  label: 'Bom desempenho',
  labelColor: '#16a34a',
  resumo: 'O trabalho demonstra boa compreensão do tema e cobre os principais aspectos da Revolução Industrial. A estrutura é clara e o raciocínio é coerente, porém faltou aprofundamento em alguns pontos.',
  pontosFortres: [
    'Identificou corretamente o período e local da Revolução Industrial',
    'Contextualizou bem a transição do trabalho artesanal para o fabril',
    'Mencionou as consequências sociais, incluindo movimentos operários',
    'Fez referência à expansão internacional do processo',
  ],
  pontosAMelhorar: [
    'Poderia citar causas mais específicas que impulsionaram a revolução',
    'Faltou mencionar o papel do capitalismo e do acúmulo de capital',
    'A conclusão poderia ser mais elaborada com impacto a longo prazo',
  ],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = boas-vindas, 2 = demo, 3 = resultado, 4 = concluído
  const [userName, setUserName] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) { router.push('/login'); return; }
      const u = JSON.parse(stored);
      if (u.onboarding_done) { router.push('/inicio'); return; }
      if (u.name) setUserName(u.name.split(' ')[0]);
    } catch { router.push('/login'); }
  }, []);

  async function runDemo() {
    setDemoLoading(true);
    await new Promise(r => setTimeout(r, 2200)); // simula processamento
    setDemoLoading(false);
    setStep(3);
  }

  async function finish() {
    setCompleting(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/onboarding', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem('user', JSON.stringify({ ...u, onboarding_done: true }));
      }
    } catch {}
    router.push('/inicio');
  }

  const totalSteps = 3;
  const currentStep = step === 4 ? 3 : step;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #0a0c18 0%, #0d1230 60%, #1a0530 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', -apple-system, sans-serif", position: 'relative' }}>

      {/* Glows */}
      <div style={{ position: 'fixed', top: '20%', left: '30%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,129,240,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '15%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,12,250,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ position: 'absolute', top: 28, left: 32 }}>
        <img src="/imagens/logo_kriteria_branco.svg" alt="KriterIA" style={{ height: 28 }} />
      </div>

      {/* Progress */}
      <div style={{ position: 'absolute', top: 36, right: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ width: i === currentStep ? 24 : 8, height: 8, borderRadius: 99, background: i <= currentStep ? 'linear-gradient(135deg, #0081f0, #810cfa)' : 'rgba(255,255,255,0.15)', transition: 'all .3s' }} />
        ))}
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>{currentStep}/{totalSteps}</span>
      </div>

      {/* ── STEP 1: Boas-vindas ── */}
      {step === 1 && (
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', animation: 'fadeUp .5s ease both' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>👋</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 12, letterSpacing: '-0.5px' }}>
            Olá{userName ? `, ${userName}` : ''}! Bem-vindo ao KriterIA
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 36 }}>
            Em menos de 2 minutos você vai ver como o KriterIA avalia um trabalho real — sem gastar nenhuma das suas avaliações.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {[
              { emoji: '📄', text: 'Veja um trabalho de exemplo já carregado' },
              { emoji: '⚡', text: 'Simule uma avaliação em segundos' },
              { emoji: '✅', text: 'Entenda o resultado e comece a usar' },
            ].map(({ emoji, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px' }}>
                <span style={{ fontSize: 20 }}>{emoji}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{text}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,129,240,0.3)' }}
          >
            Começar tour →
          </button>
          <button onClick={finish} style={{ marginTop: 12, background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 13, cursor: 'pointer' }}>
            Pular e ir direto para o início
          </button>
        </div>
      )}

      {/* ── STEP 2: Demo ── */}
      {step === 2 && (
        <div style={{ maxWidth: 680, width: '100%', animation: 'fadeUp .5s ease both' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,129,240,0.12)', color: '#60a5fa', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, marginBottom: 12, border: '1px solid rgba(0,129,240,0.2)' }}>
              ✦ Avaliação demonstração
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 8 }}>Veja como funciona na prática</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Um trabalho de exemplo já está carregado. Clique em "Gerar avaliação" para ver o resultado.</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>📄 Trabalho do aluno — Exercício: Revolução Industrial</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 6 }}>Exemplo</span>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '14px 16px', maxHeight: 180, overflowY: 'auto' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{DEMO_TEXT}</p>
            </div>
          </div>

          <button
            onClick={runDemo}
            disabled={demoLoading}
            style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, background: demoLoading ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #0081f0, #810cfa)', color: demoLoading ? 'rgba(255,255,255,0.4)' : 'white', border: 'none', cursor: demoLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
          >
            {demoLoading ? (
              <>
                <span style={{ display: 'inline-flex', gap: 4 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', animation: 'bounce 1.2s infinite', animationDelay: `${i*0.2}s`, display: 'inline-block' }} />)}
                </span>
                Gerando avaliação...
              </>
            ) : '⚡ Gerar avaliação'}
          </button>
        </div>
      )}

      {/* ── STEP 3: Resultado demo ── */}
      {step === 3 && (
        <div style={{ maxWidth: 680, width: '100%', animation: 'fadeUp .5s ease both' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 8 }}>Resultado da avaliação</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>É exatamente assim que o KriterIA apresenta os resultados reais.</p>
          </div>

          {/* Nota */}
          <div style={{ background: 'linear-gradient(135deg, rgba(0,129,240,0.15), rgba(129,12,250,0.1))', border: '1px solid rgba(0,129,240,0.25)', borderRadius: 16, padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1 }}>{DEMO_RESULT.nota}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: DEMO_RESULT.labelColor, marginTop: 4 }}>{DEMO_RESULT.label}</div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65 }}>{DEMO_RESULT.resumo}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {/* Pontos fortes */}
            <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 12, padding: '16px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>✓ Pontos fortes</p>
              {DEMO_RESULT.pontosFortres.map((p, i) => (
                <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6, lineHeight: 1.5 }}>· {p}</p>
              ))}
            </div>
            {/* A melhorar */}
            <div style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 12, padding: '16px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>↗ A melhorar</p>
              {DEMO_RESULT.pontosAMelhorar.map((p, i) => (
                <p key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6, lineHeight: 1.5 }}>· {p}</p>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(0,129,240,0.08)', border: '1px solid rgba(0,129,240,0.2)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>💡</span>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>Nas avaliações reais, o KriterIA usa <strong style={{ color: 'rgba(255,255,255,0.85)' }}>seus próprios critérios e exercícios</strong> cadastrados para gerar um feedback personalizado para cada aluno.</p>
          </div>

          <button
            onClick={finish}
            disabled={completing}
            style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, background: completing ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #0081f0, #810cfa)', color: completing ? 'rgba(255,255,255,0.4)' : 'white', border: 'none', cursor: completing ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(0,129,240,0.25)' }}
          >
            {completing ? 'Entrando...' : 'Ir para o KriterIA →'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
