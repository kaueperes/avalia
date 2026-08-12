import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(c) {
  return {
    id: c.id,
    userId: c.user_id,
    orgId: c.org_id,
    institutionId: c.institution_id,
    name: c.name,
    createdAt: c.created_at,
  };
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: dbUser } = await supabase.from('users').select('org_id').eq('id', user.userId).single();

  const { searchParams } = new URL(request.url);
  const institutionId = searchParams.get('institutionId');

  let query = supabase.from('classes').select('*').order('created_at', { ascending: false });
  query = dbUser?.org_id
    ? query.or(`user_id.eq.${user.userId},org_id.eq.${dbUser.org_id}`)
    : query.eq('user_id', user.userId);

  if (institutionId) query = query.eq('institution_id', institutionId);

  const { data } = await query;
  return NextResponse.json((data || []).map(fmt));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: dbUser } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
  if (dbUser?.org_id && dbUser.org_role !== 'admin') {
    return NextResponse.json({ error: 'Turmas são gerenciadas pela sua instituição. Fale com o administrador.' }, { status: 403 });
  }

  const { name, institutionId } = await request.json();
  if (!name) return NextResponse.json({ error: 'Nome da turma é obrigatório' }, { status: 400 });

  const { data, error } = await supabase
    .from('classes')
    .insert({ user_id: user.userId, org_id: dbUser?.org_id || null, name, institution_id: institutionId || null })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json(fmt(data), { status: 201 });
}
