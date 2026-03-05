import { NextResponse } from 'next/server';
import { profiles } from '@/lib/store';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const idx = profiles.findIndex(p => p.id === params.id && p.userId === user.userId);
  if (idx === -1) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  const body = await request.json();
  profiles[idx] = { ...profiles[idx], ...body };
  return NextResponse.json(profiles[idx]);
}

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const idx = profiles.findIndex(p => p.id === params.id && p.userId === user.userId);
  if (idx === -1) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  profiles.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
