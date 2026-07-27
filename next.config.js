/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/avaliar-v2', destination: '/avaliar-avancado', permanent: true },
    ];
  },
};
module.exports = nextConfig;
