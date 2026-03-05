import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

function fmt(p) {
  return { id: p.id, userId: p.user_id, name: p.name, discipline: p.discipline, turma: p.turma, tone: p.tone, writingSample: p.writing_sample, createdAt: p.created_at };
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

  const { name, discipline, turma, tone, writingSample } = await request.json();
  if (!name || !discipline) {
    return NextResponse.json({ error: 'Nome e disciplina são obrigatórios' }, { status: 400 });
  }

  const { data: p, error } = await supabase.from('profiles')
    .insert({ user_id: user.userId, name, discipline, turma: turma || '', tone: tone || 'neutro', writing_sample: writingSample || '' })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  return NextResponse.json(fmt(p), { status: 201 });
}
