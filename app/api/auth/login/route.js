import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
    if (!user) {
      return NextResponse.json({ error: 'Email ou senha inválidos' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Email ou senha inválidos' }, { status: 401 });
    }

    if (user.blocked) {
      return NextResponse.json({ error: 'Esta conta foi bloqueada. Entre em contato com o suporte.' }, { status: 403 });
    }

    const token = signToken({ userId: user.id, email: user.email });
    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan, quota_ciclo: user.quota_ciclo ?? 0, quota_extra: user.quota_extra ?? 0, quota_relatorios_ciclo: user.quota_relatorios_ciclo ?? 0, quota_relatorios_extra: user.quota_relatorios_extra ?? 0, onboarding_done: user.onboarding_done ?? false, is_admin: user.is_admin ?? false }
    });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
