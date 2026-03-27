'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/AppLayout';

// ── SVG helpers ──────────────────────────────────────────────────────────────
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function chartColor(v) { return v >= 9 ? '#16a34a' : v >= 7 ? '#22c55e' : v >= 6 ? '#d97706' : '#ef4444'; }

function barsSVG(items, width = 440) {
  if (!items?.length) return '';
  const lW = 155, vW = 38, bW = width - lW - vW;
  const bH = 20, gap = 10, pV = 6;
  const H = items.length * (bH + gap) + pV * 2;
  const rows = items.map((d, i) => {
    const y = pV + i * (bH + gap);
    const w = Math.max(4, Math.min((d.avg / 10) * bW, bW));
    const col = chartColor(d.avg);
    const lbl = esc(d.name.length > 21 ? d.name.substring(0, 21) + '…' : d.name);
    return `<text x="0" y="${y+14}" font-size="11" fill="#4b5563" font-family="Arial,sans-serif">${lbl}</text><rect x="${lW}" y="${y}" width="${bW}" height="${bH}" rx="3" fill="#f3f4f6"/><rect x="${lW}" y="${y}" width="${w}" height="${bH}" rx="3" fill="${col}" opacity="0.85"/><text x="${lW+w+5}" y="${y+14}" font-size="11" font-weight="700" fill="${col}" font-family="Arial,sans-serif">${d.avg.toFixed(1)}</text>`;
  }).join('');
  return `<svg width="${width}" height="${H}" xmlns="http://www.w3.org/2000/svg">${rows}</svg>`;
}

function histSVG(dist) {
  if (!dist?.length) return '';
  const max = Math.max(...dist.map(d => d.count), 1);
  const W=320, H=110, bW=50, bGap=16, pL=8, pB=26, maxH=H-pB-14;
  const colors = ['#ef4444','#f59e0b','#3b82f6','#22c55e'];
  const bars = dist.map((d, i) => {
    const x = pL + i*(bW+bGap);
    const h = Math.max(2, (d.count/max)*maxH);
    const y = H-pB-h;
    return `<rect x="${x}" y="${y}" width="${bW}" height="${h}" rx="3" fill="${colors[i]}" opacity="0.85"/><text x="${x+bW/2}" y="${y-4}" text-anchor="middle" font-size="12" font-weight="700" fill="${colors[i]}" font-family="Arial,sans-serif">${d.count}</text><text x="${x+bW/2}" y="${H-7}" text-anchor="middle" font-size="11" fill="#6b7280" font-family="Arial,sans-serif">${esc(d.label)}</text>`;
  }).join('');
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
}

function lineSVG(timeline) {
  if (!timeline?.length) return '';
  if (timeline.length < 2) return `<svg width="120" height="60" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="30" r="22" fill="${chartColor(timeline[0].score)}" opacity="0.12"/><text x="60" y="36" text-anchor="middle" font-size="20" font-weight="800" fill="${chartColor(timeline[0].score)}" font-family="Arial,sans-serif">${timeline[0].score.toFixed(1)}</text></svg>`;
  const W=440, H=110, pL=30, pR=14, pT=14, pB=26, cW=W-pL-pR, cH=H-pT-pB, n=timeline.length;
  const xs = timeline.map((_,i) => pL + (i/(n-1))*cW);
  const ys = timeline.map(d => pT + cH - Math.max(0,Math.min(d.score,10))/10*cH);
  const grid = [5,10].map(v => { const y=pT+cH-(v/10)*cH; return `<line x1="${pL}" y1="${y}" x2="${W-pR}" y2="${y}" stroke="#e5e7eb" stroke-dasharray="3,3"/><text x="${pL-4}" y="${y+4}" text-anchor="end" font-size="9" fill="#9ca3af" font-family="Arial,sans-serif">${v}</text>`; }).join('');
  const path = xs.map((x,i) => `${i===0?'M':'L'}${x},${ys[i]}`).join(' ');
  const pts = timeline.map((d,i) => `<circle cx="${xs[i]}" cy="${ys[i]}" r="4" fill="${chartColor(d.score)}" stroke="white" stroke-width="1.5"/><text x="${xs[i]}" y="${ys[i]-9}" text-anchor="middle" font-size="10" font-weight="700" fill="${chartColor(d.score)}" font-family="Arial,sans-serif">${d.score.toFixed(1)}</text><text x="${xs[i]}" y="${H-6}" text-anchor="middle" font-size="9" fill="#6b7280" font-family="Arial,sans-serif">${esc((d.exerciseName||'Ex').substring(0,10))}</text>`).join('');
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${grid}<path d="${path}" fill="none" stroke="#0081f0" stroke-width="2.5" stroke-linejoin="round"/>${pts}</svg>`;
}

// Generic line chart for PDF (takes [{label, y}])
function buildLineSVG(points, width = 440, height = 110) {
  if (!points?.length || points.length < 2) return '';
  const pL = 30, pR = 14, pT = 18, pB = 28, cW = width - pL - pR, cH = height - pT - pB, n = points.length;
  const xs = points.map((_, i) => pL + (i / (n - 1)) * cW);
  const ys = points.map(d => pT + cH - Math.max(0, Math.min(d.y, 10)) / 10 * cH);
  const grid = [5, 10].map(v => {
    const y = pT + cH - (v / 10) * cH;
    return `<line x1="${pL}" y1="${y}" x2="${width - pR}" y2="${y}" stroke="#e5e7eb" stroke-dasharray="3,3"/><text x="${pL - 4}" y="${y + 4}" text-anchor="end" font-size="9" fill="#9ca3af" font-family="Arial,sans-serif">${v}</text>`;
  }).join('');
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const pts = points.map((d, i) => {
    const col = chartColor(d.y);
    return `<circle cx="${xs[i].toFixed(1)}" cy="${ys[i].toFixed(1)}" r="5" fill="${col}" stroke="white" stroke-width="2"/><text x="${xs[i].toFixed(1)}" y="${(ys[i] - 9).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" fill="${col}" font-family="Arial,sans-serif">${d.y.toFixed(1)}</text><text x="${xs[i].toFixed(1)}" y="${(height - 6).toFixed(1)}" text-anchor="middle" font-size="9" fill="#6b7280" font-family="Arial,sans-serif">${esc((d.label || '').substring(0, 12))}</text>`;
  }).join('');
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${grid}<path d="${path}" fill="none" stroke="#0081f0" stroke-width="2.5" stroke-linejoin="round"/>${pts}</svg>`;
}

