'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TurmaEvolucaoReport } from '../relatorio-turma-evolucao-preview/page';

function token() { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; }

function RelatorioTurmaEvolucaoInner() {
  const params = useSearchParams();
  const id = params.get('id');
  const autoPrint = params.get('print') === '1';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) { setError('ID não informado.'); return; }
    fetch(`/api/reports/${id}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(r => {
        const c = r.content || {};
        const s = c.stats || {};
        setData({
          turma: r.turma || '',
          disciplina: c.disciplina || '',
          institution: r.institution || '',
          profileName: r.profileName || '',
          date: new Date(r.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
          // atividades: [string] — API salva como [{exerciseName, date, media, total}]
          atividades: (s.atividades || []).map(a => a.exerciseName || a),
          // alunos: [{name, scores:[]}] — API salva como {studentName, scores}
          alunos: (s.alunos || []).map(a => ({ name: a.studentName || a.name || '', scores: a.scores || [] })),
          criteriaRecente: (s.criteriaRecente || []).map(c => ({ name: c.name, avg: c.avg ?? 0 })),
          resumo: c.resumo || '',
          pontosFortes: c.pontosFortes || [],
          pontosAtencao: c.pontosAtencao || [],
          sugestoes: c.sugestoes || [],
        });
      })
      .catch(() => setError('Não foi possível carregar o relatório.'));
  }, [id]);

  useEffect(() => {
    if (data && autoPrint) {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [data, autoPrint]);

  if (error) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#ef4444' }}>{error}</div>;
  if (!data) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTop: '3px solid #0081f0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return <TurmaEvolucaoReport data={data} />;
}

export default function RelatorioTurmaEvolucaoPage() {
  return <Suspense fallback={null}><RelatorioTurmaEvolucaoInner /></Suspense>;
}
