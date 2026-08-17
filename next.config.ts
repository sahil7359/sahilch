import type { NextConfig } from 'next';
import path from 'node:path';

const dev = process.env.NODE_ENV !== 'production';

// Static CSP (no nonce) so pages stay statically generated. The site renders all
// dynamic/user content as text nodes — no dangerouslySetInnerHTML except static
// JSON-LD — so 'unsafe-inline' on script-src is an acceptable trade for keeping
// SSG. Dev additionally needs 'unsafe-eval' + ws for HMR.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${dev ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  `connect-src 'self' https://*.supabase.co${dev ? ' ws: http://localhost:*' : ''}`,
  `frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com https://www.youtube.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `upgrade-insecure-requests`,
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: path.resolve(process.cwd()) },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;
