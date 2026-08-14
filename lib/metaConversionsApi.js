import crypto from 'crypto';
import { PIXEL_ID } from '@/lib/pixel';

const API_VERSION = 'v21.0';

function sha256(value) {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

// Lê um cookie específico do header Cookie bruto da requisição (_fbp/_fbc,
// gerados pelo pixel no navegador — melhoram a taxa de correspondência do evento).
function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Envia um evento server-side pra API de Conversões da Meta, complementando o
// pixel do navegador (que perde eventos com bloqueador de anúncios/cookies
// restritos). event_id precisa ser o mesmo passado pro fbq() no cliente, pra
// Meta deduplicar em vez de contar o mesmo cadastro duas vezes.
// Falha silenciosamente — nunca deve quebrar o fluxo principal (signup etc.).
export async function sendMetaCapiEvent({ eventName, eventId, eventSourceUrl, email, request }) {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) return;

  try {
    const cookieHeader = request?.headers?.get('cookie');
    const userData = {};
    if (email) userData.em = [sha256(email)];
    const ip = request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (ip) userData.client_ip_address = ip;
    const userAgent = request?.headers?.get('user-agent');
    if (userAgent) userData.client_user_agent = userAgent;
    const fbp = readCookie(cookieHeader, '_fbp');
    if (fbp) userData.fbp = fbp;
    const fbc = readCookie(cookieHeader, '_fbc');
    if (fbc) userData.fbc = fbc;

    await fetch(`https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: 'website',
          event_source_url: eventSourceUrl,
          user_data: userData,
        }],
      }),
    });
  } catch {
    // CAPI é um reforço, não deve derrubar o fluxo principal se falhar
  }
}
