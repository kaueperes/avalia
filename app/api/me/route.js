import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data } = await supabase
    .from('users')
    .select('id, name, email, plan, quota_ciclo, quota_extra, quota_reset_date')
    .eq('id', user.userId)
    .single();

  if (!data) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

  return NextResponse.json({ user: data });
}
