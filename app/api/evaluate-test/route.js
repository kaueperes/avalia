import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { TYPES, TONES } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export const maxDuration = 60;

const QUOTA_TESTES_MENSAL = 10;

function isYoutubeUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname === 'youtu.be' || u.hostname.includes('youtube.com');
  } catch { return false; }
}

function selectModel({ studentWork, criteria, writingSample, exerciseContext, tone }) {
  let complexity = 0;
  const workLen = (studentWork || '').length;
  if (workLen > 2000) complexity += 2;
  else if (workLen > 700) complexity += 1;
  const numCriteria = (criteria || []).length;
  if (numCriteria > 5) complexity += 2;
  else if (numCriteria > 3) complexity += 1;
  if (writingSample) complexity += 2;
  if ((exerciseContext || '').length > 400) complexity += 1;
  if (['rigoroso', 'didatico', 'formal'].includes(tone)) complexity += 1;
  return complexity >= 4
    ? { model: 'claude-sonnet-4-6', maxTokens: 3000 }
    : { model: 'claude-haiku-4-5-20251001', maxTokens: 2000 };
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada.' }, { status: 503 });
  }

  // Busca quota de testes e data de reset
  let dbUser = null, dbErr = null;
  try {
    const dbResult = await Promise.race([
      supabase.from('users').select('quota_testes, quota_testes_reset_date').eq('id', user.userId).single(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('db_timeout')), 5000)),
    ]);
    dbUser = dbResult.data;
    dbErr = dbResult.error;
  } catch {
    // DB indisponível — deixa passar
  }

  if (!dbErr && dbUser) {
    // Reset mensal lazy: se a data de reset passou, restaura a cota
    const resetDate = dbUser.quota_testes_reset_date ? new Date(dbUser.quota_testes_reset_date) : null;
    if (resetDate && resetDate < new Date()) {
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1);
      await supabase.from('users').update({
        quota_testes: QUOTA_TESTES_MENSAL,
        quota_testes_reset_date: nextReset.toISOString(),
      }).eq('id', user.userId);
      dbUser.quota_testes = QUOTA_TESTES_MENSAL;
    }

    const testes = typeof dbUser.quota_testes === 'number' ? dbUser.quota_testes : QUOTA_TESTES_MENSAL;
    if (testes <= 0) {
      return NextResponse.json({ error: 'Você esgotou seus testes de prompt este mês. Renova no próximo ciclo mensal.' }, { status: 402 });
    }
  }

  const { type, exerciseName, exerciseContext, criteria, studentName, studentWork, tone, profName, profDisc, writingSample, images, fileUris, linkUrl } = await request.json();

  if (!exerciseName || !criteria?.length) {
    return NextResponse.json({ error: 'Exercício e critérios são obrigatórios.' }, { status: 400 });
  }

  const effectiveUrl = linkUrl || null;
  const isYt = isYoutubeUrl(effectiveUrl);
  const isWebsite = !!(effectiveUrl && !isYt);
  const websiteContent = null;

  const typeLabel = TYPES[type]?.label || type || 'Trabalho';
  const toneObj = TONES.find(t => t.id === tone);
  const toneDesc = toneObj ? `${toneObj.label} — ${toneObj.desc}` : 'Neutro';
  const criteriaList = criteria.map(c => `- ${c.name} (peso: ${c.weight}x)`).join('\n');
  const writingNote = writingSample
    ? `\nEstilo de escrita para imitar:\n"${writingSample.substring(0, 600)}"\n`
    : '';

  const promptHasVideoAudio = isYt
    || fileUris?.some(f => f.mimeType?.startsWith('video/') || f.mimeType?.startsWith('audio/'))
    || images?.some(img => img.mediaType?.startsWith('video/') || img.mediaType?.startsWith('audio/'));
  const promptHasImageOnly = !promptHasVideoAudio && !isWebsite && (
    fileUris?.some(f => f.mimeType?.startsWith('image/'))
    || images?.some(img => img.mediaType?.startsWith('image/'))
  );

  const prompt = `Você é ${profName ? `o professor ${profName}` : 'um professor experiente'}${profDisc ? ` de ${profDisc}` : ''}, avaliando o trabalho de um aluno.

Tipo de trabalho: ${typeLabel}
Exercício: "${exerciseName}"${exerciseContext ? `\nDescrição do exercício:\n${exerciseContext}` : ''}

Aluno: ${studentName || 'Aluno Teste'}
${studentWork ? `Trabalho do aluno:\n${studentWork}` : ''}

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

Regras gerais:
- Notas de 0.0 a 10.0 (uma casa decimal)
- Não penalize estilo pessoal, escolhas subjetivas, formatação diferente do esperado ou desvios que não comprometem o critério
- O feedback deve ser escrito em português brasileiro
- Os nomes dos critérios devem ser exatamente iguais aos fornecidos

FEEDBACK — siga estas regras sem exceção:

O feedback é um parecer pedagógico escrito diretamente para o aluno. Deve soar como se o próprio professor tivesse escrito — natural, humano e sem termos desnecessariamente complexos ou formais.

Estrutura obrigatória:
1. Comece diretamente pela análise do trabalho — sem saudações nem introduções
2. Destaque pelo menos um ponto forte específico e concreto observado no trabalho
3. Aponte o principal ponto de melhoria com orientação clara e acionável — específica o suficiente para o aluno saber exatamente o que fazer diferente
4. Finalize com avaliação geral coerente com a nota atribuída

Qualidade obrigatória:
- Mínimo de 5 frases bem desenvolvidas
- Cite elementos concretos do trabalho — nunca generalize ("o trabalho está bom" não é feedback útil)
- Use linguagem clara e acessível, palavras do dia a dia. Se o estilo cadastrado do professor usar vocabulário mais elaborado, siga esse estilo; caso contrário, prefira sempre a palavra mais simples que transmita a mesma ideia${promptHasVideoAudio ? `

