'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/AppLayout';

// ── Palette for dynamic turma colors ─────────────────────────────────────────
const PALETTE = [
  { color: '#0081f0', bg: '#eff6ff' },
  { color: '#d97706', bg: '#fffbeb' },
  { color: '#16a34a', bg: '#f0fdf4' },
  { color: '#7c3aed', bg: '#f5f3ff' },
  { color: '#db2777', bg: '#fdf2f8' },
  { color: '#0891b2', bg: '#ecfeff' },
];

function getTurmaColor(turma, allTurmas) {
  const idx = allTurmas.indexOf(turma);
  return PALETTE[idx % PALETTE.length];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(v) {
  return v >= 9 ? '#16a34a' : v >= 7 ? '#22c55e' : v >= 6 ? '#d97706' : '#ef4444';
}
function scoreConcept(v) {
  return v >= 9 ? 'Excelente' : v >= 7 ? 'Bom' : v >= 6 ? 'Regular' : 'Insuficiente';
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}
function todayLabel() {
  return new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// ── SVG Charts ────────────────────────────────────────────────────────────────
function EvolutionChart({ data, color = '#0081f0' }) {
  if (!data?.length) return (
    <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      Sem avaliações para exibir
    </div>
  );
  if (data.length === 1) return (
    <div style={{ height: 130, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
      <span style={{ fontSize: 40, fontWeight: 900, color: scoreColor(data[0].avg) }}>{data[0].avg.toFixed(1)}</span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data[0].label} · apenas 1 avaliação</span>
    </div>
  );

  const W = 420, H = 110, pL = 28, pR = 14, pT = 18, pB = 28;
  const cW = W - pL - pR, cH = H - pT - pB, n = data.length;
  const xs = data.map((_, i) => pL + (i / (n - 1)) * cW);
  const ys = data.map(d => pT + cH - Math.max(0, Math.min(d.avg, 10)) / 10 * cH);
  const gridLines = [4, 6, 8, 10].map(v => ({ v, y: pT + cH - (v / 10) * cH }));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const areaPath = `${path} L${xs[n-1].toFixed(1)},${(pT+cH).toFixed(1)} L${xs[0].toFixed(1)},${(pT+cH).toFixed(1)} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: 'auto' }}>
      {gridLines.map(({ v, y }) => (
        <g key={v}>
          <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#e5e7eb" strokeDasharray="3,3" />
          <text x={pL - 4} y={y + 3} textAnchor="end" fontSize={8} fill="#9ca3af" fontFamily="inherit">{v}</text>
        </g>
      ))}
      <path d={areaPath} fill={`${color}10`} />
      <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xs[i]} cy={ys[i]} r={5} fill={scoreColor(d.avg)} stroke="white" strokeWidth={2} />
          <text x={xs[i]} y={ys[i] - 10} textAnchor="middle" fontSize={10} fontWeight={700} fill={scoreColor(d.avg)} fontFamily="inherit">{d.avg.toFixed(1)}</text>
          <text x={xs[i]} y={H - 4} textAnchor="middle" fontSize={9} fill="#9ca3af" fontFamily="inherit">{d.label}</text>
        </g>
      ))}
    </svg>
  );
}

function DistChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);
  const bW = 44, gap = 12, H = 90, pB = 32;
  const W = data.length * (bW + gap) - gap;
  if (total === 0) return (
    <div style={{ height: 122, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      Sem dados para a turma selecionada
    </div>
  );
  return (
    <svg width={W} height={H + pB} style={{ overflow: 'visible', display: 'block' }}>
      {data.map((d, i) => {
        const x = i * (bW + gap);
        const h = Math.max(d.count > 0 ? 4 : 0, (d.count / max) * H);
        const y = H - h;
        const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
        return (
          <g key={i}>
            {d.count === 0
              ? <rect x={x} y={H - 3} width={bW} height={3} rx={2} fill={d.color} opacity={0.2} />
              : <rect x={x} y={y} width={bW} height={h} rx={6} fill={d.color} opacity={0.85} />
            }
            {d.count > 0 && <text x={x + bW / 2} y={y - 5} textAnchor="middle" fontSize={13} fontWeight={800} fill={d.color} fontFamily="inherit">{d.count}</text>}
            <text x={x + bW / 2} y={H + 15} textAnchor="middle" fontSize={10} fill="#6b7280" fontFamily="inherit">{d.label}</text>
            <text x={x + bW / 2} y={H + 27} textAnchor="middle" fontSize={10} fill="#9ca3af" fontFamily="inherit">{pct > 0 ? `${pct}%` : '—'}</text>
          </g>
        );
      })}
    </svg>
  );
}

function MiniSparkline({ values, color = '#0081f0', width = 60, height = 28 }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pad = 3;
  const xs = values.map((_, i) => pad + (i / (values.length - 1)) * (width - pad * 2));
  const ys = values.map(v => pad + (1 - (v - min) / range) * (height - pad * 2));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height}>
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" opacity={0.7} />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r={2.5} fill={color} />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function InicioPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Professor');
  const [selectedTurma, setSelectedTurma] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setUserName(u.name);
      }
    } catch {}

    fetch('/api/evaluations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setEvaluations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const firstName = userName.split(' ')[0];

  // Turma list
  const allTurmas = useMemo(
    () => [...new Set(evaluations.map(e => e.turma).filter(Boolean))].sort(),
    [evaluations]
  );

  // Filtered evaluations
  const filteredEvals = useMemo(
    () => selectedTurma ? evaluations.filter(e => e.turma === selectedTurma) : evaluations,
    [evaluations, selectedTurma]
  );

  // Global KPI stats (always all evaluations)
  const scores = evaluations.map(e => e.score).filter(s => typeof s === 'number');
  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
  const aprovados = scores.filter(s => s >= 6).length;
  const aprovPct = scores.length ? Math.round((aprovados / scores.length) * 100) : 0;
  const uniqueStudents = new Set(evaluations.map(e => e.studentName)).size;
  const emAtencao = evaluations.filter(e => e.score < 6).sort((a, b) => a.score - b.score);

  // Evolution data from filteredEvals — group by date, avg per day
  const evoData = useMemo(() => {
    const byDate = {};
    filteredEvals
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .forEach(e => {
        const label = fmtDate(e.createdAt);
        if (!byDate[label]) byDate[label] = [];
        byDate[label].push(e.score);
      });
    return Object.entries(byDate).map(([label, vals]) => ({
      label,
      avg: parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1)),
    }));
  }, [filteredEvals]);

  const trendDelta = evoData.length >= 2
    ? parseFloat((evoData[evoData.length - 1].avg - evoData[0].avg).toFixed(1))
    : null;

  // Distribution from filteredEvals
  const fScores = filteredEvals.map(e => e.score);
  const distData = useMemo(() => [
    { label: '0–4',  count: fScores.filter(s => s < 5).length,                    color: '#ef4444' },
    { label: '5–6',  count: fScores.filter(s => s >= 5 && s < 7).length,          color: '#f59e0b' },
    { label: '7–8',  count: fScores.filter(s => s >= 7 && s < 9).length,          color: '#3b82f6' },
    { label: '9–10', count: fScores.filter(s => s >= 9).length,                   color: '#22c55e' },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [filteredEvals]);

  // Alunos em atenção (filtered)
  const filteredAtencao = filteredEvals.filter(e => e.score < 6).sort((a, b) => a.score - b.score);

  // Turma summaries
  const turmaSummaries = useMemo(() => allTurmas.map(t => {
    const tc = getTurmaColor(t, allTurmas);
    const evals = evaluations.filter(e => e.turma === t);
    const tScores = evals.map(e => e.score).filter(s => typeof s === 'number');
    const tMedia = tScores.length ? parseFloat((tScores.reduce((s, v) => s + v, 0) / tScores.length).toFixed(1)) : 0;
    const tAprov = tScores.length ? Math.round((tScores.filter(s => s >= 6).length / tScores.length) * 100) : 0;
    return { name: t, total: evals.length, media: tMedia, aprovPct: tAprov, scores: tScores, ...tc };
  }), [evaluations, allTurmas]);

  const chartColor = selectedTurma ? (getTurmaColor(selectedTurma, allTurmas)?.color || '#0081f0') : '#0081f0';
  const recent = evaluations.slice(0, 6);

  const inpStyle = {
    padding: '8px 14px', border: '1px solid var(--border)', borderRadius: 9,
    fontSize: 13, fontWeight: 600, outline: 'none', background: 'var(--bg-card)',
    color: 'var(--text-main)', fontFamily: 'inherit', cursor: 'pointer',
    appearance: 'none', WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%236b7280' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: 30,
  };

  const kpis = [
    {
      label: 'Total de avaliações',
      value: loading ? '—' : evaluations.length,
      sub: 'desde o início',
      color: 'var(--text-main)',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    },
    {
      label: 'Média geral',
      value: loading ? '—' : (avg ?? '—'),
      sub: 'de todas as avaliações',
      color: avg ? scoreColor(parseFloat(avg)) : 'var(--text-main)',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    },
    {
      label: 'Taxa de aprovação',
      value: loading ? '—' : `${aprovPct}%`,
      sub: `${aprovados} de ${evaluations.length} alunos`,
      color: '#16a34a',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    },
    {
      label: 'Alunos avaliados',
      value: loading ? '—' : uniqueStudents,
      sub: 'alunos únicos',
      color: '#810cfa',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    },
    {
      label: 'Em atenção',
      value: loading ? '—' : emAtencao.length,
      sub: 'alunos com nota < 6',
      color: !loading && emAtencao.length > 0 ? '#ef4444' : '#16a34a',
      alert: !loading && emAtencao.length > 0,
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    },
  ];

  // Empty state
  if (!loading && evaluations.length === 0) {
    return (
      <AppLayout userName={userName}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Início</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            {greeting()}, {firstName} 👋
          </h1>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '48px', textAlign: 'center' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🎯</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>Nenhuma avaliação ainda</p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Faça sua primeira avaliação e os resultados aparecerão aqui.</p>
          <button onClick={() => router.push('/avaliar')} style={{ padding: '11px 28px', background: '#0081f0', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Fazer primeira avaliação
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout userName={userName}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Início</p>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px', marginBottom: 6 }}>
          {greeting()}, {firstName} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {loading ? 'Carregando dados...' : todayLabel()}
          {!loading && (
            <span style={{ marginLeft: 12, padding: '2px 10px', background: emAtencao.length > 0 ? '#fef2f2' : '#f0fdf4', color: emAtencao.length > 0 ? '#ef4444' : '#16a34a', borderRadius: 20, fontSize: 12, fontWeight: 700, border: `1px solid ${emAtencao.length > 0 ? '#fecaca' : '#bbf7d0'}` }}>
              {emAtencao.length > 0 ? `⚠ ${emAtencao.length} alunos precisam de atenção` : '✓ Turmas em dia'}
            </span>
          )}
        </p>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
        {kpis.map((kpi, i) => (
          <div key={i} style={{ background: kpi.alert ? '#fff5f5' : 'var(--bg-card)', borderRadius: 14, padding: '18px 20px', border: `1px solid ${kpi.alert ? '#fecaca' : 'var(--border-card)'}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{kpi.label}</span>
              {kpi.icon}
            </div>
            <span style={{ fontSize: 34, fontWeight: 900, color: kpi.color, lineHeight: 1, letterSpacing: '-1.5px' }}>{kpi.value}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{kpi.sub}</span>
          </div>
        ))}
      </div>

      {!loading && evaluations.length > 0 && (
        <>
          {/* ── Filtro global de turma ── */}
          {allTurmas.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M3 4h18M7 12h10M11 20h2" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-sub)', flexShrink: 0 }}>Filtrar por turma:</span>
              <select
                value={selectedTurma}
                onChange={e => setSelectedTurma(e.target.value)}
                style={inpStyle}
              >
                <option value="">Todas as turmas</option>
                {allTurmas.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {selectedTurma && (() => {
                const tc = getTurmaColor(selectedTurma, allTurmas);
                return (
                  <>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: tc.bg, color: tc.color, border: `1px solid ${tc.color}33` }}>
                      {selectedTurma} · {filteredEvals.length} avaliações
                    </span>
                    <button onClick={() => setSelectedTurma('')} style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', fontFamily: 'inherit' }}>
                      × Limpar
                    </button>
                  </>
                );
              })()}
              <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
                Os gráficos abaixo refletem a seleção
              </span>
            </div>
          )}

          {/* ── Charts Row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* Evolução da média */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>Evolução da média</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {trendDelta !== null && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, color: trendDelta > 0 ? '#16a34a' : trendDelta < 0 ? '#ef4444' : '#6b7280', background: trendDelta > 0 ? '#f0fdf4' : trendDelta < 0 ? '#fef2f2' : '#f1f5f9', border: `1px solid ${trendDelta > 0 ? '#bbf7d0' : trendDelta < 0 ? '#fecaca' : '#e2e8f0'}` }}>
                      {trendDelta > 0 ? '↑' : trendDelta < 0 ? '↓' : '→'} {trendDelta > 0 ? '+' : ''}{trendDelta.toFixed(1)}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {selectedTurma || 'todas as turmas'}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Média diária das avaliações</p>
              <EvolutionChart data={evoData} color={chartColor} />
              {evoData.length >= 2 && (
                <div style={{ marginTop: 16, display: 'flex', gap: 20 }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Início do período</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: scoreColor(evoData[0].avg) }}>{evoData[0].avg.toFixed(1)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Mais recente</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: scoreColor(evoData[evoData.length - 1].avg) }}>{evoData[evoData.length - 1].avg.toFixed(1)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Variação</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: trendDelta > 0 ? '#16a34a' : trendDelta < 0 ? '#ef4444' : '#6b7280' }}>
                      {trendDelta > 0 ? '+' : ''}{trendDelta?.toFixed(1)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Distribuição de notas */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>Distribuição de notas</h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {filteredEvals.length} {filteredEvals.length === 1 ? 'aluno' : 'alunos'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
                {selectedTurma ? `Faixas de desempenho · ${selectedTurma}` : 'Faixas de desempenho · todas as turmas'}
              </p>
              <DistChart data={distData} />
              <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {distData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: 'inline-block' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.label}: <strong style={{ color: 'var(--text-main)' }}>{d.count}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Atenção + Turmas ── */}
          <div style={{ display: 'grid', gridTemplateColumns: allTurmas.length > 0 ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 16 }}>

            {/* Alunos em atenção */}
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>Alunos em atenção</h3>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: 20, border: '1px solid #fecaca' }}>
                  {filteredAtencao.length} alunos
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Notas abaixo de 6,0 — intervenção recomendada</p>
              {filteredAtencao.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#16a34a', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0', fontSize: 13, fontWeight: 600 }}>
                  ✓ Nenhum aluno em atenção {selectedTurma ? `na ${selectedTurma}` : ''}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredAtencao.slice(0, 5).map((e, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#fff5f5', borderRadius: 10, border: '1px solid #fecaca', borderLeft: '3px solid #ef4444' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#dc2626', flexShrink: 0 }}>
                        {e.studentName.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.studentName}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.turma ? `${e.turma} · ` : ''}{e.exerciseName || e.type}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 18, fontWeight: 900, color: '#ef4444', lineHeight: 1 }}>{e.score.toFixed(1)}</p>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>Insuficiente</p>
                      </div>
                    </div>
                  ))}
                  {filteredAtencao.length > 5 && (
                    <button onClick={() => router.push('/avaliacoes')} style={{ fontSize: 12, color: '#0081f0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '4px 0', fontFamily: 'inherit' }}>
                      + {filteredAtencao.length - 5} mais → Ver todas
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Por turma */}
            {allTurmas.length > 0 && (
              <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '22px 24px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Resumo por turma</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Média e aprovação de cada turma</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {turmaSummaries.map((t, i) => {
                    const isSelected = selectedTurma === t.name;
                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedTurma(isSelected ? '' : t.name)}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: isSelected ? t.bg : 'var(--bg-content)', borderRadius: 10, border: `1px solid ${isSelected ? t.color + '44' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.15s' }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.bg, border: `1px solid ${t.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: t.color, lineHeight: 1, textAlign: 'center' }}>{t.name}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{t.name}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.total} avaliações</p>
                          </div>
                          <div style={{ display: 'flex', gap: 10, marginTop: 3, alignItems: 'center' }}>
                            <div style={{ height: 4, flex: 1, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${t.aprovPct}%`, background: t.color, borderRadius: 99, transition: 'width 0.4s ease' }} />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: t.color, flexShrink: 0 }}>{t.aprovPct}%</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                          <span style={{ fontSize: 20, fontWeight: 900, color: t.color, lineHeight: 1 }}>{t.media.toFixed(1)}</span>
                          <MiniSparkline values={t.scores} color={t.color} width={52} height={22} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Avaliações recentes ── */}
          {recent.length > 0 && (
            <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>Avaliações recentes</h3>
                <button onClick={() => router.push('/avaliacoes')} style={{ fontSize: 13, fontWeight: 600, color: '#0081f0', background: 'none', border: 'none', cursor: 'pointer' }}>Ver todas →</button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Últimas {recent.length} avaliações realizadas</p>
              {recent.map((e, i) => {
                const col = scoreColor(e.score);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0033ad15, #810cfa15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#4f46e5', flexShrink: 0 }}>
                      {e.studentName.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.studentName}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.exerciseName || e.type}{e.turma ? ` · ${e.turma}` : ''}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(e.createdAt).toLocaleDateString('pt-BR')}</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: col, background: `${col}15`, padding: '3px 10px', borderRadius: 20, border: `1px solid ${col}33` }}>
                          {e.score.toFixed(1)}
                        </span>
                        <p style={{ fontSize: 10, color: col, fontWeight: 700, textAlign: 'center', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{scoreConcept(e.score)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </AppLayout>
  );
}
