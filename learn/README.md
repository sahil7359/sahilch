# learn/ — the study guide for this codebase

This folder exists so Sahil can explain this site in an interview room. It is
not user docs; it is the "why" behind every meaningful decision. Nothing here
contains a personal fact about him (R1) — it is entirely about the code.

## Reading order

1. `concepts/` — the ideas you must be able to explain cold (added as built).
2. `decisions/` — one file per architectural choice a reasonable engineer might
   have made differently (ADR format).
3. `changes/` — one file per meaningful commit, numbered to match build order.
4. `interview-prep.md` — the 15 questions an interviewer is likely to ask, with
   honest answers (written at the end).

## Changes so far

| # | Title | Type |
|---|---|---|
| 0001 | Scaffold, design tokens, toolchain pinning | infrastructure |
| 0002 | Landing sections from interview-sourced content | feature |
| 0003 | Generative point-cloud hero with fallback matrix | feature |
| 0004 | Ticketing pipeline (Turnstile, idempotency, Resend) | feature |
| 0005 | Launch polish: metadata, CSP, OG, Dimension, chat placeholder | infrastructure |
| 0006 | RAG chat agent: pipeline, guardrails, eval harness | feature |

## Decisions so far

| # | Title |
|---|---|
| 0001 | Hand-rolled canvas over GSAP |
| 0002 | RLS deny-all over anon policies |
| 0003 | Hybrid retrieval (RRF + MMR) over pure vector |
| 0004 | Why the site agent and Quorum are both RAG systems |
