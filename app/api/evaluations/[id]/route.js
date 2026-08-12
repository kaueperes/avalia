import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getOrgContext, canAccessOrgMember } from '@/lib/orgAuth';

function fmt(e) {
  return { id: e.id, studentName: e.student_name, type: e.type, score: e.score, feedback: e.feedback, criteria: e.criteria, profileName: e.profile_name, turma: e.turma, exerciseName: e.exercise_name, institution: e.institution, disciplina: e.disciplina || '', institutionLogoUrl: e.institution_logo_url || '', createdAt: e.created_at };
}

export async function GET(request, { params }) {
  const ctx = await getOrgContext(request);
  if (!ctx) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data, error } = await supabase.from('evaluations').select('*').eq('id', params.id).single();
  if (error || !data || !(await canAccessOrgMember(ctx, data.user_id))) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  }
  return NextResponse.json(fmt(data));
}

export async function PUT(request, { params }) {
  const ctx = await getOrgContext(request);
  if (!ctx) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: existing } = await supabase.from('evaluations').select('user_id').eq('id', params.id).single();
  if (!existing || !(await canAccessOrgMember(ctx, existing.user_id))) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  }

  const { studentName, score, feedback, criteria } = await request.json();
  const { error } = await supabase.from('evaluations')
    .update({ student_name: studentName, score, feedback, criteria })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const ctx = await getOrgContext(request);
  if (!ctx) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: existing } = await supabase.from('evaluations').select('user_id').eq('id', params.id).single();
  if (!existing || !(await canAccessOrgMember(ctx, existing.user_id))) {
    return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  }

  const { error } = await supabase.from('evaluations').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
