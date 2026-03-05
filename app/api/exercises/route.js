import { NextResponse } from 'next/server';
import { exercises } from '@/lib/store';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  let result = exercises.filter(e => e.userId === user.userId);
  if (type) result = result.filter(e => e.type === type);
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return NextResponse.json(result);
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { name, type, context, criteria } = await request.json();
  if (!name || !type) {
    return NextResponse.json({ error: 'Nome e tipo são obrigatórios' }, { status: 400 });
  }

  const exercise = {
    id: Date.now().toString(),
    userId: user.userId,
    name, type,
    context: context || '',
    criteria: criteria || [],
    createdAt: new Date(),
  };
  exercises.push(exercise);
  return NextResponse.json(exercise, { status: 201 });
}
