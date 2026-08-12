import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

async function checkAdmin(request) {
  const decoded = getUserFromRequest(request);
  if (!decoded) return null;
  const { data: user } = await supabase.from('users').select('is_admin').eq('id', decoded.userId).single();
  return user?.is_admin ? decoded : null;
}

// POST { type: 'avaliacoes' | 'relatorios', amount } — soma cota extra avulsa
// (quota_pool_extra / quota_relatorios_pool_extra), que nunca reseta na renovação
// do Stripe — diferente do pool contratado, editado em PUT /[id].
export async function POST(request, { params }) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { id } = await params;
  const { type, amount } = await request.json();
  const qty = Number(amount);

  if (!['avaliacoes', 'relatorios'].includes(type) || !qty || qty <= 0) {
    return NextResponse.json({ error: 'Tipo ou quantidade inválidos' }, { status: 400 });
  }

  const column = type === 'avaliacoes' ? 'quota_pool_extra' : 'quota_relatorios_pool_extra';

  const { data: org } = await supabase.from('organizations').select(column).eq('id', id).single();
  if (!org) return NextResponse.json({ error: 'Organização não encontrada' }, { status: 404 });

  const { data, error } = await supabase
    .from('organizations')
    .update({ [column]: (org[column] || 0) + qty })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'Erro ao adicionar cota extra' }, { status: 500 });
  return NextResponse.json(data);
}
