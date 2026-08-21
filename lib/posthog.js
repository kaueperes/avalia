import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  if (initialized || typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return; // sem chave configurada — não inicializa (evita erro em dev/preview sem env var)

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: false, // pageview é disparado manualmente no route tracker (SPA)
    person_profiles: 'identified_only',
  });
  initialized = true;
}

export function phCapture(event, props) {
  if (typeof window !== 'undefined' && initialized) posthog.capture(event, props);
}

// Liga os eventos ao usuário logado (email/plano) — sem isso, tudo fica anônimo
// e não dá pra saber qual conta fez o quê.
export function phIdentify(user) {
  if (typeof window === 'undefined' || !initialized || !user?.id) return;
  posthog.identify(user.id, { email: user.email, name: user.name, plan: user.plan });
}

export function phReset() {
  if (typeof window !== 'undefined' && initialized) posthog.reset();
}
