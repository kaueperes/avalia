import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(p) {
  return {
    id: p.id, userId: p.user_id, name: p.name, tone: p.tone,
    writingSample: p.writing_sample, isDefault: p.is_default,
    discipline: p.discipline, turma: p.turma, teachingLevel: p.teaching_level,
    institutionLogo: p.institution_logo, institution: p.institution, createdAt: p.created_at,
  };
}

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, tone, writingSample, isDefault, discipline, turma, teachingLevel, institutionLogo, institution } = await request.json();

  // Se isDefault, remove o padrão anterior
  if (isDefault) {
    await supabase.from('profiles').update({ is_default: false }).eq('user_id', user.userId).neq('id', params.id);
  }

  const { data: p, error } = await supabase.from('profiles')
    .update({
      name, tone: tone || 'neutro', writing_sample: writingSample || '',
      is_default: isDefault || false,
      discipline: discipline || '', turma: turma || '',
      teaching_level: teachingLevel || '', institution_logo: institutionLogo || '', institution: institution || '',
    })
    .eq('id', params.id).eq('user_id', user.userId)
    .select().single();

  if (error || !p) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json(fmt(p));
}

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { error } = await supabase.from('profiles').delete().eq('id', params.id).eq('user_id', user.userId);
  if (error) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
