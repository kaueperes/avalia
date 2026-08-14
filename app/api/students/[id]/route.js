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

// Aluno herda permissão da turma (própria, ou compartilhada da org — aí só quem
// criou aquele aluno ou o admin pode editar/excluir, pra evitar um professor
// mexer no que outro colega cadastrou por engano).
async function canManage(request, studentId) {
  const user = getUserFromRequest(request);
  if (!user) return null;
  const { data: student } = await supabase.from('students').select('user_id, class_id').eq('id', studentId).single();
  if (!student) return null;
  const { data: cls } = await supabase.from('classes').select('user_id, org_id').eq('id', student.class_id).single();
  if (!cls) return null;
  if (cls.user_id === user.userId) return user;
  if (!cls.org_id) return null;
  if (student.user_id === user.userId) return user;
  const { data: dbUser } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
  return (dbUser?.org_id === cls.org_id && dbUser.org_role === 'admin') ? user : null;
}

export async function PUT(request, { params }) {
  if (!(await canManage(request, params.id))) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { name, classId } = await request.json();
  if (!name) return NextResponse.json({ error: 'Nome do aluno é obrigatório' }, { status: 400 });

  const { data, error } = await supabase
    .from('students')
    .update({ name, ...(classId ? { class_id: classId } : {}) })
    .eq('id', params.id)
    .select().single();

  if (error || !data) return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  return NextResponse.json(fmt(data));
}

export async function DELETE(request, { params }) {
  if (!(await canManage(request, params.id))) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { error } = await supabase.from('students').delete().eq('id', params.id);

  if (error) return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  return NextResponse.json({ success: true });
}
