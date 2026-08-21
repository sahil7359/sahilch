import { EMBEDDING_MODEL, EMBEDDING_DIMS, JINA_URL } from '@/lib/ai/config';

type Task = 'retrieval.query' | 'retrieval.passage';

/**
 * Jina v3 embeddings. Ingest and query MUST use the same model (symmetry rule);
 * the task differs (passage vs query) but stays in the same vector space.
 * Reads the key from process.env at call time so this works from a Next route
 * and from a standalone tsx script (ingest, evals) alike.
 */
export async function embed(texts: string[], task: Task): Promise<number[][]> {
  const key = process.env.EMBEDDING_API_KEY;
  if (!key) throw new Error('EMBEDDING_API_KEY not set');

  const res = await fetch(JINA_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      task,
      dimensions: EMBEDDING_DIMS,
      input: texts,
    }),
  });

  if (!res.ok) {
    throw new Error(`Jina ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    data: { index: number; embedding: number[] }[];
  };
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

/** pgvector comes back from PostgREST as a JSON-ish string; normalise to number[]. */
export function parseVector(v: unknown): number[] {
  if (Array.isArray(v)) return v as number[];
  if (typeof v === 'string') return JSON.parse(v) as number[];
  return [];
}
