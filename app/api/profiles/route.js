import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { PLANS } from '@/lib/types';

function fmt(p) {
  return {
    id: p.id,
    userId: p.user_id,
    name: p.name,
    tone: p.tone,
    writingSample: p.writing_sample,
    isDefault: p.is_default,
    // campos legados mantidos para compatibilidade
    discipline: p.discipline,
    turma: p.turma,
    teachingLevel: p.teaching_level,
    institutionLogo: p.institution_logo,
    institution: p.institution,
    createdAt: p.created_at,
  };
}

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data } = await supabase.from('profiles').select('*').eq('user_id', user.userId).order('created_at', { ascending: false });
  return NextResponse.json((data || []).map(fmt));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, tone, writingSample, isDefault, discipline, turma, teachingLevel, institutionLogo, institution } = await request.json();
  if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });

  const { data: dbUser } = await supabase.from('users').select('plan').eq('id', user.userId).single();
  const plan = PLANS[dbUser?.plan] || PLANS.gratuito;
  const maxPerfis = plan.limits.perfis;
  if (maxPerfis !== null) {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_id', user.userId);
    if (count >= maxPerfis) {
      return NextResponse.json({ error: `Seu plano permite no máximo ${maxPerfis} perfil(is). Faça upgrade para adicionar mais.` }, { status: 402 });
    }
  }

  // Se isDefault, remove o padrão anterior
  if (isDefault) {
    await supabase.from('profiles').update({ is_default: false }).eq('user_id', user.userId);
  }

  const { data: p, error } = await supabase.from('profiles')
    .insert({
      user_id: user.userId,
      name,
      tone: tone || 'neutro',
      writing_sample: writingSample || '',
      is_default: isDefault || false,
      discipline: discipline || '',
      turma: turma || '',
      teaching_level: teachingLevel || '',
      institution_logo: institutionLogo || '',
      institution: institution || '',
    })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json(fmt(p), { status: 201 });
}
