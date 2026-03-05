import { NextResponse } from 'next/server';
import { evaluations } from '@/lib/store';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const result = evaluations
    .filter(e => e.userId === user.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return NextResponse.json(result);
}

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await request.json();
  const { studentName, type, score, feedback, criteria, profileName } = body;

  if (!studentName || !type || score === undefined) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
  }

  const evaluation = {
    id: Date.now().toString(),
    userId: user.userId,
    studentName, type, score,
    feedback: feedback || '',
    criteria: criteria || [],
    profileName: profileName || '',
    createdAt: new Date(),
  };
  evaluations.push(evaluation);
  return NextResponse.json(evaluation, { status: 201 });
}
