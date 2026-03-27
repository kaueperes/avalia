import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(r) {
  return { id: r.id, type: r.type, subject: r.subject, turma: r.turma, exerciseName: r.exercise_name, institution: r.institution || '', profileName: r.profile_name || '', content: r.content, createdAt: r.created_at };
}

export async function GET(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data, error } = await supabase.from('reports').select('*').eq('id', params.id).eq('user_id', user.userId).single();
  if (error || !data) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json(fmt(data));
}

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { content } = await request.json();

  // Fetch current to preserve stats
  const { data: existing } = await supabase
    .from('reports').select('content').eq('id', params.id).eq('user_id', user.userId).single();
  if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  const merged = { ...existing.content, ...content, stats: existing.content.stats };
  const { error } = await supabase.from('reports').update({ content: merged }).eq('id', params.id).eq('user_id', user.userId);
  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json({ ok: true, content: merged });
}

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { error } = await supabase.from('reports').delete().eq('id', params.id).eq('user_id', user.userId);
  if (error) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
