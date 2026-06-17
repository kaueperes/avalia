import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// GET ?token=UUID — retorna info do convite (sem auth)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 });

  const { data: invite } = await supabase
    .from('org_invites')
    .select('id, email, role, status, org_id, organizations(name)')
    .eq('token', token)
    .single();

  if (!invite) return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 });
  if (invite.status !== 'pending') return NextResponse.json({ error: 'Este convite já foi utilizado ou cancelado', status: invite.status }, { status: 410 });

  return NextResponse.json({
    email: invite.email,
    role: invite.role,
    orgName: invite.organizations?.name,
  });
}

// POST { token } — aceitar convite (requer auth)
export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Faça login para aceitar o convite' }, { status: 401 });

  const { token } = await request.json();
  if (!token) return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 });

  const { data: invite } = await supabase
    .from('org_invites')
    .select('id, email, role, status, org_id, organizations(name)')
    .eq('token', token)
    .single();

  if (!invite) return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 });
  if (invite.status !== 'pending') return NextResponse.json({ error: 'Este convite já foi utilizado ou cancelado' }, { status: 410 });

  // Verificar que o email do usuário logado bate com o convite
  const { data: dbUser } = await supabase.from('users').select('email, org_id, stripe_subscription_id').eq('id', user.userId).single();
  if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

  if (dbUser.email.toLowerCase() !== invite.email.toLowerCase()) {
    return NextResponse.json({ error: 'Este convite foi enviado para outro email' }, { status: 403 });
  }

  if (dbUser.org_id) return NextResponse.json({ error: 'Você já pertence a uma organização' }, { status: 409 });

  // Cancelar assinatura Stripe se existir
  if (dbUser.stripe_subscription_id && stripe) {
    await stripe.subscriptions.cancel(dbUser.stripe_subscription_id).catch(() => {});
  }

  // Vincular usuário à org
  await supabase.from('users').update({
    org_id: invite.org_id,
    org_role: invite.role,
    org_joined_at: new Date().toISOString(),
    org_quota_used: 0,
    plan: 'org',
    stripe_subscription_id: null,
  }).eq('id', user.userId);

  // Marcar convite como aceito
  await supabase.from('org_invites').update({
    status: 'accepted',
    accepted_at: new Date().toISOString(),
  }).eq('id', invite.id);

  return NextResponse.json({ ok: true, orgName: invite.organizations?.name });
}
