import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(c) {
  return {
    id: c.id,
    userId: c.user_id,
    institutionId: c.institution_id,
    name: c.name,
    createdAt: c.created_at,
  };
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const institutionId = searchParams.get('institutionId');

  let query = supabase
    .from('classes')
    .select('*')
    .eq('user_id', user.userId)
    .order('created_at', { ascending: false });

  if (institutionId) query = query.eq('institution_id', institutionId);

  const { data } = await query;
  return NextResponse.json((data || []).map(fmt));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, institutionId } = await request.json();
  if (!name) return NextResponse.json({ error: 'Nome da turma é obrigatório' }, { status: 400 });

  const { data, error } = await supabase
    .from('classes')
    .insert({ user_id: user.userId, name, institution_id: institutionId || null })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json(fmt(data), { status: 201 });
}
