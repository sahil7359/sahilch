/**
 * The ONLY place model identifiers live. A hosted model id is deprecated on
 * short notice — change it here, not at fifteen call sites. Changing
 * EMBEDDING_MODEL/DIMS additionally requires a re-ingest; EMBEDDING_VERSION is
 * what makes that detectable (the retrieval RPC filters on it).
 */

// Chat generation — Groq, OpenAI-compatible endpoint. gpt-oss-120b is an
// open-weights model (rhymes with the open-weights narrative) and follows the
// grounding contract well; it spends some tokens on internal reasoning, hence
// the larger budget + low reasoning effort.
export const CHAT_MODEL = 'openai/gpt-oss-120b';
export const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Embeddings — Jina v3, 1024 dims (matches vector(1024) in the schema).
export const EMBEDDING_MODEL = 'jina-embeddings-v3';
export const EMBEDDING_DIMS = 1024;
export const EMBEDDING_VERSION = 'jina-embeddings-v3@1024';
export const JINA_URL = 'https://api.jina.ai/v1/embeddings';

export const GENERATION = {
  temperature: 0, // deterministic grounding — fewer surprises for the L4 gate
  maxOutputTokens: 700, // headroom for reasoning tokens + a 2-4 sentence answer
  reasoningEffort: 'low',
} as const;

// Cost ceilings (§5.6).
export const LIMITS = {
  minInputChars: 3,
  maxInputChars: 500,
  ratePerWindow: 10,
  rateWindowSec: 600, // 10 min
  sessionCap: 25,
  dailyTokenCap: 250_000,
} as const;

// Retrieval + gate.
export const RETRIEVAL = {
  candidateCount: 12, // RPC returns this many; MMR trims to finalCount
  finalCount: 6,
  rrfK: 60,
  mmrLambda: 0.7,
  // L2 gate: top candidate's cosine-to-query must clear this or the LLM is never
  // called. Tuned against the eval sets (strict enough to refuse off-topic,
  // loose enough to answer the "must not refuse" questions). 0.40 answers legit
  // questions (min observed ~0.42) and refuses off-topic (max ~0.39 for the
  // false-premise "Google 2023"); salary etc. clear L2 but L3/L4 refuse them.
  l2Threshold: 0.4,
} as const;

export const CACHE = {
  cosineThreshold: 0.97,
  ttlDays: 7,
} as const;
