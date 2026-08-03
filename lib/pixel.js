export const PIXEL_ID = '1834654430588890';

export function fbTrack(event, params) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', event, params);
  }
}
