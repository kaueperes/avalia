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

export async function GET(request) {
  const admin = await getOrgAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const { data: members } = await supabase
    .from('users')
    .select('id, name, email, org_role, org_quota_limit, org_quota_used, org_joined_at')
    .eq('org_id', admin.orgId)
    .order('org_joined_at', { ascending: true });

  return NextResponse.json(members || []);
}

// PUT: atualizar limite de cota de um membro
export async function PUT(request) {
  const admin = await getOrgAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const { memberId, orgQuotaLimit } = await request.json();
  if (!memberId) return NextResponse.json({ error: 'memberId obrigatório' }, { status: 400 });

  // Verificar que o membro pertence à mesma org
  const { data: member } = await supabase.from('users').select('org_id').eq('id', memberId).single();
  if (member?.org_id !== admin.orgId) return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });

  await supabase.from('users').update({ org_quota_limit: orgQuotaLimit ?? null }).eq('id', memberId);
  return NextResponse.json({ ok: true });
}

// DELETE: remover membro da org
export async function DELETE(request) {
  const admin = await getOrgAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get('memberId');
  if (!memberId) return NextResponse.json({ error: 'memberId obrigatório' }, { status: 400 });

  // Não pode remover a si mesmo
  if (memberId === admin.userId) return NextResponse.json({ error: 'Você não pode remover a si mesmo' }, { status: 400 });

  // Verificar que o membro pertence à mesma org
  const { data: member } = await supabase.from('users').select('org_id, org_quota_used').eq('id', memberId).single();
  if (member?.org_id !== admin.orgId) return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });

  // Reverter o membro para plano gratuito e desvinculá-lo da org
  await supabase.from('users').update({
    org_id: null,
    org_role: null,
    org_joined_at: null,
    org_quota_limit: null,
    org_quota_used: 0,
    plan: 'gratuito',
    quota_ciclo: 5,
    quota_extra: 0,
  }).eq('id', memberId);

  return NextResponse.json({ ok: true });
}
