import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DEFAULT_BOT_NAME, DEFAULT_WELCOME } from '@/lib/chatbot';

export async function GET() {
  const { data } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['chatbot_enabled', 'chatbot_name', 'chatbot_welcome']);

  const s = Object.fromEntries((data || []).map(r => [r.key, r.value]));

  return NextResponse.json({
    enabled: s.chatbot_enabled !== 'false',
    name: s.chatbot_name || '',  // vazio = frontend sorteia o nome
    welcome: s.chatbot_welcome || '',
  });
}
