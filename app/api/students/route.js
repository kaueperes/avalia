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

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');

  let query = supabase
    .from('students')
    .select('*')
    .eq('user_id', user.userId)
    .order('name', { ascending: true });

  if (classId) query = query.eq('class_id', classId);

  const { data } = await query;
  return NextResponse.json((data || []).map(fmt));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, classId } = await request.json();
  if (!name || !classId) {
    return NextResponse.json({ error: 'Nome do aluno e turma são obrigatórios' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('students')
    .insert({ user_id: user.userId, class_id: classId, name })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json(fmt(data), { status: 201 });
}
