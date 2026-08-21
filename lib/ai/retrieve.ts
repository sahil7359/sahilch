import type { SupabaseClient } from '@supabase/supabase-js';
import { embed, cosine, parseVector } from '@/lib/ai/embed';
import { EMBEDDING_VERSION, RETRIEVAL } from '@/lib/ai/config';

export type Hit = {
  id: number;
  source: string;
  heading: string | null;
  url: string | null;
  content: string;
  similarity: number;
};

type Candidate = { id: number; source: string; heading: string | null; url: string | null; content: string; score: number };
type Enriched = Candidate & { embedding: number[]; similarity: number };

/**
 * Hybrid retrieval: the RPC fuses pgvector + FTS via RRF; we then re-score
 * candidates by cosine-to-query (the number the L2 gate uses) and run MMR
 * (λ=0.7) to trim near-duplicates down to the final set.
 */
export async function retrieve(
  supabase: SupabaseClient,
  question: string,
): Promise<{ hits: Hit[]; topSimilarity: number }> {
  const vecs = await embed([question], 'retrieval.query');
  const qvec = vecs[0]!;

  const { data, error } = await supabase.rpc('match_documents_hybrid', {
    query_embedding: qvec,
    query_text: question,
    current_version: EMBEDDING_VERSION,
    match_count: RETRIEVAL.candidateCount,
    rrf_k: RETRIEVAL.rrfK,
  });
  if (error) throw new Error(`retrieve rpc: ${error.message}`);

  const cands = (data ?? []) as Candidate[];
  if (!cands.length) return { hits: [], topSimilarity: 0 };

  const ids = cands.map((c) => c.id);
  const { data: embRows } = await supabase.from('documents').select('id, embedding').in('id', ids);
  const embMap = new Map<number, number[]>(
    (embRows ?? []).map((r: { id: number; embedding: unknown }) => [r.id, parseVector(r.embedding)]),
  );

  const enriched: Enriched[] = cands.map((c) => {
    const e = embMap.get(c.id) ?? [];
    return { ...c, embedding: e, similarity: e.length ? cosine(qvec, e) : 0 };
  });
  const topSimilarity = Math.max(...enriched.map((e) => e.similarity));

  // MMR: greedily pick relevance minus redundancy.
  const selected: Enriched[] = [];
  const pool = [...enriched];
  while (selected.length < RETRIEVAL.finalCount && pool.length) {
    let best = -Infinity;
    let bi = 0;
    for (let i = 0; i < pool.length; i++) {
      const rel = pool[i]!.similarity;
      const div = selected.length
        ? Math.max(...selected.map((s) => cosine(pool[i]!.embedding, s.embedding)))
        : 0;
      const score = RETRIEVAL.mmrLambda * rel - (1 - RETRIEVAL.mmrLambda) * div;
      if (score > best) {
        best = score;
        bi = i;
      }
    }
    selected.push(pool.splice(bi, 1)[0]!);
  }

  return {
    hits: selected.map((s) => ({
      id: s.id,
      source: s.source,
      heading: s.heading,
      url: s.url,
      content: s.content,
      similarity: s.similarity,
    })),
    topSimilarity,
  };
}
