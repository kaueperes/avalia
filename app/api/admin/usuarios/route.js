import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

async function checkAdmin(request) {
  const decoded = getUserFromRequest(request);
  if (!decoded) return null;
  const { data: user } = await supabase.from('users').select('is_admin').eq('id', decoded.userId).single();
  return user?.is_admin ? decoded : null;
}

export async function GET(request) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q') || '';

  let query = supabase
    .from('users')
    .select('id, name, email, plan, quota_ciclo, quota_extra, quota_relatorios_ciclo, quota_relatorios_extra, created_at, is_admin')
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

export async function PATCH(request) {
  if (!await checkAdmin(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const { userId, plan, addQuota, addQuotaRel } = await request.json();
  if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });

  const updates = {};
  if (plan !== undefined) updates.plan = plan;

  if (addQuota || addQuotaRel) {
    const { data: current } = await supabase.from('users').select('quota_ciclo, quota_relatorios_ciclo').eq('id', userId).single();
    if (addQuota) updates.quota_ciclo = (current?.quota_ciclo ?? 0) + addQuota;
    if (addQuotaRel) updates.quota_relatorios_ciclo = (current?.quota_relatorios_ciclo ?? 0) + addQuotaRel;
  }

  const { error } = await supabase.from('users').update(updates).eq('id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