function statCardsPDF(s) {
  const pct = s.total > 0 ? Math.round((s.aprovados/s.total)*100) : 0;
  const cards = [{l:'Média da turma',v:s.media?.toFixed(1)||'—',c:chartColor(s.media||0)},{l:'Aprovação',v:`${pct}%`,c:'#16a34a'},{l:'Melhor nota',v:s.melhorNota?.toFixed(1)||'—',c:'#16a34a'},{l:'Pior nota',v:s.piorNota?.toFixed(1)||'—',c:chartColor(s.piorNota||0)}];
  return `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">${cards.map(c=>`<div style="padding:14px 8px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;text-align:center"><div style="font-size:22px;font-weight:800;color:${c.c};line-height:1.1">${c.v}</div><div style="font-size:11px;color:#6b7280;margin-top:4px">${c.l}</div></div>`).join('')}</div>`;
}

function EditableList({ label, color, borderColor, items, onChange }) {
  return (
    <div style={{ padding: '16px', border: `1px solid ${borderColor}`, borderRadius: 12, background: 'var(--bg-content)' }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color, marginBottom: 10 }}>{label}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              value={item}
              onChange={e => onChange(items.map((x, j) => j === i ? e.target.value : x))}
              style={{ flex: 1, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              style={{ padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 6, background: 'none', cursor: 'pointer', fontSize: 14, color: '#ef4444', lineHeight: 1, fontFamily: 'inherit', flexShrink: 0 }}
            >×</button>
          </div>
        ))}
        <button
          onClick={() => onChange([...items, ''])}
          style={{ alignSelf: 'flex-start', marginTop: 4, padding: '5px 12px', border: `1px dashed ${color}`, borderRadius: 7, background: 'none', cursor: 'pointer', fontSize: 12, color, fontFamily: 'inherit' }}
        >+ Adicionar</button>
      </div>
    </div>
  );
}

