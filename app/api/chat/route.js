import { NextResponse } from 'next/server';
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

  const { data: dbUser } = await supabase.from('users').select('plan').eq('id', user.userId).single();
  const plan = PLANS[dbUser?.plan] || PLANS.gratuito;
  if (!plan.features.chatbot) {
    return NextResponse.json({ error: 'O assistente virtual não está disponível no seu plano. Faça upgrade para acessar.' }, { status: 402 });
  }

  const { messages } = await request.json();
  if (!messages?.length) {
    return NextResponse.json({ error: 'Mensagens inválidas.' }, { status: 400 });
  }

  // Fetch settings from DB, fall back to defaults
  const { data: settingsData } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['chatbot_enabled', 'chatbot_system_prompt', 'chatbot_model']);
  const s = Object.fromEntries((settingsData || []).map(r => [r.key, r.value]));

  if (s.chatbot_enabled === 'false') {
    return NextResponse.json({ error: 'O assistente está temporariamente desabilitado.' }, { status: 503 });
  }

  const systemPrompt = s.chatbot_system_prompt || DEFAULT_SYSTEM_PROMPT;
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
    return NextResponse.json({ reply: text });
  } catch (err) {
    console.error('chat error:', err);
    return NextResponse.json({ error: 'Erro ao chamar a IA.' }, { status: 500 });
  }
}
