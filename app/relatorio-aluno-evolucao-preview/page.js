'use client';

// ── Mock data — 1 aluno, 4 atividades ────────────────────────────────────────
const mock = {
  studentName: 'Ana Souza',
  turma: '3º Ano A',
  disciplina: 'Língua Portuguesa',
  institution: 'Colégio Elite',
  profileName: 'Dr. Marcos Vinicius',
  date: '15 Out 2026',
  atividades: [
    { name: 'Redação — O Clima',           score: 7.2, date: '10 Ago 2026' },
    { name: 'Interpretação de Texto',       score: 8.1, date: '05 Set 2026' },
    { name: 'Produção Poética',             score: 7.8, date: '22 Set 2026' },
    { name: 'Argumentação Dissertativa',    score: 9.2, date: '10 Out 2026' },
  ],
  // Critérios apenas da atividade mais recente
  criteriaRecente: [
    { name: 'Coerência e Coesão',   score: 9.5 },
    { name: 'Argumentação',         score: 9.0 },
    { name: 'Repertório Cultural',  score: 8.8 },
    { name: 'Proposta de Solução',  score: 9.3 },
  ],
  resumo: 'Ana demonstrou uma evolução consistente e expressiva ao longo do período, partindo de 7,2 na primeira atividade e atingindo 9,2 na mais recente. O crescimento foi progressivo em todas as atividades, com destaque para o salto de desempenho na Argumentação Dissertativa, onde a aluna evidenciou domínio sólido dos critérios avaliados.',
  pontosFortes: [
    'Evolução contínua e consistente ao longo de todas as atividades.',
    'Excelente domínio da coerência e estrutura textual.',
    'Argumentação bem fundamentada com repertório cultural relevante.',
  ],
  pontosDesenvolver: [
    'Repertório cultural ainda pode ser ampliado com mais referências.',
    'Manter a consistência nas próximas atividades.',
  ],
  parecer: 'Ana é uma aluna que demonstra comprometimento e capacidade de aprendizagem progressiva. Seu desempenho na última atividade indica que ela está pronta para desafios mais complexos. Recomenda-se ampliar o repertório de leitura para consolidar ainda mais a qualidade argumentativa.',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(v) {
  return v >= 9 ? '#16a34a' : v >= 7 ? '#22c55e' : v >= 6 ? '#d97706' : '#ef4444';
}
function scoreBg(v) {
  return v >= 9 ? '#f0fdf4' : v >= 7 ? '#f0fdf4' : v >= 6 ? '#fffbeb' : '#fef2f2';
}
function scoreBorder(v) {
  return v >= 9 ? '#bbf7d0' : v >= 7 ? '#bbf7d0' : v >= 6 ? '#fde68a' : '#fecaca';
}
function scoreConcept(v) {
  return v >= 9 ? 'Excelente' : v >= 7 ? 'Bom' : v >= 6 ? 'Regular' : 'Insuficiente';
}
function avg(arr) { return arr.reduce((s, v) => s + v, 0) / arr.length; }

// ── Sub-components ─────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 3, height: 16, background: '#0081f0', borderRadius: 99, display: 'inline-block' }} />
      {children}
    </h2>
  );
}

function KpiCard({ label, value, color, sub }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 26, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function EvolutionBadge({ delta }) {
  if (Math.abs(delta) < 0.05) return <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>—</span>;
  const up = delta > 0;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: up ? '#16a34a' : '#ef4444', background: up ? '#f0fdf4' : '#fef2f2', border: `1px solid ${up ? '#bbf7d0' : '#fecaca'}`, padding: '2px 8px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {up ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}
    </span>
  );
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
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`} transform="rotate(-90 60 60)" />
        <text x="60" y="68" textAnchor="middle" fontSize="30" fontWeight="800" fill="#111" fontFamily="'Inter', sans-serif">{score.toFixed(1)}</text>
      </svg>
      <span style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: '0.12em', textTransform: 'uppercase', background: scoreBg(score), padding: '3px 12px', borderRadius: 99, border: `1px solid ${scoreBorder(score)}` }}>
        {scoreConcept(score)}
      </span>
    </div>
  );
}

// Gráfico de linha da evolução do aluno
function LineChart({ atividades }) {
  const scores = atividades.map(a => a.score);
  const W = 680, H = 170, pL = 36, pR = 20, pT = 24, pB = 48;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const n = scores.length;
  const minV = Math.max(0, Math.floor(Math.min(...scores)) - 1);
  const maxV = Math.min(10, Math.ceil(Math.max(...scores)) + 1);
  const range = maxV - minV || 1;

  const xs = scores.map((_, i) => pL + (i / (n - 1)) * cW);
  const ys = scores.map(v => pT + cH - ((v - minV) / range) * cH);

  const pathD = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${xs[n-1].toFixed(1)},${(pT+cH).toFixed(1)} L${pL},${(pT+cH).toFixed(1)} Z`;
  const gridVals = [minV, minV + range * 0.5, maxV];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="areaGradAluno" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0081f0" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0081f0" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridVals.map((v, i) => {
        const y = pT + cH - ((v - minV) / range) * cH;
        return (
          <g key={i}>
            <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4,4" />
            <text x={pL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="Inter, sans-serif">{v.toFixed(1)}</text>
          </g>
        );
      })}

      <path d={areaD} fill="url(#areaGradAluno)" />
      <path d={pathD} fill="none" stroke="#0081f0" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {atividades.map((a, i) => {
        const color = scoreColor(a.score);
        const shortName = a.name.length > 18 ? a.name.substring(0, 17) + '…' : a.name;
        return (
          <g key={i}>
            <circle cx={xs[i]} cy={ys[i]} r="9" fill={color} opacity="0.12" />
            <circle cx={xs[i]} cy={ys[i]} r="5" fill="#fff" stroke={color} strokeWidth="2.5" />
            <text x={xs[i]} y={ys[i] - 13} textAnchor="middle" fontSize="12" fontWeight="800" fill={color} fontFamily="Inter, sans-serif">{a.score.toFixed(1)}</text>
            {/* Data */}
            <text x={xs[i]} y={H - 22} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Inter, sans-serif">{a.date}</text>
            {/* Nome da atividade */}
            <text x={xs[i]} y={H - 8} textAnchor="middle" fontSize="9" fontWeight="600" fill="#64748b" fontFamily="Inter, sans-serif">{shortName}</text>
          </g>
        );
      })}
    </svg>
  );
}

