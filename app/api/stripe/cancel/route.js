import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: dbUser } = await supabase
    .from('users')
    .select('stripe_subscription_id')
    .eq('id', user.userId)
    .single();

  if (!dbUser?.stripe_subscription_id) {
    return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada.' }, { status: 400 });
  }

  const subscription = await stripe.subscriptions.update(dbUser.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  const cancelDate = new Date(subscription.current_period_end * 1000).toISOString();

  return NextResponse.json({ ok: true, cancelDate });
}
