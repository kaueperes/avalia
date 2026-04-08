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

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const institutionId = searchParams.get('institutionId');

  let query = supabase
    .from('disciplines')
    .select('*')
    .eq('user_id', user.userId)
    .order('created_at', { ascending: false });

  if (institutionId) query = query.eq('institution_id', institutionId);

  const { data } = await query;
  return NextResponse.json((data || []).map(fmt));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { institutionId, subject, exerciseName, exerciseType, criteria, description } = await request.json();
  if (!subject || !exerciseName || !exerciseType) {
    return NextResponse.json({ error: 'Disciplina, nome e tipo do exercício são obrigatórios' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('disciplines')
    .insert({
      user_id: user.userId,
      institution_id: institutionId || null,
      subject,
      exercise_name: exerciseName,
      exercise_type: exerciseType,
      criteria: criteria || [],
      description: description || '',
    })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json(fmt(data), { status: 201 });
}
