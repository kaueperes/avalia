import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(d) {
  return {
    id: d.id,
    userId: d.user_id,
    orgId: d.org_id,
    institutionId: d.institution_id,
    subject: d.subject,
    exerciseName: d.exercise_name,
    exerciseType: d.exercise_type,
    criteria: d.criteria,
    description: d.description,
    createdAt: d.created_at,
  };
}

// Dono da disciplina pode editar/excluir a própria; disciplina compartilhada
// da org só o admin daquela organização pode mexer.
async function canManage(request, row) {
  const user = getUserFromRequest(request);
  if (!user || !row) return null;
  if (row.user_id === user.userId) return user;
  if (!row.org_id) return null;
  const { data: dbUser } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
  return (dbUser?.org_id === row.org_id && dbUser.org_role === 'admin') ? user : null;
}

export async function PUT(request, { params }) {
  const { data: existing } = await supabase.from('disciplines').select('user_id, org_id').eq('id', params.id).single();
  if (!(await canManage(request, existing))) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { institutionId, subject, exerciseName, exerciseType, criteria, description } = await request.json();
  if (!subject || !exerciseName || !exerciseType) {
    return NextResponse.json({ error: 'Disciplina, nome e tipo do exercício são obrigatórios' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('disciplines')
    .update({
      institution_id: institutionId || null,
      subject,
      exercise_name: exerciseName,
      exercise_type: exerciseType,
      criteria: criteria || [],
      description: description || '',
    })
    .eq('id', params.id)
    .select().single();

  if (error || !data) return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  return NextResponse.json(fmt(data));
}

export async function DELETE(request, { params }) {
  const { data: existing } = await supabase.from('disciplines').select('user_id, org_id').eq('id', params.id).single();
  if (!(await canManage(request, existing))) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { error } = await supabase.from('disciplines').delete().eq('id', params.id);

  if (error) return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  return NextResponse.json({ success: true });
}
