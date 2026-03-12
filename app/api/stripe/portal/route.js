import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: dbUser } = await supabase.from('users').select('stripe_customer_id').eq('id', user.userId).single();
  if (!dbUser?.stripe_customer_id) {
    return NextResponse.json({ error: 'Nenhuma assinatura encontrada.' }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripe_customer_id,
    return_url: `${baseUrl}/conta`,
  });

  return NextResponse.json({ url: session.url });
}
