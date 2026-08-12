import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getUserFromRequest } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

export const maxDuration = 60;

const QUOTA_PROVAS_MENSAL = 10;

const QUESTION_TYPE_LABELS = {
  multipla: 'múltipla escolha',
  dissertativa: 'dissertativas',
  vf: 'verdadeiro ou falso',
  mista: 'mista (múltipla escolha, verdadeiro/falso e dissertativas)',
};

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada.' }, { status: 503 });
  }

  let dbUser = null, dbErr = null;
  try {
    const dbResult = await Promise.race([
      supabase.from('users').select('plan, quota_provas, quota_provas_reset_date').eq('id', user.userId).single(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('db_timeout')), 5000)),
    ]);
    dbUser = dbResult.data;
    dbErr = dbResult.error;
  } catch {
    // DB indisponível — deixa passar
  }

  if (!dbErr && dbUser) {
    if (!dbUser.plan || dbUser.plan === 'gratuito') {
      return NextResponse.json({ error: 'O Gerador de Provas está disponível a partir do plano Essencial.' }, { status: 402 });
    }

    const resetDate = dbUser.quota_provas_reset_date ? new Date(dbUser.quota_provas_reset_date) : null;
    if (resetDate && resetDate < new Date()) {
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1);
      await supabase.from('users').update({
        quota_provas: QUOTA_PROVAS_MENSAL,
        quota_provas_reset_date: nextReset.toISOString(),
      }).eq('id', user.userId);
      dbUser.quota_provas = QUOTA_PROVAS_MENSAL;
    }

    const provas = typeof dbUser.quota_provas === 'number' ? dbUser.quota_provas : 0;
    if (provas <= 0) {
      return NextResponse.json({ error: 'Você esgotou suas gerações de prova este mês. Renova no próximo ciclo mensal.' }, { status: 402 });
    }
  }

  const { discipline, topic, level, numQuestions, questionType, notes, includeAnswerKey } = await request.json();

  if (!discipline || !topic || !numQuestions) {
    return NextResponse.json({ error: 'Matéria, tema e número de questões são obrigatórios.' }, { status: 400 });
  }

  const typeLabel = QUESTION_TYPE_LABELS[questionType] || 'mista (múltipla escolha, verdadeiro/falso e dissertativas)';

  const prompt = `Você é um professor experiente criando uma prova escolar.

Matéria: ${discipline}
Tema/conteúdo: ${topic}
${level ? `Série/nível: ${level}\n` : ''}Quantidade de questões: ${numQuestions}
Tipo de questões: ${typeLabel}
${notes ? `Observações do professor:\n${notes}\n` : ''}
Gere o texto completo da prova, pronto para o professor copiar e colar. Regras:
- Numere as questões
- Para múltipla escolha, use alternativas de (a) a (e)
- Questões claras, objetivas e adequadas ao nível indicado
- Não inclua cabeçalho de "Nome/Data/Turma" nem instruções genéricas de prova — só as questões
- Escreva em português brasileiro
${includeAnswerKey ? '- Ao final, adicione uma seção "GABARITO" separada por uma linha "---", com a resposta certa de cada questão' : '- Não inclua gabarito ou respostas'}

Responda APENAS com o texto da prova (e gabarito, se solicitado), sem comentários adicionais antes ou depois.`;

  async function callGemini(promptText, model = 'gemini-2.5-flash') {
    if (!process.env.GEMINI_API_KEY) throw new Error('no_gemini_key');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: { temperature: 0.4 },
    });
    const text = result.text?.trim();
    if (!text) throw new Error('empty_response');
    return text;
  }

  async function callClaude(promptText) {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      temperature: 0.4,
      messages: [{ role: 'user', content: promptText }],
    });
    const text = message.content[0]?.text?.trim();
    if (!text) throw new Error('empty_response');
    return text;
  }

  try {
    let examText;
    const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.5-flash'];
    let lastGeminiErr;

    for (let m = 0; m < geminiModels.length; m++) {
      try {
        examText = await callGemini(prompt, geminiModels[m]);
        lastGeminiErr = null;
        break;
      } catch (err) {
        const isCascadable = err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE')
          || err?.message?.includes('404') || err?.message?.includes('NOT_FOUND')
          || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED');
        if (!isCascadable) { lastGeminiErr = err; break; }
        lastGeminiErr = err;
      }
    }

    if (lastGeminiErr) {
      console.error('Gemini failed, falling back to Claude:', lastGeminiErr?.message);
      examText = await callClaude(prompt);
    }

    let quotaRestante = null;
    if (!dbErr && dbUser) {
      const provas = typeof dbUser.quota_provas === 'number' ? dbUser.quota_provas : QUOTA_PROVAS_MENSAL;
      await supabase.from('users').update({ quota_provas: provas - 1 }).eq('id', user.userId);
      quotaRestante = Math.max(0, provas - 1);
    }

    return NextResponse.json({ examText, quotaProvasRestante: quotaRestante });
  } catch (err) {
    Sentry.captureException(err);
    console.error('generate-exam error:', err?.message || err);
    if (err?.status === 529 || err?.error?.type === 'overloaded_error') {
      return NextResponse.json({ error: 'Os servidores estão sobrecarregados no momento. Aguarde alguns segundos e tente novamente.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Ocorreu um erro ao gerar a prova. Tente novamente.' }, { status: 500 });
  }
}
