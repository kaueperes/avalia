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

  // Aluno herda o escopo da turma (própria ou compartilhada da org) — não tem org_id próprio
  if (classId) {
    const { data: dbUser } = await supabase.from('users').select('org_id').eq('id', user.userId).single();
    const { data: cls } = await supabase.from('classes').select('user_id, org_id').eq('id', classId).single();
    const canView = cls && (cls.user_id === user.userId || (dbUser?.org_id && cls.org_id === dbUser.org_id));
    if (!canView) return NextResponse.json([]);

    const { data } = await supabase.from('students').select('*').eq('class_id', classId).order('name', { ascending: true });
    return NextResponse.json((data || []).map(fmt));
  }

  const { data } = await supabase.from('students').select('*').eq('user_id', user.userId).order('name', { ascending: true });
  return NextResponse.json((data || []).map(fmt));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, classId } = await request.json();
  if (!name || !classId) {
    return NextResponse.json({ error: 'Nome do aluno e turma são obrigatórios' }, { status: 400 });
  }

  const { data: cls } = await supabase.from('classes').select('user_id, org_id').eq('id', classId).single();
  if (!cls) return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 });
  if (cls.user_id !== user.userId) {
    if (!cls.org_id) return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 });
    const { data: dbUser } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
    if (dbUser?.org_id !== cls.org_id || dbUser.org_role !== 'admin') {
      return NextResponse.json({ error: 'Alunos são gerenciados pela sua instituição. Fale com o administrador.' }, { status: 403 });
    }
  }

  const { data, error } = await supabase
    .from('students')
    .insert({ user_id: user.userId, class_id: classId, name })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json(fmt(data), { status: 201 });
}
