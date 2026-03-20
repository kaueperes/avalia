import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TYPES, TONES } from '@/lib/types';
import { supabase } from '@/lib/supabase';

// Selects the model based on evaluation complexity to balance quality and cost.
// Returns { model, maxTokens }
function selectModel({ studentWork, criteria, writingSample, exerciseContext, tone }) {
  let complexity = 0;

  // Long student work requires more careful reading
  const workLen = (studentWork || '').length;
  if (workLen > 2000) complexity += 2;
  else if (workLen > 700) complexity += 1;

  // More criteria = heavier evaluation
  const numCriteria = (criteria || []).length;
  if (numCriteria > 5) complexity += 2;
  else if (numCriteria > 3) complexity += 1;

  // Style imitation demands higher reasoning capability
  if (writingSample) complexity += 2;

  // Detailed exercise description
  if ((exerciseContext || '').length > 400) complexity += 1;

  // Tones that require elaborate, well-structured feedback
  if (['rigoroso', 'didatico', 'formal'].includes(tone)) complexity += 1;

  return complexity >= 4
    ? { model: 'claude-sonnet-4-6', maxTokens: 1800 }
    : { model: 'claude-haiku-4-5-20251001', maxTokens: 1200 };
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada.' }, { status: 503 });
  }

  // Quota enforcement: check and decrement before calling AI
  const { data: dbUser, error: dbErr } = await supabase
    .from('users')
    .select('quota_ciclo, quota_extra')
    .eq('id', user.userId)
    .single();

  if (!dbErr && dbUser) {
    const ciclo = typeof dbUser.quota_ciclo === 'number' ? dbUser.quota_ciclo : null;
    const extra = typeof dbUser.quota_extra === 'number' ? dbUser.quota_extra : null;
    // Only block if quota fields exist and both are zero
    if (ciclo !== null && ciclo <= 0 && (extra === null || extra <= 0)) {
      return NextResponse.json({ error: 'Você não tem avaliações disponíveis. Adquira mais para continuar.' }, { status: 402 });
    }
  }

  const { type, exerciseName, exerciseContext, criteria, studentName, studentWork, tone, profName, profDisc, writingSample, images, referenceWeight } = await request.json();

  if (!exerciseName || !criteria?.length) {
    return NextResponse.json({ error: 'Exercício e critérios são obrigatórios.' }, { status: 400 });
  }

  const typeLabel = TYPES[type]?.label || type;
  const toneObj = TONES.find(t => t.id === tone);
  const toneDesc = toneObj ? `${toneObj.label} — ${toneObj.desc}` : 'Neutro';

  const criteriaList = criteria.map(c => `- ${c.name} (peso: ${c.weight}x)`).join('\n');

  const writingNote = writingSample
    ? `\nEstilo de escrita para imitar (escreva o feedback imitando este estilo):\n"${writingSample.substring(0, 600)}"\n`
    : '';

  const prompt = `Você é ${profName ? `o professor ${profName}` : 'um professor experiente'}${profDisc ? ` de ${profDisc}` : ''}, avaliando o trabalho de um aluno.

Tipo de trabalho: ${typeLabel}
Exercício: "${exerciseName}"${exerciseContext ? `\nDescrição do exercício:\n${exerciseContext}` : ''}

Aluno: ${studentName || 'Aluno'}
${studentWork ? `Trabalho do aluno:\n${studentWork}` : '(Nenhum trabalho fornecido — avalie com base no enunciado e nos critérios)'}

Critérios de avaliação (com peso):
${criteriaList}
${writingNote}
Tom do feedback: ${toneDesc}

Avalie o trabalho e responda APENAS com JSON válido (sem markdown, sem texto fora do JSON):
{
  "criteriaScores": [
    {"name": "nome exato do critério", "score": 7.5, "weight": 2},
    ...
  ],
  "feedback": "Texto completo do feedback em português, no tom especificado"
}

Contexto importante: este é um trabalho acadêmico de um aluno em formação. As notas devem refletir o desempenho esperado para o nível de aprendizado, não um padrão profissional.

Para calcular a nota de cada critério, parta de 10.0 e deduza somente por problemas concretos e identificáveis:
- Ausência completa ou falha que inviabiliza totalmente o critério: -2.0 a -3.0
- Problema claro que compromete parcialmente o critério: -0.5 a -1.5
- Erro pontual e específico (não uma sugestão de melhoria): -0.1 a -0.4
- Sem problema concreto identificado: 10.0 — não invente deduções

IMPORTANTE: 10.0 significa que o critério foi atendido — não significa "perfeição absoluta". Se o trabalho cumpre o critério, a nota é 10.0. Só deduza se conseguir apontar um erro específico, não uma vaga "área de melhoria". Aplique no máximo UMA dedução por problema. Na dúvida, escolha sempre a nota maior.

Regras:
- Notas de 0.0 a 10.0 (uma casa decimal)
- Não penalize estilo pessoal, escolhas subjetivas, formatação diferente do esperado ou desvios que não comprometem o critério
- O feedback deve ser escrito em português brasileiro
- Os nomes dos critérios devem ser exatamente iguais aos fornecidos
- Seja específico, construtivo e alinhado ao tom solicitado
- Se não houver trabalho do aluno, ainda assim gere uma avaliação contextualizada${images?.length > 0 ? `\n- Os arquivos enviados estão identificados com rótulos: "Trabalho do aluno" = produção do aluno a ser avaliada; "Referência do aluno" = material consultado pelo aluno como inspiração/fonte (use como contexto, mas NÃO avalie como produção dele); "Referência para Correção" = gabarito interno do professor (use apenas para calibrar a avaliação — NUNCA mencione, cite ou faça referência ao gabarito no feedback); "Arquivo adicional" = contexto extra
- Peso do gabarito na correção: ${{ livre: 'REFERÊNCIA LIVRE — use o gabarito apenas como orientação geral; valorize criatividade e interpretações pessoais', parcial: 'PARCIAL — considere o gabarito como base, mas aceite variações e soluções alternativas coerentes', estrito: 'ESTRITO — o aluno deve seguir o gabarito de perto; penalize desvios significativos' }[referenceWeight] || 'PARCIAL — considere o gabarito como base, mas aceite variações e soluções alternativas coerentes'}
- O gabarito é uma ferramenta interna do professor. Jamais mencione sua existência no feedback ao aluno` : ''}`;

  try {
    const hasVideoOrAudio = images?.some(img =>
      img.mediaType?.startsWith('video/') || img.mediaType?.startsWith('audio/')
    );

    let parsed;

    if (hasVideoOrAudio) {
      // Route to Gemini for video/audio evaluation
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: 'GEMINI_API_KEY não configurada.' }, { status: 503 });
      }
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const parts = [
        { text: prompt },
        ...images.flatMap(img => [
          { text: img.label || 'Arquivo:' },
          { inlineData: { mimeType: img.mediaType, data: img.data } },
        ]),
      ];

      const result = await geminiModel.generateContent(parts);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return NextResponse.json({ error: 'Resposta inválida da IA. Tente novamente.' }, { status: 500 });
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      // Use Sonnet when images are present (better vision quality); otherwise use adaptive selection
      const { model, maxTokens } = images?.length > 0
        ? { model: 'claude-sonnet-4-6', maxTokens: 1800 }
        : selectModel({ studentWork, criteria, writingSample, exerciseContext, tone });

      // Build message content: text prompt + vision blocks if images present
      // Each image is preceded by a text label so the AI knows what it represents
      const messageContent = images?.length > 0
        ? [
            { type: 'text', text: prompt },
            ...images.flatMap(img => [
              { type: 'text', text: img.label || 'Imagem:' },
              { type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.data } },
            ]),
          ]
        : prompt;

      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const message = await client.messages.create({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: messageContent }],
      });

      const text = message.content[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return NextResponse.json({ error: 'Resposta inválida da IA. Tente novamente.' }, { status: 500 });
      parsed = JSON.parse(jsonMatch[0]);
    }

    // Calculate weighted score
    const totalWeight = (parsed.criteriaScores || []).reduce((s, c) => s + (c.weight || 1), 0);
    const weightedSum = (parsed.criteriaScores || []).reduce((s, c) => s + (c.score || 0) * (c.weight || 1), 0);
    const score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

    // Decrement quota in Supabase
    if (!dbErr && dbUser) {
      const ciclo = typeof dbUser.quota_ciclo === 'number' ? dbUser.quota_ciclo : null;
      const extra = typeof dbUser.quota_extra === 'number' ? dbUser.quota_extra : null;
      if (ciclo !== null && ciclo > 0) {
        await supabase.from('users').update({ quota_ciclo: ciclo - 1 }).eq('id', user.userId);
      } else if (extra !== null && extra > 0) {
        await supabase.from('users').update({ quota_extra: extra - 1 }).eq('id', user.userId);
      }
    }

    return NextResponse.json({ score, criteriaScores: parsed.criteriaScores, feedback: parsed.feedback });
  } catch (err) {
    console.error('evaluate error:', err);
    return NextResponse.json({ error: 'Erro ao chamar a IA. Tente novamente.' }, { status: 500 });
  }
}
