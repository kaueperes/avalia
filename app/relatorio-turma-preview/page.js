'use client';

// ── Mock data ─────────────────────────────────────────────────────────────────
const mock = {
  turma: '3º Ano A',
  exerciseName: 'Redação — O Clima',
  disciplina: 'Língua Portuguesa',
  institution: 'Colégio Elite',
  profileName: 'Dr. Marcos Vinicius',
  date: '15 Out 2026',
  alunos: [
    { name: 'Pedro Alves',        score: 9.8 },
    { name: 'Ana Souza',          score: 9.2 },
    { name: 'Carla Mendes',       score: 8.7 },
    { name: 'Lucas Ferreira',     score: 8.5 },
    { name: 'Beatriz Costa',      score: 8.3 },
    { name: 'Rafael Lima',        score: 8.1 },
    { name: 'Juliana Rocha',      score: 7.9 },
    { name: 'Thiago Santos',      score: 7.7 },
    { name: 'Mariana Oliveira',   score: 7.5 },
    { name: 'Gabriel Martins',    score: 7.4 },
    { name: 'Fernanda Nunes',     score: 7.2 },
    { name: 'Diego Carvalho',     score: 7.1 },
    { name: 'Isabela Ribeiro',    score: 6.9 },
    { name: 'Mateus Gonçalves',   score: 6.7 },
    { name: 'Letícia Pinto',      score: 6.5 },
    { name: 'Bruno Almeida',      score: 6.3 },
    { name: 'Amanda Vieira',      score: 6.1 },
    { name: 'Rodrigo Teixeira',   score: 5.9 },
    { name: 'Natália Barbosa',    score: 5.5 },
    { name: 'Eduardo Dias',       score: 5.1 },
    { name: 'Vanessa Castro',     score: 4.8 },
    { name: 'Henrique Moura',     score: 4.3 },
    { name: 'Priscila Ramos',     score: 3.9 },
    { name: 'André Correia',      score: 3.2 },
  ],
  criteriaAverages: [
    { name: 'Gramática e Ortografia', avg: 8.1 },
    { name: 'Coesão e Coerência',     avg: 7.3 },
    { name: 'Argumentação',           avg: 6.8 },
    { name: 'Estrutura Textual',      avg: 7.9 },
  ],
  resumo: 'A turma demonstrou desempenho satisfatório na atividade proposta, com predominância de resultados na faixa "Bom". O domínio gramatical foi o ponto de maior destaque coletivo, enquanto a argumentação permanece como área prioritária para desenvolvimento pedagógico. A dispersão entre os melhores e piores resultados indica necessidade de estratégias diferenciadas.',
  pontosFortes: [
    'Bom domínio das normas gramaticais e ortográficas.',
    'Estrutura textual bem desenvolvida na maioria dos alunos.',
    'Vocabulário adequado ao nível acadêmico esperado.',
  ],
  pontosAtencao: [
    'Argumentação e desenvolvimento de ideias precisa de reforço.',
    'Coesão entre parágrafos ainda irregular em parte da turma.',
    '4 alunos abaixo da média mínima exigem atenção especial.',
  ],
  sugestoes: [
    {
      titulo: 'Oficina de Argumentação',
      descricao: 'Propor atividades focadas em desenvolvimento de argumentos com exemplos práticos e contra-argumentação.',
      impacto: 'Estimativa de melhora de 0,8 pontos na média de argumentação.',
    },
    {
      titulo: 'Leitura Dirigida',
      descricao: 'Indicar textos de referência para ampliar o repertório dos alunos e melhorar a coesão textual.',
      impacto: 'Impacto direto nos critérios de coesão e estrutura.',
    },
    {
      titulo: 'Acompanhamento Individual',
      descricao: 'Os alunos abaixo de 5.0 devem ter plano de recuperação individualizado com metas claras.',
      impacto: 'Redução da taxa de reprovação para próximo de zero.',
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

function computeStats(alunos) {
  const total = alunos.length;
  const scores = alunos.map(a => a.score);
  const media = scores.reduce((s, v) => s + v, 0) / total;
  const aprovados = scores.filter(s => s >= 6).length;
  const melhorNota = Math.max(...scores);
  const piorNota = Math.min(...scores);
  const distribuicao = [
    { label: 'Insuficiente', range: '0 – 5,9', count: scores.filter(s => s < 6).length,            color: '#ef4444', bg: '#fef2f2' },
    { label: 'Regular',      range: '6 – 6,9', count: scores.filter(s => s >= 6 && s < 7).length,  color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Bom',          range: '7 – 8,9', count: scores.filter(s => s >= 7 && s < 9).length,  color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Excelente',    range: '9 – 10',  count: scores.filter(s => s >= 9).length,            color: '#16a34a', bg: '#f0fdf4' },
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
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function CriteriaBar({ name, avg }) {
  const color = scoreColor(avg);
  const pct = (avg / 10) * 100;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>{pct.toFixed(0)}%</span>
          <span style={{ fontSize: 14, fontWeight: 800, color, minWidth: 32, textAlign: 'right' }}>{avg.toFixed(1)}</span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 12, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: gradients[color] || `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function DistributionChart({ data, total }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const barMaxH = 90;
  const gradients = {
    '#ef4444': 'linear-gradient(180deg, #fca5a5, #ef4444)',
    '#f59e0b': 'linear-gradient(180deg, #fde68a, #f59e0b)',
    '#22c55e': 'linear-gradient(180deg, #86efac, #22c55e)',
    '#16a34a': 'linear-gradient(180deg, #4ade80, #16a34a)',
  };

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', padding: '0 4px' }}>
      {data.map((d, i) => {
        const barH = Math.max(6, (d.count / max) * barMaxH);
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Count + pct — espaço fixo no topo */}
            <div style={{ height: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: d.color, lineHeight: 1 }}>{d.count}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginTop: 2 }}>{pct}%</span>
            </div>
            {/* Área da barra com altura fixa, barra cresce a partir do fundo */}
            <div style={{ height: barMaxH, width: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map(v => (
                <div key={v} style={{ position: 'absolute', bottom: v * barMaxH, left: 0, right: 0, borderTop: '1px dashed #e2e8f0', zIndex: 0 }} />
              ))}
              <div style={{ width: '100%', height: barH, background: gradients[d.color] || d.color, borderRadius: '8px 8px 0 0', boxShadow: `0 -3px 10px ${d.color}30`, position: 'relative', zIndex: 1 }} />
            </div>
            {/* Base */}
            <div style={{ width: '100%', height: 3, background: d.color, opacity: 0.4, borderRadius: '0 0 3px 3px' }} />
            {/* Labels */}
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#374151', textAlign: 'center', lineHeight: 1.2 }}>{d.label}</span>
              <span style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>{d.range}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function TurmaReport({ data }) {
  const d = data || mock;
  const stats = computeStats(d.alunos);
  const rankingOrdenado = [...d.alunos].sort((a, b) => b.score - a.score);
  const alunosAtencao = rankingOrdenado.filter(a => a.score < 6);
  const pct = Math.round((stats.aprovados / stats.total) * 100);

  const section = {
    padding: '28px 40px',
    borderBottom: '1px solid #f1f5f9',
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f1f5f9', minHeight: '100vh', padding: '40px 20px' }}>
      <div className="rpt-card" style={{ maxWidth: 820, margin: '0 auto', background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,0.10)' }}>

        {/* ── Header ── */}
        <div style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderBottom: '1px solid #e2e8f0', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {d.institutionLogo ? (
            <img src={d.institutionLogo} alt="Logo" style={{ width: 96, height: 96, borderRadius: 12, objectFit: 'contain', flexShrink: 0 }} />
          ) : (
          <div style={{ width: 96, height: 96, borderRadius: 12, background: '#e2e8f0', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="#94a3b8" strokeWidth="1.5"/>
              <path d="M8 12h8M8 8h8M8 16h5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>LOGO</span>
          </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px', fontWeight: 600 }}>Data de Emissão</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>{d.date}</p>
          </div>
        </div>

        {/* ── Identidade da turma ── */}
        <div style={{ ...section, background: '#fff' }}>
          <div style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: '#ede9fe', color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Relatório de Turma
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '8px 0 14px', letterSpacing: '-0.5px' }}>
            {d.turma}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 28px' }}>
            {[
              { label: 'Disciplina',            value: d.disciplina },
              { label: 'Professor Responsável', value: d.profileName },
              { label: 'Atividade',             value: d.exerciseName },
            ].map(item => (
              <div key={item.label}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>{item.label}</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── KPIs ── */}
        <div style={{ ...section }}>
          <SectionTitle>Visão Geral da Turma</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            <KpiCard label="Média Geral"    value={stats.media.toFixed(1)}    color={scoreColor(stats.media)} />
            <KpiCard label="Aprovação"      value={`${pct}%`}                 color="#16a34a" sub={`${stats.aprovados} de ${stats.total}`} />
            <KpiCard label="Total de Alunos" value={stats.total}              color="#0081f0" />
            <KpiCard label="Melhor Nota"    value={stats.melhorNota.toFixed(1)} color="#16a34a" />
            <KpiCard label="Pior Nota"      value={stats.piorNota.toFixed(1)} color={scoreColor(stats.piorNota)} />
          </div>
        </div>

        {/* ── Distribuição + Critérios ── */}
        <div style={{ ...section }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <SectionTitle>Distribuição de Desempenho</SectionTitle>
              <DistributionChart data={stats.distribuicao} total={stats.total} />
            </div>
            <div>
              <SectionTitle>Média por Critério</SectionTitle>
              {d.criteriaAverages.map((c, i) => (
                <CriteriaBar key={i} name={c.name} avg={c.avg} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Ranking completo ── */}
        <div style={{ ...section }}>
          <SectionTitle>Ranking da Turma</SectionTitle>
          <div style={{ border: '1px solid #f1f5f9', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 100px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 16px' }}>
              {['#', 'Aluno', 'Nota', 'Conceito'].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
              ))}
            </div>
            {rankingOrdenado.map((a, i) => {
              const color = scoreColor(a.score);
              const isAtencao = a.score < 6;
              return (
                <div
                  key={i}
                  style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 100px', padding: '11px 16px', borderBottom: i < rankingOrdenado.length - 1 ? '1px solid #f8fafc' : 'none', background: isAtencao ? '#fff9f9' : i % 2 === 0 ? '#fff' : '#fafafa', alignItems: 'center' }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: i < 3 ? '#f59e0b' : '#94a3b8' }}>
                    {i + 1}
                    {i === 0 && ' 🥇'}{i === 1 && ' 🥈'}{i === 2 && ' 🥉'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: isAtencao ? '#dc2626' : '#1f2937' }}>{a.name}</span>
                    {isAtencao && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '1px 6px', borderRadius: 99 }}>Atenção</span>
                    )}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color }}>{a.score.toFixed(1)}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color, background: scoreBg(a.score), border: `1px solid ${scoreBorder(a.score)}`, padding: '2px 10px', borderRadius: 99, display: 'inline-block', textAlign: 'center', width: 'fit-content' }}>
                    {scoreConcept(a.score)}
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
                <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{alunosAtencao.length} aluno{alunosAtencao.length > 1 ? 's' : ''} abaixo da média mínima (6,0)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                {alunosAtencao.map((a, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{a.name}</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#ef4444' }}>{a.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Resumo ── */}
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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pontos Fortes</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {d.pontosFortes.map((p, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: 13, color: '#166534', lineHeight: 1.5 }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pontos de Atenção</span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {d.pontosAtencao.map((p, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                      <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Sugestões pedagógicas ── */}
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

      </div>

      {/* ── Controles de preview ── */}
      <div style={{ maxWidth: 820, margin: '24px auto 0', display: 'flex', gap: 10, justifyContent: 'center' }} className="no-print">
        <button
          onClick={() => window.print()}
          style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #0f172a, #0081f0)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          Imprimir / Exportar PDF
        </button>
        <a
          href="/relatorio-preview"
          style={{ padding: '10px 24px', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          Ver relatório individual
        </a>
        <a
          href="/relatorios"
          style={{ padding: '10px 24px', background: '#fff', color: '#374151', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        >
          ← Voltar
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

export default function RelatorioTurmaPreviewPage() {
  return <TurmaReport data={mock} />;
}
