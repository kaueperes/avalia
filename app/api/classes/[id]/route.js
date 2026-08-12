import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(c) {
  return {
    id: c.id,
    userId: c.user_id,
    orgId: c.org_id,
    institutionId: c.institution_id,
    name: c.name,
    createdAt: c.created_at,
  };
}

// Dono da turma pode editar/excluir a própria; turma compartilhada da org
// só o admin daquela organização pode mexer.
async function canManage(request, row) {
  const user = getUserFromRequest(request);
  if (!user || !row) return null;
  if (row.user_id === user.userId) return user;
  if (!row.org_id) return null;
  const { data: dbUser } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
  return (dbUser?.org_id === row.org_id && dbUser.org_role === 'admin') ? user : null;
}

export async function PUT(request, { params }) {
  const { data: existing } = await supabase.from('classes').select('user_id, org_id').eq('id', params.id).single();
  if (!(await canManage(request, existing))) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { name, institutionId } = await request.json();
  if (!name) return NextResponse.json({ error: 'Nome da turma é obrigatório' }, { status: 400 });

  const { data, error } = await supabase
    .from('classes')
    .update({ name, institution_id: institutionId || null })
    .eq('id', params.id)
    .select().single();

  if (error || !data) return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  return NextResponse.json(fmt(data));
}

export async function DELETE(request, { params }) {
  const { data: existing } = await supabase.from('classes').select('user_id, org_id').eq('id', params.id).single();
  if (!(await canManage(request, existing))) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { error } = await supabase.from('classes').delete().eq('id', params.id);

  if (error) return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  return NextResponse.json({ success: true });
}
