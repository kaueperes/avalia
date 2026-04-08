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

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, institutionId } = await request.json();
  if (!name) return NextResponse.json({ error: 'Nome da turma é obrigatório' }, { status: 400 });

  const { data, error } = await supabase
    .from('classes')
    .update({ name, institution_id: institutionId || null })
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
    .from('classes')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.userId);

  if (error) return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  return NextResponse.json({ success: true });
}
