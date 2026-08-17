import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// Service-role (secret) client — bypasses RLS. Server routes only. The
// `import 'server-only'` above makes the build fail if this is ever pulled into
// a client component, so the secret key can never reach the browser bundle.
let client: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (client) return client;
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase admin client is not configured.');
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
