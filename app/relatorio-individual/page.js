'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EvaluationReport } from '../relatorio-preview/page';

function token() { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; }

function RelatorioIndividualInner() {
  const params = useSearchParams();
  const id = params.get('id');
  const autoPrint = params.get('print') === '1';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) { setError('ID não informado.'); return; }
    Promise.all([
      fetch(`/api/evaluations/${id}`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.ok ? r.json() : Promise.reject(r)),
      fetch('/api/profiles', { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([e, profiles]) => {
        const profile = (profiles || []).find(p => p.name === e.profileName);
        document.title = e.studentName || 'Avaliação';
        setData({
          studentName: e.studentName || 'Aluno',
          turma: e.turma || '',
          institution: e.institution || '',
          institutionLogo: e.institutionLogoUrl || profile?.institutionLogo || '',
          profileName: e.profileName || '',
          exerciseName: e.exerciseName || '',
          disciplina: e.disciplina || '',
          tipoTrabalho: e.type || '',
          score: e.score ?? 0,
          date: new Date(e.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
          criteria: (e.criteria || []).map(c => ({ name: c.name, score: c.score ?? 0 })),
          feedback: e.feedback || '',
          pontosFortes: [],
          pontosDesenvolver: [],
        });
      })
      .catch(() => setError('Não foi possível carregar a avaliação.'));
  }, [id]);

  useEffect(() => {
    if (data && autoPrint) {
      const t = setTimeout(() => window.print(), 600);
      return () => clearTimeout(t);
    }
  }, [data, autoPrint]);

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#ef4444' }}>
      {error}
    </div>
  );

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', color: '#6b7280' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTop: '3px solid #0081f0', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return <EvaluationReport data={data} />;
}

export default function RelatorioIndividualPage() {
  return <Suspense fallback={null}><RelatorioIndividualInner /></Suspense>;
}
