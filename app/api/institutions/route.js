import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(i) {
  return {
    id: i.id,
    userId: i.user_id,
    orgId: i.org_id,
    name: i.name,
    logoUrl: i.logo_url,
    educationLevel: i.education_level,
    createdAt: i.created_at,
  };
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: dbUser } = await supabase.from('users').select('org_id').eq('id', user.userId).single();

  let query = supabase.from('institutions').select('*').order('created_at', { ascending: false });
  query = dbUser?.org_id
    ? query.or(`user_id.eq.${user.userId},org_id.eq.${dbUser.org_id}`)
    : query.eq('user_id', user.userId);

  const { data } = await query;
  return NextResponse.json((data || []).map(fmt));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: dbUser } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
  if (dbUser?.org_id && dbUser.org_role !== 'admin') {
    return NextResponse.json({ error: 'Instituição é gerenciada pela sua organização. Fale com o administrador.' }, { status: 403 });
  }

  const { name, logoUrl, educationLevel } = await request.json();
  if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });

  const { data, error } = await supabase
    .from('institutions')
    .insert({ user_id: user.userId, org_id: dbUser?.org_id || null, name, logo_url: logoUrl || '', education_level: educationLevel || '' })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json(fmt(data), { status: 201 });
}
