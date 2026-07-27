import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';

export const maxDuration = 60;

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada.' }, { status: 503 });
  }

  // Correção Básica consome a mesma cota de avaliações que a Avaliação Avançada.
  let dbUser = null, dbErr = null, orgData = null;
  try {
    const dbResult = await Promise.race([
      supabase.from('users').select('quota_ciclo, quota_extra, org_id, org_quota_limit, org_quota_used').eq('id', user.userId).single(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('db_timeout')), 5000)),
    ]);
    dbUser = dbResult.data;
    dbErr = dbResult.error;
  } catch {
    // DB indisponível — deixa passar
  }

  if (!dbErr && dbUser) {
    if (dbUser.org_id) {
      const { data: org } = await supabase.from('organizations').select('quota_pool, quota_used, active').eq('id', dbUser.org_id).single();
      orgData = org;
      if (org && !org.active) {
        return NextResponse.json({ error: 'Sua organização está inativa. Entre em contato com o administrador.' }, { status: 402 });
      }
      if (org && (org.quota_pool - org.quota_used) <= 0) {
        return NextResponse.json({ error: 'Sua instituição não tem avaliações disponíveis. Fale com o administrador.' }, { status: 402 });
      }
      if (dbUser.org_quota_limit != null && (dbUser.org_quota_used || 0) >= dbUser.org_quota_limit) {
        return NextResponse.json({ error: 'Você atingiu seu limite de avaliações nesta organização. Fale com o administrador.' }, { status: 402 });
      }
    } else {
      const ciclo = typeof dbUser.quota_ciclo === 'number' ? dbUser.quota_ciclo : null;
      const extra = typeof dbUser.quota_extra === 'number' ? dbUser.quota_extra : null;
      if (ciclo !== null && ciclo <= 0 && (extra === null || extra <= 0)) {
        return NextResponse.json({ error: 'Você não tem avaliações disponíveis. Adquira mais para continuar.' }, { status: 402 });
      }
    }
  }

  const { context, studentWork, images, fileUris, contextFileUris } = await request.json();

  if (!studentWork && !images?.length && !fileUris?.length) {
    return NextResponse.json({ error: 'Envie uma foto ou o texto da prova.' }, { status: 400 });
  }

  const prompt = `Você é um professor corrigindo rapidamente uma prova escolar (matemática, português, ou outra matéria de conteúdo objetivo), para o professor escrever o resultado direto na prova do aluno.

${context ? `Contexto/gabarito fornecido pelo professor:\n${context}\n` : ''}${contextFileUris?.length ? `O professor também anexou foto(s) do gabarito, identificadas como "Gabarito/Referência do professor" — use apenas para calibrar a correção, nunca as confunda com a prova do aluno.\n` : ''}
${studentWork ? `Prova do aluno (texto):\n${studentWork}\n` : 'Prova do aluno: veja a(s) imagem(ns) anexada(s) identificadas como "Prova do aluno".'}

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

  async function callGemini(promptText, { fileUris: fUris, images: imgs } = {}, model = 'gemini-2.5-flash') {
    if (!process.env.GEMINI_API_KEY) throw new Error('no_gemini_key');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const parts = [{ text: promptText }];
    for (const f of (fUris || [])) {
      parts.push({ text: f.label || 'Prova do aluno:' });
      parts.push({ fileData: { fileUri: f.fileUri, mimeType: f.mimeType } });
    }
    for (const img of (imgs || [])) {
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

  function detectImageMediaType(base64Data) {
    if (base64Data.startsWith('iVBOR')) return 'image/png';
    if (base64Data.startsWith('/9j/'))  return 'image/jpeg';
    if (base64Data.startsWith('R0lG'))  return 'image/gif';
    if (base64Data.startsWith('UklG'))  return 'image/webp';
    return null;
  }

  async function callClaude(promptText, files) {
    const messageContent = files?.length > 0
      ? [
          { type: 'text', text: promptText },
          ...files.flatMap(img => [
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

  try {
    let parsed;
    const allFileUris = [...(contextFileUris || []), ...(fileUris || [])];
    const hasFileUris = allFileUris.length > 0;
    const hasImages = images?.length > 0;
    const geminiFiles = { fileUris: hasFileUris ? allFileUris : undefined, images: hasImages ? images : undefined };

    try {
      const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.5-flash'];
      let lastGeminiErr;
      for (let m = 0; m < geminiModels.length; m++) {
        try {
          parsed = await callGemini(prompt, geminiFiles, geminiModels[m]);
          lastGeminiErr = null;
          break;
        } catch (err) {
          const isCascadable = err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE')
            || err?.message?.includes('404') || err?.message?.includes('NOT_FOUND');
          if (!isCascadable) throw err;
          lastGeminiErr = err;
        }
      }
      if (lastGeminiErr) throw lastGeminiErr;
    } catch (geminiErr) {
      console.error('Gemini failed:', geminiErr?.message);
      if (hasFileUris && !hasImages && !studentWork) {
        throw new Error('file_gemini_unavailable');
      }
      parsed = await callClaude(prompt, hasImages ? images : null);
    }

    if (!dbErr && dbUser) {
      if (dbUser.org_id && orgData) {
        await Promise.all([
          supabase.from('organizations').update({ quota_used: (orgData.quota_used || 0) + 1 }).eq('id', dbUser.org_id),
          supabase.from('users').update({ org_quota_used: (dbUser.org_quota_used || 0) + 1 }).eq('id', user.userId),
        ]);
      } else {
        const ciclo = typeof dbUser.quota_ciclo === 'number' ? dbUser.quota_ciclo : null;
        const extra = typeof dbUser.quota_extra === 'number' ? dbUser.quota_extra : null;
        if (ciclo !== null && ciclo > 0) {
          await supabase.from('users').update({ quota_ciclo: ciclo - 1 }).eq('id', user.userId);
        } else if (extra !== null && extra > 0) {
          await supabase.from('users').update({ quota_extra: extra - 1 }).eq('id', user.userId);
        }
      }
    }

    return NextResponse.json({ items: parsed.items || [], summary: parsed.summary || '', suggestedScore: parsed.suggestedScore || null });
  } catch (err) {
    console.error('evaluate-basica error:', err?.message || err);
    if (err?.status === 529 || err?.error?.type === 'overloaded_error') {
      return NextResponse.json({ error: 'Os servidores estão sobrecarregados no momento. Aguarde alguns segundos e tente novamente.' }, { status: 503 });
    }
    if (err?.message === 'file_gemini_unavailable') {
      return NextResponse.json({ error: 'Os servidores de avaliação de arquivos estão indisponíveis no momento. Tente novamente em alguns instantes.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Ocorreu um erro nos servidores. Tente novamente.' }, { status: 500 });
  }
}
