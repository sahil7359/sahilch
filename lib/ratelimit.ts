import 'server-only';
import { getAdminClient } from '@/lib/db/admin';

/**
 * Fixed-window rate limit backed by the bump_rate_limit RPC. Returns true if the
 * request is allowed (count within limit for the current window).
 */
export async function rateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
): Promise<{ ok: boolean; count: number }> {
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / (windowSeconds * 1000)) * windowSeconds * 1000);
  const supabase = getAdminClient();
  const { data, error } = await supabase.rpc('bump_rate_limit', {
    p_bucket: bucket,
    p_window: windowStart.toISOString(),
  });
  if (error) {
    // Fail open on infra error rather than blocking a legitimate user; the
    // session cap and daily budget still bound abuse.
    return { ok: true, count: 0 };
  }
  const count = typeof data === 'number' ? data : Number(data);
  return { ok: count <= limit, count };
}
