import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data } = await supabase
    .from('users')
    .select('id, name, email, plan, quota_ciclo, quota_extra, quota_relatorios_ciclo, quota_relatorios_extra, quota_reset_date, quota_provas')
    .eq('id', user.userId)
    .single();

  if (!data) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

  return NextResponse.json({ user: data });
}

export async function PATCH(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { name, email, currentPassword, newPassword } = await request.json();

  // ── Troca de senha ──────────────────────────────────────────────────────────
  if (currentPassword || newPassword) {
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Preencha a senha atual e a nova senha.' }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'A nova senha deve ter ao menos 6 caracteres.' }, { status: 400 });
    }

    const { data: dbUser } = await supabase.from('users').select('password').eq('id', user.userId).single();
    if (!dbUser) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, dbUser.password);
    if (!valid) return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 10);
    const { error } = await supabase.from('users').update({ password: hashed }).eq('id', user.userId);
    if (error) return NextResponse.json({ error: 'Erro ao alterar senha.' }, { status: 500 });

    return NextResponse.json({ ok: true });
  }

  // ── Atualização de nome/e-mail ──────────────────────────────────────────────
  if (!name || !name.trim()) return NextResponse.json({ error: 'O nome não pode estar vazio.' }, { status: 400 });
  if (!email || !email.trim()) return NextResponse.json({ error: 'O e-mail não pode estar vazio.' }, { status: 400 });

  const trimmedEmail = email.trim();
  const { data: existing } = await supabase.from('users').select('id').eq('email', trimmedEmail).single();
  if (existing && existing.id !== user.userId) {
    return NextResponse.json({ error: 'Este e-mail já está em uso por outra conta.' }, { status: 409 });
  }

  const { data: updated, error } = await supabase.from('users')
    .update({ name: name.trim(), email: trimmedEmail })
    .eq('id', user.userId)
    .select('id, name, email')
    .single();

  if (error) return NextResponse.json({ error: 'Erro ao salvar informações.' }, { status: 500 });

  return NextResponse.json({ user: updated });
}
