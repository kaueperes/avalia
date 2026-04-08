import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(i) {
  return {
    id: i.id,
    userId: i.user_id,
    name: i.name,
    logoUrl: i.logo_url,
    educationLevel: i.education_level,
    createdAt: i.created_at,
  };
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data } = await supabase
    .from('institutions')
    .select('*')
    .eq('user_id', user.userId)
    .order('created_at', { ascending: false });

  return NextResponse.json((data || []).map(fmt));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, logoUrl, educationLevel } = await request.json();
  if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });

  const { data, error } = await supabase
    .from('institutions')
    .insert({ user_id: user.userId, name, logo_url: logoUrl || '', education_level: educationLevel || '' })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json(fmt(data), { status: 201 });
}
