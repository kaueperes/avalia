import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { PLANS, TYPES } from '@/lib/types';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada. Adicione sua chave no arquivo .env.local.' }, { status: 503 });
  }

  const { data: dbUser } = await supabase.from('users').select('plan, quota_relatorios_ciclo, quota_relatorios_extra').eq('id', user.userId).single();
  const plan = PLANS[dbUser?.plan] || PLANS.gratuito;
  if (!plan.features.relatorioTurma) {
    return NextResponse.json({ error: 'Relatórios de turma não estão disponíveis no seu plano. Faça upgrade para acessar.' }, { status: 402 });
  }

  // Quota check
  const relCiclo = typeof dbUser?.quota_relatorios_ciclo === 'number' ? dbUser.quota_relatorios_ciclo : null;
  const relExtra = typeof dbUser?.quota_relatorios_extra === 'number' ? dbUser.quota_relatorios_extra : null;
  if (relCiclo !== null && relCiclo <= 0 && (relExtra === null || relExtra <= 0)) {
    return NextResponse.json({ error: 'Você não tem relatórios disponíveis. Adquira mais para continuar.' }, { status: 402 });
  }

  const { evaluations, turma, exerciseName } = await request.json();
  const institution = evaluations[0]?.institution || '';
  const profileName = evaluations[0]?.profileName || '';
  const disciplina = evaluations[0]?.disciplina || '';
  const tipoTrabalho = TYPES[evaluations[0]?.type]?.label || '';
  if (!evaluations || evaluations.length === 0) {
    return NextResponse.json({ error: 'Nenhuma avaliação para analisar.' }, { status: 400 });
  }

  // Detect single vs multi-activity
  const uniqueExercises = [...new Set(evaluations.map(e => (e.exerciseName || '').trim()).filter(Boolean))];
  const isMultiActivity = uniqueExercises.length >= 2;

  // Common: criteria aggregation across all evals
  const criteriaMap = {};
  for (const e of evaluations) {
    for (const c of (e.criteria || [])) {
      if (!criteriaMap[c.name]) criteriaMap[c.name] = { total: 0, count: 0 };
      criteriaMap[c.name].total += c.score || 0;
      criteriaMap[c.name].count += 1;
    }
  }
  const criteriaAvg = Object.entries(criteriaMap)
    .map(([name, d]) => ({ name, avg: parseFloat((d.total / d.count).toFixed(1)) }))
    .sort((a, b) => b.avg - a.avg);

  const avgScore = (evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length).toFixed(1);
  const passing = evaluations.filter(e => e.score >= 6).length;

  let stats;

  if (isMultiActivity) {
    // ── Multi-activity: evolution template ──────────────────────────────────────
    const exerciseGroups = {};
    for (const e of evaluations) {
      const name = (e.exerciseName || 'Exercício').trim();
      if (!exerciseGroups[name]) exerciseGroups[name] = [];
      exerciseGroups[name].push(e);
    }

    // Sort activities by earliest evaluation date for that activity
    const atividades = Object.entries(exerciseGroups).map(([name, evals]) => {
      const minDate = Math.min(...evals.map(e => new Date(e.createdAt).getTime()));
      const media = parseFloat((evals.reduce((s, e) => s + e.score, 0) / evals.length).toFixed(1));
      return { exerciseName: name, date: new Date(minDate).toISOString(), media, total: evals.length };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    // For each student, gather score per activity (take most recent if duplicates)
    const studentNames = [...new Set(evaluations.map(e => e.studentName))];
    const alunos = studentNames.map(studentName => {
      const scores = atividades.map(a => {
        const matches = exerciseGroups[a.exerciseName].filter(e => e.studentName === studentName);
        if (!matches.length) return null;
        matches.sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt));
        return matches[0].score;
      });
      const valid = scores.filter(s => s !== null);
      return {
        studentName,
        scores,
        scorePrimeiro: valid.length > 0 ? valid[0] : null,
        scoreUltimo: valid.length > 0 ? valid[valid.length - 1] : null,
        evolucao: valid.length >= 2 ? parseFloat((valid[valid.length - 1] - valid[0]).toFixed(1)) : 0,
      };
    }).sort((a, b) => (b.scoreUltimo ?? -1) - (a.scoreUltimo ?? -1));

    // Last activity stats
    const lastActivity = atividades[atividades.length - 1];
    const lastEvals = exerciseGroups[lastActivity.exerciseName];
    const lastAprovados = lastEvals.filter(e => e.score >= 6).length;

    const lastCriteriaMap = {};
    for (const e of lastEvals) {
      for (const c of (e.criteria || [])) {
        if (!lastCriteriaMap[c.name]) lastCriteriaMap[c.name] = { total: 0, count: 0 };
        lastCriteriaMap[c.name].total += c.score || 0;
        lastCriteriaMap[c.name].count += 1;
      }
    }
    const criteriaRecente = Object.entries(lastCriteriaMap)
      .map(([name, d]) => ({ name, avg: parseFloat((d.total / d.count).toFixed(1)) }))
      .sort((a, b) => b.avg - a.avg);

    const distribuicao = [
      { label: '0–4', count: lastEvals.filter(e => e.score < 5).length },
      { label: '5–6', count: lastEvals.filter(e => e.score >= 5 && e.score < 7).length },
      { label: '7–8', count: lastEvals.filter(e => e.score >= 7 && e.score < 9).length },
      { label: '9–10', count: lastEvals.filter(e => e.score >= 9).length },
    ];

    stats = {
      reportTemplate: 'turma-evolucao',
      total: studentNames.length,
      atividades,
      alunos,
      mediaInicial: atividades[0].media,
      mediaAtual: atividades[atividades.length - 1].media,
      aprovados: lastAprovados,
      melhorNota: parseFloat(Math.max(...lastEvals.map(e => e.score)).toFixed(1)),
      piorNota: parseFloat(Math.min(...lastEvals.map(e => e.score)).toFixed(1)),
      distribuicao,
      criteriaAverages: criteriaAvg,
      criteriaRecente,
    };
  } else {
    // ── Single activity: standard turma template ─────────────────────────────
    stats = {
      reportTemplate: 'turma',
      total: evaluations.length,
      media: parseFloat(avgScore),
      aprovados: passing,
      melhorNota: parseFloat(Math.max(...evaluations.map(e => e.score)).toFixed(1)),
      piorNota: parseFloat(Math.min(...evaluations.map(e => e.score)).toFixed(1)),
      distribuicao: [
        { label: '0–4', count: evaluations.filter(e => e.score < 5).length },
        { label: '5–6', count: evaluations.filter(e => e.score >= 5 && e.score < 7).length },
        { label: '7–8', count: evaluations.filter(e => e.score >= 7 && e.score < 9).length },
        { label: '9–10', count: evaluations.filter(e => e.score >= 9).length },
      ],
      criteriaAverages: criteriaAvg,
      alunos: evaluations
        .map(e => ({ studentName: e.studentName, score: e.score }))
        .sort((a, b) => b.score - a.score),
    };
  }

  const criteriaText = criteriaAvg.length > 0
    ? criteriaAvg.map(c => `- ${c.name}: média ${c.avg}`).join('\n')
    : '(sem critérios detalhados)';

  const studentLines = evaluations.map(e =>
    `• ${e.studentName}: nota ${e.score.toFixed(1)}${e.exerciseName ? `, exercício "${e.exerciseName}"` : ''}`
  ).join('\n');

  const context = [
    institution ? `Instituição: ${institution}` : null,
    profileName ? `Professor(a): ${profileName}` : null,
    turma ? `Turma: ${turma}` : null,
    exerciseName ? `Exercício filtrado: ${exerciseName}` : null,
    isMultiActivity ? `Análise evolutiva: ${stats.atividades?.length} atividades` : null,
  ].filter(Boolean).join(' | ');

  const prompt = `Você é um assistente pedagógico especialista em educação. Analise o desempenho desta turma com base nas avaliações abaixo e forneça uma análise pedagógica construtiva.

${context ? `Contexto: ${context}\n` : ''}Total de alunos avaliados: ${evaluations.length}
Média da turma: ${avgScore}
Aprovados (nota ≥ 6): ${passing} de ${evaluations.length}

Desempenho por critério:
${criteriaText}

Notas individuais:
${studentLines}

Responda APENAS com um JSON válido neste formato exato (sem markdown, sem texto fora do JSON):
{
  "resumo": "2-3 frases resumindo o desempenho geral da turma",
  "pontosFortes": ["ponto forte 1", "ponto forte 2", "ponto forte 3"],
  "pontosAtencao": ["ponto de atenção 1", "ponto de atenção 2", "ponto de atenção 3"],
  "analiseDetalhada": "Parágrafo com análise mais profunda dos padrões observados",
  "sugestoes": [
    { "titulo": "Nome da atividade/estratégia", "descricao": "O que fazer e como fazer", "impacto": "Por que isso vai ajudar" },
    { "titulo": "...", "descricao": "...", "impacto": "..." },
    { "titulo": "...", "descricao": "...", "impacto": "..." }
  ]
}`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Resposta inválida da IA. Tente novamente.' }, { status: 500 });

    const analysis = JSON.parse(jsonMatch[0]);

    // Decrement quota
    if (relCiclo !== null && relCiclo > 0) {
      await supabase.from('users').update({ quota_relatorios_ciclo: relCiclo - 1 }).eq('id', user.userId);
    } else if (relExtra !== null && relExtra > 0) {
      await supabase.from('users').update({ quota_relatorios_extra: relExtra - 1 }).eq('id', user.userId);
    }

    // Save report
    await supabase.from('reports').insert({
      user_id: user.userId,
      type: 'turma',
      subject: '',
      turma: turma || '',
      exercise_name: isMultiActivity ? '' : (exerciseName || evaluations[0]?.exerciseName || ''),
      institution: institution,
      profile_name: profileName,
      content: { ...analysis, disciplina, tipoTrabalho, stats },
    });

    return NextResponse.json({ ...analysis, disciplina, tipoTrabalho, stats });
  } catch (err) {
    console.error('analyze-class error:', err);
    return NextResponse.json({ error: 'Erro ao chamar a IA. Verifique sua chave ANTHROPIC_API_KEY.' }, { status: 500 });
  }
}
