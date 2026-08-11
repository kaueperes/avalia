import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

async function checkAdmin(request) {
  const decoded = getUserFromRequest(request);
  if (!decoded) return null;
  const { data: user } = await supabase.from('users').select('is_admin').eq('id', decoded.userId).single();
  return user?.is_admin ? decoded : null;
}

// POST { email } — define um professor (já com conta no Kriteria) como admin da organização
export async function POST(request, { params }) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { id } = await params;
  const { email } = await request.json();
  if (!email?.trim()) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });

  const normalizedEmail = email.trim().toLowerCase();

  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email, org_id, stripe_subscription_id')
    .eq('email', normalizedEmail)
    .single();

  if (!existingUser) {
    return NextResponse.json({ error: 'Nenhum professor com esse email tem conta no Kriteria ainda.' }, { status: 404 });
  }

  if (existingUser.org_id && existingUser.org_id !== id) {
    return NextResponse.json({ error: 'Este professor já pertence a outra organização.' }, { status: 409 });
  }

  const updates = { org_role: 'admin' };

  // Só trata como "entrada nova" na org se ele ainda não fazia parte dela
  if (existingUser.org_id !== id) {
    updates.org_id = id;
    updates.org_joined_at = new Date().toISOString();
    updates.org_quota_used = 0;
    updates.plan = 'org';
    updates.stripe_subscription_id = null;

    if (existingUser.stripe_subscription_id && stripe) {
      await stripe.subscriptions.cancel(existingUser.stripe_subscription_id).catch(() => {});
    }
  }

  const { error } = await supabase.from('users').update(updates).eq('id', existingUser.id);
  if (error) return NextResponse.json({ error: 'Erro ao definir admin' }, { status: 500 });

  return NextResponse.json({ ok: true, email: existingUser.email });
}
