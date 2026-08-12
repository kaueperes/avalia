import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

async function checkAdmin(request) {
  const decoded = getUserFromRequest(request);
  if (!decoded) return null;
  const { data: user } = await supabase.from('users').select('is_admin').eq('id', decoded.userId).single();
  return user?.is_admin ? decoded : null;
}

export async function PUT(request, { params }) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { id } = await params;
  const { name, quotaPool, quotaRelatoriosPool, active, stripeCustomerId, stripeSubscriptionId } = await request.json();

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (quotaPool !== undefined) updates.quota_pool = quotaPool;
  if (quotaRelatoriosPool !== undefined) updates.quota_relatorios_pool = quotaRelatoriosPool;
  if (active !== undefined) updates.active = active;
  if (stripeCustomerId !== undefined) updates.stripe_customer_id = stripeCustomerId.trim() || null;
  if (stripeSubscriptionId !== undefined) updates.stripe_subscription_id = stripeSubscriptionId.trim() || null;

  const { data, error } = await supabase.from('organizations').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { id } = await params;

  // Desvincular todos os membros antes de deletar
  await supabase.from('users').update({
    org_id: null, org_role: null, org_joined_at: null,
    org_quota_limit: null, org_quota_used: 0,
    plan: 'gratuito', quota_ciclo: 5, quota_extra: 0,
  }).eq('org_id', id);

  await supabase.from('organizations').delete().eq('id', id);
  return NextResponse.json({ ok: true });
}
