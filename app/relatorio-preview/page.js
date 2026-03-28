'use client';

// ── Mock data ─────────────────────────────────────────────────────────────────
const mock = {
  studentName: 'Ana Souza',
  turma: '3º Ano A',
  institution: 'Colégio Elite',
  profileName: 'Dr. Marcos Vinicius',
  exerciseName: 'Redação — O Clima',
  disciplina: 'Língua Portuguesa',
  score: 8.5,
  date: '15 Out 2026',
  criteria: [
    { name: 'Gramática e Ortografia', score: 9.0 },
    { name: 'Coesão e Coerência', score: 8.0 },
    { name: 'Argumentação', score: 7.5 },
    { name: 'Estrutura Textual', score: 9.5 },
  ],
  feedback:
    'A Ana demonstrou um excelente domínio das normas gramaticais e uma estrutura textual sólida. Seus argumentos foram bem desenvolvidos, mostrando uma clara compreensão do tema proposto. Recomendamos continuar focando na coesão entre parágrafos para uma fluidez ainda maior.',
  pontosFortes: [
    'Domínio ortográfico avançado.',
    'Vocabulário rico e preciso.',
    'Uso excelente de conectivos textuais.',
  ],
  pontosDesenvolver: [
    'Transição entre introdução e desenvolvimento.',
    'Aprofundamento de exemplos práticos.',
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(v) {
  return v >= 9 ? '#16a34a' : v >= 7 ? '#22c55e' : v >= 5 ? '#d97706' : '#ef4444';
}
function scoreBg(v) {
  return v >= 9 ? '#f0fdf4' : v >= 7 ? '#f0fdf4' : v >= 5 ? '#fffbeb' : '#fef2f2';
}
function scoreConcept(v) {
  return v >= 9 ? 'Excelente' : v >= 7 ? 'Bom' : v >= 5 ? 'Regular' : 'Insuficiente';
}

function ScoreRing({ score }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const filled = circ * (score / 10);
  const color = scoreColor(score);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ display: 'block' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="68" textAnchor="middle" fontSize="30" fontWeight="800" fill="#111" fontFamily="'Inter', sans-serif">{score.toFixed(1)}</text>
      </svg>
      <span style={{
        fontSize: 11, fontWeight: 800, color, letterSpacing: '0.12em',
        textTransform: 'uppercase', background: scoreBg(score),
        padding: '3px 10px', borderRadius: 99, border: `1px solid ${color}33`,
      }}>
        {scoreConcept(score)}
      </span>
    </div>
  );
}

function CriteriaBar({ name, score }) {
  const color = scoreColor(score);
  const pct = (score / 10) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{name}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color, minWidth: 28, textAlign: 'right' }}>{score.toFixed(1)}</span>
      </div>
      <div style={{ height: 10, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}cc, ${color})`,
          borderRadius: 99,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

// ── Report component (reusable for real data later) ───────────────────────────
export function EvaluationReport({ data }) {
  const d = data || mock;
  const mainColor = scoreColor(d.score);

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: '#f8fafc',
      minHeight: '100vh',
      padding: '40px 20px',
    }}>
      <div className="rpt-card" style={{
        maxWidth: 780,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 4px 40px rgba(0,0,0,0.10)',
      }}>

        {/* ── Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderBottom: '1px solid #e2e8f0',
          padding: '24px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Logo da instituição */}
          {d.institutionLogo ? (
            <img src={d.institutionLogo} alt="Logo" style={{ width: 96, height: 96, borderRadius: 12, objectFit: 'contain', flexShrink: 0 }} />
          ) : (
          <div style={{
            width: 96, height: 96, borderRadius: 12,
            background: '#e2e8f0',
            border: '1px dashed #cbd5e1',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="#94a3b8" strokeWidth="1.5"/>
              <path d="M8 12h8M8 8h8M8 16h5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>LOGO</span>
          </div>
          )}

          {/* Data */}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px', fontWeight: 600 }}>Data de Emissão</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>{d.date}</p>
          </div>
        </div>

        {/* ── Student identity ── */}
        <div style={{ padding: '32px 40px 28px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {/* Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
                {d.studentName}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 24px' }}>
                {[
                  { label: 'Turma', value: d.turma },
                  { label: 'Disciplina', value: d.disciplina },
                  { label: 'Professor Responsável', value: d.profileName },
                  { label: 'Atividade', value: d.exerciseName },
                ].map(item => item.value ? (
                  <div key={item.label}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>{item.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: 0 }}>{item.value}</p>
                  </div>
                ) : null)}
              </div>
            </div>

            {/* Score ring */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0,
            }}>
              <ScoreRing score={d.score} />
            </div>
          </div>
        </div>

        {/* ── Criteria ── */}
        {d.criteria?.length > 0 && (
          <div style={{ padding: '28px 40px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 24px', letterSpacing: '-0.2px' }}>
              Desempenho por Critério
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
              {d.criteria.map((c, i) => (
                <CriteriaBar key={i} name={c.name} score={c.score} />
              ))}
            </div>
          </div>
        )}

        {/* ── Feedback ── */}
        {d.feedback && (
          <div style={{ padding: '28px 40px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{
              background: '#f8fafc',
              borderRadius: 14,
              borderLeft: '4px solid #0081f0',
              padding: '20px 24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#0081f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#0081f0', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Parecer Pedagógico
                </span>
              </div>
              <p style={{
                fontSize: 14, lineHeight: 1.85, color: '#374151',
                fontStyle: 'italic', margin: 0,
              }}>
                "{d.feedback}"
              </p>
            </div>
          </div>
        )}

        {/* ── Pontos fortes + a desenvolver ── */}
        {(d.pontosFortes?.length > 0 || d.pontosDesenvolver?.length > 0) && (
          <div style={{ padding: '28px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, borderBottom: '1px solid #f1f5f9' }}>
            {/* Pontos fortes */}
            {d.pontosFortes?.length > 0 && (
              <div style={{ background: '#f0fdf4', borderRadius: 14, padding: '20px 22px', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    Pontos Fortes
                  </span>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {d.pontosFortes.map((p, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ fontSize: 13, color: '#166534', lineHeight: 1.5 }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pontos a melhorar */}
            {d.pontosDesenvolver?.length > 0 && (
              <div style={{ background: '#fffbeb', borderRadius: 14, padding: '20px 22px', border: '1px solid #fde68a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    Pontos a Melhorar
                  </span>
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {d.pontosDesenvolver.map((p, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Preview controls (não aparecem no print) ── */}
      <div style={{ maxWidth: 780, margin: '24px auto 0', display: 'flex', gap: 10, justifyContent: 'center' }} className="no-print">
        <button
          onClick={() => window.print()}
          style={{
            padding: '10px 24px', background: 'linear-gradient(135deg, #0f172a, #0081f0)',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', letterSpacing: '0.02em',
          }}
        >
          Imprimir / Exportar PDF
        </button>
        <a
          href="/relatorios"
          style={{
            padding: '10px 24px', background: '#fff', color: '#374151',
            border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
          }}
        >
          ← Voltar aos relatórios
        </a>
      </div>

      <div className="print-pg" />
      <style>{`
        @page { margin: 0; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .rpt-card { overflow: visible !important; -webkit-box-decoration-break: clone; box-decoration-break: clone; padding-top: 24px; padding-bottom: 24px; }
        }
        .print-pg { display: none; position: fixed; bottom: 12px; right: 16px; font-size: 10px; color: #94a3b8; font-family: sans-serif; }
        .print-pg::after { content: counter(page); }
        @media print { .print-pg { display: block; } }
      `}</style>
    </div>
  );
}

export default function RelatorioPreviewPage() {
  return <EvaluationReport data={mock} />;
}
