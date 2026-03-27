'use client';

// ── Mock data — 2 atividades ──────────────────────────────────────────────────
const mock = {
  turma: '3º Ano A',
  disciplina: 'Língua Portuguesa',
  institution: 'Colégio Elite',
  profileName: 'Dr. Marcos Vinicius',
  date: '15 Out 2026',
  atividades: ['Redação — O Clima', 'Redação — Tecnologia e Sociedade'],
  alunos: [
    { name: 'Pedro Alves',       scores: [9.8, 9.5] },
    { name: 'Ana Souza',         scores: [9.2, 9.7] },
    { name: 'Carla Mendes',      scores: [8.7, 9.0] },
    { name: 'Lucas Ferreira',    scores: [8.5, 8.2] },
    { name: 'Beatriz Costa',     scores: [8.3, 8.9] },
    { name: 'Rafael Lima',       scores: [8.1, 8.4] },
    { name: 'Juliana Rocha',     scores: [7.9, 8.1] },
    { name: 'Thiago Santos',     scores: [7.7, 7.3] },
    { name: 'Mariana Oliveira',  scores: [7.5, 7.8] },
    { name: 'Gabriel Martins',   scores: [7.4, 7.6] },
    { name: 'Fernanda Nunes',    scores: [7.2, 7.5] },
    { name: 'Diego Carvalho',    scores: [7.1, 6.9] },
    { name: 'Isabela Ribeiro',   scores: [6.9, 7.2] },
    { name: 'Mateus Gonçalves',  scores: [6.7, 7.0] },
    { name: 'Letícia Pinto',     scores: [6.5, 6.8] },
    { name: 'Bruno Almeida',     scores: [6.3, 6.1] },
    { name: 'Amanda Vieira',     scores: [6.1, 6.4] },
    { name: 'Rodrigo Teixeira',  scores: [5.9, 6.2] },
    { name: 'Natália Barbosa',   scores: [5.5, 5.9] },
    { name: 'Eduardo Dias',      scores: [5.1, 5.6] },
    { name: 'Vanessa Castro',    scores: [4.8, 5.3] },
    { name: 'Henrique Moura',    scores: [4.3, 4.1] },
    { name: 'Priscila Ramos',    scores: [3.9, 4.5] },
    { name: 'André Correia',     scores: [3.2, 3.8] },
  ],
  criteriaEvolution: [
    { name: 'Gramática e Ortografia', avg1: 8.1, avg2: 8.4 },
    { name: 'Coesão e Coerência',     avg1: 7.3, avg2: 7.7 },
    { name: 'Argumentação',           avg1: 6.8, avg2: 7.1 },
    { name: 'Estrutura Textual',      avg1: 7.9, avg2: 8.0 },
  ],
  resumo: 'A turma apresentou evolução positiva entre as duas atividades avaliadas. A média geral subiu 0,4 pontos, com destaque para o avanço na argumentação e coesão textual. Alguns alunos ainda demonstram dificuldades persistentes que exigem atenção individualizada.',
  pontosFortes: [
    'Evolução consistente da média geral entre as atividades.',
    'Melhora expressiva no critério de argumentação.',
    'Maioria dos alunos manteve ou elevou seu desempenho.',
  ],
  pontosAtencao: [
    '4 alunos permanecem abaixo da média mínima nas duas atividades.',
    'Coesão textual ainda apresenta irregularidade em parte da turma.',
    'Queda de desempenho em 3 alunos entre a primeira e segunda atividade.',
  ],
  sugestoes: [
    {
      titulo: 'Reforço em Argumentação',
      descricao: 'Apesar da melhora, argumentação ainda é o critério mais fraco. Oficinas práticas com debates e redações modelo podem acelerar o progresso.',
      impacto: 'Potencial de elevar a média do critério para acima de 7,5.',
    },
    {
      titulo: 'Plano de Recuperação Individual',
      descricao: 'Os 4 alunos abaixo de 6,0 nas duas atividades precisam de acompanhamento específico com metas e prazos definidos.',
      impacto: 'Redução da taxa de insuficiência de 17% para menos de 5%.',
    },
    {
      titulo: 'Reconhecimento dos Alunos em Evolução',
      descricao: 'Identificar e reconhecer os alunos com maior evolução entre as atividades serve como motivação coletiva.',
      impacto: 'Engajamento e clima positivo na turma.',
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

function computeStats(alunos, scoreIndex) {
  const scores = alunos.map(a => a.scores[scoreIndex]);
  const total = scores.length;
  const media = avg(scores);
  const aprovados = scores.filter(s => s >= 6).length;
  const melhorNota = Math.max(...scores);
  const piorNota = Math.min(...scores);
  const distribuicao = [
    { label: 'Insuficiente', range: '0 – 5,9', count: scores.filter(s => s < 6).length,           color: '#ef4444' },
    { label: 'Regular',      range: '6 – 6,9', count: scores.filter(s => s >= 6 && s < 7).length, color: '#f59e0b' },
    { label: 'Bom',          range: '7 – 8,9', count: scores.filter(s => s >= 7 && s < 9).length, color: '#22c55e' },
    { label: 'Excelente',    range: '9 – 10',  count: scores.filter(s => s >= 9).length,           color: '#16a34a' },
  ];
  return { total, media, aprovados, melhorNota, piorNota, distribuicao };
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 20px', letterSpacing: '-0.2px', display: 'flex', alignItems: 'center', gap: 10 }}>
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
    <span style={{ fontSize: 11, fontWeight: 700, color: up ? '#16a34a' : '#ef4444', background: up ? '#f0fdf4' : '#fef2f2', border: `1px solid ${up ? '#bbf7d0' : '#fecaca'}`, padding: '2px 7px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {up ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}
    </span>
  );
}

function CriteriaEvolutionBar({ name, avg1, avg2 }) {
  const color1 = '#94a3b8';
  const color2 = scoreColor(avg2);
  const delta = avg2 - avg1;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{avg1.toFixed(1)}</span>
          <span style={{ fontSize: 10, color: '#cbd5e1' }}>→</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: color2 }}>{avg2.toFixed(1)}</span>
          <EvolutionBadge delta={delta} />
        </div>
      </div>
      {/* Track duplo: ativ1 embaixo (cinza), ativ2 em cima (colorida) */}
      <div style={{ position: 'relative', height: 12, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', height: '100%', width: `${(avg1 / 10) * 100}%`, background: '#e2e8f0', borderRadius: 99 }} />
        <div style={{ position: 'absolute', height: '100%', width: `${(avg2 / 10) * 100}%`, background: `linear-gradient(90deg, ${color2}88, ${color2})`, borderRadius: 99 }} />
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 5 }}>
        <span style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 3, background: '#e2e8f0', borderRadius: 99, display: 'inline-block' }} /> Ativ. 1
        </span>
        <span style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 3, background: color2, borderRadius: 99, display: 'inline-block' }} /> Ativ. 2
        </span>
      </div>
    </div>
  );
}

