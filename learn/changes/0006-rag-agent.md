# 0006 — RAG chat agent: pipeline, guardrails, and eval harness

**Type:** feature
**Files:** lib/ai/{config,embed,retrieve,guard,prompt,cache,answer}.ts · app/api/chat/route.ts · components/chat/* · scripts/{ingest,eval-rag}.ts · evals/*.jsonl · content/corpus/*

## What changed
The grounded RAG agent. Corpus is ingested with provenance tags stripped, embedded
with Jina v3 (1024-dim). A question flows: L1 pre-filter → semantic cache → embed →
hybrid retrieval (RPC RRF + cosine + MMR) → L2 relevance gate → generate (Groq
gpt-oss-120b) → L4 post-check → persist. Four independent layers, three of them
code. The chat UI is a streaming panel gated by NEXT_PUBLIC_FEATURE_CHAT.

## Why
It is the site's thesis made literal: an AI/ML engineer who ships agents with
guardrails and evals. The agent is tuned to refuse rather than fabricate — see
decisions/0004.

## Key decisions and gotchas (the story to be able to tell)
- **The model in the brief did not exist.** `llama-3.3-70b-versatile` returned
  `model_not_found` on this Groq account. Listed the account's models and picked
  `openai/gpt-oss-120b` — open-weights, which fits the narrative. It spends tokens
  on internal reasoning, so the budget is 700 with `reasoning_effort: low`.
- **Generate fully, then L4, then stream.** The brief buffers the last 40 tokens;
  that only catches failures in the tail. Because a fabricated fact anywhere is
  catastrophic, the answer is generated whole, L4-checked, and only then streamed —
  nothing unvetted ever reaches the screen. First-token latency rises slightly;
  worth it.
- **L2 gates on cosine-to-query, not the RRF score.** RRF sums are ~0.03-scale;
  the brief's 0.62 only makes sense as a similarity. Measured the corpus and set
  the threshold to 0.40 — a clean gap between legit (>=0.42) and off-topic (<=0.39
  for the false-premise "Google 2023").
- **gpt-oss emits typographic characters** (U+2011 hyphen, smart quotes). They
  broke verbatim-number matching in L4 and the eval's string checks, so model
  output is folded to ASCII before L4.
- **Two eval bugs found and fixed:** a base64 detector that flagged any long
  question (it stripped spaces first), and temp 0.2 variance causing L4 discards
  (dropped to temp 0).

## Verified
`pnpm eval:rag`: recall 97.6% (>=90), false refusals 0, groundedness 100% (>=95),
adversarial 26/26 (100%), hallucinated facts 0. Also HTTP-tested: grounded answers
with sources, L1 injection refusal, L2 low-score refusal, L3 salary refusal (no
leak), 400 on bad body. RLS deny-all still holds; the anon key touches nothing.

## What breaks without it
The single most-inspected feature on the site (P0 visitors "will try to break the
chat agent") is missing — and if built naively, one hallucinated date under his
name is worse than no agent at all.
