import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { TYPES, TONES } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export const maxDuration = 60;

function isYoutubeUrl(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.hostname === 'youtu.be' || u.hostname.includes('youtube.com');
  } catch { return false; }
}

async function fetchWebsiteContent(url) {
  const html = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', Referer: url },
  }).then(r => r.text());

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 4000);

  const seen = new Set();
  const imgUrls = [];
  const regexes = [
    /property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
    /content=["']([^"']+)["'][^>]+property=["']og:image["']/gi,
    /<img[^>]+src=["']([^"'?#\s]+\.(?:jpg|jpeg|png|webp))["'?#\s]/gi,
    /["'](https?:\/\/cdn\.[^"'\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s]*)?)["']/gi,
    /["'](https?:\/\/[^"'\s]+\/(?:images?|uploads?|assets?|media)\/[^"'\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s]*)?)["']/gi,
  ];
  for (const re of regexes) {
    let m;
    while ((m = re.exec(html)) !== null && imgUrls.length < 10) {
      const u = m[1];
      if (u && u.startsWith('http') && !seen.has(u) && !/icon|logo|avatar|favicon|pixel|tracking|banner|badge/i.test(u)) {
        seen.add(u);
        imgUrls.push(u);
      }
    }
  }

  const images = [];
  for (const imgUrl of imgUrls.slice(0, 6)) {
    try {
      const res = await fetch(imgUrl, {
        signal: AbortSignal.timeout(5000),
        headers: { 'User-Agent': 'Mozilla/5.0', Referer: url },
      });
      if (!res.ok) continue;
      const ct = (res.headers.get('content-type') || '').split(';')[0].trim();
      if (!ct.startsWith('image/')) continue;
      const buf = await res.arrayBuffer();
      if (buf.byteLength > 5 * 1024 * 1024) continue;
      images.push({ data: Buffer.from(buf).toString('base64'), mediaType: ct, label: 'Imagem do portfólio do aluno' });
    } catch { /* skip */ }
  }

  return { text, images };
}

