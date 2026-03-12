import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { PLANS, ADDONS, REPORT_ADDONS } from '@/lib/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.text();
  const sig  = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, planKey } = session.metadata;

    if (!userId || !planKey) return NextResponse.json({ ok: true });

    const isEvalAddon = ['extra_50', 'extra_100'].includes(planKey);
    const isReportAddon = ['extra_rel_5', 'extra_rel_10'].includes(planKey);

    if (isEvalAddon) {
      const addon = ADDONS.find(a => a.id === planKey);
      if (addon) {
        const { data: user } = await supabase.from('users').select('quota_extra').eq('id', userId).single();
        await supabase.from('users').update({ quota_extra: (user?.quota_extra ?? 0) + addon.qty }).eq('id', userId);
      }
    } else if (isReportAddon) {
      const addon = REPORT_ADDONS.find(a => a.id === planKey);
      if (addon) {
        const { data: user } = await supabase.from('users').select('quota_relatorios_extra').eq('id', userId).single();
        await supabase.from('users').update({ quota_relatorios_extra: (user?.quota_relatorios_extra ?? 0) + addon.qty }).eq('id', userId);
      }
    } else {
      const plan = PLANS[planKey];
      if (plan) {
        let resetDate = null;
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          resetDate = new Date(sub.current_period_end * 1000).toISOString();
        }
        await supabase.from('users').update({
          plan: planKey,
          quota_ciclo: plan.limits.avaliacoes ?? 9999,
          quota_relatorios_ciclo: plan.limits.relatorios ?? 0,
          stripe_subscription_id: session.subscription,
          quota_reset_date: resetDate,
        }).eq('id', userId);
      }
    }
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    // Only reset quota on renewal (not on first payment, which is handled by checkout.session.completed)
    if (invoice.billing_reason === 'subscription_cycle') {
      const { data: user } = await supabase.from('users').select('id, plan').eq('stripe_subscription_id', invoice.subscription).single();
      if (user) {
        const plan = PLANS[user.plan];
        if (plan) {
          const periodEnd = invoice.lines?.data?.[0]?.period?.end;
          const resetDate = periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
          await supabase.from('users').update({
            quota_ciclo: plan.limits.avaliacoes ?? 9999,
            quota_relatorios_ciclo: plan.limits.relatorios ?? 0,
            ...(resetDate && { quota_reset_date: resetDate }),
          }).eq('id', user.id);
        }
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const { data: user } = await supabase.from('users').select('id').eq('stripe_subscription_id', subscription.id).single();
    if (user) {
      const gratuito = PLANS.gratuito;
      await supabase.from('users').update({
        plan: 'gratuito',
        quota_ciclo: gratuito.limits.avaliacoes,
        quota_relatorios_ciclo: 0,
        stripe_subscription_id: null,
      }).eq('id', user.id);
    }
  }

  return NextResponse.json({ ok: true });
}
