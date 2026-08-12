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

// POST: adiciona um professor + disciplina (compartilhada da org) à equipe
export async function POST(request, { params }) {
  const admin = await getOrgAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const { id: teamId } = await params;
  const { data: team } = await supabase.from('org_teams').select('org_id').eq('id', teamId).single();
  if (team?.org_id !== admin.orgId) return NextResponse.json({ error: 'Equipe não encontrada' }, { status: 404 });

  const { userId, disciplineId } = await request.json();
  if (!userId || !disciplineId) return NextResponse.json({ error: 'Professor e disciplina obrigatórios' }, { status: 400 });

  const { data: member } = await supabase.from('users').select('org_id').eq('id', userId).single();
  if (member?.org_id !== admin.orgId) return NextResponse.json({ error: 'Professor não pertence à sua organização' }, { status: 400 });

  const { data: discipline } = await supabase.from('disciplines').select('org_id').eq('id', disciplineId).single();
  if (discipline?.org_id !== admin.orgId) return NextResponse.json({ error: 'Disciplina não pertence à sua organização' }, { status: 400 });

  const { data, error } = await supabase
    .from('org_team_members')
    .insert({ team_id: teamId, user_id: userId, discipline_id: disciplineId })
    .select().single();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Esse professor já está nessa equipe com essa disciplina' }, { status: 409 });
    return NextResponse.json({ error: 'Erro ao adicionar à equipe' }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// DELETE: remove um vínculo professor+disciplina da equipe (?memberId=)
export async function DELETE(request, { params }) {
  const admin = await getOrgAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const { id: teamId } = await params;
  const { data: team } = await supabase.from('org_teams').select('org_id, coordinator_id').eq('id', teamId).single();
  if (team?.org_id !== admin.orgId) return NextResponse.json({ error: 'Equipe não encontrada' }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get('memberId');
  if (!memberId) return NextResponse.json({ error: 'memberId obrigatório' }, { status: 400 });

  const { data: membership } = await supabase.from('org_team_members').select('user_id').eq('id', memberId).eq('team_id', teamId).single();
  if (!membership) return NextResponse.json({ error: 'Vínculo não encontrado' }, { status: 404 });

  await supabase.from('org_team_members').delete().eq('id', memberId);

  // Se essa era a última disciplina do coordenador nessa equipe, ele perde a coordenação
  if (team.coordinator_id === membership.user_id) {
    const { count } = await supabase.from('org_team_members').select('id', { count: 'exact', head: true }).eq('team_id', teamId).eq('user_id', membership.user_id);
    if (!count) await supabase.from('org_teams').update({ coordinator_id: null }).eq('id', teamId);
  }

  return NextResponse.json({ ok: true });
}
