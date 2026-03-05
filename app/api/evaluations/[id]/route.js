import { NextResponse } from 'next/server';
import { evaluations } from '@/lib/store';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const idx = evaluations.findIndex(e => e.id === params.id && e.userId === user.userId);
  if (idx === -1) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

  evaluations.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
