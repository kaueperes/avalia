import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { signToken } from '@/lib/auth';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const firstName = name.split(' ')[0];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    resend.emails.send({
      from: 'KriterIA <noreply@avalia.education>',
      to: email,
      subject: 'Bem-vindo ao KriterIA!',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
          <p style="font-size: 20px; font-weight: 900; color: #111827; margin-bottom: 32px; letter-spacing: -0.5px;">Aval<span style="color: #0081f0;">iA</span></p>
          <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 12px;">Olá, ${firstName}! Seja bem-vindo 👋</h2>
          <p style="font-size: 15px; color: #4B5563; line-height: 1.6; margin-bottom: 28px;">
            Sua conta no KriterIA foi criada com sucesso. Agora você pode avaliar trabalhos de alunos com inteligência artificial — economizando horas de correção.
          </p>
          <p style="font-size: 14px; color: #4B5563; line-height: 1.6; margin-bottom: 8px;">Com o plano gratuito você pode:</p>
          <ul style="font-size: 14px; color: #4B5563; line-height: 1.8; padding-left: 20px; margin-bottom: 28px;">
            <li>Criar perfis de avaliação personalizados</li>
            <li>Avaliar trabalhos com critérios definidos por você</li>
            <li>Exportar avaliações em PDF</li>
          </ul>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
            <tr>
              <td>
                <a href="${appUrl}/avaliar" target="_self" style="display: inline-block; padding: 13px 28px; background-color: #0081f0; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px; font-family: Arial, sans-serif;">
                  Fazer minha primeira avaliação
                </a>
              </td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 28px 0;" />
          <p style="font-size: 12px; color: #D1D5DB;">KriterIA · Plataforma de avaliação educacional com IA</p>
        </div>
      `,
    }).catch(() => {}); // não bloqueia o signup se o email falhar

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan, onboarding_done: false }
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
