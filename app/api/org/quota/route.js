import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET: cota da organização do usuário logado — acessível a qualquer membro
// (admin ou não), diferente de /api/org/dashboard que é só pra admin.
export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: dbUser } = await supabase.from('users').select('org_id').eq('id', user.userId).single();
  if (!dbUser?.org_id) return NextResponse.json({ error: 'Você não pertence a uma organização' }, { status: 403 });

  const { data: org } = await supabase
    .from('organizations')
    .select('quota_pool, quota_used, quota_pool_extra, quota_relatorios_pool, quota_relatorios_used, quota_relatorios_pool_extra, active')
    .eq('id', dbUser.org_id)
    .single();

  const { count } = await supabase.from('org_teams').select('id', { count: 'exact', head: true }).eq('coordinator_id', user.userId);

  return NextResponse.json({ ...(org || {}), isCoordinator: !!count });
}
