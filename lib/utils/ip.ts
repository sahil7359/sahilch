import 'server-only';
import { createHash } from 'node:crypto';
import { env } from '@/lib/env';

/** Extract the client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return headers.get('x-real-ip') ?? '0.0.0.0';
}

/** Salted hash of an IP — we never store raw IPs. */
export function hashIp(ip: string): string {
  const salt = env.IP_HASH_SALT ?? 'dev-salt';
  return createHash('sha256').update(salt + ip).digest('hex').slice(0, 32);
}
