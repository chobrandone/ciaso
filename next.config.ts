import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
];

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  serverExternalPackages: ['@libsql/client', 'libsql'],
  // libsql loads its platform binary (@libsql/<os>-<arch>) dynamically, so tracing misses it;
  // bcryptjs is needed by scripts/setup-db.mjs, which runs outside the bundle;
  // db/seed-images are read at runtime when the app seeds an empty database.
  outputFileTracingIncludes: {
    '/**': ['./node_modules/@libsql/**/*', './node_modules/libsql/**/*', './node_modules/bcryptjs/**/*', './db/seed-images/**/*']
  },
  eslint: { ignoreDuringBuilds: true },
  // Admin uploads event flyers/photos through server actions
  experimental: { serverActions: { bodySizeLimit: '12mb' } },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'i.ytimg.com' }]
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    // Old WordPress URLs -> new structure
    return [
      { source: '/services-2', destination: '/services', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
      // v2 URLs that were replaced
      { source: '/programs', destination: '/services', permanent: true },
      { source: '/journey', destination: '/services#journey', permanent: true },
      { source: '/stories', destination: '/testimonial', permanent: true },
      { source: '/get-involved', destination: '/volunteer', permanent: true },
      { source: '/resources', destination: '/events', permanent: true }
    ];
  }
};

export default nextConfig;
