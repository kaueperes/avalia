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
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { data: orgs } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });

  if (!orgs?.length) return NextResponse.json([]);

  // Uma query só pra todos os membros de todas as orgs — usada tanto pra contar quanto pra achar o admin
  const orgIds = orgs.map(o => o.id);
  const { data: members } = await supabase.from('users').select('org_id, org_role, name, email').in('org_id', orgIds);

  const result = orgs.map(org => {
    const orgMembers = (members || []).filter(m => m.org_id === org.id);
    const admin = orgMembers.find(m => m.org_role === 'admin');
    return { ...org, memberCount: orgMembers.length, adminName: admin?.name || null, adminEmail: admin?.email || null };
  });
  return NextResponse.json(result);
}

export async function POST(request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { name, quotaPool, quotaRelatoriosPool } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });

  // Nasce inativa: só é ativada automaticamente pelo webhook do Stripe quando o primeiro
  // pagamento da assinatura vinculada (ver "Editar" → Stripe Subscription ID) for confirmado.
  // Pode ser ativada manualmente em "Editar" se o pagamento foi combinado por fora do Stripe.
  const { data: org, error } = await supabase
    .from('organizations')
    .insert({ name: name.trim(), quota_pool: quotaPool || 0, quota_relatorios_pool: quotaRelatoriosPool || 0, active: false })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao criar organização' }, { status: 500 });
  return NextResponse.json(org, { status: 201 });
}
