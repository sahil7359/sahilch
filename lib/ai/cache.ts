import type { SupabaseClient } from '@supabase/supabase-js';
import { cosine, parseVector } from '@/lib/ai/embed';
import { EMBEDDING_VERSION, CACHE } from '@/lib/ai/config';

export type CachedAnswer = { answer: string; sources: unknown };

/**
 * Semantic cache lookup. Exact-question repeats are the common case (visitors ask
 * the same eight things). The cache is small, so fetching valid entries and
 * scoring cosine in TS is simpler than a vector index round-trip, and the 0.97
 * threshold keeps "top 5" and "top 10" from colliding.
 */
export async function cacheLookup(
  supabase: SupabaseClient,
  qEmbedding: number[],
): Promise<CachedAnswer | null> {
  const { data } = await supabase
    .from('semantic_cache')
    .select('answer, sources, q_embedding')
    .eq('embedding_version', EMBEDDING_VERSION)
    .gt('expires_at', new Date().toISOString())
    .limit(500);
  if (!data?.length) return null;

  let best: { answer: string; sources: unknown; sim: number } | null = null;
  for (const row of data as { answer: string; sources: unknown; q_embedding: unknown }[]) {
    const sim = cosine(qEmbedding, parseVector(row.q_embedding));
    if (!best || sim > best.sim) best = { answer: row.answer, sources: row.sources, sim };
  }
  if (best && best.sim >= CACHE.cosineThreshold) {
    return { answer: best.answer, sources: best.sources };
  }
  return null;
}

export async function cacheStore(
  supabase: SupabaseClient,
  question: string,
  qEmbedding: number[],
  answer: string,
  sources: unknown,
): Promise<void> {
  const expires = new Date(Date.now() + CACHE.ttlDays * 86400_000).toISOString();
  await supabase.from('semantic_cache').insert({
    q_embedding: qEmbedding,
    question,
    answer,
    sources,
    embedding_version: EMBEDDING_VERSION,
    expires_at: expires,
  });
}
