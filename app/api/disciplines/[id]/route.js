import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(d) {
  return {
    id: d.id,
    userId: d.user_id,
    institutionId: d.institution_id,
    subject: d.subject,
    exerciseName: d.exercise_name,
    exerciseType: d.exercise_type,
    criteria: d.criteria,
    description: d.description,
    createdAt: d.created_at,
  };
}

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

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
    .eq('user_id', user.userId)
    .select().single();

  if (error || !data) return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  return NextResponse.json(fmt(data));
}

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { error } = await supabase
    .from('disciplines')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.userId);

  if (error) return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  return NextResponse.json({ success: true });
}
