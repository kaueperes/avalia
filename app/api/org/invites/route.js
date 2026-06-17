import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function getOrgAdmin(request) {
  const user = getUserFromRequest(request);
  if (!user) return null;
  const { data } = await supabase.from('users').select('org_id, org_role, name').eq('id', user.userId).single();
  if (!data?.org_id || data.org_role !== 'admin') return null;
  return { userId: user.userId, orgId: data.org_id, name: data.name };
}

export async function GET(request) {
  const admin = await getOrgAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const { data: invites } = await supabase
    .from('org_invites')
    .select('id, email, role, status, created_at, accepted_at')
    .eq('org_id', admin.orgId)
    .order('created_at', { ascending: false });

  return NextResponse.json(invites || []);
}

export async function POST(request) {
  const admin = await getOrgAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const { email } = await request.json();
  if (!email?.trim()) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });

  const normalizedEmail = email.trim().toLowerCase();

  // Verificar se já é membro
  const { data: existing } = await supabase.from('users').select('org_id').eq('email', normalizedEmail).single();
  if (existing?.org_id) return NextResponse.json({ error: 'Este professor já pertence a uma organização' }, { status: 409 });

  // Verificar se já tem convite pendente
  const { data: pendingInvite } = await supabase.from('org_invites')
    .select('id').eq('org_id', admin.orgId).eq('email', normalizedEmail).eq('status', 'pending').single();
  if (pendingInvite) return NextResponse.json({ error: 'Já existe um convite pendente para este email' }, { status: 409 });

  const { data: org } = await supabase.from('organizations').select('name').eq('id', admin.orgId).single();

  const { data: invite, error } = await supabase.from('org_invites')
    .insert({ org_id: admin.orgId, email: normalizedEmail, role: 'member', invited_by: admin.userId })
    .select().single();

  if (error) return NextResponse.json({ error: 'Erro ao criar convite' }, { status: 500 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.avalia.education';
  const inviteUrl = `${appUrl}/convite?token=${invite.token}`;

  resend.emails.send({
    from: 'Kriteria <noreply@avalia.education>',
    to: normalizedEmail,
    subject: `Convite para ${org?.name || 'sua instituição'} no Kriteria`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
        <p style="font-size: 20px; font-weight: 900; color: #111827; margin-bottom: 32px; letter-spacing: -0.5px;">Aval<span style="color: #0081f0;">iA</span></p>
        <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin-bottom: 12px;">Você foi convidado!</h2>
        <p style="font-size: 15px; color: #4B5563; line-height: 1.6; margin-bottom: 28px;">
          ${admin.name} convidou você para fazer parte de <strong>${org?.name || 'sua instituição'}</strong> no Kriteria — a plataforma de avaliação educacional com IA.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
          <tr>
            <td>
              <a href="${inviteUrl}" target="_self" style="display: inline-block; padding: 13px 28px; background-color: #0081f0; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px; font-family: Arial, sans-serif;">
                Aceitar convite
              </a>
            </td>
          </tr>
        </table>
        <p style="font-size: 13px; color: #9CA3AF; margin-bottom: 4px;">Ou copie e cole este link no navegador:</p>
        <p style="font-size: 13px; color: #0081f0; word-break: break-all; margin-bottom: 28px;">${inviteUrl}</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 28px 0;" />
        <p style="font-size: 12px; color: #D1D5DB;">Kriteria · Plataforma de avaliação educacional com IA</p>
      </div>
    `,
  }).catch(() => {});

  return NextResponse.json({ ok: true, inviteId: invite.id }, { status: 201 });
}

export async function DELETE(request) {
  const admin = await getOrgAdmin(request);
  if (!admin) return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const inviteId = searchParams.get('id');
  if (!inviteId) return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });

  await supabase.from('org_invites')
    .update({ status: 'cancelled' })
    .eq('id', inviteId)
    .eq('org_id', admin.orgId);

  return NextResponse.json({ ok: true });
}
