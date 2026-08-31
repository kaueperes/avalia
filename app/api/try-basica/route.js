import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

// Correção rápida ANÔNIMA usada pela landing /experimente — mesmo prompt e
// cascata Gemini→Claude da Avaliação Básica, mas sem auth, sem cota de usuário,
// sem persistência do trabalho. Só aceita 1 aluno (texto colado e/ou 1 foto
// inline em base64, sem o pipeline de storage que exige login).

export const maxDuration = 60;

const RATE_LIMIT = 3;                       // testes por IP na janela
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
const MAX_TEXT = 8000;                      // caracteres do trabalho / contexto
const MAX_IMAGE_B64 = 5_600_000;           // ~4 MB decodificado (abaixo do teto de 4,5 MB do Vercel)

function getIp(request) {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function detectImageMediaType(base64Data) {
  if (base64Data.startsWith('iVBOR')) return 'image/png';
  if (base64Data.startsWith('/9j/'))  return 'image/jpeg';
  if (base64Data.startsWith('R0lG'))  return 'image/gif';
  if (base64Data.startsWith('UklG'))  return 'image/webp';
  return null;
}

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

async function callGemini(promptText, images, model = 'gemini-2.5-flash') {
  if (!process.env.GEMINI_API_KEY) throw new Error('no_gemini_key');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const parts = [{ text: promptText }];
  for (const img of (images || [])) {
    parts.push({ text: img.label || 'Prova do aluno:' });
    parts.push({ inlineData: { mimeType: img.mediaType, data: img.data } });
  }
  const result = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts }],
    config: { temperature: 0.2, responseMimeType: 'application/json' },
  });
  return parseJson(result.text);
}

async function callClaude(promptText, images) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('no_anthropic_key');
  const messageContent = images?.length > 0
    ? [
        { type: 'text', text: promptText },
        ...images.flatMap(img => [
          { type: 'text', text: img.label || 'Prova do aluno:' },
          { type: 'image', source: { type: 'base64', media_type: detectImageMediaType(img.data) || img.mediaType, data: img.data } },
        ]),
      ]
    : promptText;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    temperature: 0.2,
    messages: [{ role: 'user', content: messageContent }],
  });
  return parseJson(message.content[0]?.text || '');
}

export async function POST(request) {
  if (!process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Serviço de correção indisponível no momento.' }, { status: 503 });
  }

  const ip = getIp(request);

  // ── Rate limit leve por IP (fail-open se o banco falhar) ────────────────────
  try {
    const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const { count, error } = await supabase
      .from('demo_trials')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', since);
    if (!error && typeof count === 'number' && count >= RATE_LIMIT) {
      return NextResponse.json({
        error: 'rate_limit',
        message: 'Você já testou 3 vezes hoje. Crie uma conta grátis para continuar avaliando sem limite.',
      }, { status: 429 });
    }
  } catch (e) {
    Sentry.captureException(e);
  }

  let body;
  try { body = await request.json(); } catch { body = {}; }
  let { context, studentWork, image } = body;

  if (typeof studentWork === 'string' && studentWork.length > MAX_TEXT) studentWork = studentWork.slice(0, MAX_TEXT);
  if (typeof context === 'string' && context.length > MAX_TEXT) context = context.slice(0, MAX_TEXT);

  let imageData = null, imageMediaType = null;
  if (image?.data) {
    imageData = String(image.data).replace(/^data:[^;]+;base64,/, '');
    imageMediaType = image.mediaType || detectImageMediaType(imageData) || 'image/jpeg';
    if (imageData.length > MAX_IMAGE_B64) {
      return NextResponse.json({ error: 'A imagem é muito grande. Envie uma foto de até 4 MB.' }, { status: 413 });
    }
  }

  if (!studentWork && !imageData) {
    return NextResponse.json({ error: 'Envie uma foto ou o texto da prova.' }, { status: 400 });
  }

  const prompt = `Você é um professor corrigindo rapidamente uma prova escolar (matemática, português, ou outra matéria de conteúdo objetivo), para o professor escrever o resultado direto na prova do aluno.

${context ? `Contexto/gabarito fornecido pelo professor:\n${context}\n` : ''}
${studentWork ? `Prova do aluno (texto):\n${studentWork}\n` : 'Prova do aluno: veja a imagem anexada identificada como "Prova do aluno".'}

Analise questão por questão e responda APENAS com JSON válido (sem markdown, sem texto fora do JSON):
{
  "items": [
    {"question": "identificação da questão (ex: '1', '2a')", "status": "certo" | "errado" | "incerto", "comment": "explicação curta e direta do que está certo, o que errou, ou por que você não tem certeza"}
  ],
  "summary": "resumo geral em 1-2 frases",
  "suggestedScore": "nota sugerida no formato 'X/10' ou null se não for possível calcular"
}

Regras importantes:
- Para questões objetivas (cálculo, resposta numérica, múltipla escolha), você mesmo pode resolver e verificar a resposta do aluno — não precisa de gabarito para isso
- Para questões que dependem do que foi especificamente ensinado em aula ou de um livro didático (datas, definições, interpretação de texto sem gabarito claro), e nenhum contexto/gabarito foi fornecido: marque "status": "incerto" e explique no comment que a resposta esperada depende do que foi ensinado em aula — não afirme com confiança total
- Seja direto e objetivo nos comentários — o professor vai escrever isso rapidamente na prova
- Responda em português brasileiro`;

  try {
    let parsed;
    const images = imageData ? [{ data: imageData, mediaType: imageMediaType, label: 'Prova do aluno:' }] : null;

    try {
      const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.5-flash'];
      let lastGeminiErr;
      for (let m = 0; m < geminiModels.length; m++) {
        try {
          parsed = await callGemini(prompt, images, geminiModels[m]);
          lastGeminiErr = null;
          break;
        } catch (err) {
          const isCascadable = err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE')
            || err?.message?.includes('404') || err?.message?.includes('NOT_FOUND')
            || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED');
          if (!isCascadable) throw err;
          lastGeminiErr = err;
        }
      }
      if (lastGeminiErr) throw lastGeminiErr;
    } catch (geminiErr) {
      console.error('try-basica Gemini failed:', geminiErr?.message);
      parsed = await callClaude(prompt, images);
    }

    // Registra o uso pra contagem de rate limit (fail-open)
    try {
      await supabase.from('demo_trials').insert({ ip });
    } catch (e) {
      Sentry.captureException(e);
    }

    return NextResponse.json({
      items: parsed.items || [],
      summary: parsed.summary || '',
      suggestedScore: parsed.suggestedScore || null,
    });
  } catch (err) {
    Sentry.captureException(err);
    console.error('try-basica error:', err?.message || err);
    if (err?.status === 529 || err?.error?.type === 'overloaded_error') {
      return NextResponse.json({ error: 'Os servidores estão sobrecarregados no momento. Aguarde alguns segundos e tente novamente.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Ocorreu um erro nos servidores. Tente novamente.' }, { status: 500 });
  }
}
