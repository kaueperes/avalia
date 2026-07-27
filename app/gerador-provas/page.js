'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '../components/AppLayout';

function token() { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; }

const IconSpinner = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const IconCopy = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;

const QUESTION_TYPES = [
  { id: 'mista', label: 'Mista' },
  { id: 'multipla', label: 'Múltipla escolha' },
  { id: 'dissertativa', label: 'Dissertativa' },
  { id: 'vf', label: 'Verdadeiro/Falso' },
];

export default function GeradorProvas() {
  const [loadingMe, setLoadingMe] = useState(true);
  const [plan, setPlan] = useState('gratuito');
  const [quotaProvas, setQuotaProvas] = useState(0);

  const [discipline, setDiscipline] = useState('');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState('mista');
  const [notes, setNotes] = useState('');
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [examText, setExamText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/me', { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          setPlan(data.user.plan || 'gratuito');
          setQuotaProvas(typeof data.user.quota_provas === 'number' ? data.user.quota_provas : 0);
        }
      })
      .finally(() => setLoadingMe(false));
  }, []);

  async function handleGenerate() {
    if (!discipline || !topic || !numQuestions) return;
    setGenerating(true);
    setError('');
    setExamText('');
    setCopied(false);
    try {
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ discipline, topic, level: level || undefined, numQuestions: Number(numQuestions), questionType, notes: notes || undefined, includeAnswerKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar prova');
      setExamText(data.examText);
      if (typeof data.quotaProvasRestante === 'number') setQuotaProvas(data.quotaProvasRestante);
    } catch (e) {
      setError(e.message || 'Erro ao gerar prova');
    } finally {
      setGenerating(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(examText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const secLabel = { fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 };
  const section = { padding: '20px 24px', borderBottom: '1px solid var(--border-card)' };
  const sectionLast = { padding: '20px 24px' };
  const inp = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, background: 'var(--bg-content)', color: 'var(--text-main)', fontFamily: 'inherit', boxSizing: 'border-box' };
  const lbl = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 6 };
  const btnPrimary = { background: 'linear-gradient(135deg, #0081f0, #0033ad)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' };
  const btnSecondary = { background: 'transparent', color: 'var(--text-sub)', border: '1px solid var(--border)', borderRadius: 10, padding: '9px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 };
  const card = { background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 16, overflow: 'hidden' };
  const fieldRow = { marginBottom: 14 };

  const canGenerate = discipline && topic && numQuestions > 0 && !generating && quotaProvas > 0;
  const isGratuito = plan === 'gratuito';

  return (
    <AppLayout>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#810cfa', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>Ferramentas</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>Gerador de Provas</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 6, marginBottom: 0 }}>
          Descreva a prova e copie o texto gerado para usar onde precisar.
        </p>
      </div>

      <div style={{ maxWidth: 680 }}>
        {!loadingMe && isGratuito ? (
          <div style={{ padding: '16px 20px', background: '#FEF9EC', border: '1px solid #F59E0B33', borderRadius: 12 }}>
            <span style={{ fontSize: 14, color: '#92400E' }}>O Gerador de Provas está disponível a partir do plano Essencial. </span>
            <Link href="/conta" style={{ fontSize: 14, color: '#0081f0', fontWeight: 600, textDecoration: 'none' }}>Ver planos →</Link>
          </div>
        ) : (
          <>
            <div style={card}>
              <div style={section}>
                <div style={secLabel}>Dados da prova</div>

                <div style={fieldRow}>
                  <label style={lbl}>Matéria</label>
                  <input style={inp} value={discipline} onChange={e => setDiscipline(e.target.value)} placeholder="Ex: Matemática" />
                </div>

                <div style={fieldRow}>
                  <label style={lbl}>Tema/conteúdo</label>
                  <input style={inp} value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex: Equação de 2º grau" />
                </div>

                <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <label style={lbl}>Série/nível (opcional)</label>
                    <input style={inp} value={level} onChange={e => setLevel(e.target.value)} placeholder="Ex: 8º ano" />
                  </div>
                  <div style={{ width: 140 }}>
                    <label style={lbl}>Nº de questões</label>
                    <input type="number" min={1} max={30} style={inp} value={numQuestions} onChange={e => setNumQuestions(e.target.value)} />
                  </div>
                </div>

                <div style={fieldRow}>
                  <label style={lbl}>Tipo de questão</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {QUESTION_TYPES.map(t => (
                      <button key={t.id} onClick={() => setQuestionType(t.id)}
                        style={{ padding: '7px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: `1px solid ${questionType === t.id ? '#810cfa' : 'var(--border)'}`, background: questionType === t.id ? '#810cfa' : 'var(--bg-content)', color: questionType === t.id ? '#fff' : 'var(--text-main)', fontWeight: questionType === t.id ? 700 : 400, fontFamily: 'inherit' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={fieldRow}>
                  <label style={lbl}>Observações (opcional)</label>
                  <textarea style={inp} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex: focar em problemas do dia a dia" />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-main)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={includeAnswerKey} onChange={e => setIncludeAnswerKey(e.target.checked)} />
                  Incluir gabarito ao final
                </label>
              </div>

              <div style={{ ...sectionLast, display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={handleGenerate} disabled={!canGenerate} style={{ ...btnPrimary, opacity: canGenerate ? 1 : 0.5, cursor: canGenerate ? 'pointer' : 'not-allowed' }}>
                  {generating ? <><IconSpinner /> Gerando...</> : 'Gerar prova'}
                </button>
                {!loadingMe && <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{quotaProvas} gerações restantes este mês</span>}
              </div>
            </div>

            {error && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #dc262633', borderRadius: 10, color: '#991B1B', fontSize: 13 }}>
                {error}
              </div>
            )}

            {examText && (
              <div style={{ ...card, marginTop: 20 }}>
                <div style={{ ...section, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ ...secLabel, marginBottom: 0 }}>Prova gerada</div>
                  <button onClick={handleCopy} style={btnSecondary}><IconCopy /> {copied ? 'Copiado!' : 'Copiar'}</button>
                </div>
                <div style={sectionLast}>
                  <textarea readOnly value={examText} rows={16}
                    style={{ ...inp, fontFamily: 'ui-monospace, monospace', fontSize: 13, lineHeight: 1.6 }} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
