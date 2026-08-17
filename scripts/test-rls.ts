/**
 * RLS deny-all test. The anon (publishable) key will be scraped from the client
 * bundle — it must grant access to nothing. Asserts the anon client can neither
 * read nor write any table, even when rows exist. Run: pnpm tsx scripts/test-rls.ts
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  if (line.startsWith('#')) continue;
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && m[1]) process.env[m[1]] = m[2] ?? '';
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
});
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

let failures = 0;
const ok = (name: string, pass: boolean) => {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
  if (!pass) failures++;
};

const TABLES = ['documents', 'tickets', 'chat_sessions', 'chat_turns', 'semantic_cache', 'rate_limits', 'daily_budget'];

async function main() {
  // Seed a visible probe row via admin (bypasses RLS) so "read blocked" is real,
  // not just an empty table.
  const probeWindow = new Date().toISOString();
  await admin.from('rate_limits').insert({ bucket: '__rls_probe__', window_start: probeWindow, count: 1 });

  // Admin sanity: it CAN see the probe.
  const adminRead = await admin.from('rate_limits').select('*').eq('bucket', '__rls_probe__');
  ok('admin can read (sanity)', (adminRead.data?.length ?? 0) >= 1);

  // Anon reads must return zero rows on every table.
  for (const t of TABLES) {
    const r = await anon.from(t).select('*').limit(5);
    ok(`anon read blocked: ${t}`, (r.data?.length ?? 0) === 0);
  }

  // Anon writes must fail on every table.
  const writes: Record<string, object> = {
    documents: { source: 'x', chunk_index: 0, content: 'x', token_count: 1, embedding: Array(1024).fill(0), embedding_version: 'x' },
    tickets: { ref: 'X', name: 'x', email: 'a@b.co', subject: 'x', message: 'x'.repeat(11), idempotency_key: crypto.randomUUID(), ip_hash: 'x' },
    chat_sessions: { ip_hash: 'x' },
    semantic_cache: { q_embedding: Array(1024).fill(0), question: 'x', answer: 'x', embedding_version: 'x', expires_at: probeWindow },
    rate_limits: { bucket: '__anon__', window_start: probeWindow, count: 1 },
    daily_budget: { day: '2099-01-01', tokens_used: 1 },
  };
  for (const [t, row] of Object.entries(writes)) {
    const r = await anon.from(t).insert(row);
    ok(`anon write blocked: ${t}`, r.error !== null);
  }

  // Cleanup
  await admin.from('rate_limits').delete().eq('bucket', '__rls_probe__');

  console.log(`\n${failures === 0 ? 'ALL RLS CHECKS PASSED' : failures + ' FAILURE(S)'}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
