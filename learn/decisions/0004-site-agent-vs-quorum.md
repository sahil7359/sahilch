# 0004 — Why the site agent and Quorum are both RAG systems

**Status:** accepted
**Date:** 2026-08-21

**Write this one whether or not it feels like a decision. It is the question he is
most likely to be asked and least prepared for.**

Quorum is a RAG system: hybrid retrieval (dense + BM25, RRF), grounding, an
evaluation harness, citations. The chat agent on this site is a RAG system:
hybrid retrieval (dense + BM25, RRF), grounding, an evaluation harness, citations.
A technical interviewer with both tabs open will ask, in some form:

> *"You've built the same thing twice. Why?"*

## The bad answer
Defensive, or a claim that they are entirely different systems. They are not. The
retrieval core is the same shape, and pretending otherwise fails the first
follow-up.

## The honest answer
They solve the same retrieval problem under **opposite operating constraints**,
and the constraints are what make them different engineering.

| | Quorum | Site agent |
|---|---|---|
| Optimises for | Finding coverage + grounding | **Refusal correctness** |
| Corpus | A repo's docs, per-PR, evolving | ~60 chunks about one person, fixed |
| Failure cost | A missed or weak finding | **A fabricated career fact, published** |
| Posture | Cite-or-drop; silence over ungrounded | Refuse unless confidently grounded — L2 gate deliberately over-strict |
| Adversarial surface | Low (internal diffs) | **Public endpoint, actively probed by peers** |
| Persona | Reviewer | Third-person; never impersonates him |

The site agent's L2 relevance gate refuses answerable questions on purpose, and
four independent layers (pre-filter, cache, gate, post-check) each get a veto —
three of them code, only one a prompt. That is a **worse** general-purpose RAG
system and a **correct** portfolio agent: the cost of a wrong answer here is a
fabricated fact under his name, so the whole system is tuned to prefer silence.

## If asked about this in an interview
"You built the same thing twice — why?" → Same retrieval core, opposite
constraints. Quorum optimises for coverage of findings; this agent optimises for
refusal correctness, because the failure mode here is publishing a fake fact about
me. So the gate is deliberately too strict, and four layers can each refuse — code,
not prompts, does the enforcing. Being able to explain why that tradeoff flips
with the deployment context is the point.

## Measured
Golden recall 97.6%, adversarial suite 26/26, groundedness 100%, hallucinated
facts 0, false refusals 0 — on `openai/gpt-oss-120b` at temperature 0.
