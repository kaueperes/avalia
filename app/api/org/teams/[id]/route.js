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

// PUT: renomear equipe e/ou definir coordenador (precisa já ser membro da equipe)
export async function PUT(request, { params }) {
  const admin = await getOrgAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const { id } = await params;
  const { data: team } = await supabase.from('org_teams').select('org_id').eq('id', id).single();
  if (team?.org_id !== admin.orgId) return NextResponse.json({ error: 'Equipe não encontrada' }, { status: 404 });

  const { name, coordinatorId } = await request.json();
  const updates = {};
  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: 'Nome da equipe obrigatório' }, { status: 400 });
    updates.name = name.trim();
  }
  if (coordinatorId !== undefined) {
    if (coordinatorId) {
      const { data: member } = await supabase.from('org_team_members').select('id').eq('team_id', id).eq('user_id', coordinatorId).limit(1).single();
      if (!member) return NextResponse.json({ error: 'O coordenador precisa já ser membro da equipe' }, { status: 400 });
    }
    updates.coordinator_id = coordinatorId || null;
  }

  const { data, error } = await supabase.from('org_teams').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: 'Erro ao atualizar equipe' }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE: exclui a equipe (membros são removidos em cascata via FK)
export async function DELETE(request, { params }) {
  const admin = await getOrgAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const { id } = await params;
  const { data: team } = await supabase.from('org_teams').select('org_id').eq('id', id).single();
  if (team?.org_id !== admin.orgId) return NextResponse.json({ error: 'Equipe não encontrada' }, { status: 404 });

  const { error } = await supabase.from('org_teams').delete().eq('id', id);
  if (error) return NextResponse.json({ error: 'Erro ao excluir equipe' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
