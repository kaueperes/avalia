import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(p) {
  return { id: p.id, userId: p.user_id, name: p.name, discipline: p.discipline, turma: p.turma, tone: p.tone, writingSample: p.writing_sample, institutionLogo: p.institution_logo, createdAt: p.created_at };
}

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, discipline, turma, tone, writingSample, institutionLogo } = await request.json();
  const { data: p, error } = await supabase.from('profiles')
    .update({ name, discipline, turma: turma || '', tone: tone || 'neutro', writing_sample: writingSample || '', institution_logo: institutionLogo || '' })
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
