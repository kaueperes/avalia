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
  if (!plan.features.relatorioAluno) {
    return NextResponse.json({ error: 'Relatórios individuais de aluno não estão disponíveis no seu plano. Faça upgrade para acessar.' }, { status: 402 });
  }

  // Quota check
  const relCiclo = typeof dbUser?.quota_relatorios_ciclo === 'number' ? dbUser.quota_relatorios_ciclo : null;
  const relExtra = typeof dbUser?.quota_relatorios_extra === 'number' ? dbUser.quota_relatorios_extra : null;
  if (relCiclo !== null && relCiclo <= 0 && (relExtra === null || relExtra <= 0)) {
    return NextResponse.json({ error: 'Você não tem relatórios disponíveis. Adquira mais para continuar.' }, { status: 402 });
  }

  const { evaluations, studentName } = await request.json();
  if (!evaluations || evaluations.length === 0) {
    return NextResponse.json({ error: 'Nenhuma avaliação para analisar.' }, { status: 400 });
  }

  const sorted = evaluations.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const evalLines = sorted.map((e, i) => {
    const criteriaText = (e.criteria || []).map(c => `    - ${c.name}: ${c.score?.toFixed(1) ?? '?'}`).join('\n');
    return `Avaliação ${i + 1} (${new Date(e.createdAt).toLocaleDateString('pt-BR')}):\n  Exercício: ${e.exerciseName || 'sem nome'}\n  Tipo: ${e.type}\n  Nota: ${e.score.toFixed(1)}\n${criteriaText ? `  Critérios:\n${criteriaText}` : ''}${e.feedback ? `\n  Feedback: ${e.feedback.substring(0, 300)}${e.feedback.length > 300 ? '...' : ''}` : ''}`;
  }).join('\n\n');

  const avgScore = (sorted.reduce((s, e) => s + e.score, 0) / sorted.length).toFixed(1);
  const trend = sorted.length > 1
    ? (sorted[sorted.length - 1].score > sorted[0].score ? 'crescente' : sorted[sorted.length - 1].score < sorted[0].score ? 'decrescente' : 'estável')
    : 'única avaliação';

  const prompt = `Você é um assistente pedagógico especialista em educação. Analise o histórico individual de avaliações do aluno abaixo e gere um parecer pedagógico formal e construtivo.

Aluno: ${studentName}
Total de avaliações: ${sorted.length}
Média geral: ${avgScore}
Tendência: ${trend}

Histórico completo:
${evalLines}

Responda APENAS com um JSON válido neste formato exato (sem markdown, sem texto fora do JSON):
{
  "resumo": "2-3 frases descrevendo o desempenho geral e evolução do aluno",
  "evolucao": true,
  "pontosFortes": ["ponto forte 1", "ponto forte 2", "ponto forte 3"],
  "pontosDesenvolver": ["ponto a desenvolver 1", "ponto a desenvolver 2", "ponto a desenvolver 3"],
  "parecer": "Parágrafo formal de parecer pedagógico, como um professor escreveria em um relatório oficial. Tom profissional e construtivo. Mencione a evolução das notas, padrões observados e recomendações específicas para o aluno."
}`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
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

    return NextResponse.json(analysis);
  } catch (err) {
    console.error('analyze-student error:', err);
    return NextResponse.json({ error: 'Erro ao chamar a IA. Verifique sua chave ANTHROPIC_API_KEY.' }, { status: 500 });
  }
}
