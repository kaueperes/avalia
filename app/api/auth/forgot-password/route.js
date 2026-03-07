import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });

    const { data: user } = await supabase.from('users').select('id, name').eq('email', email).single();

    // Sempre retorna sucesso para não revelar se o email existe
    if (!user) return NextResponse.json({ ok: true });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora

    await supabase.from('users').update({ reset_token: token, reset_token_expires: expires }).eq('id', user.id);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetLink = `${appUrl}/redefinir-senha?token=${token}`;
    const firstName = (user.name || 'Professor').split(' ')[0];

    await resend.emails.send({
      from: 'AvaliA <noreply@avalia.education>',
      to: email,
      subject: 'Redefinição de senha — AvaliA',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
          <p style="font-size: 20px; font-weight: 900; color: #111827; margin-bottom: 32px; letter-spacing: -0.5px;">Avali<span style="color: #0081f0;">A</span></p>
          <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 12px;">Redefinir sua senha</h2>
          <p style="font-size: 15px; color: #4B5563; line-height: 1.6; margin-bottom: 28px;">
            Olá, ${firstName}! Recebemos uma solicitação para redefinir a senha da sua conta no AvaliA.
            Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
            <tr>
              <td>
                <a href="${resetLink}" style="display: inline-block; padding: 13px 28px; background-color: #0081f0; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px; font-family: Arial, sans-serif;">
                  Redefinir senha
                </a>
              </td>
            </tr>
          </table>
          <p style="font-size: 13px; color: #6B7280; margin-bottom: 20px;">Ou copie e cole o link abaixo no seu navegador:</p>
          <p style="font-size: 12px; color: #9CA3AF; word-break: break-all;">${resetLink}</p>
          <p style="font-size: 13px; color: #9CA3AF; line-height: 1.6;">
            Se você não solicitou isso, pode ignorar este email — sua senha permanece a mesma.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 28px 0;" />
          <p style="font-size: 12px; color: #D1D5DB;">AvaliA · Plataforma de avaliação educacional com IA</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
