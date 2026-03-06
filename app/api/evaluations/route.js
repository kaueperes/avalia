import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(e) {
  return { id: e.id, userId: e.user_id, studentName: e.student_name, type: e.type, score: e.score, feedback: e.feedback, criteria: e.criteria, profileName: e.profile_name, turma: e.turma, exerciseName: e.exercise_name, createdAt: e.created_at };
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data } = await supabase.from('evaluations').select('*').eq('user_id', user.userId).order('created_at', { ascending: false });
  return NextResponse.json((data || []).map(fmt));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { studentName, type, score, feedback, criteria, profileName, turma, exerciseName } = await request.json();
  if (!studentName || !type || score === undefined) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
  }

  const { data: e, error } = await supabase.from('evaluations')
    .insert({ user_id: user.userId, student_name: studentName, type, score, feedback: feedback || '', criteria: criteria || [], profile_name: profileName || '', turma: turma || '', exercise_name: exerciseName || '' })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json(fmt(e), { status: 201 });
}
