import { getAdminClient } from '@/lib/db/admin';

// Runs on every request, never cached — so each hit is a real Postgres round
// trip. This is what the keepalive workflow leans on to stop the free-tier
// Supabase project auto-pausing.
//
// It does BOTH a read and a write on purpose: reads alone did not satisfy
// Supabase's "sufficient activity" bar (verified 200/db:up pings every two days
// still ended in a pause), and a write is unambiguous database activity.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Fixed window, so the write always UPDATEs one existing row rather than
// accumulating a new row per ping.
const KEEPALIVE_BUCKET = 'keepalive';
const KEEPALIVE_WINDOW = '1970-01-01T00:00:00.000Z';

export async function GET() {
  const started = Date.now();
  try {
    const supabase = getAdminClient();

    // 1) Real read.
    const { error: readErr } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true });
    if (readErr) throw readErr;

    // 2) Real write, via the existing rate-limit upsert RPC.
    const { error: writeErr } = await supabase.rpc('bump_rate_limit', {
      p_bucket: KEEPALIVE_BUCKET,
      p_window: KEEPALIVE_WINDOW,
    });
    if (writeErr) throw writeErr;

    return Response.json(
      { ok: true, db: 'up', read: true, write: true, ms: Date.now() - started },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch {
    return Response.json(
      { ok: false, db: 'down', ms: Date.now() - started },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}