function DistributionCompare({ data1, data2 }) {
  const max = Math.max(...data1.map(d => d.count), ...data2.map(d => d.count), 1);
  const barMaxH = 80;
  return (
    <div>
      {/* Legenda */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#cbd5e1', display: 'inline-block' }} /> Ativ. 1
        </span>
        <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#0081f0', display: 'inline-block' }} /> Ativ. 2
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {data1.map((d, i) => {
          const d2 = data2[i];
          const h1 = Math.max(4, (d.count / max) * barMaxH);
          const h2 = Math.max(4, (d2.count / max) * barMaxH);
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ height: 44, display: 'flex', alignItems: 'flex-end', gap: 3, paddingBottom: 4, width: '100%', justifyContent: 'center' }}>
                {/* Bar ativ1 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 3 }}>{d.count}</span>
                  <div style={{ width: '100%', height: h1, background: '#cbd5e1', borderRadius: '4px 4px 0 0' }} />
                </div>
                {/* Bar ativ2 */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: d.color, marginBottom: 3 }}>{d2.count}</span>
                  <div style={{ width: '100%', height: h2, background: d.color, borderRadius: '4px 4px 0 0', opacity: 0.85 }} />
                </div>
              </div>
              <div style={{ width: '100%', height: 2, background: d.color, opacity: 0.3 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#374151', textAlign: 'center', marginTop: 6, lineHeight: 1.2 }}>{d.label}</span>
              <span style={{ fontSize: 9, color: '#94a3b8', textAlign: 'center' }}>{d.range}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RelatorioTurmaMultiPreviewPage() {
  const d = mock;
  const stats1 = computeStats(d.alunos, 0);
  const stats2 = computeStats(d.alunos, 1);
  const deltaMedia = stats2.media - stats1.media;
  const deltaAprov = stats2.aprovados - stats1.aprovados;

  const rankingOrdenado = [...d.alunos]
    .map(a => ({ ...a, mediaGeral: avg(a.scores), delta: a.scores[1] - a.scores[0] }))
    .sort((a, b) => b.mediaGeral - a.mediaGeral);

  const alunosAtencao = rankingOrdenado.filter(a => a.scores[1] < 6);
  const maiorEvolucao = [...rankingOrdenado].sort((a, b) => b.delta - a.delta).slice(0, 3);

  const section = { padding: '28px 40px', borderBottom: '1px solid #f1f5f9' };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f1f5f9', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,0.10)' }}>

        {/* ── Header ── */}
        <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderBottom: '1px solid #e2e8f0', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 12, background: '#e2e8f0', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="#94a3b8" strokeWidth="1.5"/>
              <path d="M8 12h8M8 8h8M8 16h5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>LOGO</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px', fontWeight: 600 }}>Data de Emissão</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>{d.date}</p>
          </div>
        </div>

        {/* ── Identidade da turma ── */}
        <div style={{ ...section }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#ede9fe', color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Relatório de Turma
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#dbeafe', color: '#1d4ed8', letterSpacing: '0.08em' }}>
              {d.atividades.length} atividades
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '8px 0 14px', letterSpacing: '-0.5px' }}>{d.turma}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px', marginBottom: 14 }}>
            {[
              { label: 'Disciplina',            value: d.disciplina },
              { label: 'Professor Responsável', value: d.profileName },
            ].map(item => (
              <div key={item.label}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>{item.label}</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>
          {/* Atividades */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {d.atividades.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                <span style={{ width: 20, height: 20, borderRadius: 99, background: i === 0 ? '#e2e8f0' : '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: i === 0 ? '#64748b' : '#1d4ed8', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── KPIs comparativos ── */}
        <div style={{ ...section }}>
          <SectionTitle>Visão Geral Comparativa</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Média Geral</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px' }}>Atividade 1</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: scoreColor(stats1.media), margin: 0 }}>{stats1.media.toFixed(1)}</p>
                </div>
                <span style={{ fontSize: 18, color: '#cbd5e1', marginBottom: 4 }}>→</span>
                <div>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px' }}>Atividade 2</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: scoreColor(stats2.media), margin: 0 }}>{stats2.media.toFixed(1)}</p>
                </div>
                <div style={{ marginBottom: 4 }}>
                  <EvolutionBadge delta={deltaMedia} />
                </div>
              </div>
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Aprovação</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px' }}>Atividade 1</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: '#16a34a', margin: 0 }}>{Math.round((stats1.aprovados / stats1.total) * 100)}%</p>
                </div>
                <span style={{ fontSize: 18, color: '#cbd5e1', marginBottom: 4 }}>→</span>
                <div>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 2px' }}>Atividade 2</p>
                  <p style={{ fontSize: 24, fontWeight: 900, color: '#16a34a', margin: 0 }}>{Math.round((stats2.aprovados / stats2.total) * 100)}%</p>
                </div>
                <div style={{ marginBottom: 4 }}>
                  <EvolutionBadge delta={deltaAprov} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <KpiCard label="Total de Alunos"  value={stats2.total}                    color="#0081f0" />
            <KpiCard label="Melhor Nota (Ativ. 2)" value={stats2.melhorNota.toFixed(1)} color="#16a34a" />
            <KpiCard label="Pior Nota (Ativ. 2)"   value={stats2.piorNota.toFixed(1)}   color={scoreColor(stats2.piorNota)} />
          </div>
        </div>

        {/* ── Distribuição comparativa + Critérios com evolução ── */}
        <div style={{ ...section }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <SectionTitle>Distribuição Comparativa</SectionTitle>
              <DistributionCompare data1={stats1.distribuicao} data2={stats2.distribuicao} />
            </div>
            <div>
              <SectionTitle>Evolução por Critério</SectionTitle>
              {d.criteriaEvolution.map((c, i) => (
                <CriteriaEvolutionBar key={i} name={c.name} avg1={c.avg1} avg2={c.avg2} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Destaques de evolução ── */}
        <div style={{ ...section }}>
          <SectionTitle>Maiores Evoluções</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {maiorEvolucao.map((a, i) => (
              <div key={i} style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, color: '#f59e0b' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>{a.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>{a.scores[0].toFixed(1)}</span>
                  <span style={{ fontSize: 11, color: '#cbd5e1' }}>→</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: scoreColor(a.scores[1]) }}>{a.scores[1].toFixed(1)}</span>
                  <EvolutionBadge delta={a.delta} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Ranking completo ── */}
        <div style={{ ...section }}>
          <SectionTitle>Ranking da Turma</SectionTitle>
          <div style={{ border: '1px solid #f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 72px 72px 80px 96px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 16px', gap: 8 }}>
              {['#', 'Aluno', 'Ativ. 1', 'Ativ. 2', 'Evolução', 'Conceito'].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
              ))}
            </div>
            {rankingOrdenado.map((a, i) => {
              const isAtencao = a.scores[1] < 6;
              const color2 = scoreColor(a.scores[1]);
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 72px 72px 80px 96px', padding: '11px 16px', gap: 8, borderBottom: i < rankingOrdenado.length - 1 ? '1px solid #f8fafc' : 'none', background: isAtencao ? '#fff9f9' : i % 2 === 0 ? '#fff' : '#fafafa', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: i < 3 ? '#f59e0b' : '#94a3b8' }}>
                    {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: isAtencao ? '#dc2626' : '#1f2937' }}>{a.name}</span>
                    {isAtencao && <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '1px 6px', borderRadius: 99 }}>Atenção</span>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{a.scores[0].toFixed(1)}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: color2 }}>{a.scores[1].toFixed(1)}</span>
                  <EvolutionBadge delta={a.delta} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: color2, background: scoreBg(a.scores[1]), border: `1px solid ${scoreBorder(a.scores[1])}`, padding: '2px 8px', borderRadius: 99, textAlign: 'center' }}>
                    {scoreConcept(a.scores[1])}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{alunosAtencao.length} aluno{alunosAtencao.length > 1 ? 's' : ''} abaixo de 6,0 na última atividade</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {alunosAtencao.map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{a.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <EvolutionBadge delta={a.delta} />
                      <span style={{ fontSize: 14, fontWeight: 900, color: '#ef4444' }}>{a.scores[1].toFixed(1)}</span>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#0081f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#0081f0', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Resumo Geral</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.85, color: '#374151', margin: 0, fontStyle: 'italic' }}>"{d.resumo}"</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pontos Fortes</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {d.pontosFortes.map((p, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2, flexShrink: 0 }}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 13, color: '#166534', lineHeight: 1.5 }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pontos de Atenção</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {d.pontosAtencao.map((p, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
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
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 14, padding: '18px 20px', background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', borderLeft: '4px solid #0081f0', alignItems: 'start' }}>
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

        {/* ── Footer ── */}
        <div style={{ background: '#f8fafc', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#94a3b8" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#94a3b8" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {d.institution} · Documento Acadêmico Oficial
            </span>
          </div>
        </div>
      </div>

      {/* ── Controles ── */}
      <div style={{ maxWidth: 820, margin: '24px auto 0', display: 'flex', gap: 10, justifyContent: 'center' }} className="no-print">
        <button onClick={() => window.print()} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0f172a, #0081f0)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Imprimir / Exportar PDF
        </button>
        <a href="/relatorio-turma-preview" style={{ padding: '10px 24px', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Ver turma (1 atividade)
        </a>
        <a href="/relatorio-preview" style={{ padding: '10px 24px', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
          Ver individual
        </a>
      </div>

      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } }`}</style>
    </div>
  );
}
