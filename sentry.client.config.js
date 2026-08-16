import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
  ignoreErrors: [
    // Ruído conhecido do navegador interno do Instagram/Facebook (WebView Android) —
    // falha na ponte JS-Java de log de performance deles, não é bug do Kriteria.
    // https://github.com/getsentry/sentry-javascript/issues/15065
    /Error invoking postMessage: Java (exception was raised|object is gone)/,
  ],
});
