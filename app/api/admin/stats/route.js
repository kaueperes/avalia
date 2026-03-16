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

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [usersRes, evalsRes, newUsersRes] = await Promise.all([
    supabase.from('users').select('plan, is_admin'),
    supabase.from('evaluations').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
  ]);

  const users = usersRes.data || [];
  const byPlan = users.reduce((acc, u) => {
    if (u.is_admin) return acc;
    acc[u.plan] = (acc[u.plan] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    totalUsers: users.filter(u => !u.is_admin).length,
    newThisMonth: newUsersRes.count ?? 0,
    totalEvaluations: evalsRes.count ?? 0,
    byPlan: {
      gratuito: byPlan.gratuito || 0,
      essencial: byPlan.essencial || 0,
      pro: byPlan.pro || 0,
      premium: byPlan.premium || 0,
    },
  });
}
