import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: dbUser } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
  if (!dbUser?.org_id || dbUser.org_role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const orgId = dbUser.org_id;
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const [orgRes, membersRes, invitesRes] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', orgId).single(),
    supabase.from('users').select('id, name, email, org_quota_limit, org_quota_used, org_joined_at').eq('org_id', orgId),
    supabase.from('org_invites').select('id', { count: 'exact', head: true }).eq('org_id', orgId).eq('status', 'pending'),
  ]);

  const members = membersRes.data || [];
  const memberIds = members.map(m => m.id);

  let evalThisMonth = 0;
  if (memberIds.length > 0) {
    const { count } = await supabase.from('evaluations')
      .select('id', { count: 'exact', head: true })
      .in('user_id', memberIds)
      .gte('created_at', firstOfMonth);
    evalThisMonth = count || 0;
  }

  return NextResponse.json({
    org: orgRes.data,
    memberCount: members.length,
    evalThisMonth,
    pendingInvites: invitesRes.count || 0,
  });
}
