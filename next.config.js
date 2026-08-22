const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/avaliar-v2', destination: '/avaliar-avancado', permanent: true },
    ];
  },
  // Reverse proxy do PostHog: faz o navegador falar com kriteria.education/ingest
  // em vez de us.i.posthog.com direto — evita bloqueadores de anúncio que barram
  // domínios conhecidos de analytics, sem mudar nada do que já está rastreando.
  async rewrites() {
    return [
      { source: '/ingest/static/:path*', destination: 'https://us-assets.i.posthog.com/static/:path*' },
      { source: '/ingest/:path*', destination: 'https://us.i.posthog.com/:path*' },
    ];
  },
  skipTrailingSlashRedirect: true,
};

module.exports = withSentryConfig(nextConfig, {
  org: 'kriteria-na',
  project: 'javascript-nextjs',
  silent: true,
});
