import { NextResponse } from 'next/server';
import { exercises } from '@/lib/store';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const idx = exercises.findIndex(e => e.id === params.id && e.userId === user.userId);
  if (idx === -1) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  const body = await request.json();
  exercises[idx] = { ...exercises[idx], ...body };
  return NextResponse.json(exercises[idx]);
}

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const idx = exercises.findIndex(e => e.id === params.id && e.userId === user.userId);
  if (idx === -1) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  exercises.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
