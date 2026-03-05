import { NextResponse } from 'next/server';
import { profiles } from '@/lib/store';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  return NextResponse.json(profiles.filter(p => p.userId === user.userId));
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, discipline, turma, tone, writingSample } = await request.json();
  if (!name || !discipline) {
    return NextResponse.json({ error: 'Nome e disciplina são obrigatórios' }, { status: 400 });
  }

  const profile = {
    id: Date.now().toString(),
    userId: user.userId,
    name, discipline,
    turma: turma || '',
    tone: tone || 'neutro',
    writingSample: writingSample || '',
    createdAt: new Date(),
  };
  profiles.push(profile);
  return NextResponse.json(profile, { status: 201 });
}
