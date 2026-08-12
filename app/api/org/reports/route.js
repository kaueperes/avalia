import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { coordinatedTeamIds } from '@/lib/orgAuth';
import { supabase } from '@/lib/supabase';

// GET: relatórios (parecer de aluno / relatório de turma) gerados por qualquer
// professor da organização — mesma lógica de escopo de /api/org/evaluations,
// só que a disciplina fica dentro de content.disciplina (JSONB), não numa coluna.
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: dbUser } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
  if (!dbUser?.org_id) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const ctx = { userId: user.userId, orgId: dbUser.org_id, orgRole: dbUser.org_role };
  const isAdmin = dbUser.org_role === 'admin';

  let allowedDisciplines = {};
  let memberIds = [];

  if (isAdmin) {
    const { data: members } = await supabase.from('users').select('id').eq('org_id', dbUser.org_id);
    memberIds = (members || []).map(m => m.id);
  } else {
    const teamIds = await coordinatedTeamIds(ctx);
    if (!teamIds.length) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

    const { data: memberships } = await supabase.from('org_team_members').select('user_id, discipline_id').in('team_id', teamIds);
    if (!memberships?.length) return NextResponse.json([]);

    const disciplineIds = [...new Set(memberships.map(m => m.discipline_id))];
    const { data: disciplines } = await supabase.from('disciplines').select('id, subject').in('id', disciplineIds);
    const disciplineNameById = Object.fromEntries((disciplines || []).map(d => [d.id, d.subject]));

    for (const m of memberships) {
      const name = disciplineNameById[m.discipline_id];
      if (!name) continue;
      if (!allowedDisciplines[m.user_id]) allowedDisciplines[m.user_id] = new Set();
      allowedDisciplines[m.user_id].add(name);
    }
    memberIds = Object.keys(allowedDisciplines);
  }

  if (!memberIds.length) return NextResponse.json([]);

  const { data: members } = await supabase.from('users').select('id, name').in('id', memberIds);
  if (!members?.length) return NextResponse.json([]);
  const memberMap = Object.fromEntries(members.map(m => [m.id, m.name]));

  const { data: reports } = await supabase
    .from('reports')
    .select('id, user_id, type, subject, turma, exercise_name, institution, profile_name, content, created_at')
    .in('user_id', memberIds)
    .order('created_at', { ascending: false })
    .limit(200);

  let all = (reports || []).map(r => ({ ...r, teacherName: memberMap[r.user_id] }));

  // Coordenador só vê a disciplina vinculada de cada professor na equipe dele
  if (!isAdmin) {
    all = all.filter(r => allowedDisciplines[r.user_id]?.has(r.content?.disciplina));
  }

  all = all.map(({ user_id, content, ...rest }) => ({ ...rest, disciplina: content?.disciplina || '', resumo: content?.resumo || content?.parecer || '' }));

  return NextResponse.json(all);
}
