'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TYPES, scoreToGrade, scoreColor } from '@/lib/types';
import AppLayout from '../components/AppLayout';
import Tooltip from '../components/Tooltip';

// ── Chart helpers ─────────────────────────────────────────────────────────────
function _esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function _cc(v) { return v >= 7 ? '#16a34a' : v >= 5 ? '#d97706' : '#ef4444'; }
function _barsSVG(items, width = 420) {
  if (!items?.length) return '';
  const lW=150,vW=36,bW=width-lW-vW,bH=20,gap=10,pV=6;
  const H=items.length*(bH+gap)+pV*2;
  return `<svg width="${width}" height="${H}" xmlns="http://www.w3.org/2000/svg">${items.map((d,i)=>{const y=pV+i*(bH+gap);const w=Math.max(4,Math.min((d.avg/10)*bW,bW));const col=_cc(d.avg);const lbl=_esc(d.name.length>20?d.name.substring(0,20)+'…':d.name);return `<text x="0" y="${y+14}" font-size="11" fill="#4b5563" font-family="Arial,sans-serif">${lbl}</text><rect x="${lW}" y="${y}" width="${bW}" height="${bH}" rx="3" fill="#f3f4f6"/><rect x="${lW}" y="${y}" width="${w}" height="${bH}" rx="3" fill="${col}" opacity="0.85"/><text x="${lW+w+5}" y="${y+14}" font-size="11" font-weight="700" fill="${col}" font-family="Arial,sans-serif">${d.avg.toFixed(1)}</text>`;}).join('')}</svg>`;
}
function _histSVG(dist) {
  if (!dist?.length) return '';
  const max=Math.max(...dist.map(d=>d.count),1);
  const W=300,H=110,bW=50,bGap=14,pL=8,pB=26,maxH=H-pB-14;
  const colors=['#ef4444','#f59e0b','#3b82f6','#22c55e'];
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${dist.map((d,i)=>{const x=pL+i*(bW+bGap);const h=Math.max(2,(d.count/max)*maxH);const y=H-pB-h;return `<rect x="${x}" y="${y}" width="${bW}" height="${h}" rx="3" fill="${colors[i]}" opacity="0.85"/><text x="${x+bW/2}" y="${y-4}" text-anchor="middle" font-size="12" font-weight="700" fill="${colors[i]}" font-family="Arial,sans-serif">${d.count}</text><text x="${x+bW/2}" y="${H-7}" text-anchor="middle" font-size="11" fill="#6b7280" font-family="Arial,sans-serif">${_esc(d.label)}</text>`;}).join('')}</svg>`;
}

export default function AvaliacoesPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Professor');
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [turmaFilter, setTurmaFilter] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [scoreMin, setScoreMin] = useState('');
  const [scoreMax, setScoreMax] = useState('');
  const [detail, setDetail] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [classReport, setClassReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [studentReport, setStudentReport] = useState(null);
  const [studentReportLoading, setStudentReportLoading] = useState(false);
  const [studentReportError, setStudentReportError] = useState('');
  const [reportMenuOpen, setReportMenuOpen] = useState(false);
  const reportMenuRef = useRef(null);
  const [detailDraft, setDetailDraft] = useState(null);
  const [selected, setSelected] = useState(new Set());

  function token() { return localStorage.getItem('token'); }

  useEffect(() => {
    function handleClickOutside(e) {
      if (reportMenuRef.current && !reportMenuRef.current.contains(e.target)) setReportMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token()) { router.push('/login'); return; }
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); if (u.name) setUserName(u.name); } catch {}
    fetch('/api/evaluations', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { setEvaluations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
    fetch('/api/profiles', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(data => setProfiles(Array.isArray(data) ? data : [])).catch(() => {});
  }, [router]);

  const filtered = evaluations.filter(e => {
    if (search && !e.studentName.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && e.type !== typeFilter) return false;
    if (turmaFilter && (e.turma || '').toLowerCase() !== turmaFilter.toLowerCase()) return false;
    if (exerciseFilter && (e.exerciseName || '') !== exerciseFilter) return false;
    if (institutionFilter && (e.institution || '') !== institutionFilter) return false;
    if (scoreMin !== '' && e.score < Number(scoreMin)) return false;
    if (scoreMax !== '' && e.score > Number(scoreMax)) return false;
    return true;
  });

  const turmas = [...new Set(evaluations.map(e => e.turma).filter(Boolean))].sort();
  const exercises = [...new Set(evaluations.map(e => e.exerciseName).filter(Boolean))].sort();
  const institutions = [...new Set(evaluations.map(e => e.institution).filter(Boolean))].sort();

  const selectedEvals = evaluations.filter(e => selected.has(e.id));
  const selectedStudents = [...new Set(selectedEvals.map(e => e.studentName))];
  const canStudentReport = selectedStudents.length === 1 && selectedEvals.length >= 2;
  const canClassReport = selectedStudents.length >= 2;
  const allFilteredSelected = filtered.length > 0 && filtered.every(e => selected.has(e.id));

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelected(prev => {
        const next = new Set(prev);
        filtered.forEach(e => next.delete(e.id));
        return next;
      });
    } else {
      setSelected(prev => {
        const next = new Set(prev);
        filtered.forEach(e => next.add(e.id));
        return next;
      });
    }
  }

  function clearFilters() { setSearch(''); setTypeFilter(''); setTurmaFilter(''); setExerciseFilter(''); setInstitutionFilter(''); setScoreMin(''); setScoreMax(''); }

  async function saveEdit() {
    if (!detailDraft) return;
    const r = await fetch(`/api/evaluations/${detail.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName: detailDraft.studentName, score: detailDraft.score, feedback: detailDraft.feedback, criteria: detailDraft.criteria }),
    });
    if (r.ok) {
      setEvaluations(prev => prev.map(e => e.id === detail.id ? { ...e, ...detailDraft } : e));
      setDetail(detailDraft);
      setDetailDraft(null);
    }
  }

  async function del(id) {
    if (!confirm('Excluir esta avaliação?')) return;
    await fetch(`/api/evaluations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setEvaluations(prev => prev.filter(e => e.id !== id));
  }

  async function clearAll() {
    if (!confirm('Excluir TODAS as avaliações? Esta ação não pode ser desfeita.')) return;
    await Promise.all(evaluations.map(e => fetch(`/api/evaluations/${e.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })));
    setEvaluations([]);
  }

  function exportCSV() {
    const rows = [['Aluno', 'Tipo', 'Exercício', 'Turma', 'Instituição', 'Nota', 'Conceito', 'Professor', 'Data']];
    filtered.forEach(e => rows.push([e.studentName, TYPES[e.type]?.label || e.type, e.exerciseName || '', e.turma || '', e.institution || '', e.score.toFixed(1), scoreToGrade(e.score), e.profileName || '', new Date(e.createdAt).toLocaleDateString('pt-BR')]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `avaliacoes-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  const scores = evaluations.map(e => e.score);
  const avg = scores.length ? (scores.reduce((a,b) => a+b,0)/scores.length).toFixed(1) : '—';
  const passing = scores.filter(s => s >= 5).length;
  const best = scores.length ? Math.max(...scores).toFixed(1) : '—';

  function generatePDF(e) {
    const profile = profiles.find(p => p.name === e.profileName);
    const logo = profile?.institutionLogo || '';
    const grade = scoreToGrade(e.score);
    const scoreNum = typeof e.score === 'number' ? e.score.toFixed(1) : e.score;
    const scoreHex = e.score >= 7 ? '#16a34a' : e.score >= 5 ? '#ca8a04' : '#dc2626';
    const scoreBg = e.score >= 7 ? '#dcfce7' : e.score >= 5 ? '#fef9c3' : '#fee2e2';
    const disciplina = e.disciplina || '';
    const tipoTrabalho = TYPES[e.type]?.label || e.type || '';

    const metaItems = [
      disciplina && `<div style="display:inline-block;background:#f5f3ff;color:#7c3aed;font-size:11px;font-weight:700;padding:3px 10px;border-radius:6px;margin-right:6px">${disciplina}</div>`,
      tipoTrabalho && `<span style="font-size:13px;color:#374151;font-weight:600">${tipoTrabalho}</span>`,
      e.exerciseName && `<span style="font-size:13px;color:#6b7280"> · ${e.exerciseName}</span>`,
    ].filter(Boolean).join('');

    const criteriaRows = (e.criteria || []).map(c => {
      const pct = Math.round((c.score || 0) * 10);
      const color = c.score >= 7 ? '#16a34a' : c.score >= 5 ? '#ca8a04' : '#dc2626';
      const bg = c.score >= 7 ? '#dcfce7' : c.score >= 5 ? '#fef9c3' : '#fee2e2';
      return `<tr>
        <td style="padding:10px 0;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;width:55%">${c.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;width:35%">
          <div style="background:#e5e7eb;border-radius:99px;height:6px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:${color};border-radius:99px"></div>
          </div>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;width:10%">
          <span style="background:${bg};color:${color};font-size:12px;font-weight:700;padding:2px 8px;border-radius:6px">${c.score?.toFixed(1) ?? '—'}</span>
        </td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
    <title>Avaliação — ${e.studentName}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111; padding: 48px; max-width: 740px; margin: 0 auto; }
      @media print { body { padding: 24px; } @page { margin: 1.5cm; } }
    </style></head><body>
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #e5e7eb">
        <div style="flex:1">
          ${logo ? `<img src="${logo}" style="max-height:44px;max-width:160px;object-fit:contain;margin-bottom:10px;display:block" />` : ''}
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#7c3aed;font-weight:700;margin-bottom:6px">Avaliação Individual</div>
          <div style="font-size:26px;font-weight:800;color:#111;margin-bottom:6px">${e.studentName}</div>
          <div style="margin-bottom:4px">${metaItems}</div>
          <div style="font-size:12px;color:#9ca3af;margin-top:6px">
            ${e.turma ? `Turma ${e.turma}` : ''}${e.turma && e.profileName ? ' · ' : ''}${e.profileName ? `Prof. ${e.profileName}` : ''}${(e.turma || e.profileName) && e.institution ? ' · ' : ''}${e.institution || ''}
          </div>
          <div style="font-size:12px;color:#9ca3af;margin-top:2px">${new Date(e.createdAt).toLocaleDateString('pt-BR')}</div>
        </div>
        <div style="text-align:center;flex-shrink:0;margin-left:32px;background:${scoreBg};border-radius:16px;padding:16px 24px">
          <div style="font-size:52px;font-weight:800;color:${scoreHex};line-height:1">${scoreNum}</div>
          <div style="font-size:11px;color:${scoreHex};margin-top:2px">/ 10</div>
          <div style="font-size:18px;font-weight:800;color:${scoreHex};margin-top:6px">${grade}</div>
        </div>
      </div>
      <!-- Critérios -->
      ${criteriaRows ? `
      <div style="margin-bottom:28px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;margin-bottom:12px">Critérios de Avaliação</div>
        <table style="width:100%;border-collapse:collapse">${criteriaRows}</table>
      </div>` : ''}
      <!-- Feedback -->
      ${e.feedback ? `
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;margin-bottom:12px">Feedback</div>
        <div style="background:#f9fafb;border-radius:12px;padding:20px 24px;font-size:14px;line-height:1.85;color:#374151;white-space:pre-wrap;border-left:3px solid #7c3aed">${e.feedback}</div>
      </div>` : ''}
      <!-- Footer -->
      <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center">
        Gerado pela AvaliA · avalia.education
      </div>
    </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  }

  async function generateClassReport() {
    setReportLoading(true);
    setReportError('');
    setClassReport(null);
    const turmaCtx = selectedEvals.length === new Set(selectedEvals.map(e => e.turma)).size ? '' : (selectedEvals[0]?.turma || '');
    try {
      const r = await fetch('/api/analyze-class', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluations: selectedEvals, turma: turmaCtx, exerciseName: '' }),
      });
      const data = await r.json();
      if (!r.ok) { setReportError(data.error || 'Erro ao gerar relatório.'); return; }
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (typeof u.quota_relatorios_ciclo === 'number' && u.quota_relatorios_ciclo > 0) {
          u.quota_relatorios_ciclo -= 1;
        } else if (typeof u.quota_relatorios_extra === 'number' && u.quota_relatorios_extra > 0) {
          u.quota_relatorios_extra -= 1;
        }
        localStorage.setItem('user', JSON.stringify(u));
        window.dispatchEvent(new Event('storage'));
      } catch {}
      router.push('/relatorios');
    } catch { setReportError('Erro de conexão. Tente novamente.'); }
    finally { setReportLoading(false); }
  }

  function generateClassPDF(report) {
    const evalsForPDF = selectedEvals.length > 0 ? selectedEvals : filtered;
    const avgScore = evalsForPDF.length ? (evalsForPDF.reduce((s,e)=>s+e.score,0)/evalsForPDF.length).toFixed(1) : '—';
    const passing = evalsForPDF.filter(e=>e.score>=5).length;
    const turmas_ = [...new Set(evalsForPDF.map(e => e.turma).filter(Boolean))];
    const turmaTitle = turmas_.length === 1 ? turmas_[0] : (turmaFilter || 'Turma');
    const exerciseTitle = exerciseFilter ? ` · ${exerciseFilter}` : '';
    const date = new Date().toLocaleDateString('pt-BR');

    // Build chart data from evaluations
    const dist = [
      { label: '0–4', count: evalsForPDF.filter(e=>e.score<5).length },
      { label: '5–6', count: evalsForPDF.filter(e=>e.score>=5&&e.score<7).length },
      { label: '7–8', count: evalsForPDF.filter(e=>e.score>=7&&e.score<9).length },
      { label: '9–10', count: evalsForPDF.filter(e=>e.score>=9).length },
    ];
    const cMap = {};
    for (const e of evalsForPDF) for (const c of (e.criteria||[])) {
      if (!cMap[c.name]) cMap[c.name] = { total: 0, count: 0 };
      cMap[c.name].total += c.score||0; cMap[c.name].count += 1;
    }
    const cAvg = Object.entries(cMap).map(([name,d])=>({ name, avg: parseFloat((d.total/d.count).toFixed(1)) })).sort((a,b)=>b.avg-a.avg);
    const histSvg = _histSVG(dist);
    const barsSvg = _barsSVG(cAvg, 460);

    const suggestionsHtml = (report.sugestoes || []).map((s, i) => `
      <div style="margin-bottom:16px;padding:16px 20px;background:#f9fafb;border-radius:10px;border-left:3px solid #0081f0">
        <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:4px">${i+1}. ${s.titulo}</div>
        <div style="font-size:13px;color:#374151;margin-bottom:6px">${s.descricao}</div>
        <div style="font-size:12px;color:#6b7280;font-style:italic">${s.impacto}</div>
      </div>`).join('');

    const strongItems = (report.pontosFortes || []).map(p => `<li style="margin-bottom:4px;color:#374151;font-size:13px">${p}</li>`).join('');
    const weakItems = (report.pontosAtencao || []).map(p => `<li style="margin-bottom:4px;color:#374151;font-size:13px">${p}</li>`).join('');

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
    <title>Relatório da Turma — ${turmaTitle}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111; padding: 48px; max-width: 760px; margin: 0 auto; }
      @media print { body { padding: 24px; } @page { margin: 1.5cm; } }
    </style></head><body>
      <div style="border-bottom:2px solid #e5e7eb;padding-bottom:24px;margin-bottom:32px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:600;margin-bottom:6px">Relatório Pedagógico da Turma</div>
        <div style="font-size:26px;font-weight:800;color:#111">${turmaTitle}${exerciseTitle}</div>
        <div style="font-size:13px;color:#9ca3af;margin-top:4px">Gerado em ${date} · ${evalsForPDF.length} alunos avaliados</div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px">
        <div style="background:#f0f9ff;border-radius:10px;padding:16px 20px">
          <div style="font-size:28px;font-weight:800;color:#0081f0;line-height:1">${avgScore}</div>
          <div style="font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;margin-top:4px">Média da turma</div>
        </div>
        <div style="background:#f0fdf4;border-radius:10px;padding:16px 20px">
          <div style="font-size:28px;font-weight:800;color:#16a34a;line-height:1">${passing}</div>
          <div style="font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;margin-top:4px">Aprovados (≥5)</div>
        </div>
        <div style="background:#fafafa;border-radius:10px;padding:16px 20px">
          <div style="font-size:28px;font-weight:800;color:#374151;line-height:1">${evalsForPDF.length}</div>
          <div style="font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;margin-top:4px">Total avaliados</div>
        </div>
      </div>

      ${histSvg || barsSvg ? `
      <div style="display:grid;grid-template-columns:${histSvg && barsSvg ? '1fr 1fr' : '1fr'};gap:24px;margin-bottom:32px;align-items:start">
        ${histSvg ? `<div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Distribuição de Notas</div>
          ${histSvg}
        </div>` : ''}
        ${barsSvg ? `<div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Média por Critério</div>
          ${barsSvg}
        </div>` : ''}
      </div>` : ''}

      <div style="margin-bottom:28px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Resumo Geral</div>
        <div style="font-size:14px;line-height:1.8;color:#374151">${report.resumo}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px">
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#16a34a;margin-bottom:10px">Pontos Fortes</div>
          <ul style="padding-left:18px">${strongItems}</ul>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#dc2626;margin-bottom:10px">Pontos de Atenção</div>
          <ul style="padding-left:18px">${weakItems}</ul>
        </div>
      </div>

      ${report.analiseDetalhada ? `
      <div style="margin-bottom:28px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Análise Detalhada</div>
        <div style="font-size:14px;line-height:1.8;color:#374151">${report.analiseDetalhada}</div>
      </div>` : ''}

      ${report.sugestoes?.length ? `
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:14px">Sugestões Pedagógicas</div>
        ${suggestionsHtml}
      </div>` : ''}
    </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  }

  function generateQuickPDF() {
    const date = new Date().toLocaleDateString('pt-BR');
    const evalsForQuick = selectedEvals.length > 0 ? selectedEvals : filtered;
    const rows = evalsForQuick.map(e => {
      const c = e.score >= 7 ? '#16a34a' : e.score >= 5 ? '#ca8a04' : '#dc2626';
      return `<tr>
        <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:600;color:#111">${e.studentName}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280">${TYPES[e.type]?.label || e.type}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280">${e.exerciseName || '—'}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280">${e.turma || '—'}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:800;color:${c}">${e.score.toFixed(1)}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6"><span style="background:${e.score>=7?'#dcfce7':e.score>=5?'#fef9c3':'#fee2e2'};color:${c};padding:2px 10px;border-radius:6px;font-size:12px;font-weight:700">${scoreToGrade(e.score)}</span></td>
        <td style="padding:10px 14px;border-bottom:1px solid #f3f4f6;font-size:12px;color:#9ca3af">${new Date(e.createdAt).toLocaleDateString('pt-BR')}</td>
      </tr>`;
    }).join('');

    const avgScore = evalsForQuick.length ? (evalsForQuick.reduce((s,e)=>s+e.score,0)/evalsForQuick.length).toFixed(1) : '—';
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
    <title>Notas — ${date}</title>
    <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111; padding: 48px; } @media print { body { padding: 24px; } @page { margin: 1.5cm; } }</style>
    </head><body>
      <div style="border-bottom:2px solid #e5e7eb;padding-bottom:20px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:flex-end">
        <div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:600;margin-bottom:6px">Registro de Avaliações</div>
          <div style="font-size:24px;font-weight:800;color:#111">${turmaFilter || 'Todas as Turmas'}${exerciseFilter ? ` · ${exerciseFilter}` : ''}</div>
          <div style="font-size:13px;color:#9ca3af;margin-top:4px">Gerado em ${date}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:30px;font-weight:800;color:#0081f0">${avgScore}</div>
          <div style="font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase">Média geral</div>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:#f9fafb">
          <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600">Aluno</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600">Tipo</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600">Exercício</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600">Turma</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600">Nota</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600">Conceito</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;font-weight:600">Data</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  }

  async function generateStudentReport() {
    const studentEvals = selectedEvals;
    const studentName = selectedStudents[0] || 'Aluno';
    setStudentReportLoading(true);
    setStudentReportError('');
    setStudentReport(null);
    try {
      const r = await fetch('/api/analyze-student', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluations: studentEvals, studentName }),
      });
      const data = await r.json();
      if (!r.ok) { setStudentReportError(data.error || 'Erro ao gerar parecer.'); return; }
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (typeof u.quota_relatorios_ciclo === 'number' && u.quota_relatorios_ciclo > 0) {
          u.quota_relatorios_ciclo -= 1;
        } else if (typeof u.quota_relatorios_extra === 'number' && u.quota_relatorios_extra > 0) {
          u.quota_relatorios_extra -= 1;
        }
        localStorage.setItem('user', JSON.stringify(u));
        window.dispatchEvent(new Event('storage'));
      } catch {}
      router.push('/relatorios');
    } catch { setStudentReportError('Erro de conexão. Tente novamente.'); }
    finally { setStudentReportLoading(false); }
  }

  function generateStudentPDF(report) {
    const studentName = selectedStudents[0] || 'Aluno';
    const date = new Date().toLocaleDateString('pt-BR');
    const scoresOverTime = selectedEvals.slice().sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt)).map(e =>
      `${new Date(e.createdAt).toLocaleDateString('pt-BR')}: ${e.score.toFixed(1)}${e.exerciseName ? ` (${e.exerciseName})` : ''}`
    ).join('<br>');

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
    <title>Parecer Individual — ${studentName}</title>
    <style>* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: #111; padding: 48px; max-width: 720px; margin: 0 auto; } @media print { body { padding: 24px; } @page { margin: 1.5cm; } }</style>
    </head><body>
      <div style="border-bottom:2px solid #e5e7eb;padding-bottom:24px;margin-bottom:32px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:600;margin-bottom:6px">Parecer Individual do Aluno</div>
        <div style="font-size:26px;font-weight:800;color:#111">${studentName}</div>
        <div style="font-size:13px;color:#9ca3af;margin-top:4px">Gerado em ${date} · ${selectedEvals.length} avaliação(ões) analisada(s)</div>
      </div>
      ${report.evolucao ? `<div style="margin-bottom:24px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Evolução das Notas</div><div style="font-size:13px;line-height:2;color:#374151">${scoresOverTime}</div></div>` : ''}
      <div style="margin-bottom:24px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Resumo do Desempenho</div><div style="font-size:14px;line-height:1.8;color:#374151">${report.resumo}</div></div>
      ${report.pontosFortes?.length ? `<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#16a34a;margin-bottom:8px">Pontos Fortes</div><ul style="padding-left:18px">${report.pontosFortes.map(p=>`<li style="font-size:13px;color:#374151;margin-bottom:4px">${p}</li>`).join('')}</ul></div>` : ''}
      ${report.pontosDesenvolver?.length ? `<div style="margin-bottom:20px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#dc2626;margin-bottom:8px">A Desenvolver</div><ul style="padding-left:18px">${report.pontosDesenvolver.map(p=>`<li style="font-size:13px;color:#374151;margin-bottom:4px">${p}</li>`).join('')}</ul></div>` : ''}
      ${report.parecer ? `<div style="margin-bottom:24px;padding:20px;background:#f9fafb;border-radius:10px;border-left:3px solid #0081f0"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:10px">Parecer Final</div><div style="font-size:14px;line-height:1.8;color:#374151">${report.parecer}</div></div>` : ''}
    </body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 400);
  }

  const inpStyle = {
    padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 9,
    fontSize: 13, outline: 'none', background: 'var(--bg-card)',
    color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <AppLayout userName={userName}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Histórico</p>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Gerenciar Avaliações</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>Consulte, filtre e exporte o histórico completo de avaliações.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Dropdown Gerar Relatório */}
          <div ref={reportMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setReportMenuOpen(o => !o)}
              disabled={selected.size === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: selected.size === 0 ? 'var(--bg-card)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: selected.size === 0 ? 'var(--text-muted)' : 'white', border: selected.size === 0 ? '1px solid var(--border)' : 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: selected.size === 0 ? 'not-allowed' : 'pointer', opacity: selected.size === 0 ? 0.4 : 1 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Gerar Relatório{selected.size > 0 ? ` (${selected.size})` : ''}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 2, opacity: 0.8 }}><polyline points="6 9 12 15 18 9"/></svg>
            </button>

            {reportMenuOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', width: 300, zIndex: 200, overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px 8px', fontSize: 10, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Selecione o tipo de relatório
                </div>

                {/* Opção 1: PDF rápido */}
                <button
                  onClick={() => { setReportMenuOpen(false); generateQuickPDF(); }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg-content)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>Exportar Notas em PDF</span>
                      <span style={{ fontSize: 10, fontWeight: 700, background: '#e0f2fe', color: '#0369a1', borderRadius: 5, padding: '1px 7px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rápido</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>Tabela completa com todas as avaliações, notas e conceitos. Gerado instantaneamente, sem IA.</p>
                  </div>
                </button>

                <div style={{ height: 1, background: 'var(--border-card)', margin: '0 16px' }} />

                {/* Opção 2: Análise da turma */}
                <button
                  onClick={() => { if (!canClassReport) return; setReportMenuOpen(false); setClassReport(null); setReportError(''); generateClassReport(); }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: canClassReport ? 'pointer' : 'default', textAlign: 'left', opacity: canClassReport ? 1 : 0.5 }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-content)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: '#f5f3ff', border: '1px solid #7c3aed33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>Análise Pedagógica da Turma</span>
                      <span style={{ fontSize: 10, fontWeight: 700, background: '#f5f3ff', color: '#7c3aed', borderRadius: 5, padding: '1px 7px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>IA</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                      {canClassReport ? `${selectedEvals.length} avaliações de ${selectedStudents.length} alunos selecionadas.` : 'Selecione avaliações de 2+ alunos diferentes.'}
                    </p>
                  </div>
                </button>

                <div style={{ height: 1, background: 'var(--border-card)', margin: '0 16px' }} />

                {/* Opção 3: Parecer individual */}
                <button
                  onClick={() => { if (!canStudentReport) return; setReportMenuOpen(false); setStudentReport(null); setStudentReportError(''); generateStudentReport(); }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: canStudentReport ? 'pointer' : 'default', textAlign: 'left', opacity: canStudentReport ? 1 : 0.5 }}
                  onMouseEnter={e => { if (canStudentReport) e.currentTarget.style.background = 'var(--bg-content)'; }}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff7ed', border: '1px solid #f9731633', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>Parecer Individual do Aluno</span>
                      <span style={{ fontSize: 10, fontWeight: 700, background: '#fff7ed', color: '#ea580c', borderRadius: 5, padding: '1px 7px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>IA</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                      {canStudentReport ? `${selectedEvals.length} avaliações de ${selectedStudents[0]} selecionadas.` : 'Selecione 2+ avaliações do mesmo aluno.'}
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button onClick={exportCSV} disabled={filtered.length === 0} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: filtered.length === 0 ? 'not-allowed' : 'pointer', background: 'var(--bg-card)', color: 'var(--text-main)', opacity: filtered.length === 0 ? 0.4 : 1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar CSV
          </button>
          <button onClick={clearAll} disabled={evaluations.length === 0} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', border: '1px solid #EF444433', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: evaluations.length === 0 ? 'not-allowed' : 'pointer', background: 'transparent', color: '#EF4444', opacity: evaluations.length === 0 ? 0.4 : 1 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Limpar tudo
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total de avaliações', value: evaluations.length },
          { label: 'Média geral', value: avg },
          { label: 'Aprovados (≥5)', value: passing },
          { label: 'Melhor nota', value: best },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12, padding: '20px 22px' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#0081f0', lineHeight: 1, marginBottom: 6 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          <Tooltip text="Filtre as avaliações por aluno, tipo de trabalho, turma, exercício ou faixa de nota.">Filtros</Tooltip>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input style={{ ...inpStyle, width: 180 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar aluno..." />
          <select style={{ ...inpStyle, width: 170 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">Todos os tipos</option>
            {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select style={{ ...inpStyle, width: 150 }} value={turmaFilter} onChange={e => setTurmaFilter(e.target.value)}>
            <option value="">Todas as turmas</option>
            {turmas.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select style={{ ...inpStyle, width: 200 }} value={exerciseFilter} onChange={e => setExerciseFilter(e.target.value)}>
            <option value="">Todos os exercícios</option>
            {exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
          </select>
          <select style={{ ...inpStyle, width: 180 }} value={institutionFilter} onChange={e => setInstitutionFilter(e.target.value)}>
            <option value="">Todas as instituições</option>
            {institutions.map(inst => <option key={inst} value={inst}>{inst}</option>)}
          </select>
          <input style={{ ...inpStyle, width: 80 }} value={scoreMin} onChange={e => setScoreMin(e.target.value)} placeholder="Nota ≥" type="number" min="0" max="10" step="0.1" />
          <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>—</span>
          <input style={{ ...inpStyle, width: 80 }} value={scoreMax} onChange={e => setScoreMax(e.target.value)} placeholder="≤ 10" type="number" min="0" max="10" step="0.1" />
          {(search || typeFilter || turmaFilter || exerciseFilter || institutionFilter || scoreMin || scoreMax) && (
            <button onClick={clearFilters} style={{ ...inpStyle, cursor: 'pointer', color: 'var(--text-muted)' }}>× Limpar</button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-card)', fontWeight: 600, fontSize: 14, color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Registro de Avaliações</span>
          {filtered.length > 0 && <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 400 }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>}
        </div>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-sub)', fontSize: 13 }}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 14px' }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
              {evaluations.length === 0 ? 'Nenhuma avaliação ainda.' : 'Nenhuma avaliação encontrada com esses filtros.'}
            </p>
            {evaluations.length === 0 && (
              <button onClick={() => router.push('/avaliar')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Criar primeira avaliação
              </button>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-content)' }}>
                <th style={{ padding: '10px 16px', width: 36 }}>
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer', width: 15, height: 15 }}
                  />
                </th>
                {['Aluno', 'Tipo', 'Exercício', 'Nota', 'Conceito', 'Turma', 'Instituição', 'Professor', 'Data', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--text-sub)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const c = scoreColor(e.score);
                return (
                  <tr key={e.id} style={{ borderTop: '1px solid var(--border-card)', background: selected.has(e.id) ? 'var(--bg-content)' : 'none' }}>
                    <td style={{ padding: '13px 16px', width: 36 }}>
                      <input
                        type="checkbox"
                        checked={selected.has(e.id)}
                        onChange={() => toggleSelect(e.id)}
                        style={{ cursor: 'pointer', width: 15, height: 15 }}
                      />
                    </td>
                    <td style={{ padding: '13px 16px', fontWeight: 600, color: 'var(--text-main)' }}>{e.studentName}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-muted)' }}>{TYPES[e.type]?.label || e.type}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-sub)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.exerciseName || '—'}</td>
                    <td style={{ padding: '13px 16px', fontWeight: 700, color: c.text, fontSize: 15 }}>{typeof e.score === 'number' ? e.score.toFixed(1) : e.score}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ background: c.bg, color: c.text, borderRadius: 6, padding: '2px 10px', fontWeight: 700, fontSize: 12 }}>{scoreToGrade(e.score)}</span>
                    </td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-sub)' }}>{e.turma || '—'}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-sub)' }}>{e.institution || '—'}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-muted)' }}>{e.profileName || '—'}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-sub)' }}>{new Date(e.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => window.open(`/relatorio-individual?id=${e.id}`, '_blank')} style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: '#0081f0' }}>Ver</button>
                        <button onClick={() => window.open(`/relatorio-individual?id=${e.id}&print=1`, '_blank')} style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)' }}>PDF</button>
                        <button onClick={() => { setDetail(e); setDetailDraft(JSON.parse(JSON.stringify(e))); }} style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--bg-content)', color: 'var(--text-main)' }}>Editar</button>
                        <button onClick={() => del(e.id)} style={{ padding: '5px 9px', border: '1px solid #EF444433', borderRadius: 7, fontSize: 12, cursor: 'pointer', background: 'transparent', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal detalhe */}
      {detail && (() => {
        const d = detailDraft || detail;
        const editing = !!detailDraft;
        const sc = scoreColor(d.score);
        return (
          <div onClick={() => { setDetail(null); setDetailDraft(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div onClick={ev => ev.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 32, maxWidth: 680, width: '100%', maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--border-card)' }}>

              {/* Cabeçalho */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 20 }}>
                  {editing ? (
                    <input
                      value={detailDraft.studentName || ''}
                      onChange={e => setDetailDraft(dd => ({ ...dd, studentName: e.target.value }))}
                      placeholder="Nome do aluno"
                      style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', background: 'var(--bg-content)', fontFamily: 'inherit', width: '100%', marginBottom: 6 }}
                    />
                  ) : (
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>{detail.studentName}</h2>
                  )}
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    {TYPES[detail.type]?.label || detail.type} · {new Date(detail.createdAt).toLocaleDateString('pt-BR')}
                    {detail.turma ? ` · ${detail.turma}` : ''}
                    {detail.profileName ? ` · ${detail.profileName}` : ''}
                  </p>
                  {detail.exerciseName && (
                    <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 4 }}>Exercício: <strong>{detail.exerciseName}</strong></p>
                  )}
                </div>
                {/* Nota */}
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 20 }}>
                  {editing ? (
                    <div>
                      <input
                        type="number" min="0" max="10" step="0.1"
                        value={detailDraft.score}
                        onChange={e => setDetailDraft(dd => ({ ...dd, score: parseFloat(e.target.value) || 0 }))}
                        style={{ fontSize: 28, fontWeight: 800, width: 90, textAlign: 'center', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', color: sc.text, background: 'var(--bg-content)', fontFamily: 'inherit' }}
                      />
                      <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 4 }}><Tooltip text="Nota final do aluno, de 0 a 10. Você pode editar antes de gerar o PDF.">/&nbsp;10</Tooltip></div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 40, fontWeight: 800, color: sc.text, lineHeight: 1 }}>{typeof d.score === 'number' ? d.score.toFixed(1) : d.score}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 2, fontWeight: 600 }}>{scoreToGrade(d.score)}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Critérios */}
              {d.criteria?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                    <Tooltip text="Nota de cada critério (0 a 10). No modo de edição você pode ajustar cada nota individualmente.">Critérios</Tooltip>
                  </p>
                  {d.criteria.map((c, i) => {
                    const cc = scoreColor(c.score || 0);
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <div style={{ flex: 1, fontSize: 13, color: 'var(--text-main)' }}>{c.name}</div>
                        <div style={{ width: 100, height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
                          <div style={{ width: `${(c.score || 0) * 10}%`, height: '100%', background: cc.text, borderRadius: 99 }} />
                        </div>
                        {editing ? (
                          <input
                            type="number" min="0" max="10" step="0.1"
                            value={c.score || 0}
                            onChange={e => setDetailDraft(dd => ({ ...dd, criteria: dd.criteria.map((cr, j) => j === i ? { ...cr, score: parseFloat(e.target.value) || 0 } : cr) }))}
                            style={{ width: 58, fontSize: 13, fontWeight: 700, border: '1px solid var(--border)', borderRadius: 6, padding: '3px 6px', textAlign: 'center', color: cc.text, background: 'var(--bg-content)', fontFamily: 'inherit' }}
                          />
                        ) : (
                          <div style={{ fontSize: 13, fontWeight: 700, color: cc.text, width: 30, textAlign: 'right', flexShrink: 0 }}>{c.score?.toFixed(1) ?? '—'}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Feedback */}
              {editing && (
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                  <Tooltip text="Texto do feedback gerado pela IA. Você pode editar livremente antes de gerar o PDF.">Feedback</Tooltip>
                </p>
              )}
              {editing ? (
                <textarea
                  value={detailDraft.feedback || ''}
                  onChange={e => setDetailDraft(dd => ({ ...dd, feedback: e.target.value }))}
                  style={{ width: '100%', minHeight: 200, fontSize: 14, lineHeight: 1.8, padding: 16, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-content)', color: 'var(--text-main)', resize: 'vertical', fontFamily: 'inherit', marginBottom: 20, boxSizing: 'border-box' }}
                />
              ) : (
                d.feedback && (
                  <div style={{ background: 'var(--bg-content)', borderRadius: 10, padding: 18, fontSize: 14, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text-main)', marginBottom: 20 }}>
                    {d.feedback}
                  </div>
                )
              )}

              {/* Botões */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button onClick={() => generatePDF(d)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Gerar PDF
                </button>
                {editing ? (
                  <>
                    <button onClick={saveEdit} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: 'white', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      Salvar alterações
                    </button>
                    <button onClick={() => setDetailDraft(null)} style={{ padding: '10px 18px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button onClick={() => setDetailDraft(JSON.parse(JSON.stringify(detail)))} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Editar
                  </button>
                )}
                <button onClick={() => { setDetail(null); setDetailDraft(null); }} style={{ padding: '10px 22px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Modal Relatório da Turma */}
      {(reportLoading || classReport || reportError) && (
        <div onClick={() => { if (!reportLoading) { setClassReport(null); setReportError(''); } }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={ev => ev.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 36, maxWidth: 740, width: '100%', maxHeight: '88vh', overflowY: 'auto', border: '1px solid var(--border-card)' }}>
            {/* Loading state */}
            {reportLoading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTop: '3px solid #7c3aed', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.9s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>Analisando a turma...</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>A IA está examinando {selectedEvals.length} avaliações</p>
              </div>
            )}
            {/* Error state */}
            {reportError && !reportLoading && (
              <div>
                <div style={{ background: '#FEF2F2', border: '1px solid #EF444433', borderRadius: 10, padding: '16px 20px', marginBottom: 20, color: '#EF4444', fontSize: 14 }}>{reportError}</div>
                <button onClick={() => { setClassReport(null); setReportError(''); }} style={{ padding: '10px 22px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 14, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>Fechar</button>
              </div>
            )}
            {/* Report */}
            {classReport && !reportLoading && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Relatório Pedagógico</p>
                    <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>
                      {turmaFilter || 'Todas as turmas'}{exerciseFilter ? ` · ${exerciseFilter}` : ''}
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{selectedEvals.length} avaliações analisadas</p>
                  </div>
                  <button onClick={() => { setClassReport(null); setReportError(''); }} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 18, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
                </div>

                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
                  {[
                    { label: 'Média da turma', value: selectedEvals.length ? (selectedEvals.reduce((s,e)=>s+e.score,0)/selectedEvals.length).toFixed(1) : '—', color: '#0081f0' },
                    { label: 'Aprovados (≥5)', value: selectedEvals.filter(e=>e.score>=5).length, color: '#16a34a' },
                    { label: 'Total avaliados', value: selectedEvals.length, color: '#374151' },
                  ].map(k => (
                    <div key={k.label} style={{ background: 'var(--bg-content)', borderRadius: 10, padding: '14px 18px', border: '1px solid var(--border-card)' }}>
                      <div style={{ fontSize: 26, fontWeight: 800, color: k.color, lineHeight: 1, marginBottom: 4 }}>{k.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-sub)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</div>
                    </div>
                  ))}
                </div>

                {/* Gráficos — computados do selectedEvals */}
                {(() => {
                  const dist = [
                    { label: '0–4', count: selectedEvals.filter(e => e.score < 5).length },
                    { label: '5–6', count: selectedEvals.filter(e => e.score >= 5 && e.score < 7).length },
                    { label: '7–8', count: selectedEvals.filter(e => e.score >= 7 && e.score < 9).length },
                    { label: '9–10', count: selectedEvals.filter(e => e.score >= 9).length },
                  ];
                  const cMap = {};
                  for (const e of selectedEvals) for (const c of (e.criteria || [])) {
                    if (!cMap[c.name]) cMap[c.name] = { total: 0, n: 0 };
                    cMap[c.name].total += c.score || 0; cMap[c.name].n += 1;
                  }
                  const cAvg = Object.entries(cMap).map(([name, d]) => ({ name, avg: parseFloat((d.total/d.n).toFixed(1)) })).sort((a,b) => b.avg - a.avg);
                  if (!cAvg.length) return null;
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                      <div style={{ background: 'var(--bg-content)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border-card)' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Distribuição de notas</p>
                        <div dangerouslySetInnerHTML={{ __html: _histSVG(dist) }} />
                      </div>
                      <div style={{ background: 'var(--bg-content)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border-card)' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Média por critério</p>
                        <div dangerouslySetInnerHTML={{ __html: _barsSVG(cAvg, 260) }} />
                      </div>
                    </div>
                  );
                })()}

                {/* Resumo */}
                <div style={{ background: 'var(--bg-content)', borderRadius: 10, padding: '16px 20px', marginBottom: 24, border: '1px solid var(--border-card)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Resumo Geral</p>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>{classReport.resumo}</p>
                </div>

                {/* Pontos fortes / atenção */}
                <div className="form-grid" style={{ marginBottom: 24 }}>
                  <div style={{ background: '#ECFDF5', border: '1px solid #10B98133', borderRadius: 10, padding: '16px 20px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Pontos Fortes</p>
                    <ul style={{ paddingLeft: 18 }}>
                      {(classReport.pontosFortes || []).map((p, i) => (
                        <li key={i} style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 6, lineHeight: 1.5 }}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ background: '#FFF7ED', border: '1px solid #F97316' + '33', borderRadius: 10, padding: '16px 20px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Pontos de Atenção</p>
                    <ul style={{ paddingLeft: 18 }}>
                      {(classReport.pontosAtencao || []).map((p, i) => (
                        <li key={i} style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 6, lineHeight: 1.5 }}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Análise detalhada */}
                {classReport.analiseDetalhada && (
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Análise Detalhada</p>
                    <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>{classReport.analiseDetalhada}</p>
                  </div>
                )}

                {/* Sugestões pedagógicas */}
                {classReport.sugestoes?.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Sugestões Pedagógicas</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {classReport.sugestoes.map((s, i) => (
                        <div key={i} style={{ background: 'var(--bg-content)', border: '1px solid var(--border-card)', borderLeft: '3px solid #7c3aed', borderRadius: 10, padding: '16px 20px' }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>{i+1}. {s.titulo}</p>
                          <p style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 6, lineHeight: 1.6 }}>{s.descricao}</p>
                          {s.impacto && <p style={{ fontSize: 12, color: 'var(--text-sub)', fontStyle: 'italic' }}>{s.impacto}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => generateClassPDF(classReport)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: 'white', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Gerar PDF
                  </button>
                  <button onClick={() => { setClassReport(null); setReportError(''); }} style={{ padding: '10px 22px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Modal Parecer Individual */}
      {(studentReportLoading || studentReport || studentReportError) && (
        <div onClick={() => { if (!studentReportLoading) { setStudentReport(null); setStudentReportError(''); } }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={ev => ev.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 36, maxWidth: 680, width: '100%', maxHeight: '88vh', overflowY: 'auto', border: '1px solid var(--border-card)' }}>
            {studentReportLoading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTop: '3px solid #ea580c', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 0.9s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 }}>Gerando parecer individual...</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>A IA está analisando o histórico do aluno</p>
              </div>
            )}
            {studentReportError && !studentReportLoading && (
              <div>
                <div style={{ background: '#FEF2F2', border: '1px solid #EF444433', borderRadius: 10, padding: '16px 20px', marginBottom: 20, color: '#EF4444', fontSize: 14 }}>{studentReportError}</div>
                <button onClick={() => { setStudentReport(null); setStudentReportError(''); }} style={{ padding: '10px 22px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 14, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>Fechar</button>
              </div>
            )}
            {studentReport && !studentReportLoading && (() => {
              const studentName = selectedStudents[0] || 'Aluno';
              const sortedEvals = selectedEvals.slice().sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt));
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Parecer Individual</p>
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-main)' }}>{studentName}</h2>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{selectedEvals.length} avaliação(ões) analisada(s)</p>
                    </div>
                    <button onClick={() => { setStudentReport(null); setStudentReportError(''); }} style={{ padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 7, fontSize: 18, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
                  </div>

                  {/* Evolução */}
                  {sortedEvals.length > 1 && (
                    <div style={{ marginBottom: 24 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Evolução das Notas</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {sortedEvals.map((e, i) => {
                          const c = scoreColor(e.score);
                          return (
                            <div key={i} style={{ background: 'var(--bg-content)', border: '1px solid var(--border-card)', borderRadius: 9, padding: '10px 14px', textAlign: 'center', minWidth: 80 }}>
                              <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>{e.score.toFixed(1)}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 2 }}>{e.exerciseName || new Date(e.createdAt).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Resumo */}
                  <div style={{ background: 'var(--bg-content)', borderRadius: 10, padding: '16px 20px', marginBottom: 20, border: '1px solid var(--border-card)' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Resumo do Desempenho</p>
                    <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>{studentReport.resumo}</p>
                  </div>

                  <div className="form-grid" style={{ marginBottom: 20 }}>
                    {studentReport.pontosFortes?.length > 0 && (
                      <div style={{ background: '#ECFDF5', border: '1px solid #10B98133', borderRadius: 10, padding: '16px 20px' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Pontos Fortes</p>
                        <ul style={{ paddingLeft: 18 }}>
                          {studentReport.pontosFortes.map((p, i) => <li key={i} style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 6, lineHeight: 1.5 }}>{p}</li>)}
                        </ul>
                      </div>
                    )}
                    {studentReport.pontosDesenvolver?.length > 0 && (
                      <div style={{ background: '#FFF7ED', border: '1px solid #f9731633', borderRadius: 10, padding: '16px 20px' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>A Desenvolver</p>
                        <ul style={{ paddingLeft: 18 }}>
                          {studentReport.pontosDesenvolver.map((p, i) => <li key={i} style={{ fontSize: 13, color: 'var(--text-main)', marginBottom: 6, lineHeight: 1.5 }}>{p}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Parecer formal */}
                  {studentReport.parecer && (
                    <div style={{ background: 'var(--bg-content)', border: '1px solid var(--border-card)', borderLeft: '3px solid #ea580c', borderRadius: 10, padding: '18px 20px', marginBottom: 28 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Parecer Final</p>
                      <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text-main)' }}>{studentReport.parecer}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => generateStudentPDF(studentReport)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: 'linear-gradient(135deg, #ea580c, #dc2626)', color: 'white', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Gerar PDF
                    </button>
                    <button onClick={() => { setStudentReport(null); setStudentReportError(''); }} style={{ padding: '10px 22px', border: '1px solid var(--border)', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)' }}>
                      Fechar
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
