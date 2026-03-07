import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 });

    const { data: user } = await supabase
      .from('users')
      .select('id, reset_token_expires')
      .eq('reset_token', token)
      .single();

    if (!user) return NextResponse.json({ error: 'Link inválido ou expirado' }, { status: 400 });

    if (new Date(user.reset_token_expires) < new Date()) {
      return NextResponse.json({ error: 'Este link expirou. Solicite um novo.' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    await supabase.from('users')
      .update({ password: hashed, reset_token: null, reset_token_expires: null })
      .eq('id', user.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
