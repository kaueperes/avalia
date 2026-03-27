import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(e) {
  return { id: e.id, studentName: e.student_name, type: e.type, score: e.score, feedback: e.feedback, criteria: e.criteria, profileName: e.profile_name, turma: e.turma, exerciseName: e.exercise_name, institution: e.institution, disciplina: e.disciplina || '', createdAt: e.created_at };
}

export async function GET(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data, error } = await supabase.from('evaluations').select('*').eq('id', params.id).eq('user_id', user.userId).single();
  if (error || !data) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json(fmt(data));
}

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { studentName, score, feedback, criteria } = await request.json();
  const { error } = await supabase.from('evaluations')
    .update({ student_name: studentName, score, feedback, criteria })
    .eq('id', params.id)
    .eq('user_id', user.userId);

  if (error) return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { error } = await supabase.from('evaluations').delete().eq('id', params.id).eq('user_id', user.userId);
  if (error) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
