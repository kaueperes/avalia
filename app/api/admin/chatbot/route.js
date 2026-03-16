import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { DEFAULT_BOT_NAME, DEFAULT_WELCOME, DEFAULT_MODEL, DEFAULT_SYSTEM_PROMPT } from '@/lib/chatbot';

const KEYS = ['chatbot_enabled', 'chatbot_name', 'chatbot_welcome', 'chatbot_model', 'chatbot_system_prompt'];

async function checkAdmin(request) {
  const decoded = getUserFromRequest(request);
  if (!decoded) return null;
  const { data: user } = await supabase.from('users').select('is_admin').eq('id', decoded.userId).single();
  return user?.is_admin ? decoded : null;
}

export async function GET(request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { data } = await supabase.from('settings').select('key, value').in('key', KEYS);
  const s = Object.fromEntries((data || []).map(r => [r.key, r.value]));

  return NextResponse.json({
    enabled: s.chatbot_enabled !== 'false',
    name: s.chatbot_name || DEFAULT_BOT_NAME,
    welcome: s.chatbot_welcome || DEFAULT_WELCOME,
    model: s.chatbot_model || DEFAULT_MODEL,
    systemPrompt: s.chatbot_system_prompt || DEFAULT_SYSTEM_PROMPT,
  });
}

export async function PATCH(request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const body = await request.json();
  const upserts = [];

  if (body.enabled !== undefined) upserts.push({ key: 'chatbot_enabled', value: String(body.enabled), updated_at: new Date().toISOString() });
  if (body.name !== undefined) upserts.push({ key: 'chatbot_name', value: body.name, updated_at: new Date().toISOString() });
  if (body.welcome !== undefined) upserts.push({ key: 'chatbot_welcome', value: body.welcome, updated_at: new Date().toISOString() });
  if (body.model !== undefined) upserts.push({ key: 'chatbot_model', value: body.model, updated_at: new Date().toISOString() });
  if (body.systemPrompt !== undefined) upserts.push({ key: 'chatbot_system_prompt', value: body.systemPrompt, updated_at: new Date().toISOString() });

  if (upserts.length === 0) return NextResponse.json({ ok: true });

  const { error } = await supabase.from('settings').upsert(upserts, { onConflict: 'key' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
