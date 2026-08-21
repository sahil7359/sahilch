# 0003 — Hybrid retrieval (RRF + MMR) over pure vector search

**Status:** accepted
**Date:** 2026-08-21

## Context
The chat corpus is ~60 chunks about one person. The highest-intent queries are
exact tokens — `DataChat`, `Quorum`, `LTIMindtree`, `Fabric Data Engineer
Associate`, `KIIT`, `pgvector`. Pure dense vector search is mediocre at exact
tokens, and because the whole corpus is about one subject, the top-k is easily
crowded by six near-identical chunks.

## Decision
Hybrid: pgvector top-20 fused with Postgres full-text top-20 via reciprocal rank
fusion (in the `match_documents_hybrid` RPC), then re-scored by cosine-to-query
and diversified with MMR (λ=0.7) down to 6.

## Alternatives considered
- **Pure dense** — misses exact-token queries and returns redundant neighbours.
- **Pure BM25** — nails exact tokens, misses paraphrases ("is he open to remote").
- **A reranker (cross-encoder)** — Quorum measured reranking cost 0.079 NDCG@5
  for 63-91x the latency and cut it; on a 60-chunk corpus a reranker is even less
  justified.

## Consequences
+ Exact-token and paraphrase queries both retrieve well (measured: legit
  questions score 0.50-0.90 cosine, off-topic 0.08-0.47 — a clean separation).
+ MMR stops six versions of "DataChat is an agent…" from filling the context.
- Two ranking signals to reason about; the L2 gate uses cosine-to-query, not the
  RRF score (RRF scores are ~0.03-scale, not comparable to a 0.62 threshold).

## The honest version
On 60 chunks, pure vector search would mostly work. Hybrid earns its place on the
exact-token queries a recruiter actually types (project and company names), and
the same architecture scales if the corpus grows. The interesting decision was
gating on cosine-to-query rather than the fused rank score — the brief's "< 0.62"
only makes sense as a similarity, not an RRF sum.
