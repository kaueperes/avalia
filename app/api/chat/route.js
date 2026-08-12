import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/types';
import Anthropic from '@anthropic-ai/sdk';
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_MODEL } from '@/lib/chatbot';

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY não configurada.' }, { status: 503 });
  }

  const { data: dbUser } = await supabase.from('users').select('plan, chatbot_msgs_used, chatbot_msgs_reset_date').eq('id', user.userId).single();
  const plan = PLANS[dbUser?.plan] || PLANS.gratuito;
  if (!plan.features.chatbot) {
    return NextResponse.json({ error: 'O assistente virtual não está disponível no seu plano. Faça upgrade para acessar.' }, { status: 402 });
  }

  // Reset mensal lazy: se a data de reset passou, zera o contador
  const resetDate = dbUser.chatbot_msgs_reset_date ? new Date(dbUser.chatbot_msgs_reset_date) : null;
  let msgsUsed = dbUser.chatbot_msgs_used ?? 0;
  if (!resetDate || resetDate < new Date()) {
    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1);
    msgsUsed = 0;
    await supabase.from('users').update({
      chatbot_msgs_used: 0,
      chatbot_msgs_reset_date: nextReset.toISOString(),
    }).eq('id', user.userId);
  }

  const maxMsgs = plan.limits.chatbot;
  if (maxMsgs != null && msgsUsed >= maxMsgs) {
    return NextResponse.json({ error: `Você atingiu o limite de ${maxMsgs} mensagens do assistente este mês. Faça upgrade para continuar ou aguarde a renovação do ciclo.` }, { status: 402 });
  }

  const { messages, botName: clientBotName } = await request.json();
  if (!messages?.length) {
    return NextResponse.json({ error: 'Mensagens inválidas.' }, { status: 400 });
  }

  // Fetch settings from DB, fall back to defaults
  const { data: settingsData } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['chatbot_enabled', 'chatbot_system_prompt', 'chatbot_model', 'chatbot_name']);
  const s = Object.fromEntries((settingsData || []).map(r => [r.key, r.value]));

  if (s.chatbot_enabled === 'false') {
    return NextResponse.json({ error: 'O assistente está temporariamente desabilitado.' }, { status: 503 });
  }

  const botName = (s.chatbot_name && !s.chatbot_name.includes('{')) ? s.chatbot_name : (clientBotName || 'Luca');
  const systemPrompt = (s.chatbot_system_prompt || DEFAULT_SYSTEM_PROMPT).replace(/\{nome\}/g, botName);
  const model = s.chatbot_model || DEFAULT_MODEL;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model,
      max_tokens: 600,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0]?.text || '';

    await supabase.from('users').update({ chatbot_msgs_used: msgsUsed + 1 }).eq('id', user.userId);

    return NextResponse.json({ reply: text });
  } catch (err) {
    Sentry.captureException(err);
    console.error('chat error:', err);
    return NextResponse.json({ error: 'Erro ao chamar a IA.' }, { status: 500 });
  }
}
