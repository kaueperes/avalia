import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(d) {
  return {
    id: d.id,
    userId: d.user_id,
    orgId: d.org_id,
    institutionId: d.institution_id,
    subject: d.subject,
    exerciseName: d.exercise_name,
    exerciseType: d.exercise_type,
    criteria: d.criteria,
    description: d.description,
    createdAt: d.created_at,
  };
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: dbUser } = await supabase.from('users').select('org_id').eq('id', user.userId).single();

  const { searchParams } = new URL(request.url);
  const institutionId = searchParams.get('institutionId');

  // Usuário de org vê as próprias disciplinas + as compartilhadas pela instituição
  let query = supabase.from('disciplines').select('*').order('created_at', { ascending: false });
  query = dbUser?.org_id
    ? query.or(`user_id.eq.${user.userId},org_id.eq.${dbUser.org_id}`)
    : query.eq('user_id', user.userId);

  if (institutionId) query = query.or(`institution_id.eq.${institutionId},institution_id.is.null`);

  const { data } = await query;
  return NextResponse.json((data || []).map(fmt));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: dbUser } = await supabase.from('users').select('org_id, org_role').eq('id', user.userId).single();
  // Dentro de uma org, disciplina é gerenciada pelo admin — professor comum só escolhe
  if (dbUser?.org_id && dbUser.org_role !== 'admin') {
    return NextResponse.json({ error: 'Disciplinas são gerenciadas pela sua instituição. Fale com o administrador.' }, { status: 403 });
  }

  const { institutionId, subject, exerciseName, exerciseType, criteria, description } = await request.json();
  if (!subject || !exerciseName || !exerciseType) {
    return NextResponse.json({ error: 'Disciplina, nome e tipo do exercício são obrigatórios' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('disciplines')
    .insert({
      user_id: user.userId,
      org_id: dbUser?.org_id || null,
      institution_id: institutionId || null,
      subject,
      exercise_name: exerciseName,
      exercise_type: exerciseType,
      criteria: criteria || [],
      description: description || '',
    })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json(fmt(data), { status: 201 });
}
