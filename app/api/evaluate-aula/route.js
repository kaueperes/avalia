import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getUserFromRequest } from '@/lib/auth';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

export const maxDuration = 60;

const QUOTA_AULA_MENSAL = 10;

const TEMA_LABELS = {
  didatica: 'Didática (clareza da explicação, ritmo, verificação de entendimento)',
  conteudo: 'Conteúdo da aula (correção e profundidade do que foi ensinado)',
  dinamica: 'Dinâmica de aula (engajamento, participação, gestão do tempo)',
};

const TOM_INSTRUCOES = {
  encorajador: 'Use um tom encorajador e construtivo — celebre o que está bom antes de apontar o que pode melhorar, e trate os pontos de melhoria como oportunidades, não falhas.',
  direto: 'Use um tom direto e objetivo — vá reto ao ponto nos pontos fortes e nos pontos a desenvolver, sem suavizar demais, mas sempre respeitoso.',
};

function parseJson(text) {
  const candidates = [];
  let depth = 0, start = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') { if (depth === 0) start = i; depth++; }
    else if (text[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) { candidates.push(text.slice(start, i + 1)); start = -1; }
    }
  }
  if (!candidates.length) throw new Error('no_json');
  for (const candidate of candidates) {
    try { return JSON.parse(candidate); } catch {}
  }
  throw new Error('invalid_json');
}

async function callGemini(promptText, { fileUri, mimeType }, model) {
  if (!process.env.GEMINI_API_KEY) throw new Error('no_gemini_key');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const parts = [
    { text: promptText },
    { text: 'Áudio da aula:' },
    { fileData: { fileUri, mimeType } },
  ];
  const result = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts }],
    config: { temperature: 0.4, responseMimeType: 'application/json' },
  });
  return parseJson(result.text);
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tema = searchParams.get('tema');

  let query = supabase.from('class_evaluations').select('*').eq('user_id', user.userId).order('created_at', { ascending: false });
  if (tema) query = query.contains('temas', [tema]);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Erro ao buscar histórico.' }, { status: 500 });

  return NextResponse.json(data || []);
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada.' }, { status: 503 });
  }

  const { data: dbUser } = await supabase.from('users')
    .select('plan, quota_aula, quota_aula_reset_date, aula_trial_used')
    .eq('id', user.userId).single();

  const isGratuito = !dbUser?.plan || dbUser.plan === 'gratuito';

  if (isGratuito) {
    if (dbUser?.aula_trial_used) {
      return NextResponse.json({ error: 'Você já usou sua Avaliação de Aula gratuita. Faça upgrade de plano para continuar avaliando suas aulas.' }, { status: 402 });
    }
  } else {
    const resetDate = dbUser.quota_aula_reset_date ? new Date(dbUser.quota_aula_reset_date) : null;
    if (!dbUser.quota_aula_reset_date || (resetDate && resetDate < new Date())) {
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1);
      await supabase.from('users').update({
        quota_aula: QUOTA_AULA_MENSAL,
        quota_aula_reset_date: nextReset.toISOString(),
      }).eq('id', user.userId);
      dbUser.quota_aula = QUOTA_AULA_MENSAL;
    }
    const restante = typeof dbUser.quota_aula === 'number' ? dbUser.quota_aula : QUOTA_AULA_MENSAL;
    if (restante <= 0) {
      return NextResponse.json({ error: 'Você esgotou suas Avaliações de Aula este mês. Renova no próximo ciclo.' }, { status: 402 });
    }
  }

  const { temas, temaOutro, contexto, tom, fileUri, mimeType } = await request.json();

  if (!temas?.length || !contexto?.trim() || !fileUri || !mimeType) {
    return NextResponse.json({ error: 'Envie o áudio, o contexto e ao menos um tema pra avaliar.' }, { status: 400 });
  }

  const temaList = temas.map(t => TEMA_LABELS[t] || (t === 'outro' ? `Outro: ${temaOutro || ''}` : t)).join('; ');
  const tomInstrucao = TOM_INSTRUCOES[tom] || TOM_INSTRUCOES.encorajador;

  const prompt = `Você é um mentor pedagógico experiente, ouvindo o áudio de uma aula gravada por um professor que quer feedback sobre a própria prática — não sobre os alunos.

Contexto dado pelo professor (disciplina, conteúdo da aula, público, etc):
${contexto}

O professor quer feedback especificamente sobre: ${temaList}

${tomInstrucao}

Ouça o áudio e responda APENAS com JSON válido (sem markdown, sem texto fora do JSON):
{
  "pontosFortes": ["ponto forte 1", "ponto forte 2", "..."],
  "pontosDesenvolver": ["ponto a desenvolver 1", "ponto a desenvolver 2", "..."],
  "parecer": "parecer geral em 2-4 frases, conectando os pontos acima com o contexto da aula",
  "nivel": "um único rótulo qualitativo resumindo esta aula: 'Em desenvolvimento', 'Consistente' ou 'Destaque'"
}

Regras importantes:
- Foque exclusivamente no que o professor pediu (${temaList}) — não avalie os alunos, nem dê nota numérica pra ninguém
- Baseie-se só no que foi realmente dito/feito no áudio, sem presumir o que não deu pra ouvir
- Seja específico, cite momentos concretos da aula quando possível, em vez de generalidades
- Responda em português brasileiro`;

  try {
    let parsed;
    const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.5-flash'];
    let lastErr;
    for (let m = 0; m < geminiModels.length; m++) {
      try {
        parsed = await callGemini(prompt, { fileUri, mimeType }, geminiModels[m]);
        lastErr = null;
        break;
      } catch (err) {
        const isCascadable = err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE')
          || err?.message?.includes('404') || err?.message?.includes('NOT_FOUND')
          || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED');
        if (!isCascadable) { lastErr = err; break; }
        lastErr = err;
      }
    }
    if (lastErr) throw lastErr;

    const { data: saved, error: saveErr } = await supabase.from('class_evaluations').insert({
      user_id: user.userId,
      temas,
      tema_outro: temaOutro || null,
      contexto,
      tom: tom || 'encorajador',
      nivel: parsed.nivel || null,
      pontos_fortes: parsed.pontosFortes || [],
      pontos_desenvolver: parsed.pontosDesenvolver || [],
      parecer: parsed.parecer || '',
    }).select().single();

    if (saveErr) console.error('class_evaluations insert error:', saveErr.message);

    if (isGratuito) {
      await supabase.from('users').update({ aula_trial_used: true }).eq('id', user.userId);
    } else {
      const restante = typeof dbUser.quota_aula === 'number' ? dbUser.quota_aula : QUOTA_AULA_MENSAL;
      await supabase.from('users').update({ quota_aula: restante - 1 }).eq('id', user.userId);
    }

    return NextResponse.json(saved || { temas, contexto, tom, ...parsed });
  } catch (err) {
    Sentry.captureException(err);
    console.error('evaluate-aula error:', err?.message || err);
    return NextResponse.json({ error: 'Não foi possível processar o áudio no momento. Tente novamente em alguns instantes.' }, { status: 503 });
  }
}
