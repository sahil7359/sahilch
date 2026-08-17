/**
 * Ticket idempotency + ref-sequence test (the silent-bug class). Asserts a
 * duplicate idempotency_key collapses to exactly one row and refs come from the
 * sequence. Run: pnpm tsx scripts/test-ticket.ts
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  if (line.startsWith('#')) continue;
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && m[1]) process.env[m[1]] = m[2] ?? '';
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

let failures = 0;
const ok = (name: string, pass: boolean) => {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
  if (!pass) failures++;
};

async function main() {
  const key = `test-${crypto.randomUUID()}`;
  const base = { name: 'Test', email: 'test@example.com', subject: 'Idempotency probe', message: 'x'.repeat(20), idempotency_key: key, ip_hash: 'testhash' };

  const ref1 = (await admin.rpc('next_ticket_ref')).data as string;
  ok('ref format SC-YYYY-NNNN', /^SC-\d{4}-\d{4}$/.test(ref1));

  const first = await admin.from('tickets').insert({ ...base, ref: ref1 }).select('ref').single();
  ok('first insert succeeds', !first.error);

  const ref2 = (await admin.rpc('next_ticket_ref')).data as string;
  const second = await admin.from('tickets').insert({ ...base, ref: ref2 }).select('ref');
  ok('duplicate idempotency_key rejected (23505)', second.error?.code === '23505');

  const rows = await admin.from('tickets').select('id').eq('idempotency_key', key);
  ok('exactly one row for the key', (rows.data?.length ?? 0) === 1);

  ok('refs are distinct from the sequence', ref1 !== ref2);

  await admin.from('tickets').delete().eq('idempotency_key', key);

  console.log(`\n${failures === 0 ? 'ALL TICKET CHECKS PASSED' : failures + ' FAILURE(S)'}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
