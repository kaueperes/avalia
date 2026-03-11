import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  essencial:     process.env.STRIPE_PRICE_ESSENCIAL,
  pro:           process.env.STRIPE_PRICE_PRO,
  premium:       process.env.STRIPE_PRICE_PREMIUM,
  extra_50:      process.env.STRIPE_PRICE_EXTRA_50,
  extra_100:     process.env.STRIPE_PRICE_EXTRA_100,
  extra_rel_5:   process.env.STRIPE_PRICE_EXTRA_REL_5,
  extra_rel_10:  process.env.STRIPE_PRICE_EXTRA_REL_10,
};

const ADDON_IDS = ['extra_50', 'extra_100', 'extra_rel_5', 'extra_rel_10'];

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { priceId: planKey } = await request.json();
  const priceId = PRICE_MAP[planKey];
  if (!priceId) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });

  const isAddon = ADDON_IDS.includes(planKey);

  // Busca ou cria customer no Stripe
  const { data: dbUser } = await supabase.from('users').select('stripe_customer_id, email, name').eq('id', user.userId).single();

  let customerId = dbUser?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: dbUser.email, name: dbUser.name, metadata: { userId: user.userId } });
    customerId = customer.id;
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.userId);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: isAddon ? 'payment' : 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/conta?success=1`,
    cancel_url:  `${baseUrl}/conta?canceled=1`,
    metadata: { userId: user.userId, planKey },
  });

  return NextResponse.json({ url: session.url });
}
