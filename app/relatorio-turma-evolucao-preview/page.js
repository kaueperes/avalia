'use client';

// ── Mock data — 4 atividades ──────────────────────────────────────────────────
const mock = {
  turma: '3º Ano A',
  disciplina: 'Língua Portuguesa',
  institution: 'Colégio Elite',
  profileName: 'Dr. Marcos Vinicius',
  date: '15 Out 2026',
  atividades: [
    'Redação — O Clima',
    'Interpretação de Texto',
    'Produção Poética',
    'Argumentação Dissertativa',
  ],
  alunos: [
    { name: 'Pedro Alves',      scores: [9.8, 9.2, 9.5, 9.6] },
    { name: 'Ana Souza',        scores: [9.2, 9.7, 9.0, 9.4] },
    { name: 'Carla Mendes',     scores: [8.7, 9.0, 8.5, 8.9] },
    { name: 'Lucas Ferreira',   scores: [8.5, 8.2, 8.8, 8.3] },
    { name: 'Beatriz Costa',    scores: [8.3, 8.9, 8.1, 8.7] },
    { name: 'Rafael Lima',      scores: [8.1, 8.4, 7.9, 8.2] },
    { name: 'Juliana Rocha',    scores: [7.9, 8.1, 7.6, 8.0] },
    { name: 'Thiago Santos',    scores: [7.7, 7.3, 7.5, 7.1] },
    { name: 'Mariana Oliveira', scores: [7.5, 7.8, 7.2, 7.9] },
    { name: 'Gabriel Martins',  scores: [7.4, 7.6, 7.0, 7.5] },
    { name: 'Fernanda Nunes',   scores: [7.2, 7.5, 6.9, 7.3] },
    { name: 'Diego Carvalho',   scores: [7.1, 6.9, 7.3, 6.8] },
    { name: 'Isabela Ribeiro',  scores: [6.9, 7.2, 6.7, 7.1] },
    { name: 'Mateus Gonçalves', scores: [6.7, 7.0, 6.5, 6.9] },
    { name: 'Letícia Pinto',    scores: [6.5, 6.8, 6.2, 6.7] },
    { name: 'Bruno Almeida',    scores: [6.3, 6.1, 6.5, 6.0] },
    { name: 'Amanda Vieira',    scores: [6.1, 6.4, 5.9, 6.3] },
    { name: 'Rodrigo Teixeira', scores: [5.9, 6.2, 5.7, 6.1] },
    { name: 'Natália Barbosa',  scores: [5.5, 5.9, 5.3, 5.8] },
    { name: 'Eduardo Dias',     scores: [5.1, 5.6, 5.0, 5.5] },
    { name: 'Vanessa Castro',   scores: [4.8, 5.3, 4.6, 5.4] },
    { name: 'Henrique Moura',   scores: [4.3, 4.1, 4.5, 4.0] },
    { name: 'Priscila Ramos',   scores: [3.9, 4.5, 3.7, 4.8] },
    { name: 'André Correia',    scores: [3.2, 3.8, 3.5, 4.1] },
  ],
  // Critérios apenas da atividade mais recente
  criteriaRecente: [
    { name: 'Coerência e Coesão',   avg: 7.9 },
    { name: 'Argumentação',         avg: 7.2 },
    { name: 'Repertório Cultural',  avg: 6.8 },
    { name: 'Proposta de Solução',  avg: 7.5 },
  ],
  resumo: 'A turma apresentou evolução progressiva ao longo das quatro atividades do período, com média geral subindo de 7,0 para 7,5. O avanço foi consistente na maioria dos alunos, embora 4 permaneçam abaixo da média mínima. A última atividade — Argumentação Dissertativa — revelou melhora significativa na capacidade de estruturação textual.',
  pontosFortes: [
    'Tendência de crescimento sustentada ao longo do período.',
    'Redução no número de alunos em situação de atenção.',
    'Melhora expressiva na estruturação dos textos dissertativos.',
  ],
  pontosAtencao: [
    '4 alunos permanecem abaixo de 6,0 em todas as atividades.',
    'Repertório cultural ainda é o critério mais fraco da turma.',
    '3 alunos apresentam tendência de queda entre as atividades.',
  ],
  sugestoes: [
    {
      titulo: 'Leitura de Repertório',
      descricao: 'Indicar textos de referência cultural, filosófica e científica para enriquecer o repertório dos alunos nas redações dissertativas.',
      impacto: 'Potencial de elevar a média de "Repertório Cultural" de 6,8 para acima de 7,5.',
    },
    {
      titulo: 'Acompanhamento dos Alunos em Queda',
      descricao: 'Os 3 alunos com tendência de queda precisam de atenção preventiva antes que o desempenho se agrave.',
      impacto: 'Prevenção de mais reprovações no próximo período.',
    },
    {
      titulo: 'Plano Intensivo para Alunos em Atenção',
      descricao: 'Os 4 alunos abaixo de 6,0 em todas as atividades precisam de plano de recuperação com metas claras e acompanhamento semanal.',
      impacto: 'Redução da taxa de insuficiência de 17% para abaixo de 5%.',
    },
  ],
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
function trend(scores) {
  // regressão linear simples para determinar tendência
  const n = scores.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = avg(scores);
  const num = scores.reduce((s, y, i) => s + (i - xMean) * (y - yMean), 0);
  const den = scores.reduce((s, _, i) => s + (i - xMean) ** 2, 0);
  return den === 0 ? 0 : num / den;
}

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
    <span style={{ fontSize: 11, fontWeight: 700, color: up ? '#16a34a' : '#ef4444', background: up ? '#f0fdf4' : '#fef2f2', border: `1px solid ${up ? '#bbf7d0' : '#fecaca'}`, padding: '2px 7px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
      {up ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}
    </span>
  );
}

function TrendIcon({ slope }) {
  if (Math.abs(slope) < 0.05) return <span style={{ fontSize: 12, color: '#94a3b8' }}>→</span>;
  return <span style={{ fontSize: 12 }}>{slope > 0 ? '↗' : '↘'}</span>;
}

// Gráfico de linha da evolução da média da turma
function LineChart({ medias, labels }) {
  const W = 680, H = 160, pL = 36, pR = 20, pT = 20, pB = 36;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const n = medias.length;
  const minV = Math.max(0, Math.floor(Math.min(...medias)) - 1);
  const maxV = Math.min(10, Math.ceil(Math.max(...medias)) + 1);
  const range = maxV - minV || 1;

  const xs = medias.map((_, i) => pL + (i / (n - 1)) * cW);
  const ys = medias.map(v => pT + cH - ((v - minV) / range) * cH);

  const pathD = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${xs[n-1].toFixed(1)},${(pT+cH).toFixed(1)} L${pL},${(pT+cH).toFixed(1)} Z`;

  const gridVals = [minV, minV + range * 0.33, minV + range * 0.67, maxV];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0081f0" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0081f0" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {gridVals.map((v, i) => {
        const y = pT + cH - ((v - minV) / range) * cH;
        return (
          <g key={i}>
            <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4,4" />
            <text x={pL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontFamily="Inter, sans-serif">{v.toFixed(1)}</text>
          </g>
        );
      })}

      {/* Area */}
      <path d={areaD} fill="url(#areaGrad)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#0081f0" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots + labels */}
      {medias.map((v, i) => {
        const color = scoreColor(v);
        const shortLabel = labels[i].length > 16 ? labels[i].substring(0, 15) + '…' : labels[i];
        return (
          <g key={i}>
            {/* Dot glow */}
            <circle cx={xs[i]} cy={ys[i]} r="8" fill={color} opacity="0.15" />
            <circle cx={xs[i]} cy={ys[i]} r="5" fill="#fff" stroke={color} strokeWidth="2.5" />
            {/* Value above */}
            <text x={xs[i]} y={ys[i] - 12} textAnchor="middle" fontSize="11" fontWeight="800" fill={color} fontFamily="Inter, sans-serif">{v.toFixed(1)}</text>
            {/* Activity label below */}
            <text x={xs[i]} y={H - 6} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="Inter, sans-serif">{shortLabel}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Sparkline individual por aluno
function Sparkline({ scores }) {
  const W = 56, H = 22, pad = 3;
  const n = scores.length;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  const xs = scores.map((_, i) => pad + (i / (n - 1)) * (W - pad * 2));
  const ys = scores.map(v => pad + (H - pad * 2) - ((v - min) / range) * (H - pad * 2));
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const lastColor = scoreColor(scores[scores.length - 1]);
  const t = trend(scores);
  const lineColor = Math.abs(t) < 0.05 ? '#94a3b8' : t > 0 ? '#22c55e' : '#ef4444';
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <path d={d} fill="none" stroke={lineColor} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={xs[n-1]} cy={ys[n-1]} r="2.5" fill={lastColor} />
    </svg>
  );
}

function CriteriaBar({ name, avg: a }) {
  const color = scoreColor(a);
  const pct = (a / 10) * 100;
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
        <span style={{ fontSize: 14, fontWeight: 800, color }}>{a.toFixed(1)}</span>
      </div>
      <div style={{ height: 12, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: gradients[color] || `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 99 }} />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function TurmaEvolucaoReport({ data }) {
  const d = data || mock;
  const n = d.atividades.length;

  // Médias por atividade
  const mediasAtiv = d.atividades.map((_, i) => avg(d.alunos.map(a => a.scores[i])));

  // Stats da última atividade
  const lastScores = d.alunos.map(a => a.scores[n - 1]);
  const total = d.alunos.length;
  const mediaAtual = avg(lastScores);
  const mediaInicial = mediasAtiv[0];
  const deltaMedia = mediaAtual - mediaInicial;
  const aprovados = lastScores.filter(s => s >= 6).length;

  // Ranking pela nota mais recente
  const rankingOrdenado = [...d.alunos]
    .map(a => ({
      ...a,
      scoreAtual: a.scores[n - 1],
      scoreInicial: a.scores[0],
      deltaGeral: a.scores[n - 1] - a.scores[0],
      trendSlope: trend(a.scores),
    }))
    .sort((a, b) => b.scoreAtual - a.scoreAtual);

  const alunosAtencao = rankingOrdenado.filter(a => a.scoreAtual < 6);
  const alunosQueda = rankingOrdenado.filter(a => a.trendSlope < -0.15 && a.scoreAtual >= 6);
  const maiorEvolucao = [...rankingOrdenado].sort((a, b) => b.deltaGeral - a.deltaGeral).slice(0, 3);

  const section = { padding: '28px 40px', borderBottom: '1px solid #f1f5f9' };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f1f5f9', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,0.10)' }}>

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

        {/* ── Identidade ── */}
        <div style={{ ...section }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#ede9fe', color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Relatório de Turma</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#dbeafe', color: '#1d4ed8' }}>{n} atividades</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '8px 0 14px', letterSpacing: '-0.5px' }}>{d.turma}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px', marginBottom: 16 }}>
            {[{ label: 'Disciplina', value: d.disciplina }, { label: 'Professor Responsável', value: d.profileName }].map(item => (
              <div key={item.label}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>{item.label}</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>
          {/* Lista de atividades como timeline horizontal */}
          <div style={{ display: 'flex', gap: 0, alignItems: 'center', flexWrap: 'wrap' }}>
            {d.atividades.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', background: i === n - 1 ? '#dbeafe' : '#f8fafc', border: `1px solid ${i === n - 1 ? '#93c5fd' : '#e2e8f0'}`, borderRadius: 99 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 99, background: i === n - 1 ? '#0081f0' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: i === n - 1 ? '#fff' : '#64748b', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 12, fontWeight: i === n - 1 ? 700 : 500, color: i === n - 1 ? '#1d4ed8' : '#374151', whiteSpace: 'nowrap' }}>{a}</span>
                  {i === n - 1 && <span style={{ fontSize: 9, fontWeight: 700, color: '#0081f0', background: '#bfdbfe', padding: '1px 5px', borderRadius: 99 }}>recente</span>}
                </div>
                {i < n - 1 && <span style={{ fontSize: 10, color: '#cbd5e1', margin: '0 2px' }}>→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── KPIs ── */}
        <div style={{ ...section }}>
          <SectionTitle>Visão Geral do Período</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            <KpiCard label="Média Atual"     value={mediaAtual.toFixed(1)}   color={scoreColor(mediaAtual)} sub={`Início: ${mediaInicial.toFixed(1)}`} />
            <KpiCard label="Evolução"        value={`${deltaMedia >= 0 ? '+' : ''}${deltaMedia.toFixed(1)}`} color={deltaMedia >= 0 ? '#16a34a' : '#ef4444'} sub="1ª → última ativ." />
            <KpiCard label="Aprovação"       value={`${Math.round((aprovados / total) * 100)}%`} color="#16a34a" sub={`${aprovados} de ${total}`} />
            <KpiCard label="Total de Alunos" value={total}                    color="#0081f0" sub={`${n} atividades`} />
            <KpiCard label="Em Atenção"      value={alunosAtencao.length}     color={alunosAtencao.length > 0 ? '#ef4444' : '#16a34a'} sub="abaixo de 6,0" />
          </div>
        </div>

        {/* ── Linha de evolução da turma ── */}
        <div style={{ ...section }}>
          <SectionTitle>Evolução da Média da Turma</SectionTitle>
          <LineChart medias={mediasAtiv} labels={d.atividades} />
        </div>

        {/* ── Critérios da atividade mais recente + distribuição ── */}
        <div style={{ ...section }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <SectionTitle>Critérios — Atividade Mais Recente</SectionTitle>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '-12px 0 16px', fontStyle: 'italic' }}>{d.atividades[n - 1]}</p>
              {d.criteriaRecente.map((c, i) => <CriteriaBar key={i} name={c.name} avg={c.avg} />)}
            </div>
            <div>
              <SectionTitle>Distribuição — Atividade Mais Recente</SectionTitle>
              {(() => {
                const dist = [
                  { label: 'Insuficiente', range: '0–5,9', count: lastScores.filter(s => s < 6).length,           color: '#ef4444' },
                  { label: 'Regular',      range: '6–6,9', count: lastScores.filter(s => s >= 6 && s < 7).length, color: '#f59e0b' },
                  { label: 'Bom',          range: '7–8,9', count: lastScores.filter(s => s >= 7 && s < 9).length, color: '#22c55e' },
                  { label: 'Excelente',    range: '9–10',  count: lastScores.filter(s => s >= 9).length,           color: '#16a34a' },
                ];
                const maxC = Math.max(...dist.map(d => d.count), 1);
                const barMaxH = 90;
                const grads = { '#ef4444': 'linear-gradient(180deg,#fca5a5,#ef4444)', '#f59e0b': 'linear-gradient(180deg,#fde68a,#f59e0b)', '#22c55e': 'linear-gradient(180deg,#86efac,#22c55e)', '#16a34a': 'linear-gradient(180deg,#4ade80,#16a34a)' };
                return (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {dist.map((d, i) => {
                      const h = Math.max(6, (d.count / maxC) * barMaxH);
                      const pct = Math.round((d.count / total) * 100);
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ height: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 }}>
                            <span style={{ fontSize: 16, fontWeight: 900, color: d.color, lineHeight: 1 }}>{d.count}</span>
                            <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{pct}%</span>
                          </div>
                          <div style={{ height: barMaxH, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                            <div style={{ width: '100%', height: h, background: grads[d.color], borderRadius: '6px 6px 0 0', boxShadow: `0 -2px 8px ${d.color}30` }} />
                          </div>
                          <div style={{ width: '100%', height: 2, background: d.color, opacity: 0.35 }} />
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#374151', textAlign: 'center', marginTop: 6, lineHeight: 1.2 }}>{d.label}</span>
                          <span style={{ fontSize: 9, color: '#94a3b8' }}>{d.range}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* ── Destaques ── */}
        <div style={{ ...section }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Maiores evoluções */}
            <div>
              <SectionTitle>Maior Evolução no Período</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {maiorEvolucao.map((a, i) => (
                  <div key={i} style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{['🥇','🥈','🥉'][i]}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#166534', margin: 0 }}>{a.name}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{a.scoreInicial.toFixed(1)} → {a.scoreAtual.toFixed(1)}</p>
                      </div>
                    </div>
                    <EvolutionBadge delta={a.deltaGeral} />
                  </div>
                ))}
              </div>
            </div>
            {/* Alunos com queda */}
            {alunosQueda.length > 0 && (
              <div>
                <SectionTitle>Tendência de Queda</SectionTitle>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {alunosQueda.slice(0, 3).map((a, i) => (
                    <div key={i} style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', margin: 0 }}>{a.name}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{a.scoreInicial.toFixed(1)} → {a.scoreAtual.toFixed(1)}</p>
                      </div>
                      <EvolutionBadge delta={a.deltaGeral} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Ranking ── */}
        <div style={{ ...section }}>
          <SectionTitle>Ranking da Turma</SectionTitle>
          <div style={{ border: '1px solid #f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 60px 60px 64px 60px 100px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 16px', gap: 8, alignItems: 'center' }}>
              {['#', 'Aluno', '1ª Ativ.', 'Atual', 'Evolução', 'Tendência', 'Conceito'].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>
            {rankingOrdenado.map((a, i) => {
              const isAtencao = a.scoreAtual < 6;
              const color = scoreColor(a.scoreAtual);
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 60px 60px 64px 60px 100px', padding: '11px 16px', gap: 8, borderBottom: i < rankingOrdenado.length - 1 ? '1px solid #f8fafc' : 'none', background: isAtencao ? '#fff9f9' : i % 2 === 0 ? '#fff' : '#fafafa', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: i < 3 ? '#f59e0b' : '#94a3b8' }}>
                    {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: isAtencao ? '#dc2626' : '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                    {isAtencao && <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '1px 5px', borderRadius: 99, flexShrink: 0 }}>Atenção</span>}
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{a.scoreInicial.toFixed(1)}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color }}>{a.scoreAtual.toFixed(1)}</span>
                  <EvolutionBadge delta={a.deltaGeral} />
                  <Sparkline scores={a.scores} />
                  <span style={{ fontSize: 11, fontWeight: 700, color, background: scoreBg(a.scoreAtual), border: `1px solid ${scoreBorder(a.scoreAtual)}`, padding: '2px 8px', borderRadius: 99, textAlign: 'center' }}>
                    {scoreConcept(a.scoreAtual)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Alunos em atenção ── */}
        {alunosAtencao.length > 0 && (
          <div style={{ ...section }}>
            <SectionTitle>Alunos que Precisam de Atenção</SectionTitle>
            <div style={{ background: '#fff9f9', border: '1px solid #fecaca', borderRadius: 14, padding: '20px 24px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', margin: '0 0 14px' }}>
                {alunosAtencao.length} aluno{alunosAtencao.length > 1 ? 's' : ''} abaixo de 6,0 na atividade mais recente
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {alunosAtencao.map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', margin: 0 }}>{a.name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{a.scores.map(s => s.toFixed(1)).join(' → ')}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 900, color: '#ef4444' }}>{a.scoreAtual.toFixed(1)}</span>
                      <EvolutionBadge delta={a.deltaGeral} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Análise pedagógica ── */}
        <div style={{ ...section }}>
          <SectionTitle>Análise Pedagógica</SectionTitle>
          <div style={{ background: '#f8fafc', borderRadius: 14, borderLeft: '4px solid #0081f0', padding: '20px 24px', marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#0081f0', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 10 }}>Resumo do Período</span>
            <p style={{ fontSize: 14, lineHeight: 1.85, color: '#374151', margin: 0, fontStyle: 'italic' }}>"{d.resumo}"</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
              <span style={{ fontSize: 11, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 12 }}>Pontos de Atenção</span>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {d.pontosAtencao.map((p, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2, flexShrink: 0 }}><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Sugestões ── */}
        <div style={{ ...section, borderBottom: 'none' }}>
          <SectionTitle>Sugestões Pedagógicas</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {d.sugestoes.map((s, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 14, padding: '18px 20px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', borderLeft: '4px solid #0081f0' }}>
                <div style={{ width: 32, height: 32, borderRadius: 99, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#0081f0' }}>{i + 1}</span>
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{s.titulo}</p>
                  <p style={{ fontSize: 13, color: '#374151', margin: '0 0 6px', lineHeight: 1.6 }}>{s.descricao}</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, fontStyle: 'italic' }}>{s.impacto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Controles ── */}
      <div style={{ maxWidth: 860, margin: '24px auto 0', display: 'flex', gap: 10, justifyContent: 'center' }} className="no-print">
        <button onClick={() => window.print()} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0f172a, #0081f0)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Imprimir / Exportar PDF</button>
        <a href="/relatorio-turma-multi-preview" style={{ padding: '10px 24px', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Ver 2 atividades</a>
        <a href="/relatorio-turma-preview" style={{ padding: '10px 24px', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Ver 1 atividade</a>
      </div>

      <div className="print-pg" />
      <style>{`@page { margin: 0; } @media print { .no-print { display: none !important; } body { background: white !important; } } .print-pg { display: none; position: fixed; bottom: 12px; right: 16px; font-size: 10px; color: #94a3b8; font-family: sans-serif; } .print-pg::after { content: counter(page); } @media print { .print-pg { display: block; } }`}</style>
    </div>
  );
}

export default function RelatorioTurmaEvolucaoPreviewPage() {
  return <TurmaEvolucaoReport data={mock} />;
}
