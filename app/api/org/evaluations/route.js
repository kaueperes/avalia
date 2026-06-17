import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: dbUser } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
  if (!dbUser?.org_id || dbUser.org_role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const { data: members } = await supabase
    .from('users')
    .select('id, name, org_joined_at')
    .eq('org_id', dbUser.org_id);

  if (!members?.length) return NextResponse.json([]);

  // Para cada membro, buscar avaliações feitas após a data de entrada na org
  const queries = members.map(m =>
    supabase.from('evaluations')
      .select('id, student_name, exercise_name, score, created_at, type, turma, disciplina')
      .eq('user_id', m.id)
      .gte('created_at', m.org_joined_at || '1970-01-01')
      .order('created_at', { ascending: false })
      .limit(100)
  );

  const results = await Promise.all(queries);
  const memberMap = Object.fromEntries(members.map(m => [m.id, m.name]));

  const all = results.flatMap((r, i) =>
    (r.data || []).map(e => ({ ...e, teacherName: memberMap[members[i].id] }))
  );

  all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return NextResponse.json(all);
}
