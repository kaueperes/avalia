'use client';

import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { TYPES, CATEGORIES, TONES, scoreColor, scoreToGrade } from '@/lib/types';

function token() { return typeof window !== 'undefined' ? localStorage.getItem('token') : null; }

const DEFAULT_CRITERIA = [
  { name: 'Conteúdo', weight: 2 },
  { name: 'Clareza', weight: 1 },
  { name: 'Organização', weight: 1 },
];

const PESOS = [1, 2, 3];

// ── Icons ─────────────────────────────────────────────────────────────────────

const FlaskIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6l1 7H8L9 3z"/><path d="M8 10l-4 9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1l-4-9"/>
    <line x1="12" y1="3" x2="12" y2="10"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const CompareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="3" width="8" height="18" rx="1"/>
  </svg>
);

// ── Componente de resultado ───────────────────────────────────────────────────

function ResultadoTeste({ resultado, label = 'Resultado' }) {
  const col = scoreColor(resultado.score);
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ ...col, padding: '6px 14px', borderRadius: 8, fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
          {resultado.score?.toFixed(1)}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{label}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{scoreToGrade(resultado.score)} · {resultado.criteriaScores?.length} critérios</div>
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        {resultado.criteriaScores?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {resultado.criteriaScores.map((c, i) => {
              const cc = scoreColor(c.score);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--text-main)' }}>{c.name}</div>
                  <div style={{ width: 90, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${(c.score / 10) * 100}%`, height: '100%', background: cc.text, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: cc.text, minWidth: 32, textAlign: 'right' }}>{c.score?.toFixed(1)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-sub)', minWidth: 32 }}>×{c.weight}</div>
                </div>
              );
            })}
          </div>
        )}
        {resultado.feedback && (
          <div style={{ background: 'var(--bg-content)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
            {resultado.feedback}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function TestarPromptPage() {
  const [user, setUser] = useState(null);
  const [quotaTestes, setQuotaTestes] = useState(null);

  // Formulário
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseContext, setExerciseContext] = useState('');
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [studentWork, setStudentWork] = useState('');
  const [tone, setTone] = useState('neutro');

  // Resultados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultados, setResultados] = useState([]); // máx 2 para comparação
  const [modoComparacao, setModoComparacao] = useState(false);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(u);
      if (u.quota_testes !== undefined) setQuotaTestes(u.quota_testes);
    } catch {}
  }, []);

  // Filtra tipos pela categoria selecionada
  const tiposDaCategoria = selectedCat
    ? Object.entries(TYPES).filter(([, t]) => t.cat === selectedCat)
    : [];

  function addCriterio() {
    setCriteria(prev => [...prev, { name: '', weight: 1 }]);
  }

  function removeCriterio(idx) {
    setCriteria(prev => prev.filter((_, i) => i !== idx));
  }

  function updateCriterio(idx, field, value) {
    setCriteria(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  }

  async function handleTestar() {
    if (!exerciseName.trim()) { setError('Informe o nome do exercício.'); return; }
    const criteriosValidos = criteria.filter(c => c.name.trim());
    if (criteriosValidos.length === 0) { setError('Adicione pelo menos um critério com nome.'); return; }
    if (!studentWork.trim()) { setError('Cole o trabalho do aluno para avaliar.'); return; }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/evaluate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          type: selectedType || undefined,
          exerciseName: exerciseName.trim(),
          exerciseContext: exerciseContext.trim() || undefined,
          criteria: criteriosValidos,
          studentWork: studentWork.trim(),
          tone,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro ao processar o teste.'); return; }

      // Mantém no máximo 2 resultados para comparação
      setResultados(prev => {
        const novo = { ...data, label: `Teste ${Date.now()}` };
        const lista = [novo, ...prev].slice(0, 2);
        return lista;
      });

      // Atualiza contador local
      if (data.quota_testes_restante !== null && data.quota_testes_restante !== undefined) {
        setQuotaTestes(data.quota_testes_restante);
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          u.quota_testes = data.quota_testes_restante;
          localStorage.setItem('user', JSON.stringify(u));
        } catch {}
      }
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const inp = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border-input)',
    borderRadius: 10,
    fontSize: 14,
    background: 'var(--bg-card)',
    color: 'var(--text-main)',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <AppLayout userName={user?.name} userEmail={user?.email} userPlan={user?.plan}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Banner modo teste */}
      <div style={{
        background: 'linear-gradient(135deg, #78350f, #92400e)',
        border: '1px solid #a16207',
        borderRadius: 12,
        padding: '14px 20px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fde68a' }}>
          <FlaskIcon />
          <span style={{ fontSize: 14, fontWeight: 700 }}>MODO TESTE</span>
        </div>
        <span style={{ color: '#fcd34d', fontSize: 13 }}>
          Os resultados não são salvos no histórico e <strong>não consomem suas cotas de avaliação</strong>
        </span>
        {quotaTestes !== null && (
          <div style={{
            marginLeft: 'auto',
            background: 'rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            padding: '5px 12px',
            fontSize: 13,
            color: quotaTestes <= 2 ? '#fca5a5' : '#fde68a',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}>
            {quotaTestes} de {10} testes disponíveis · renova mensalmente
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* Coluna esquerda: formulário */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Tipo de trabalho */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tipo de Trabalho (opcional)</div>

            {/* Categorias */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: selectedCat ? 12 : 0 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCat(selectedCat === cat.id ? null : cat.id); setSelectedType(''); }}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    border: `1px solid ${selectedCat === cat.id ? '#0081f0' : 'var(--border)'}`,
                    background: selectedCat === cat.id ? '#eff6ff' : 'transparent',
                    color: selectedCat === cat.id ? '#0081f0' : 'var(--text-muted)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {selectedCat && tiposDaCategoria.length > 0 && (
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                style={{ ...inp, marginTop: 4 }}
              >
                <option value="">Selecione o tipo...</option>
                {tiposDaCategoria.map(([key, t]) => (
                  <option key={key} value={key}>{t.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* Exercício */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exercício</div>
            <input
              placeholder="Nome do exercício *"
              value={exerciseName}
              onChange={e => setExerciseName(e.target.value)}
              style={{ ...inp, marginBottom: 10 }}
            />
            <textarea
              placeholder="Descrição ou enunciado do exercício (opcional)"
              value={exerciseContext}
              onChange={e => setExerciseContext(e.target.value)}
              rows={3}
              style={{ ...inp, resize: 'vertical' }}
            />
          </div>

          {/* Critérios */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Critérios de Avaliação</div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 5 }}>
              <InfoIcon /> Teste diferentes critérios e pesos para refinar sua rubrica
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {criteria.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    placeholder={`Critério ${i + 1}`}
                    value={c.name}
                    onChange={e => updateCriterio(i, 'name', e.target.value)}
                    style={{ ...inp, flex: 1 }}
                  />
                  <select
                    value={c.weight}
                    onChange={e => updateCriterio(i, 'weight', Number(e.target.value))}
                    style={{ ...inp, width: 80, flexShrink: 0 }}
                    title="Peso"
                  >
                    {PESOS.map(p => <option key={p} value={p}>×{p}</option>)}
                  </select>
                  {criteria.length > 1 && (
                    <button
                      onClick={() => removeCriterio(i)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-sub)', padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                      title="Remover critério"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addCriterio}
              style={{
                marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
                background: 'transparent', border: '1px dashed var(--border)', borderRadius: 8,
                padding: '7px 14px', fontSize: 13, color: 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'inherit', width: '100%', justifyContent: 'center',
              }}
            >
              <PlusIcon /> Adicionar critério
            </button>
          </div>

          {/* Tom */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tom do Feedback</div>
            <select value={tone} onChange={e => setTone(e.target.value)} style={inp}>
              {TONES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Trabalho do aluno */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trabalho do Aluno (texto)</div>
            <div style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 12 }}>
              Cole aqui um exemplo de trabalho para testar o resultado da sua rubrica
            </div>
            <textarea
              placeholder="Cole o texto do trabalho aqui..."
              value={studentWork}
              onChange={e => setStudentWork(e.target.value)}
              rows={8}
              style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleTestar}
            disabled={loading || quotaTestes === 0}
            style={{
              padding: '13px 24px',
              background: loading || quotaTestes === 0
                ? 'var(--border)'
                : 'linear-gradient(135deg, #d97706, #b45309)',
              color: loading || quotaTestes === 0 ? 'var(--text-muted)' : 'white',
              border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
              cursor: loading || quotaTestes === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity .15s',
            }}
          >
            {loading ? <><SpinnerIcon /> Avaliando...</> : quotaTestes === 0 ? 'Sem testes disponíveis este mês' : <><FlaskIcon /> Testar Prompt</>}
          </button>
        </div>

        {/* Coluna direita: resultados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {resultados.length === 0 && !loading && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12,
              padding: '48px 24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>Nenhum teste ainda</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Configure os critérios e cole o trabalho do aluno para ver como a IA avalia com sua rubrica. Você pode rodar até 10 testes por mês.
              </div>
            </div>
          )}

          {loading && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 12,
              padding: '48px 24px', textAlign: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#d97706', fontSize: 14, fontWeight: 500 }}>
                <SpinnerIcon /> Avaliando com sua rubrica...
              </div>
            </div>
          )}

          {resultados.length > 0 && (
            <>
              {resultados.length === 2 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                    {modoComparacao ? 'Comparando 2 versões' : 'Resultado mais recente'}
                  </div>
                  <button
                    onClick={() => setModoComparacao(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 8,
                      background: modoComparacao ? '#eff6ff' : 'var(--bg-card)',
                      color: modoComparacao ? '#0081f0' : 'var(--text-muted)',
                      fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <CompareIcon /> {modoComparacao ? 'Ver só o último' : 'Comparar versões'}
                  </button>
                </div>
              )}

              {modoComparacao && resultados.length === 2 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0081f0', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mais Recente</div>
                    <ResultadoTeste resultado={resultados[0]} label="Versão B" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Anterior</div>
                    <ResultadoTeste resultado={resultados[1]} label="Versão A" />
                  </div>
                </div>
              ) : (
                <ResultadoTeste resultado={resultados[0]} label="Resultado do Teste" />
              )}

              {resultados.length === 1 && (
                <div style={{ fontSize: 12, color: 'var(--text-sub)', textAlign: 'center' }}>
                  Rode outro teste para comparar duas versões de critérios lado a lado
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .testar-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppLayout>
  );
}