export default function RelatoriosPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Professor');
  const [userPlan, setUserPlan] = useState('gratuito');
  const [reports, setReports] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [turmaFilter, setTurmaFilter] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  function token() { return localStorage.getItem('token'); }

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.name) setUserName(u.name);
      if (u.plan) setUserPlan(u.plan);
    } catch {}
    fetch('/api/reports', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setReports(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
    fetch('/api/profiles', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(data => setProfiles(Array.isArray(data) ? data : [])).catch(() => {});
  }, [router]);

  const canUseReports = ['pro', 'premium'].includes(userPlan);

  const turmas = [...new Set(reports.map(r => r.turma).filter(Boolean))].sort();
  const institutions = [...new Set(reports.map(r => r.institution).filter(Boolean))].sort();

  const filtered = reports.filter(r => {
    if (typeFilter && r.type !== typeFilter) return false;
    if (turmaFilter && (r.turma || '') !== turmaFilter) return false;
    if (institutionFilter && (r.institution || '') !== institutionFilter) return false;
    return true;
  });

  function startEditing() {
    const c = detail.content;
    setDraft({
      resumo: c.resumo || '',
      pontosFortes: (c.pontosFortes || []).slice(),
      pontosAtencao: (c.pontosAtencao || []).slice(),
      pontosDesenvolver: (c.pontosDesenvolver || []).slice(),
      analiseDetalhada: c.analiseDetalhada || '',
      parecer: c.parecer || '',
      sugestoes: (c.sugestoes || []).map(s => ({ ...s })),
    });
    setEditing(true);
  }

  function cancelEditing() { setEditing(false); setDraft(null); }

  async function saveReport() {
    setSaving(true);
    try {
      const r = await fetch(`/api/reports/${detail.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: draft }),
      });
      if (r.ok) {
        const { content } = await r.json();
        const updated = { ...detail, content };
        setReports(prev => prev.map(x => x.id === detail.id ? updated : x));
        setDetail(updated);
        setEditing(false);
        setDraft(null);
      }
    } finally { setSaving(false); }
  }

  async function del(id) {
    if (!confirm('Excluir este relatório?')) return;
    await fetch(`/api/reports/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setReports(prev => prev.filter(r => r.id !== id));
    if (detail?.id === id) setDetail(null);
  }

  // ── PDF helpers ─────────────────────────────────────────────────────────────
  function getLogoMarkup(profileName, institution) {
    const profile = profiles.find(p => p.name === profileName) || {};
    const logo = profile.institutionLogo || '';
    if (logo) return `<img src="${logo}" style="max-height:52px;max-width:160px;object-fit:contain" />`;
    if (institution) return `<span style="font-size:18px;font-weight:800;color:#0f172a">${esc(institution)}</span>`;
    return '';
  }

  function pdfHeader(logoMarkup, date) {
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:20px;margin-bottom:28px;border-bottom:2px solid #e2e8f0">
      <div>${logoMarkup}</div>
      <div style="text-align:right">
        <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;font-weight:600;letter-spacing:0.1em;margin-bottom:3px">Data de Emissão</div>
        <div style="font-size:16px;font-weight:800;color:#0f172a">${date}</div>
      </div>
    </div>`;
  }

  function kpiCardsHtml(cards) {
    return `<div style="display:grid;grid-template-columns:repeat(${cards.length},1fr);gap:10px;margin-bottom:24px">
      ${cards.map(c => `<div style="padding:14px 10px;background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;text-align:center"><div style="font-size:20px;font-weight:800;color:${c.color};line-height:1.1">${c.value}</div><div style="font-size:10px;color:#6b7280;margin-top:4px">${c.label}</div></div>`).join('')}
    </div>`;
  }

  function openPDF(title, body) {
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${title}</title>
      <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111; padding: 40px 48px; max-width: 780px; margin: 0 auto; } @media print { body { padding: 24px; } @page { margin: 1.5cm; } }</style>
      </head><body>${body}</body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  }

  function generatePDFTurma(r) {
    const c = r.content;
    const s = c.stats || {};
    const date = new Date(r.createdAt).toLocaleDateString('pt-BR');
    const logoMarkup = getLogoMarkup(r.profileName, r.institution);
    const pct = s.total > 0 ? Math.round((s.aprovados / s.total) * 100) : 0;

    const kpis = kpiCardsHtml([
      { label: 'Média da Turma', value: s.media?.toFixed(1) || '—', color: chartColor(s.media || 0) },
      { label: 'Aprovação', value: `${pct}%`, color: '#16a34a' },
      { label: 'Total Alunos', value: String(s.total || 0), color: '#374151' },
      { label: 'Melhor Nota', value: s.melhorNota?.toFixed(1) || '—', color: '#16a34a' },
      { label: 'Pior Nota', value: s.piorNota?.toFixed(1) || '—', color: chartColor(s.piorNota || 0) },
    ]);

    const distSvg = histSVG(s.distribuicao);
    const critSvg = barsSVG(s.criteriaAverages || [], 260);

    const rankingRows = (s.alunos || []).map((a, i) => {
      const col = chartColor(a.score);
      const concept = a.score >= 9 ? 'Excelente' : a.score >= 7 ? 'Bom' : a.score >= 6 ? 'Regular' : 'Insuficiente';
      const tag = a.score < 6 ? ` <span style="font-size:10px;background:#fef2f2;color:#ef4444;padding:1px 6px;border-radius:4px;font-weight:700;border:1px solid #fecaca">Atenção</span>` : '';
      return `<tr style="border-bottom:1px solid #f3f4f6"><td style="padding:8px 12px;font-size:13px;color:#9ca3af;font-weight:600">${i+1}</td><td style="padding:8px 12px;font-size:13px;color:#111;font-weight:600">${esc(a.studentName)}${tag}</td><td style="padding:8px 12px;font-size:14px;font-weight:800;color:${col}">${a.score.toFixed(1)}</td><td style="padding:8px 12px;font-size:11px;color:${col};font-weight:700;text-transform:uppercase">${concept}</td></tr>`;
    }).join('');

    const suggestionsHtml = (c.sugestoes || []).map((sg, i) => `
      <div style="margin-bottom:12px;padding:14px 18px;background:#f9fafb;border-radius:10px;border-left:3px solid #0081f0">
        <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:3px">${i+1}. ${esc(sg.titulo)}</div>
        <div style="font-size:13px;color:#374151;margin-bottom:4px">${esc(sg.descricao)}</div>
        <div style="font-size:12px;color:#6b7280;font-style:italic">${esc(sg.impacto)}</div>
      </div>`).join('');

    const strongItems = (c.pontosFortes || []).map(p => `<li style="margin-bottom:4px;font-size:13px;color:#374151">${esc(p)}</li>`).join('');
    const weakItems = (c.pontosAtencao || []).map(p => `<li style="margin-bottom:4px;font-size:13px;color:#374151">${esc(p)}</li>`).join('');

    const body = `
      ${pdfHeader(logoMarkup, date)}
      <div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #f1f5f9">
        <h1 style="font-size:24px;font-weight:900;color:#0f172a;margin-bottom:8px">${esc(r.turma || 'Turma')}</h1>
        <div style="display:flex;flex-wrap:wrap;gap:12px 24px">
          ${c.disciplina ? `<div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Disciplina</div><div style="font-size:14px;font-weight:700;color:#0f172a">${esc(c.disciplina)}</div></div>` : ''}
          ${c.tipoTrabalho ? `<div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Tipo de Trabalho</div><div style="font-size:13px;color:#374151">${esc(c.tipoTrabalho)}</div></div>` : ''}
          ${r.exerciseName ? `<div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Atividade</div><div style="font-size:13px;color:#374151">${esc(r.exerciseName)}</div></div>` : ''}
          ${r.profileName ? `<div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Professor(a)</div><div style="font-size:13px;color:#374151">${esc(r.profileName)}</div></div>` : ''}
        </div>
      </div>
      ${kpis}
      ${(distSvg || critSvg) ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;align-items:start">
        ${distSvg ? `<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:8px">Distribuição de Notas</div>${distSvg}</div>` : ''}
        ${critSvg ? `<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:8px">Desempenho por Critério</div>${critSvg}</div>` : ''}
      </div>` : ''}
      ${s.alunos?.length > 0 ? `<div style="margin-bottom:24px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Ranking da Turma</div>
        <table style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb">
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700">#</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700">Aluno</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700">Nota</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700">Conceito</th>
        </tr></thead><tbody>${rankingRows}</tbody></table></div>` : ''}
      ${c.resumo ? `<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:8px">Análise Pedagógica</div><div style="font-size:14px;line-height:1.8;color:#374151">${esc(c.resumo)}</div></div>` : ''}
      ${(strongItems || weakItems) ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
        ${strongItems ? `<div><div style="font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Pontos Fortes</div><ul style="padding-left:18px">${strongItems}</ul></div>` : ''}
        ${weakItems ? `<div><div style="font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Pontos de Atenção</div><ul style="padding-left:18px">${weakItems}</ul></div>` : ''}
      </div>` : ''}
      ${c.analiseDetalhada ? `<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:8px">Análise Detalhada</div><div style="font-size:14px;line-height:1.8;color:#374151">${esc(c.analiseDetalhada)}</div></div>` : ''}
      ${c.sugestoes?.length ? `<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:12px">Sugestões Pedagógicas</div>${suggestionsHtml}</div>` : ''}`;

    openPDF(`Relatório da Turma — ${r.turma || 'Turma'}`, body);
  }

  function generatePDFTurmaEvo(r) {
    const c = r.content;
    const s = c.stats || {};
    const date = new Date(r.createdAt).toLocaleDateString('pt-BR');
    const logoMarkup = getLogoMarkup(r.profileName, r.institution);
    const atividades = s.atividades || [];
    const alunos = s.alunos || [];
    const delta = (s.mediaAtual || 0) - (s.mediaInicial || 0);
    const deltaSign = delta >= 0 ? '+' : '';
    const deltaColor = delta > 0 ? '#16a34a' : delta < 0 ? '#ef4444' : '#6b7280';
    const pct = s.total > 0 ? Math.round((s.aprovados / s.total) * 100) : 0;

    const timelinePills = atividades.map((a, i) =>
      `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:white;border:1px solid #e2e8f0;border-radius:10px">
        <span style="width:22px;height:22px;border-radius:50%;background:#0081f0;color:white;font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${i+1}</span>
        <div><div style="font-size:12px;font-weight:700;color:#0f172a">${esc(a.exerciseName)}</div><div style="font-size:11px;color:#6b7280">Média: ${a.media.toFixed(1)}</div></div>
      </div>`
    ).join('');

    const kpis = kpiCardsHtml([
      { label: 'Média Inicial', value: s.mediaInicial?.toFixed(1) || '—', color: chartColor(s.mediaInicial || 0) },
      { label: 'Média Atual', value: s.mediaAtual?.toFixed(1) || '—', color: chartColor(s.mediaAtual || 0) },
      { label: 'Evolução', value: `${deltaSign}${delta.toFixed(1)}`, color: deltaColor },
      { label: 'Aprovação', value: `${pct}%`, color: '#16a34a' },
      { label: 'Atividades', value: String(atividades.length), color: '#374151' },
    ]);

    const lineChartSvg = buildLineSVG(atividades.map(a => ({ label: a.exerciseName, y: a.media })));
    const critSvg = barsSVG(s.criteriaRecente || s.criteriaAverages || [], 440);

    const rankingRows = alunos.map((a, i) => {
      const evo = a.evolucao || 0;
      const evoSign = evo >= 0 ? '+' : '';
      const evoColor = evo > 0 ? '#16a34a' : evo < 0 ? '#ef4444' : '#6b7280';
      const lastScore = a.scoreUltimo;
      const col = chartColor(lastScore || 0);
      const tag = (lastScore !== null && lastScore < 6) ? ` <span style="font-size:10px;background:#fef2f2;color:#ef4444;padding:1px 6px;border-radius:4px;font-weight:700;border:1px solid #fecaca">Atenção</span>` : '';
      return `<tr style="border-bottom:1px solid #f3f4f6">
        <td style="padding:8px 12px;font-size:13px;color:#9ca3af;font-weight:600">${i+1}</td>
        <td style="padding:8px 12px;font-size:13px;color:#111;font-weight:600">${esc(a.studentName)}${tag}</td>
        <td style="padding:8px 12px;font-size:13px;color:#6b7280">${a.scorePrimeiro !== null ? a.scorePrimeiro.toFixed(1) : '—'}</td>
        <td style="padding:8px 12px;font-size:14px;font-weight:800;color:${col}">${lastScore !== null ? lastScore.toFixed(1) : '—'}</td>
        <td style="padding:8px 12px;font-size:12px;font-weight:700;color:${evoColor}">${evo !== 0 ? `${evoSign}${evo.toFixed(1)}` : '—'}</td>
      </tr>`;
    }).join('');

    const suggestionsHtml = (c.sugestoes || []).map((sg, i) => `
      <div style="margin-bottom:12px;padding:14px 18px;background:#f9fafb;border-radius:10px;border-left:3px solid #0081f0">
        <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:3px">${i+1}. ${esc(sg.titulo)}</div>
        <div style="font-size:13px;color:#374151;margin-bottom:4px">${esc(sg.descricao)}</div>
        <div style="font-size:12px;color:#6b7280;font-style:italic">${esc(sg.impacto)}</div>
      </div>`).join('');

    const strongItems = (c.pontosFortes || []).map(p => `<li style="margin-bottom:4px;font-size:13px;color:#374151">${esc(p)}</li>`).join('');
    const weakItems = (c.pontosAtencao || []).map(p => `<li style="margin-bottom:4px;font-size:13px;color:#374151">${esc(p)}</li>`).join('');

    const body = `
      ${pdfHeader(logoMarkup, date)}
      <div style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #f1f5f9">
        <h1 style="font-size:24px;font-weight:900;color:#0f172a;margin-bottom:6px">${esc(r.turma || 'Turma')} — Evolução</h1>
        <div style="display:flex;flex-wrap:wrap;gap:12px 24px;margin-top:6px">
          ${c.disciplina ? `<div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Disciplina</div><div style="font-size:14px;font-weight:700;color:#0f172a">${esc(c.disciplina)}</div></div>` : ''}
          ${r.profileName ? `<div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Professor(a)</div><div style="font-size:13px;color:#374151">${esc(r.profileName)}</div></div>` : ''}
        </div>
      </div>
      ${atividades.length > 0 ? `<div style="margin-bottom:20px;padding:14px 16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:12px">Atividades Avaliadas</div>
        <div style="display:grid;grid-template-columns:repeat(${Math.min(atividades.length, 3)},1fr);gap:10px">${timelinePills}</div>
      </div>` : ''}
      ${kpis}
      ${lineChartSvg ? `<div style="margin-bottom:24px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:8px">Evolução da Média da Turma</div>${lineChartSvg}</div>` : ''}
      ${critSvg ? `<div style="margin-bottom:24px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:8px">Desempenho por Critério (Última Atividade)</div>${critSvg}</div>` : ''}
      ${alunos.length > 0 ? `<div style="margin-bottom:24px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Ranking de Evolução</div>
        <table style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb">
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700">#</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700">Aluno</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700">1ª Nota</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700">Nota Atual</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700">Evolução</th>
        </tr></thead><tbody>${rankingRows}</tbody></table></div>` : ''}
      ${c.resumo ? `<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:8px">Análise Pedagógica</div><div style="font-size:14px;line-height:1.8;color:#374151">${esc(c.resumo)}</div></div>` : ''}
      ${(strongItems || weakItems) ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
        ${strongItems ? `<div><div style="font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Pontos Fortes</div><ul style="padding-left:18px">${strongItems}</ul></div>` : ''}
        ${weakItems ? `<div><div style="font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Pontos de Atenção</div><ul style="padding-left:18px">${weakItems}</ul></div>` : ''}
      </div>` : ''}
      ${c.analiseDetalhada ? `<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:8px">Análise Detalhada</div><div style="font-size:14px;line-height:1.8;color:#374151">${esc(c.analiseDetalhada)}</div></div>` : ''}
      ${c.sugestoes?.length ? `<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:12px">Sugestões Pedagógicas</div>${suggestionsHtml}</div>` : ''}`;

    openPDF(`Evolução da Turma — ${r.turma || 'Turma'}`, body);
  }

  function generatePDFAlunoEvo(r) {
    const c = r.content;
    const s = c.stats || {};
    const date = new Date(r.createdAt).toLocaleDateString('pt-BR');
    const logoMarkup = getLogoMarkup(r.profileName, r.institution);
    const atividades = s.atividades || s.timeline?.map(t => ({ exerciseName: t.exerciseName, score: t.score, date: t.date })) || [];
    const lastAtiv = atividades[atividades.length - 1];
    const firstAtiv = atividades[0];
    const lastScore = lastAtiv?.score ?? s.media ?? 0;
    const evolucao = atividades.length >= 2 ? parseFloat((lastScore - (firstAtiv?.score ?? lastScore)).toFixed(1)) : 0;
    const melhor = atividades.length > 0 ? Math.max(...atividades.map(a => a.score)) : lastScore;
    const pior = atividades.length > 0 ? Math.min(...atividades.map(a => a.score)) : lastScore;
    const lastScoreColor = chartColor(lastScore);
    const concept = lastScore >= 9 ? 'Excelente' : lastScore >= 7 ? 'Bom' : lastScore >= 6 ? 'Regular' : 'Insuficiente';
    const evoSign = evolucao >= 0 ? '+' : '';
    const evoColor = evolucao > 0 ? '#16a34a' : evolucao < 0 ? '#ef4444' : '#6b7280';

    const kpis = kpiCardsHtml([
      { label: 'Média Geral', value: s.media?.toFixed(1) || '—', color: chartColor(s.media || 0) },
      { label: 'Evolução', value: atividades.length >= 2 ? `${evoSign}${evolucao.toFixed(1)}` : '—', color: evoColor },
      { label: 'Nota Inicial', value: firstAtiv?.score?.toFixed(1) || '—', color: chartColor(firstAtiv?.score || 0) },
      { label: 'Melhor Nota', value: melhor.toFixed(1), color: '#16a34a' },
      { label: 'Pior Nota', value: pior.toFixed(1), color: chartColor(pior) },
    ]);

    const lineChartSvg = atividades.length >= 2
      ? buildLineSVG(atividades.map(a => ({ label: a.exerciseName, y: a.score })))
      : '';

    const criteriaData = s.criteriaRecente || s.criteriaAverages || [];
    const critSvg = criteriaData.length > 0 ? barsSVG(criteriaData, 260) : '';

    const ativRows = atividades.map((a, i) => {
      const delta = i > 0 ? parseFloat((a.score - atividades[i - 1].score).toFixed(1)) : null;
      const col = chartColor(a.score);
      const deltaHtml = delta !== null
        ? `<span style="font-size:11px;font-weight:700;color:${delta >= 0 ? '#16a34a' : '#ef4444'}">${delta >= 0 ? '+' : ''}${delta.toFixed(1)}</span>`
        : '—';
      return `<tr style="border-bottom:1px solid #f3f4f6">
        <td style="padding:8px 10px;font-size:13px;color:#374151">${esc(a.exerciseName)}</td>
        <td style="padding:8px 10px;font-size:12px;color:#9ca3af">${a.date ? new Date(a.date).toLocaleDateString('pt-BR') : '—'}</td>
        <td style="padding:8px 10px;font-size:14px;font-weight:800;color:${col}">${a.score.toFixed(1)}</td>
        <td style="padding:8px 10px">${deltaHtml}</td>
      </tr>`;
    }).join('');

    const strongItems = (c.pontosFortes || []).map(p => `<li style="margin-bottom:4px;font-size:13px;color:#374151">${esc(p)}</li>`).join('');
    const devItems = (c.pontosDesenvolver || []).map(p => `<li style="margin-bottom:4px;font-size:13px;color:#374151">${esc(p)}</li>`).join('');

    const body = `
      ${pdfHeader(logoMarkup, date)}
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid #f1f5f9">
        <div style="flex:1">
          <h1 style="font-size:26px;font-weight:900;color:#0f172a;margin-bottom:10px">${esc(r.subject)}</h1>
          <div style="display:flex;flex-wrap:wrap;gap:12px 24px">
            ${c.disciplina ? `<div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Disciplina</div><div style="font-size:14px;font-weight:700;color:#0f172a">${esc(c.disciplina)}</div></div>` : ''}
            ${c.tipoTrabalho ? `<div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Tipo de Trabalho</div><div style="font-size:13px;color:#374151">${esc(c.tipoTrabalho)}</div></div>` : ''}
            ${r.turma ? `<div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Turma</div><div style="font-size:13px;color:#374151">${esc(r.turma)}</div></div>` : ''}
            ${r.profileName ? `<div><div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Professor(a)</div><div style="font-size:13px;color:#374151">${esc(r.profileName)}</div></div>` : ''}
          </div>
        </div>
        <div style="text-align:center;flex-shrink:0;margin-left:24px">
          <div style="font-size:52px;font-weight:900;color:${lastScoreColor};line-height:1">${lastScore.toFixed(1)}</div>
          <div style="font-size:12px;font-weight:800;color:${lastScoreColor};text-transform:uppercase;letter-spacing:0.1em">${concept}</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:2px">Nota atual</div>
        </div>
      </div>
      ${kpis}
      ${lineChartSvg ? `<div style="margin-bottom:24px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:8px">Evolução das Notas</div>${lineChartSvg}</div>` : ''}
      <div style="display:grid;grid-template-columns:${critSvg && atividades.length > 0 ? '1fr 1fr' : '1fr'};gap:20px;margin-bottom:24px;align-items:start">
        ${critSvg ? `<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:8px">Desempenho por Critério</div>${critSvg}</div>` : ''}
        ${atividades.length > 0 ? `<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:8px">Notas por Atividade</div>
          <table style="width:100%;border-collapse:collapse"><thead><tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb">
            <th style="padding:8px 10px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700">Atividade</th>
            <th style="padding:8px 10px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700">Data</th>
            <th style="padding:8px 10px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700">Nota</th>
            <th style="padding:8px 10px;text-align:left;font-size:11px;color:#9ca3af;font-weight:700">Δ</th>
          </tr></thead><tbody>${ativRows}</tbody></table>
        </div>` : ''}
      </div>
      ${c.resumo ? `<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:8px">Análise do Desempenho</div><div style="font-size:14px;line-height:1.8;color:#374151">${esc(c.resumo)}</div></div>` : ''}
      ${(strongItems || devItems) ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
        ${strongItems ? `<div><div style="font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Pontos Fortes</div><ul style="padding-left:18px">${strongItems}</ul></div>` : ''}
        ${devItems ? `<div><div style="font-size:11px;font-weight:700;color:#d97706;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">A Desenvolver</div><ul style="padding-left:18px">${devItems}</ul></div>` : ''}
      </div>` : ''}
      ${c.parecer ? `<div style="padding:20px;background:#f9fafb;border-radius:10px;border-left:3px solid #810cfa"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Parecer Pedagógico Final</div><div style="font-size:14px;line-height:1.8;color:#374151;font-style:italic">"${esc(c.parecer)}"</div></div>` : ''}`;

    openPDF(`Evolução do Aluno — ${r.subject}`, body);
  }

  function generatePDF(r) {
    const template = r.content?.stats?.reportTemplate;
    if (template === 'turma-evolucao') return generatePDFTurmaEvo(r);
    if (template === 'aluno-evolucao') return generatePDFAlunoEvo(r);
    if (r.type === 'turma') return generatePDFTurma(r);
    // Legacy aluno reports (no reportTemplate)
    generatePDFAlunoEvo(r);
  }

  // ── Modal infographics ───────────────────────────────────────────────────────
  function renderInfographics(r) {
    const s = r.content?.stats;
    if (!s) return null;
    const template = s.reportTemplate || r.type;

    if (template === 'turma-evolucao') {
      const delta = (s.mediaAtual || 0) - (s.mediaInicial || 0);
      const deltaSign = delta >= 0 ? '+' : '';
      const deltaColor = delta > 0 ? '#16a34a' : delta < 0 ? '#ef4444' : '#6b7280';
      const pct = s.total > 0 ? Math.round((s.aprovados / s.total) * 100) : 0;
      return (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
            {[
              { l: 'Média Inicial', v: s.mediaInicial?.toFixed(1), c: chartColor(s.mediaInicial || 0) },
              { l: 'Média Atual', v: s.mediaAtual?.toFixed(1), c: chartColor(s.mediaAtual || 0) },
              { l: 'Evolução', v: `${deltaSign}${delta.toFixed(1)}`, c: deltaColor },
              { l: 'Aprovação', v: `${pct}%`, c: '#16a34a' },
              { l: 'Atividades', v: String(s.atividades?.length || 0), c: '#374151' },
            ].map(card => (
              <div key={card.l} style={{ padding: '10px 6px', background: 'var(--bg-content)', borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: card.c }}>{card.v || '—'}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{card.l}</div>
              </div>
            ))}
          </div>
          {s.atividades?.length >= 2 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Evolução da média</p>
              <div dangerouslySetInnerHTML={{ __html: lineSVG(s.atividades.map(a => ({ exerciseName: a.exerciseName, score: a.media }))) }} />
            </div>
          )}
          {(s.criteriaRecente || s.criteriaAverages)?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Critérios (última atividade)</p>
              <div dangerouslySetInnerHTML={{ __html: barsSVG(s.criteriaRecente || s.criteriaAverages, 420) }} />
            </div>
          )}
          {s.alunos?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Ranking</p>
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead><tr style={{ background: 'var(--bg-content)', borderBottom: '1px solid var(--border)' }}>
                    {['#', 'Aluno', '1ª Nota', 'Atual', 'Evo.'].map(h => <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700 }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {s.alunos.map((a, i) => {
                      const evo = a.evolucao || 0;
                      const col = chartColor(a.scoreUltimo || 0);
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '7px 10px', color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td style={{ padding: '7px 10px', fontWeight: 600, color: 'var(--text-main)' }}>{a.studentName}</td>
                          <td style={{ padding: '7px 10px', color: 'var(--text-sub)' }}>{a.scorePrimeiro !== null ? a.scorePrimeiro.toFixed(1) : '—'}</td>
                          <td style={{ padding: '7px 10px', fontWeight: 800, color: col }}>{a.scoreUltimo !== null ? a.scoreUltimo.toFixed(1) : '—'}</td>
                          <td style={{ padding: '7px 10px', fontWeight: 700, color: evo > 0 ? '#16a34a' : evo < 0 ? '#ef4444' : 'var(--text-muted)' }}>{evo !== 0 ? `${evo >= 0 ? '+' : ''}${evo.toFixed(1)}` : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      );
    }

    if (template === 'aluno-evolucao' || r.type === 'aluno') {
      const atividades = s.atividades || s.timeline || [];
      const svg = lineSVG(s.timeline || atividades.map(a => ({ exerciseName: a.exerciseName, score: a.score, date: a.date })));
      const criteriaData = s.criteriaRecente || s.criteriaAverages || [];
      return (
        <>
          {svg && <div><p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Evolução das notas</p><div dangerouslySetInnerHTML={{ __html: svg }} /></div>}
          {criteriaData.length > 0 && <div><p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Desempenho por critério</p><div dangerouslySetInnerHTML={{ __html: barsSVG(criteriaData) }} /></div>}
        </>
      );
    }

    // turma template (single activity)
    const pct = s.total > 0 ? Math.round((s.aprovados / s.total) * 100) : 0;
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[
            { l: 'Média', v: s.media?.toFixed(1), c: chartColor(s.media || 0) },
            { l: 'Aprovação', v: `${pct}%`, c: '#16a34a' },
            { l: 'Melhor nota', v: s.melhorNota?.toFixed(1), c: '#16a34a' },
            { l: 'Pior nota', v: s.piorNota?.toFixed(1), c: chartColor(s.piorNota || 0) },
          ].map(card => (
            <div key={card.l} style={{ padding: '12px 8px', background: 'var(--bg-content)', borderRadius: 10, border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: card.c }}>{card.v || '—'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{card.l}</div>
            </div>
          ))}
        </div>
        {(s.distribuicao || s.criteriaAverages?.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {s.distribuicao && <div><p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Distribuição de notas</p><div dangerouslySetInnerHTML={{ __html: histSVG(s.distribuicao) }} /></div>}
            {s.criteriaAverages?.length > 0 && <div><p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Média por critério</p><div dangerouslySetInnerHTML={{ __html: barsSVG(s.criteriaAverages, 270) }} /></div>}
          </div>
        )}
        {s.alunos?.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Ranking da turma</p>
            <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 10 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead><tr style={{ background: 'var(--bg-content)', borderBottom: '1px solid var(--border)' }}>
                  {['#', 'Aluno', 'Nota', 'Conceito'].map(h => <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 700 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {s.alunos.map((a, i) => {
                    const col = chartColor(a.score);
                    const concept = a.score >= 9 ? 'Excelente' : a.score >= 7 ? 'Bom' : a.score >= 6 ? 'Regular' : 'Insuficiente';
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '7px 10px', color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td style={{ padding: '7px 10px', fontWeight: 600, color: 'var(--text-main)' }}>{a.studentName}{a.score < 6 && <span style={{ marginLeft: 6, fontSize: 10, background: '#fef2f2', color: '#ef4444', padding: '1px 6px', borderRadius: 4, fontWeight: 700, border: '1px solid #fecaca' }}>Atenção</span>}</td>
                        <td style={{ padding: '7px 10px', fontWeight: 800, color: col }}>{a.score.toFixed(1)}</td>
                        <td style={{ padding: '7px 10px', fontSize: 11, fontWeight: 700, color: col, textTransform: 'uppercase' }}>{concept}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    );
  }

  const inpStyle = {
    padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 9,
    fontSize: 13, outline: 'none', background: 'var(--bg-card)',
    color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  const hasFilters = typeFilter || turmaFilter || institutionFilter;

  // ── Template label for badges ─────────────────────────────────────────────
  function typeLabel(r) {
    const t = r.content?.stats?.reportTemplate;
    if (t === 'turma-evolucao') return 'Turma · Evolução';
    if (t === 'aluno-evolucao') return 'Aluno · Evolução';
    return r.type === 'turma' ? 'Turma' : 'Aluno';
  }

  function reportRoute(r) {
    const t = r.content?.stats?.reportTemplate;
    if (r.type === 'aluno') return `/relatorio-aluno-evolucao?id=${r.id}`;
    if (t === 'turma-evolucao') return `/relatorio-turma-evolucao?id=${r.id}`;
    return `/relatorio-turma?id=${r.id}`;
  }

  return (
    <AppLayout userName={userName}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>IA Pedagógica</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Gerenciar Relatórios</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Acesse os relatórios pedagógicos gerados por IA.</p>
        </div>
      </div>

      {/* Upsell */}
      {!canUseReports && (
        <div style={{ textAlign: 'center', padding: '80px 32px', border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg-card)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>Relatórios disponíveis nos planos Pro e Premium</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 460, margin: '0 auto 24px' }}>
            Gere pareceres pedagógicos individuais por aluno e análises completas de turma com inteligência artificial.
          </p>
          <button
            onClick={() => router.push('/conta')}
            style={{ padding: '11px 28px', background: 'linear-gradient(135deg, #0081f0, #810cfa)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Ver planos e fazer upgrade
          </button>
        </div>
      )}

      {canUseReports && (
        <>
          {/* Filtros */}
          {reports.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
              <select style={{ ...inpStyle, width: 160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">Todos os tipos</option>
                <option value="aluno">Aluno</option>
                <option value="turma">Turma</option>
              </select>
              {turmas.length > 0 && (
                <select style={{ ...inpStyle, width: 180 }} value={turmaFilter} onChange={e => setTurmaFilter(e.target.value)}>
                  <option value="">Todas as turmas</option>
                  {turmas.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
              {institutions.length > 0 && (
                <select style={{ ...inpStyle, width: 200 }} value={institutionFilter} onChange={e => setInstitutionFilter(e.target.value)}>
                  <option value="">Todas as instituições</option>
                  {institutions.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              )}
              {hasFilters && (
                <button
                  onClick={() => { setTypeFilter(''); setTurmaFilter(''); setInstitutionFilter(''); }}
                  style={{ padding: '9px 14px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 13, background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  × Limpar
                </button>
              )}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>Carregando relatórios...</div>
          )}

          {!loading && reports.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 32px', border: '1px solid var(--border)', borderRadius: 16, background: 'var(--bg-card)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>Nenhum relatório ainda</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 380, margin: '0 auto 24px' }}>
                Gere um relatório de aluno ou de turma na página de avaliações para vê-lo aqui.
              </p>
              <button
                onClick={() => router.push('/avaliacoes')}
                style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Ir para Avaliações
              </button>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-card)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-content)' }}>
                    {['Tipo', 'Aluno / Turma', 'Professor · Instituição', 'Disciplina · Atividade', 'Data', ''].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background .12s' }}
                      onClick={() => setDetail(r)}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                          background: r.type === 'turma' ? '#ede9fe' : '#e0f2fe',
                          color: r.type === 'turma' ? '#7c3aed' : '#0369a1',
                          textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                        }}>
                          {typeLabel(r)}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', fontWeight: 600, color: 'var(--text-main)', fontSize: 14 }}>
                        {r.type === 'aluno' ? r.subject : (r.turma || '—')}
                        {r.type === 'aluno' && r.turma && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>{r.turma}</span>
                        )}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13 }}>
                        {r.profileName && <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>{r.profileName}</div>}
                        {r.institution && <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 1 }}>{r.institution}</div>}
                        {!r.profileName && !r.institution && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13 }}>
                        {r.content?.disciplina && <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{r.content.disciplina}</div>}
                        {r.exerciseName && <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: r.content?.disciplina ? 2 : 0 }}>{r.exerciseName}</div>}
                        {!r.content?.disciplina && !r.exerciseName && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px', color: 'var(--text-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>
                        {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '13px 16px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => window.open(reportRoute(r), '_blank')}
                            title="Ver relatório"
                            style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'none', cursor: 'pointer', fontSize: 12, color: '#0081f0', fontFamily: 'inherit' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => window.open(reportRoute(r) + '&print=1', '_blank')}
                            title="Exportar PDF"
                            style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-sub)', fontFamily: 'inherit' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => {
                              const c = r.content;
                              setDetail(r);
                              setDraft({
                                resumo: c.resumo || '',
                                pontosFortes: (c.pontosFortes || []).slice(),
                                pontosAtencao: (c.pontosAtencao || []).slice(),
                                pontosDesenvolver: (c.pontosDesenvolver || []).slice(),
                                analiseDetalhada: c.analiseDetalhada || '',
                                parecer: c.parecer || '',
                                sugestoes: (c.sugestoes || []).map(s => ({ ...s })),
                              });
                              setEditing(true);
                            }}
                            title="Editar relatório"
                            style={{ padding: '5px 10px', border: '1px solid #0081f0', borderRadius: 7, background: 'none', cursor: 'pointer', fontSize: 12, color: '#0081f0', fontFamily: 'inherit' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => del(r.id)}
                            title="Excluir"
                            style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, background: 'none', cursor: 'pointer', fontSize: 12, color: '#ef4444', fontFamily: 'inherit' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && reports.length > 0 && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 14 }}>
              Nenhum relatório corresponde aos filtros aplicados.
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {detail && (
        <div
          onClick={() => { if (!editing) { setDetail(null); setDraft(null); } }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border-card)', maxWidth: 700, width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 6, marginRight: 10,
                  background: detail.type === 'turma' ? '#ede9fe' : '#e0f2fe',
                  color: detail.type === 'turma' ? '#7c3aed' : '#0369a1',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  {typeLabel(detail)}
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                  {detail.type === 'aluno' ? detail.subject : (detail.turma || 'Turma')}
                </span>
                {detail.content?.disciplina && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', marginLeft: 8, background: '#f5f3ff', padding: '2px 8px', borderRadius: 6 }}>{detail.content.disciplina}</span>
                )}
                {detail.exerciseName && (
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 6 }}>· {detail.exerciseName}</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {!editing && (
                  <>
                    <button
                      onClick={() => generatePDF(detail)}
                      style={{ padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', fontFamily: 'inherit' }}
                    >
                      Exportar PDF
                    </button>
                    <button
                      onClick={startEditing}
                      style={{ padding: '7px 14px', border: '1px solid #0081f0', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#0081f0', fontFamily: 'inherit' }}
                    >
                      Editar
                    </button>
                  </>
                )}
                {editing && (
                  <button
                    onClick={saveReport}
                    disabled={saving}
                    style={{ padding: '7px 16px', border: 'none', borderRadius: 8, background: '#0081f0', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? 'Salvando…' : 'Salvar'}
                  </button>
                )}
                <button
                  onClick={() => { if (!editing) { setDetail(null); setDraft(null); } else cancelEditing(); }}
                  style={{ padding: '7px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)', lineHeight: 1, fontFamily: 'inherit' }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                {detail.profileName && <span><strong style={{ color: 'var(--text-sub)' }}>Professor(a):</strong> {detail.profileName}</span>}
                {detail.institution && <span><strong style={{ color: 'var(--text-sub)' }}>Instituição:</strong> {detail.institution}</span>}
                <span>Gerado em {new Date(detail.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>

              {/* Infographics */}
              {renderInfographics(detail)}

              {editing && draft ? (
                <>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Resumo</p>
                    <textarea
                      value={draft.resumo}
                      onChange={e => setDraft(d => ({ ...d, resumo: e.target.value }))}
                      rows={3}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 14, lineHeight: 1.7, resize: 'vertical', background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>
                  <EditableList
                    label="Pontos Fortes" color="#16a34a" borderColor="#bbf7d0"
                    items={draft.pontosFortes}
                    onChange={v => setDraft(d => ({ ...d, pontosFortes: v }))}
                  />
                  {detail.type === 'turma' ? (
                    <EditableList
                      label="Pontos de Atenção" color="#dc2626" borderColor="#fecaca"
                      items={draft.pontosAtencao}
                      onChange={v => setDraft(d => ({ ...d, pontosAtencao: v }))}
                    />
                  ) : (
                    <EditableList
                      label="A Desenvolver" color="#dc2626" borderColor="#fecaca"
                      items={draft.pontosDesenvolver}
                      onChange={v => setDraft(d => ({ ...d, pontosDesenvolver: v }))}
                    />
                  )}
                  {detail.type === 'turma' && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Análise Detalhada</p>
                      <textarea
                        value={draft.analiseDetalhada}
                        onChange={e => setDraft(d => ({ ...d, analiseDetalhada: e.target.value }))}
                        rows={5}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 14, lineHeight: 1.7, resize: 'vertical', background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}
                  {detail.type === 'aluno' && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Parecer Final</p>
                      <textarea
                        value={draft.parecer}
                        onChange={e => setDraft(d => ({ ...d, parecer: e.target.value }))}
                        rows={6}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #bfdbfe', borderRadius: 9, borderLeft: '3px solid #0081f0', fontSize: 14, lineHeight: 1.7, resize: 'vertical', background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}
                  {detail.type === 'turma' && draft.sugestoes?.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 12 }}>Sugestões Pedagógicas</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {draft.sugestoes.map((s, i) => (
                          <div key={i} style={{ padding: '14px 18px', background: 'var(--bg-content)', borderRadius: 10, borderLeft: '3px solid #0081f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <input
                              value={s.titulo}
                              onChange={e => setDraft(d => { const sug = d.sugestoes.map((x,j) => j===i ? {...x,titulo:e.target.value} : x); return {...d,sugestoes:sug}; })}
                              placeholder="Título"
                              style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
                            />
                            <textarea
                              value={s.descricao}
                              onChange={e => setDraft(d => { const sug = d.sugestoes.map((x,j) => j===i ? {...x,descricao:e.target.value} : x); return {...d,sugestoes:sug}; })}
                              rows={2}
                              placeholder="Descrição"
                              style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 13, resize: 'vertical', background: 'var(--bg-card)', color: 'var(--text-main)', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
                            />
                            <input
                              value={s.impacto}
                              onChange={e => setDraft(d => { const sug = d.sugestoes.map((x,j) => j===i ? {...x,impacto:e.target.value} : x); return {...d,sugestoes:sug}; })}
                              placeholder="Impacto esperado"
                              style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontStyle: 'italic', background: 'var(--bg-card)', color: 'var(--text-muted)', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {detail.content.resumo && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Resumo</p>
                      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>{detail.content.resumo}</p>
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {detail.content.pontosFortes?.length > 0 && (
                      <div style={{ padding: '16px', border: '1px solid #bbf7d0', borderRadius: 12, background: 'var(--bg-content)' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#16a34a', marginBottom: 10 }}>Pontos Fortes</p>
                        <ul style={{ paddingLeft: 18 }}>
                          {detail.content.pontosFortes.map((p, i) => (
                            <li key={i} style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 5, lineHeight: 1.5 }}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(detail.content.pontosDesenvolver || detail.content.pontosAtencao)?.length > 0 && (
                      <div style={{ padding: '16px', border: '1px solid #fecaca', borderRadius: 12, background: 'var(--bg-content)' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#dc2626', marginBottom: 10 }}>
                          {detail.type === 'turma' ? 'Pontos de Atenção' : 'A Desenvolver'}
                        </p>
                        <ul style={{ paddingLeft: 18 }}>
                          {(detail.content.pontosDesenvolver || detail.content.pontosAtencao).map((p, i) => (
                            <li key={i} style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 5, lineHeight: 1.5 }}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {detail.content.analiseDetalhada && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Análise Detalhada</p>
                      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>{detail.content.analiseDetalhada}</p>
                    </div>
                  )}
                  {detail.content.parecer && (
                    <div style={{ padding: '16px 20px', background: 'var(--bg-content)', borderRadius: 12, borderLeft: '3px solid #0081f0' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 8 }}>Parecer Final</p>
                      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>{detail.content.parecer}</p>
                    </div>
                  )}
                  {detail.content.sugestoes?.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-sub)', marginBottom: 12 }}>Sugestões Pedagógicas</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {detail.content.sugestoes.map((s, i) => (
                          <div key={i} style={{ padding: '14px 18px', background: 'var(--bg-content)', borderRadius: 10, borderLeft: '3px solid #0081f0' }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>{i+1}. {s.titulo}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 4 }}>{s.descricao}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{s.impacto}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
