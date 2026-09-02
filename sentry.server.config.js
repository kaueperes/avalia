import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Só reporta em produção (Vercel). Em dev local (`next dev`, NODE_ENV=development)
  // a SDK fica inerte — erros transitórios de build enquanto se edita um arquivo
  // não viram issue no Sentry.
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0,
  sendDefaultPii: false,
  beforeSend(event) {
    // The app's JWT travels in the Authorization header (lib/auth.js) — never
    // let it leave the server, even indirectly via request context on an event.
    if (event.request?.headers?.authorization) {
      event.request.headers.authorization = '[Filtered]';
    }
    if (event.request?.headers?.Authorization) {
      event.request.headers.Authorization = '[Filtered]';
    }
    return event;
  },
});
