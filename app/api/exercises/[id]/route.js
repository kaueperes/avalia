import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(e) {
  return { id: e.id, userId: e.user_id, name: e.name, type: e.type, disciplina: e.disciplina || '', context: e.context, criteria: e.criteria, createdAt: e.created_at };
}

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, type, disciplina, context, criteria } = await request.json();
  const { data: e, error } = await supabase.from('exercises')
    .update({ name, type, disciplina: disciplina || '', context: context || '', criteria: criteria || [] })
    .eq('id', params.id).eq('user_id', user.userId)
    .select().single();

  if (error || !e) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json(fmt(e));
}

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { error } = await supabase.from('exercises').delete().eq('id', params.id).eq('user_id', user.userId);
  if (error) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