CONTEXTO DE MÍDIA — VÍDEO/ÁUDIO:
Este trabalho é em vídeo ou áudio. Ao escrever o feedback, referencie elementos específicos do que foi visto ou ouvido: timing, fluidez de movimento, transições, entonação, ritmo de fala, composição de cenas, postura, domínio do conteúdo.` : ''}${isWebsite ? `

CONTEXTO DE TRABALHO — SITE/PORTFÓLIO ONLINE:
O trabalho do aluno é um site ou portfólio online (${effectiveUrl}). Analise o conteúdo — textos, estrutura e imagens dos projetos apresentados.` : ''}${promptHasImageOnly ? `

CONTEXTO DE MÍDIA — IMAGEM:
Este trabalho é visual. Ao escrever o feedback, referencie elementos visuais concretos: composição, proporções, uso de cor e luz, detalhes técnicos, acabamento, escolhas estilísticas.` : ''}`;

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
      try { return JSON.parse(candidate.replace(/[ -]/g, ' ')); } catch {}
    }
    throw new Error('invalid_json');
  }

  async function callGemini(promptText, { fileUris: fUris, images: imgs } = {}, lUrl, siteContent, model = 'gemini-2.5-flash') {
    if (!process.env.GEMINI_API_KEY) throw new Error('no_gemini_key');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const lUrlIsYt = isYoutubeUrl(lUrl);
    const hasVideoAudio = lUrlIsYt
      || fUris?.some(f => f.mimeType?.startsWith('video/') || f.mimeType?.startsWith('audio/'))
      || imgs?.some(f => f.mediaType?.startsWith('video/') || f.mediaType?.startsWith('audio/'));

    const parts = [{ text: promptText }];

    if (lUrl && !lUrlIsYt && siteContent) {
      if (siteContent.text) parts.push({ text: `\nConteúdo extraído do site (${lUrl}):\n${siteContent.text}` });
      for (const img of (siteContent.images || [])) {
        parts.push({ text: img.label || 'Imagem do portfólio:' });
        parts.push({ inlineData: { mimeType: img.mediaType, data: img.data } });
      }
    }

    for (const f of (fUris || [])) {
      parts.push({ text: f.label || 'Arquivo:' });
      parts.push({ fileData: { fileUri: f.fileUri, mimeType: f.mimeType } });
    }
    for (const img of (imgs || [])) {
      parts.push({ text: img.label || 'Arquivo:' });
      parts.push({ inlineData: { mimeType: img.mediaType, data: img.data } });
    }
    if (lUrlIsYt) {
      parts.push({ text: 'Trabalho do aluno (vídeo do YouTube):' });
      parts.push({ fileData: { fileUri: lUrl, mimeType: 'video/mp4' } });
    }
    if (lUrl && !lUrlIsYt) parts.push({ text: `URL do site/portfólio do aluno: ${lUrl}` });

    const isWebsiteUrl = !!(lUrl && !lUrlIsYt);
    const config = hasVideoAudio || isWebsiteUrl
      ? { temperature: 0.2, ...(isWebsiteUrl ? { tools: [{ urlContext: {} }] } : {}) }
      : { temperature: 0.2, responseMimeType: 'application/json' };

    const result = await ai.models.generateContent({
      model, contents: [{ role: 'user', parts }], config,
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

  async function callClaude(promptText, files, modelOverride) {
    const { model, maxTokens } = modelOverride || selectModel({ studentWork, criteria, writingSample, exerciseContext, tone });
    const messageContent = files?.length > 0
      ? [
          { type: 'text', text: promptText },
          ...files.flatMap(img => [
            { type: 'text', text: img.label || 'Arquivo:' },
            img.mediaType === 'application/pdf'
              ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: img.data } }
              : { type: 'image', source: { type: 'base64', media_type: detectImageMediaType(img.data) || img.mediaType, data: img.data } },
          ]),
        ]
      : promptText;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model, max_tokens: maxTokens, temperature: 0.2,
      messages: [{ role: 'user', content: messageContent }],
    });
    return parseJson(message.content[0]?.text || '');
  }

  try {
    const { model: selectedModel, maxTokens: selectedMaxTokens } = selectModel({ studentWork, criteria, writingSample, exerciseContext, tone });

    let parsed;
    const hasFileUris = fileUris?.length > 0;
    const hasImages = images?.length > 0;
    const geminiFiles = { fileUris: hasFileUris ? fileUris : undefined, images: hasImages ? images : undefined };

    try {
      const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.5-flash'];
      let lastGeminiErr;

      for (let m = 0; m < geminiModels.length; m++) {
        const model = geminiModels[m];
        let modelErr;

        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            parsed = await callGemini(prompt, geminiFiles, effectiveUrl || null, websiteContent, model);
            modelErr = null;
            break;
          } catch (err) {
            const isCascadable = err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE')
              || err?.message?.includes('404') || err?.message?.includes('NOT_FOUND');
            if (!isCascadable) throw err;
            modelErr = err;
            if (attempt < 2) await new Promise(r => setTimeout(r, 3000));
          }
        }

        if (!modelErr) { lastGeminiErr = null; break; }
        lastGeminiErr = modelErr;
      }

      if (lastGeminiErr) throw lastGeminiErr;
    } catch (geminiErr) {
      console.error('Gemini failed (modo teste):', geminiErr?.message);
      const hasVideoAudio = isYt
        || fileUris?.some(f => f.mimeType?.startsWith('video/') || f.mimeType?.startsWith('audio/'))
        || images?.some(img => img.mediaType?.startsWith('video/') || img.mediaType?.startsWith('audio/'));
      if (hasVideoAudio) throw new Error('video_gemini_unavailable');
      if (hasFileUris) {
        if (studentWork || hasImages) {
          parsed = await callClaude(prompt, hasImages ? images : null, hasImages ? { model: 'claude-sonnet-4-6', maxTokens: 3000 } : { model: selectedModel, maxTokens: selectedMaxTokens });
        } else {
          throw new Error('file_gemini_unavailable');
        }
      } else if (hasImages) {
        parsed = await callClaude(prompt, images, { model: 'claude-sonnet-4-6', maxTokens: 3000 });
      } else {
        parsed = await callClaude(prompt, null, { model: selectedModel, maxTokens: selectedMaxTokens });
      }
    }

    const totalWeight = (parsed.criteriaScores || []).reduce((s, c) => s + (c.weight || 1), 0);
    const weightedSum = (parsed.criteriaScores || []).reduce((s, c) => s + (c.score || 0) * (c.weight || 1), 0);
    const score = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

    // Decrementa quota_testes
    if (!dbErr && dbUser) {
      const testes = typeof dbUser.quota_testes === 'number' ? dbUser.quota_testes : QUOTA_TESTES_MENSAL;
      if (testes > 0) {
        // Garante que quota_testes_reset_date exista para controle do reset mensal
        const updates = { quota_testes: testes - 1 };
        if (!dbUser.quota_testes_reset_date) {
          const nextReset = new Date();
          nextReset.setMonth(nextReset.getMonth() + 1);
          updates.quota_testes_reset_date = nextReset.toISOString();
        }
        await supabase.from('users').update(updates).eq('id', user.userId);
      }
    }

    // Salva rascunho (mantém no máximo 5 por usuário)
    const inputSummary = `${typeLabel} · ${exerciseName}`;
    await supabase.from('evaluation_drafts').insert({
      user_id: user.userId,
      result_json: { score, criteriaScores: parsed.criteriaScores, feedback: parsed.feedback },
      input_summary: inputSummary,
    });

    // Remove rascunhos mais antigos além do limite de 5
    const { data: drafts } = await supabase
      .from('evaluation_drafts')
      .select('id, created_at')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false });

    if (drafts && drafts.length > 5) {
      const toDelete = drafts.slice(5).map(d => d.id);
      await supabase.from('evaluation_drafts').delete().in('id', toDelete);
    }

    const quotaRestante = dbUser ? Math.max(0, (dbUser.quota_testes ?? QUOTA_TESTES_MENSAL) - 1) : null;

    return NextResponse.json({
      score,
      criteriaScores: parsed.criteriaScores,
      feedback: parsed.feedback,
      is_draft: true,
      quota_testes_restante: quotaRestante,
    });
  } catch (err) {
    console.error('evaluate-test error:', err?.message || err);
    if (err?.status === 529 || err?.error?.type === 'overloaded_error') {
      return NextResponse.json({ error: 'Os servidores estão sobrecarregados. Aguarde alguns segundos e tente novamente.' }, { status: 503 });
    }
    if (err?.message === 'video_gemini_unavailable') {
      return NextResponse.json({ error: 'Vídeo e áudio não estão disponíveis no modo teste. Use texto ou imagens.' }, { status: 503 });
    }
    if (err?.message === 'file_gemini_unavailable') {
      return NextResponse.json({ error: 'Os servidores de avaliação de arquivos estão indisponíveis no momento. Tente novamente em alguns instantes.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Ocorreu um erro. Tente novamente.' }, { status: 500 });
  }
}
