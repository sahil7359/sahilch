import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the workspace root — a stray package-lock.json in a parent dir otherwise
  // confuses Turbopack's root detection.
  turbopack: { root: path.resolve(process.cwd()) },
  // Security headers + CSP are added in Phase 8 (launch polish).
};

export default nextConfig;
