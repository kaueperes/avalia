import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(s) {
  return {
    id: s.id,
    userId: s.user_id,
    classId: s.class_id,
    name: s.name,
    createdAt: s.created_at,
  };
}

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, classId } = await request.json();
  if (!name) return NextResponse.json({ error: 'Nome do aluno é obrigatório' }, { status: 400 });

  const { data, error } = await supabase
    .from('students')
    .update({ name, ...(classId ? { class_id: classId } : {}) })
    .eq('id', params.id)
    .eq('user_id', user.userId)
    .select().single();

  if (error || !data) return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  return NextResponse.json(fmt(data));
}

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.userId);

  if (error) return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  return NextResponse.json({ success: true });
}
