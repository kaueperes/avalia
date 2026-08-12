import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { coordinatedTeamIds } from '@/lib/orgAuth';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: dbUser } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
  if (!dbUser?.org_id) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const ctx = { userId: user.userId, orgId: dbUser.org_id, orgRole: dbUser.org_role };
  const isAdmin = dbUser.org_role === 'admin';

  // allowedDisciplines[userId] = null (sem filtro, vê tudo) ou Set de nomes de disciplina
  let allowedDisciplines = null; // null = não é admin nem coordenador, acesso negado
  let memberIds = [];

  if (isAdmin) {
    const { data: members } = await supabase.from('users').select('id').eq('org_id', dbUser.org_id);
    memberIds = (members || []).map(m => m.id);
    allowedDisciplines = {}; // admin não filtra por disciplina
  } else {
    const teamIds = await coordinatedTeamIds(ctx);
    if (!teamIds.length) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

    const { data: memberships } = await supabase.from('org_team_members').select('user_id, discipline_id').in('team_id', teamIds);
    if (!memberships?.length) return NextResponse.json([]);

    const disciplineIds = [...new Set(memberships.map(m => m.discipline_id))];
    const { data: disciplines } = await supabase.from('disciplines').select('id, subject').in('id', disciplineIds);
    const disciplineNameById = Object.fromEntries((disciplines || []).map(d => [d.id, d.subject]));

    allowedDisciplines = {};
    for (const m of memberships) {
      const name = disciplineNameById[m.discipline_id];
      if (!name) continue;
      if (!allowedDisciplines[m.user_id]) allowedDisciplines[m.user_id] = new Set();
      allowedDisciplines[m.user_id].add(name);
    }
    memberIds = Object.keys(allowedDisciplines);
  }

  if (!memberIds.length) return NextResponse.json([]);

  const { data: members } = await supabase.from('users').select('id, name, org_joined_at').in('id', memberIds);
  if (!members?.length) return NextResponse.json([]);

  const queries = members.map(m =>
    supabase.from('evaluations')
      .select('id, user_id, student_name, exercise_name, score, created_at, type, turma, disciplina')
      .eq('user_id', m.id)
      .gte('created_at', m.org_joined_at || '1970-01-01')
      .order('created_at', { ascending: false })
      .limit(100)
  );

  const results = await Promise.all(queries);
  const memberMap = Object.fromEntries(members.map(m => [m.id, m.name]));

  let all = results.flatMap((r, i) =>
    (r.data || []).map(e => ({ ...e, teacherName: memberMap[members[i].id] }))
  );

  // Coordenador só vê a disciplina vinculada de cada professor na equipe dele
  if (!isAdmin) {
    all = all.filter(e => allowedDisciplines[e.user_id]?.has(e.disciplina));
  }

  all = all.map(({ user_id, ...rest }) => rest);

  all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return NextResponse.json(all);
}
