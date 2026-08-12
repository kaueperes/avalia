import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

async function getOrgAdmin(request) {
  const user = getUserFromRequest(request);
  if (!user) return null;
  const { data } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
  if (!data?.org_id || data.org_role !== 'admin') return null;
  return { userId: user.userId, orgId: data.org_id };
}

// GET: lista as equipes da org, com membros (professor + disciplina) e coordenador
export async function GET(request) {
  const admin = await getOrgAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const { data: teams } = await supabase
    .from('org_teams')
    .select('id, name, coordinator_id, created_at')
    .eq('org_id', admin.orgId)
    .order('created_at', { ascending: true });

  if (!teams?.length) return NextResponse.json([]);

  const teamIds = teams.map(t => t.id);
  const { data: members } = await supabase
    .from('org_team_members')
    .select('id, team_id, user_id, discipline_id')
    .in('team_id', teamIds);

  const userIds = [...new Set((members || []).map(m => m.user_id))];
  const disciplineIds = [...new Set((members || []).map(m => m.discipline_id))];

  const [{ data: users }, { data: disciplines }] = await Promise.all([
    userIds.length ? supabase.from('users').select('id, name, email').in('id', userIds) : { data: [] },
    disciplineIds.length ? supabase.from('disciplines').select('id, subject').in('id', disciplineIds) : { data: [] },
  ]);
  const userMap = Object.fromEntries((users || []).map(u => [u.id, u]));
  const disciplineMap = Object.fromEntries((disciplines || []).map(d => [d.id, d.subject]));

  const result = teams.map(team => ({
    id: team.id,
    name: team.name,
    coordinatorId: team.coordinator_id,
    coordinatorName: team.coordinator_id ? userMap[team.coordinator_id]?.name : null,
    members: (members || []).filter(m => m.team_id === team.id).map(m => ({
      id: m.id,
      userId: m.user_id,
      userName: userMap[m.user_id]?.name || '',
      userEmail: userMap[m.user_id]?.email || '',
      disciplineId: m.discipline_id,
      disciplineName: disciplineMap[m.discipline_id] || '',
    })),
  }));

  return NextResponse.json(result);
}

// POST: cria uma equipe nova (só nome — membros são adicionados depois)
export async function POST(request) {
  const admin = await getOrgAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nome da equipe obrigatório' }, { status: 400 });

  const { data, error } = await supabase
    .from('org_teams')
    .insert({ org_id: admin.orgId, name: name.trim() })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao criar equipe' }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
