const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/avaliar-v2', destination: '/avaliar-avancado', permanent: true },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: 'kriteria-na',
  project: 'javascript-nextjs',
  silent: true,
});
