import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/types';
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
  if (!evaluations || evaluations.length === 0) {
    return NextResponse.json({ error: 'Nenhuma avaliação para analisar.' }, { status: 400 });
  }

  // Build summary for Claude
  const avgScore = (evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length).toFixed(1);
  const passing = evaluations.filter(e => e.score >= 5).length;

  // Criteria aggregation
  const criteriaMap = {};
  for (const e of evaluations) {
    for (const c of (e.criteria || [])) {
      if (!criteriaMap[c.name]) criteriaMap[c.name] = { total: 0, count: 0 };
      criteriaMap[c.name].total += c.score || 0;
      criteriaMap[c.name].count += 1;
    }
  }
  const criteriaAvg = Object.entries(criteriaMap).map(([name, d]) => ({
    name,
    avg: (d.total / d.count).toFixed(1),
  })).sort((a, b) => b.avg - a.avg);

  const criteriaText = criteriaAvg.length > 0
    ? criteriaAvg.map(c => `- ${c.name}: média ${c.avg}`).join('\n')
    : '(sem critérios detalhados)';

  const studentLines = evaluations.map(e =>
    `• ${e.studentName}: nota ${e.score.toFixed(1)}${e.exerciseName ? `, exercício "${e.exerciseName}"` : ''}`
  ).join('\n');

  const context = [
    turma ? `Turma: ${turma}` : null,
    exerciseName ? `Exercício filtrado: ${exerciseName}` : null,
  ].filter(Boolean).join(' | ');

  const prompt = `Você é um assistente pedagógico especialista em educação. Analise o desempenho desta turma com base nas avaliações abaixo e forneça uma análise pedagógica construtiva.

${context ? `Contexto: ${context}\n` : ''}Total de alunos avaliados: ${evaluations.length}
Média da turma: ${avgScore}
Aprovados (nota ≥ 5): ${passing} de ${evaluations.length}

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
    // Extract JSON (in case the model wraps it in code blocks)
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
      exercise_name: exerciseName || '',
      content: analysis,
    });

    return NextResponse.json(analysis);
  } catch (err) {
    console.error('analyze-class error:', err);
    return NextResponse.json({ error: 'Erro ao chamar a IA. Verifique sua chave ANTHROPIC_API_KEY.' }, { status: 500 });
  }
}
