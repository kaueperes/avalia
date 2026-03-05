import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(e) {
  return { id: e.id, userId: e.user_id, name: e.name, type: e.type, context: e.context, criteria: e.criteria, createdAt: e.created_at };
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  let query = supabase.from('exercises').select('*').eq('user_id', user.userId).order('created_at', { ascending: false });
  if (type) query = query.eq('type', type);

  const { data } = await query;
  return NextResponse.json((data || []).map(fmt));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, type, context, criteria } = await request.json();
  if (!name || !type) {
    return NextResponse.json({ error: 'Nome e tipo são obrigatórios' }, { status: 400 });
  }

  const { data: e, error } = await supabase.from('exercises')
    .insert({ user_id: user.userId, name, type, context: context || '', criteria: criteria || [] })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json(fmt(e), { status: 201 });
}
