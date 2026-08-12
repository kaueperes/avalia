export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config.js');
  }
}

export const onRequestError = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? (...args) => import('@sentry/nextjs').then(({ captureRequestError }) => captureRequestError(...args))
  : undefined;
