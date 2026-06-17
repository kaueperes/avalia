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

  // Adicionar contagem de membros para cada org
  const counts = await Promise.all(
    orgs.map(org =>
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('org_id', org.id)
    )
  );

  const result = orgs.map((org, i) => ({ ...org, memberCount: counts[i].count || 0 }));
  return NextResponse.json(result);
}

export async function POST(request) {
  if (!await checkAdmin(request)) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });

  const { name, quotaPool } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({ name: name.trim(), quota_pool: quotaPool || 0 })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao criar organização' }, { status: 500 });
  return NextResponse.json(org, { status: 201 });
}