function CriteriaBar({ name, score }) {
  const color = scoreColor(score);
  const pct = (score / 10) * 100;
  const gradients = {
    '#16a34a': 'linear-gradient(90deg, #4ade80, #16a34a)',
    '#22c55e': 'linear-gradient(90deg, #86efac, #22c55e)',
    '#d97706': 'linear-gradient(90deg, #fcd34d, #d97706)',
    '#ef4444': 'linear-gradient(90deg, #fca5a5, #ef4444)',
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{name}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>{score.toFixed(1)}</span>
      </div>
      <div style={{ height: 12, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: gradients[color] || `linear-gradient(90deg,${color}88,${color})`, borderRadius: 99 }} />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function AlunoEvolucaoReport({ data }) {
  const d = data || mock;
  const scores = d.atividades.map(a => a.score);
  const n = d.atividades.length;
  const scoreAtual = scores[n - 1];
  const scoreInicial = scores[0];
  const mediaGeral = avg(scores);
  const melhorNota = Math.max(...scores);
  const piorNota = Math.min(...scores);
  const deltaGeral = scoreAtual - scoreInicial;

  const section = { padding: '28px 40px', borderBottom: '1px solid #f1f5f9' };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f1f5f9', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,0.10)' }}>

        {/* ── Header ── */}
        <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderBottom: '1px solid #e2e8f0', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {d.institutionLogo ? (
            <img src={d.institutionLogo} alt="Logo" style={{ width: 96, height: 96, borderRadius: 12, objectFit: 'contain' }} />
          ) : (
          <div style={{ width: 96, height: 96, borderRadius: 12, background: '#e2e8f0', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="#94a3b8" strokeWidth="1.5"/>
              <path d="M8 12h8M8 8h8M8 16h5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>LOGO</span>
          </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px', fontWeight: 600 }}>Data de Emissão</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>{d.date}</p>
          </div>
        </div>

        {/* ── Identidade do aluno ── */}
        <div style={{ ...section }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#e0f2fe', color: '#0369a1', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Parecer Individual</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#dbeafe', color: '#1d4ed8' }}>{n} atividades</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '8px 0 14px', letterSpacing: '-0.5px' }}>{d.studentName}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px', marginBottom: 16 }}>
                {[
                  { label: 'Turma',                 value: d.turma },
                  { label: 'Disciplina',             value: d.disciplina },
                  { label: 'Professor Responsável',  value: d.profileName },
                ].map(item => (
                  <div key={item.label}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>{item.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: 0 }}>{item.value}</p>
                  </div>
                ))}
              </div>
              {/* Timeline de atividades */}
              <div style={{ display: 'flex', gap: 0, alignItems: 'center', flexWrap: 'wrap' }}>
                {d.atividades.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: i === n - 1 ? '#dbeafe' : '#f8fafc', border: `1px solid ${i === n - 1 ? '#93c5fd' : '#e2e8f0'}`, borderRadius: 99 }}>
                      <span style={{ width: 16, height: 16, borderRadius: 99, background: i === n - 1 ? '#0081f0' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: i === n - 1 ? '#fff' : '#64748b', flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ fontSize: 11, fontWeight: i === n - 1 ? 700 : 400, color: i === n - 1 ? '#1d4ed8' : '#64748b', whiteSpace: 'nowrap' }}>{a.score.toFixed(1)}</span>
                    </div>
                    {i < n - 1 && <span style={{ fontSize: 10, color: '#cbd5e1', margin: '0 2px' }}>→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Score ring da atividade mais recente */}
            <div style={{ flexShrink: 0, marginLeft: 32 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px', textAlign: 'center' }}>Nota Atual</p>
              <ScoreRing score={scoreAtual} />
            </div>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div style={{ ...section }}>
          <SectionTitle>Visão Geral do Período</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            <KpiCard label="Média do Período" value={mediaGeral.toFixed(1)}     color={scoreColor(mediaGeral)} />
            <KpiCard label="Evolução Geral"   value={`${deltaGeral >= 0 ? '+' : ''}${deltaGeral.toFixed(1)}`} color={deltaGeral >= 0 ? '#16a34a' : '#ef4444'} sub="1ª → última ativ." />
            <KpiCard label="Nota Inicial"     value={scoreInicial.toFixed(1)}   color={scoreColor(scoreInicial)} sub={d.atividades[0].name.substring(0, 14) + '…'} />
            <KpiCard label="Melhor Nota"      value={melhorNota.toFixed(1)}      color="#16a34a" />
            <KpiCard label="Pior Nota"        value={piorNota.toFixed(1)}        color={scoreColor(piorNota)} />
          </div>
        </div>

        {/* ── Gráfico de evolução ── */}
        <div style={{ ...section }}>
          <SectionTitle>Evolução das Notas</SectionTitle>
          <LineChart atividades={d.atividades} />
        </div>

        {/* ── Critérios da última atividade ── */}
        <div style={{ ...section }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <SectionTitle>Critérios — Atividade Mais Recente</SectionTitle>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '-12px 0 16px', fontStyle: 'italic' }}>{d.atividades[n - 1].name}</p>
              {d.criteriaRecente.map((c, i) => <CriteriaBar key={i} name={c.name} score={c.score} />)}
            </div>

            {/* Tabela de notas por atividade */}
            <div>
              <SectionTitle>Notas por Atividade</SectionTitle>
              <div style={{ border: '1px solid #f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
                {d.atividades.map((a, i) => {
                  const color = scoreColor(a.score);
                  const delta = i > 0 ? a.score - d.atividades[i - 1].score : null;
                  const isLast = i === n - 1;
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr auto auto', gap: 10, padding: '12px 16px', borderBottom: i < n - 1 ? '1px solid #f8fafc' : 'none', background: isLast ? '#f0f9ff' : i % 2 === 0 ? '#fff' : '#fafafa', alignItems: 'center' }}>
                      <span style={{ width: 20, height: 20, borderRadius: 99, background: isLast ? '#0081f0' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: isLast ? '#fff' : '#64748b' }}>{i + 1}</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: isLast ? 700 : 500, color: isLast ? '#0f172a' : '#374151', margin: 0, lineHeight: 1.3 }}>{a.name}</p>
                        <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>{a.date}</p>
                      </div>
                      {delta !== null ? <EvolutionBadge delta={delta} /> : <span />}
                      <span style={{ fontSize: 15, fontWeight: 900, color, minWidth: 32, textAlign: 'right' }}>{a.score.toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Análise pedagógica ── */}
        <div style={{ ...section }}>
          <SectionTitle>Análise Pedagógica</SectionTitle>
          <div style={{ background: '#f8fafc', borderRadius: 14, borderLeft: '4px solid #0081f0', padding: '20px 24px', marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0081f0', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 10 }}>Resumo do Período</span>
            <p style={{ fontSize: 14, lineHeight: 1.85, color: '#374151', margin: 0, fontStyle: 'italic' }}>"{d.resumo}"</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '18px 20px' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 12 }}>Pontos Fortes</span>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {d.pontosFortes.map((p, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2, flexShrink: 0 }}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 13, color: '#166534', lineHeight: 1.5 }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '18px 20px' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 12 }}>A Desenvolver</span>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {d.pontosDesenvolver.map((p, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2, flexShrink: 0 }}><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Parecer final */}
          <div style={{ padding: '20px 24px', background: '#f8fafc', borderRadius: 14, borderLeft: '4px solid #810cfa' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#810cfa', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 10 }}>Parecer Final</span>
            <p style={{ fontSize: 14, lineHeight: 1.85, color: '#374151', margin: 0 }}>{d.parecer}</p>
          </div>
        </div>

      </div>

      {/* ── Controles ── */}
      <div style={{ maxWidth: 820, margin: '24px auto 0', display: 'flex', gap: 10, justifyContent: 'center' }} className="no-print">
        <button onClick={() => window.print()} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0f172a, #0081f0)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Imprimir / Exportar PDF</button>
        <a href="/relatorio-preview" style={{ padding: '10px 24px', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Ver individual (1 atividade)</a>
        <a href="/relatorio-turma-evolucao-preview" style={{ padding: '10px 24px', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Ver evolução da turma</a>
      </div>

      <div className="print-pg" />
      <style>{`@page { margin: 0; } @media print { .no-print { display: none !important; } body { background: white !important; } } .print-pg { display: none; position: fixed; bottom: 12px; right: 16px; font-size: 10px; color: #94a3b8; font-family: sans-serif; } .print-pg::after { content: counter(page); } @media print { .print-pg { display: block; } }`}</style>
    </div>
  );
}

export default function RelatorioAlunoEvolucaoPreviewPage() {
  return <AlunoEvolucaoReport data={mock} />;
}
