export const PIXEL_ID = '1834654430588890';

// eventId: mesmo event_id usado na chamada equivalente da API de Conversões
// (server-side) — permite a Meta deduplicar o mesmo evento vindo dos dois lados.
export function fbTrack(event, params, eventId) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    if (eventId) window.fbq('track', event, params || {}, { eventID: eventId });
    else window.fbq('track', event, params);
  }
}
