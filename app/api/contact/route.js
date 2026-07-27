import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

export async function POST(request) {
  try {
    const { nome, email, assunto, mensagem } = await request.json();
    if (!nome || !email || !assunto || !mensagem) {
      return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 });
    }

    await resend.emails.send({
      from: 'Kriteria <noreply@kriteria.education>',
      to: 'contato@kriteria.education',
      replyTo: email,
      subject: `[Contato] ${assunto} — ${nome}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
          <p style="font-size: 13px; color: #6B7280;"><strong>Nome:</strong> ${esc(nome)}</p>
          <p style="font-size: 13px; color: #6B7280;"><strong>Email:</strong> ${esc(email)}</p>
          <p style="font-size: 13px; color: #6B7280;"><strong>Assunto:</strong> ${esc(assunto)}</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="font-size: 14px; color: #111827; white-space: pre-wrap; line-height: 1.6;">${esc(mensagem)}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao enviar mensagem.' }, { status: 500 });
  }
}
