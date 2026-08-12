import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { PLANS } from '@/lib/types';

function fmt(e, authorName) {
  return { id: e.id, userId: e.user_id, authorName: authorName || null, name: e.name, type: e.type, disciplina: e.disciplina || '', context: e.context, criteria: e.criteria, disciplineId: e.discipline_id || null, createdAt: e.created_at };
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: dbUser } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const disciplineId = searchParams.get('disciplineId');

  let query = supabase.from('exercises').select('*').order('created_at', { ascending: false });
  if (dbUser?.org_id && dbUser.org_role === 'admin') {
    // Admin vê também os exercícios de outros professores nas disciplinas compartilhadas da org
    const { data: orgDisciplines } = await supabase.from('disciplines').select('id').eq('org_id', dbUser.org_id);
    const orgDisciplineIds = (orgDisciplines || []).map(d => d.id);
    query = orgDisciplineIds.length
      ? query.or(`user_id.eq.${user.userId},discipline_id.in.(${orgDisciplineIds.join(',')})`)
      : query.eq('user_id', user.userId);
  } else {
    query = query.eq('user_id', user.userId);
  }
  if (type) query = query.eq('type', type);
  if (disciplineId) query = query.eq('discipline_id', disciplineId);

  const { data } = await query;

  // Anexa o nome do autor só quando não é o próprio usuário (evita join desnecessário)
  const otherIds = [...new Set((data || []).filter(e => e.user_id !== user.userId).map(e => e.user_id))];
  let names = {};
  if (otherIds.length) {
    const { data: authors } = await supabase.from('users').select('id, name').in('id', otherIds);
    names = Object.fromEntries((authors || []).map(a => [a.id, a.name]));
  }

  return NextResponse.json((data || []).map(e => fmt(e, names[e.user_id])));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, type, disciplina, context, criteria, disciplineId } = await request.json();
  if (!name || !type) {
    return NextResponse.json({ error: 'Nome e tipo são obrigatórios' }, { status: 400 });
  }

  const { data: dbUser } = await supabase.from('users').select('plan, org_id').eq('id', user.userId).single();
  // Usuário de org não tem limite individual de exercício — cota é do pool da instituição
  if (!dbUser?.org_id) {
    const plan = PLANS[dbUser?.plan] || PLANS.gratuito;
    const maxExercicios = plan.limits.exercicios;
    if (maxExercicios !== null) {
      const { count } = await supabase.from('exercises').select('*', { count: 'exact', head: true }).eq('user_id', user.userId);
      if (count >= maxExercicios) {
        return NextResponse.json({ error: `Seu plano permite no máximo ${maxExercicios} exercício(s). Faça upgrade para adicionar mais.` }, { status: 402 });
      }
    }
  }

  const { data: e, error } = await supabase.from('exercises')
    .insert({ user_id: user.userId, name, type, disciplina: disciplina || '', context: context || '', criteria: criteria || [], discipline_id: disciplineId || null })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json(fmt(e), { status: 201 });
}
