import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
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
