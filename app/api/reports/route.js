import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(r) {
  return { id: r.id, type: r.type, subject: r.subject, turma: r.turma, exerciseName: r.exercise_name, institution: r.institution || '', profileName: r.profile_name || '', content: r.content, createdAt: r.created_at };
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data } = await supabase.from('reports').select('*').eq('user_id', user.userId).order('created_at', { ascending: false });
  return NextResponse.json((data || []).map(fmt));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { type, subject, turma, exerciseName, content } = await request.json();
  if (!type || !content) return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });

  const { data: r, error } = await supabase.from('reports')
    .insert({ user_id: user.userId, type, subject: subject || '', turma: turma || '', exercise_name: exerciseName || '', content })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar relatório' }, { status: 500 });
  return NextResponse.json(fmt(r), { status: 201 });
}
