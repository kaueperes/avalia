import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 });
    }

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase.from('users')
      .insert({ name, email, password: hashed, plan: 'gratuito', quota_ciclo: 5, quota_extra: 0, quota_relatorios_ciclo: 0, quota_relatorios_extra: 0 })
      .select().single();

    if (error) throw error;

    const token = signToken({ userId: user.id, email: user.email });
    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan, onboarding_done: false }
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
