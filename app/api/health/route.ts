import { getAdminClient } from '@/lib/db/admin';

// Runs on every request, never statically cached — so each hit opens a real
// Postgres connection. That genuine DB compute is what Supabase counts as
// project activity, which is how the keepalive workflow stops the free-tier
// project from auto-pausing after ~7 idle days.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  try {
    const supabase = getAdminClient();
    // A real SELECT count(*) against a table — lightweight but genuine DB work.
    const { error } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    return Response.json(
      { ok: true, db: 'up', ms: Date.now() - started },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch {
    return Response.json(
      { ok: false, db: 'down', ms: Date.now() - started },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}