async function screenshotWebsite(url) {
  const [{ default: chromium }, { default: puppeteer }] = await Promise.all([
    import('@sparticuz/chromium'),
    import('puppeteer-core'),
  ]);

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1280, height: 900 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' });

    // Remove automation signals so Cloudflare/bot-detection passes
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = { runtime: {}, loadTimes: () => {}, csi: () => {} };
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
      Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt', 'en-US', 'en'] });
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
    // Extra wait for Cloudflare JS challenge to complete and redirect
    await new Promise(r => setTimeout(r, 4000));

    const images = [];

    const shot1 = await page.screenshot({ type: 'jpeg', quality: 75 });
    images.push({ data: Buffer.from(shot1).toString('base64'), mediaType: 'image/jpeg', label: 'Screenshot do portfólio (topo da página)' });

    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise(r => setTimeout(r, 800));
    const shot2 = await page.screenshot({ type: 'jpeg', quality: 75 });
    images.push({ data: Buffer.from(shot2).toString('base64'), mediaType: 'image/jpeg', label: 'Screenshot do portfólio (rolagem)' });

    return images;
  } finally {
    await browser.close();
  }
}

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
    ? { model: 'claude-sonnet-4-6', maxTokens: 3000 }
    : { model: 'claude-haiku-4-5-20251001', maxTokens: 2000 };
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada.' }, { status: 503 });
  }

  // Quota enforcement: check and decrement before calling AI.
  // Wrapped with a 5s timeout so a paused/slow DB never blocks the AI call.
  let dbUser = null, dbErr = null;
  try {
    const dbResult = await Promise.race([
      supabase.from('users').select('quota_ciclo, quota_extra').eq('id', user.userId).single(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('db_timeout')), 5000)),
    ]);
    dbUser = dbResult.data;
    dbErr = dbResult.error;
  } catch {
    // DB unavailable or timed out — skip quota check and proceed
  }

  if (!dbErr && dbUser) {
    const ciclo = typeof dbUser.quota_ciclo === 'number' ? dbUser.quota_ciclo : null;
    const extra = typeof dbUser.quota_extra === 'number' ? dbUser.quota_extra : null;
    // Only block if quota fields exist and both are zero
    if (ciclo !== null && ciclo <= 0 && (extra === null || extra <= 0)) {
      return NextResponse.json({ error: 'Você não tem avaliações disponíveis. Adquira mais para continuar.' }, { status: 402 });
    }
  }

  const { type, exerciseName, exerciseContext, criteria, studentName, studentWork, tone, profName, profDisc, writingSample, images, fileUris, linkUrl, youtubeUrl, referenceWeight } = await request.json();

  if (!exerciseName || !criteria?.length) {
    return NextResponse.json({ error: 'Exercício e critérios são obrigatórios.' }, { status: 400 });
  }

  // linkUrl is the new unified field; youtubeUrl kept for backward compat
  const effectiveUrl = linkUrl || youtubeUrl || null;
  const isYt = isYoutubeUrl(effectiveUrl);
  const isWebsite = !!(effectiveUrl && !isYt);

  let websiteContent = null;
  if (isWebsite) {
    const [fetchResult, screenshotResult] = await Promise.allSettled([
      fetchWebsiteContent(effectiveUrl),
      screenshotWebsite(effectiveUrl),
    ]);
    const fetched = fetchResult.status === 'fulfilled' ? fetchResult.value : { text: '', images: [] };
    const shots = screenshotResult.status === 'fulfilled' ? screenshotResult.value : [];
    websiteContent = { text: fetched.text, images: [...(fetched.images || []), ...shots] };
  }

  const typeLabel = TYPES[type]?.label || type;
  const toneObj = TONES.find(t => t.id === tone);
  const toneDesc = toneObj ? `${toneObj.label} — ${toneObj.desc}` : 'Neutro';

  const criteriaList = criteria.map(c => `- ${c.name} (peso: ${c.weight}x)`).join('\n');

  const writingNote = writingSample
    ? `\nEstilo de escrita para imitar (escreva o feedback imitando este estilo):\n"${writingSample.substring(0, 600)}"\n`
    : '';

  // Detect media type for prompt-level context instructions
  const promptHasVideoAudio = isYt
    || fileUris?.some(f => f.mimeType?.startsWith('video/') || f.mimeType?.startsWith('audio/'))
    || images?.some(img => img.mediaType?.startsWith('video/') || img.mediaType?.startsWith('audio/'));
  const promptHasImageOnly = !promptHasVideoAudio && !isWebsite && (
    fileUris?.some(f => f.mimeType?.startsWith('image/'))
    || images?.some(img => img.mediaType?.startsWith('image/'))
    || (websiteContent?.images?.length > 0)
  );

  const prompt = `Você é ${profName ? `o professor ${profName}` : 'um professor experiente'}${profDisc ? ` de ${profDisc}` : ''}, avaliando o trabalho de um aluno.

Tipo de trabalho: ${typeLabel}
Exercício: "${exerciseName}"${exerciseContext ? `\nDescrição do exercício:\n${exerciseContext}` : ''}

Aluno: ${studentName || 'Aluno'}
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
Este trabalho é em vídeo ou áudio. Ao escrever o feedback, referencie elementos específicos do que foi visto ou ouvido: timing, fluidez de movimento, transições, entonação, ritmo de fala, composição de cenas, postura, domínio do conteúdo. Para animações: qualidade do movimento, expressividade, sincronia. Para apresentações orais e locuções: clareza, articulação, presença. Nunca avalie "o vídeo" de forma genérica — cite o que foi concretamente observado.` : ''}${isWebsite ? `

CONTEXTO DE TRABALHO — SITE/PORTFÓLIO ONLINE:
O trabalho do aluno é um site ou portfólio online (${effectiveUrl}). Analise o conteúdo extraído abaixo — textos, estrutura e imagens dos projetos apresentados. Avalie qualidade dos trabalhos, organização, apresentação visual e domínio da técnica demonstrado. Cite elementos concretos que você conseguiu observar no portfólio.` : ''}${promptHasImageOnly ? `

CONTEXTO DE MÍDIA — IMAGEM:
Este trabalho é visual. Ao escrever o feedback, referencie elementos visuais concretos: composição, proporções, uso de cor e luz, detalhes técnicos, acabamento, escolhas estilísticas. Nunca avalie "a imagem" de forma genérica — cite o que foi concretamente observado.` : ''}${images?.length > 0 ? `

Os arquivos enviados estão identificados com rótulos: "Trabalho do aluno" = produção do aluno a ser avaliada; "Referência do aluno" = material consultado pelo aluno como inspiração/fonte (use como contexto, mas NÃO avalie como produção dele); "Referência para Correção" = gabarito interno do professor (use apenas para calibrar a avaliação — NUNCA mencione, cite ou faça referência ao gabarito no feedback); "Arquivo adicional" = contexto extra
Peso do gabarito na correção: ${{ livre: 'REFERÊNCIA LIVRE — use o gabarito apenas como orientação geral; valorize criatividade e interpretações pessoais', parcial: 'PARCIAL — considere o gabarito como base, mas aceite variações e soluções alternativas coerentes', estrito: 'ESTRITO — o aluno deve seguir o gabarito de perto; penalize desvios significativos' }[referenceWeight] || 'PARCIAL — considere o gabarito como base, mas aceite variações e soluções alternativas coerentes'}
O gabarito é uma ferramenta interna do professor. Jamais mencione sua existência no feedback ao aluno` : ''}`;

  // Helper: parse JSON from model response text.
  // Walks char-by-char to collect every top-level {...} candidate, then tries
  // each one — avoids greedy-regex issues where stray braces in surrounding
  // explanation text produce an unparseable super-string.
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
      // second attempt: strip control characters that sometimes appear in AI output
      try { return JSON.parse(candidate.replace(/[ -]/g, ' ')); } catch {}
    }
    throw new Error('invalid_json');
  }

  // Helper: call Gemini with prompt + optional files + optional link URL.
  // fileUris:       array of { fileUri, mimeType, label } — uploaded via Gemini Files API (preferred).
  // images:         array of { data, mediaType, label }   — base64 inlineData (legacy fallback).
  // lUrl:           YouTube URL (native fileData) or generic website URL (text + extracted images).
  // siteContent:    pre-fetched { text, images } for generic website URLs.
  // responseMimeType: 'application/json' is omitted for video/audio inputs.
  async function callGemini(promptText, { fileUris: fUris, images: imgs } = {}, lUrl, siteContent, model = 'gemini-2.5-flash') {
    if (!process.env.GEMINI_API_KEY) throw new Error('no_gemini_key');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const lUrlIsYt = isYoutubeUrl(lUrl);
    const hasVideoAudio = lUrlIsYt
      || fUris?.some(f => f.mimeType?.startsWith('video/') || f.mimeType?.startsWith('audio/'))
      || imgs?.some(f => f.mediaType?.startsWith('video/') || f.mediaType?.startsWith('audio/'));

    const parts = [{ text: promptText }];

    // Website: inject extracted text and images before other content
    if (lUrl && !lUrlIsYt && siteContent) {
      if (siteContent.text) {
        parts.push({ text: `\nConteúdo extraído do site (${lUrl}):\n${siteContent.text}` });
      }
      for (const img of (siteContent.images || [])) {
        parts.push({ text: img.label || 'Imagem do portfólio do aluno:' });
        parts.push({ inlineData: { mimeType: img.mediaType, data: img.data } });
      }
    }

    // Preferred path: Gemini Files API URIs
    for (const f of (fUris || [])) {
      parts.push({ text: f.label || 'Arquivo:' });
      parts.push({ fileData: { fileUri: f.fileUri, mimeType: f.mimeType } });
    }

    // Legacy path: base64 inlineData
    for (const img of (imgs || [])) {
      parts.push({ text: img.label || 'Arquivo:' });
      parts.push({ inlineData: { mimeType: img.mediaType, data: img.data } });
    }

    if (lUrlIsYt) {
      parts.push({ text: 'Trabalho do aluno (vídeo do YouTube):' });
      parts.push({ fileData: { fileUri: lUrl, mimeType: 'video/mp4' } });
    }

    if (lUrl && !lUrlIsYt) {
      parts.push({ text: `URL do site/portfólio do aluno: ${lUrl}` });
    }

    const isWebsiteUrl = !!(lUrl && !lUrlIsYt);
    const config = hasVideoAudio || isWebsiteUrl
      ? { temperature: 0.2, ...(isWebsiteUrl ? { tools: [{ urlContext: {} }] } : {}) }
      : { temperature: 0.2, responseMimeType: 'application/json' };
    const result = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts }],
      config,
    });
    return parseJson(result.text);
  }

  // Detects actual image format from base64 prefix to avoid MIME type mismatch
  function detectImageMediaType(base64Data) {
    if (base64Data.startsWith('iVBOR')) return 'image/png';
    if (base64Data.startsWith('/9j/'))  return 'image/jpeg';
    if (base64Data.startsWith('R0lG'))  return 'image/gif';
    if (base64Data.startsWith('UklG'))  return 'image/webp';
    return null;
  }

  // Helper: call Claude with prompt + optional image blocks
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
      model, max_tokens: maxTokens,
      temperature: 0.2,
      messages: [{ role: 'user', content: messageContent }],
    });
    return parseJson(message.content[0]?.text || '');
  }

  try {
    const { model: selectedModel, maxTokens: selectedMaxTokens } = selectModel({ studentWork, criteria, writingSample, exerciseContext, tone });

    let parsed;

    // Gemini first (generous free tier, supports all media types).
    // Falls back to Claude if Gemini is unavailable or fails.
    // NOTE: Claude does not support video/audio or Gemini Files API URIs.
    const hasFileUris = fileUris?.length > 0;
    const hasImages = images?.length > 0;
    const geminiFiles = { fileUris: hasFileUris ? fileUris : undefined, images: hasImages ? images : undefined };

    try {
      // Cascade through Gemini models on 503/404: 2.5-flash → 2.5-flash-lite → 3.5-flash
      // All Gemini 1.x and 2.0 models were discontinued by Google (404 NOT_FOUND).
      // Each model gets 2 attempts with 3s wait between them before moving to the next model.
      // Cascades on both 503 (overload) and 404 (model discontinued/not found).
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
            if (attempt < 2) {
              console.warn(`Gemini ${model} error on attempt ${attempt}, retrying in 3s...`);
              await new Promise(r => setTimeout(r, 3000));
            }
          }
        }

        if (!modelErr) { lastGeminiErr = null; break; }
        lastGeminiErr = modelErr;
        if (m < geminiModels.length - 1) {
          console.warn(`Gemini ${model} unavailable, falling back to ${geminiModels[m + 1]}...`);
        }
      }

      if (lastGeminiErr) throw lastGeminiErr;
    } catch (geminiErr) {
      console.error('Gemini failed:', {
        message: geminiErr?.message,
        status: geminiErr?.status,
        statusText: geminiErr?.statusText,
        errorDetails: JSON.stringify(geminiErr?.errorDetails ?? geminiErr?.error ?? ''),
      });
      const hasVideoAudio = isYt
        || fileUris?.some(f => f.mimeType?.startsWith('video/') || f.mimeType?.startsWith('audio/'))
        || images?.some(img => img.mediaType?.startsWith('video/') || img.mediaType?.startsWith('audio/'));
      if (hasVideoAudio) throw new Error('video_gemini_unavailable');
      // fileUris are Gemini-only (Claude can't access Google file storage)
      if (hasFileUris) throw new Error('video_gemini_unavailable');
      if (isWebsite && websiteContent?.images?.length > 0) {
        parsed = await callClaude(prompt, websiteContent.images, { model: 'claude-sonnet-4-6', maxTokens: 3000 });
      } else if (isWebsite && websiteContent?.text) {
        parsed = await callClaude(`${prompt}\n\nConteúdo do site (${effectiveUrl}):\n${websiteContent.text}`, null, { model: selectedModel, maxTokens: selectedMaxTokens });
      } else if (hasImages) {
        parsed = await callClaude(prompt, images, { model: 'claude-sonnet-4-6', maxTokens: 3000 });
      } else {
        parsed = await callClaude(prompt, null, { model: selectedModel, maxTokens: selectedMaxTokens });
      }
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
    console.error('evaluate error:', err?.message || err, err?.status, err?.error);
    if (err?.status === 529 || err?.error?.type === 'overloaded_error') {
      return NextResponse.json({ error: 'Os servidores estão sobrecarregados no momento. Aguarde alguns segundos e tente novamente.' }, { status: 503 });
    }
    if (err?.message === 'video_gemini_unavailable') {
      return NextResponse.json({ error: 'Os servidores de avaliação de vídeo e áudio estão indisponíveis no momento. Tente novamente em alguns instantes.' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Ocorreu um erro nos servidores. Tente novamente.' }, { status: 500 });
  }
}
