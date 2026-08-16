# PRD — Personal Portfolio, Sahil Chakraborty

**Status:** authored Phase 0, reconciled to brief **v2.1** · **Source of truth:** `PORTFOLIO-BUILD-PROMPT.md`

## 1. Audience

| Priority | Who | Duration | Device | Needs |
|---|---|---|---|---|
| P0 | MLE hiring managers, tech leads | 45s–4min | Desktop | What was built, did it ship, can he reason about tradeoffs. Will open GitHub. Will try to break the chat agent |
| P1 | Recruiters, HR screeners | 20–40s | **Mobile** | Role clarity, location, years, stack keywords, resume, contact |
| P2 | Peer engineers | 2–5min | Desktop | Craft. Inspect network tab. Their sharing is distribution |
| P3 | Sahil | ongoing | any | An extensible system that doesn't rot |

**P1 is the largest segment and arrives on mobile.** The hero must communicate without motion — mobile never loads the frame sequence. Build the static case first, correct standalone.

## 2. The one claim the site must make credible

> This person ships production AI systems with guardrails, evaluations, and cost ceilings — not notebooks.

**The site is the storefront; Datachat and Quorum are the product.** A visitor who leaves impressed by the scroll engine but unable to name what he built has been failed. **When polish competes with clarity about the work, clarity wins.** A work card missing its measured numbers is a P0 defect; a missing Dimension feed is not.

## 3. The four (maybe five) projects

| Project | What it is | Status | Site role |
|---|---|---|---|
| **Datachat** | Agentic knowledge/data assistant — RAG + citations, hybrid retrieval, eval harness, FastAPI + Docker, deployed | Live | **Carries the site** |
| **Quorum** | Workflow/automation agent — LangGraph, MCP, human-in-the-loop, guardrails, audit log, trajectory eval | Live | **Carries the site** |
| **LACRE** | Local AI code review engine — AST analysis + RAG | Earlier | Range evidence |
| **Electricity Consumption Forecasting** | Time-series regression | Earlier | Range evidence |
| **Project 3** | In-progress ladder project (§5.5c) | In progress | Honest dated slot, or absent |

Ask whether a fifth repo belongs; do not assume the list is complete.

## 4. Facts requiring confirmation (R1)

Nothing in §1.1 of the brief is publishable until confirmed in the interview. In particular:

- **⚠ TCS title conflict** — "Systems Engineer (AI & Automation)" vs "Data Engineer". Ask in Group 6. Official designation → timeline entry; functional description → body copy. Never pick one silently.
- Education (KIIT B.Tech CSE 2021–2025), experience order, certifications, target cities — all confirmed in interview before use.

## 5. Goals

- G1 — Recruiter learns role, location, seniority, stack, finds resume + contact in < 30s on mobile.
- G2 — Hiring manager inspects real projects with explicit **tradeoff**, **measured numbers**, and **known limitations** per project.
- G3 — Technical visitor interrogates a grounded chat agent that refuses cleanly and never fabricates.
- G4 — Every claim traces to an interview answer or a GitHub README (R1); corpus sentences carry provenance tags.
- G5 — Zero cost, zero maintenance rot: graceful degradation is the worst case, never a bill.

## 6. Non-goals

- No blog/CMS/newsletter/analytics needing weekly attention.
- No general-purpose chatbot. Agent answers only about Sahil's professional background.
- No invented metrics/employers/dates/achievements. No aggregate stats ("4 production systems").
- No paid tiers, no payment card. No `dangerouslySetInnerHTML`. No client-side DB writes.
- Project 3 never renders "coming soon".

## 7. Per-section requirements & acceptance criteria

| Section | Priority | Requirement | Acceptance |
|---|---|---|---|
| Nav | P0 | Frosted 48px, hides on scroll-down past 120px, returns on scroll-up, 1px accent progress line, distinct Dimension entry, **persistent Résumé button (§5.5b)**, mobile full-screen overlay | Keyboard reachable; Résumé in desktop nav at all scroll positions AND in mobile top bar (not overlay) |
| Hero | P0 | Scroll-scrubbed / generative / static per Group 3. Full fallback matrix. Résumé secondary link present in `HeroFallback` | Fallback says "AI/ML engineer, Bangalore, ex-TCS" with zero motion; mobile fetches zero frames |
| Goals | P1 | Current focus + where heading, **dated** | Dates present; interview-sourced |
| Work | P0 | Card grid → `work/[slug]`; each: problem→approach→**tradeoff**→**measured numbers (§5.5a)**→**known limitations (§5.5a)**→stack→GitHub→demo | Metrics block + limitations block present on Datachat & Quorum; every number shows its method |
| Stack | P0 | Two visually distinct tiers: **interviewable** (Q27) and **familiar with** (Q28). Never merged, never from a lockfile | Tiers separated; nothing inferred from dependencies |
| Experience | P0 | Vertical timeline TCS→LTIMindtree→transition, outcomes not responsibilities | TCS title = confirmed official designation; measurable outcomes only if given |
| Education | P0 | KIIT B.Tech CSE 2021–2025 | Confirmed Group 7 |
| Hobbies | P1 | Exactly 3 equal columns: Riding · Gaming · Finding New Tech | Equal visual weight; stacks on mobile |
| Certifications | P1 | Real badges, verification links, issue dates | Only certs given Group 10 |
| Contact | P0 | Ticket form (flag on) or styled pre-filled `mailto:` (flag off) | Both flag states verified; flag-off never drops a message |
| Chat agent | P0 | Grounded RAG, 4 defence layers, refuses cleanly, no provenance tag leaks | Adversarial 100%; hallucinations = 0; tag-leak test passes |
| Project 3 slot | P0 | Honest in-progress card, content-only swap, tested fixture | Dated; no metrics strip, no demo button, no "coming soon"; swap tested |
| Dimension | P1 | `(dimension)` under `warp`, ISR feeds, last-good | Failed feed hides its block, never "no data" |

## 8. Success metrics (release gates)

- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95.
- LCP ≤ 2.5s (mobile 4G), INP ≤ 200ms, CLS ≤ 0.05.
- First-load JS (landing) ≤ 165KB gzip; **chat panel absent from landing bundle**.
- Hero sequence ≤ 4MB, desktop-only, lazy.
- Chat first token ≤ 900ms p75; ticket round-trip ≤ 1.2s p95.
- Scroll: **p95 ≤ 16ms, worst frame ≤ 32ms at 1× AND 4× CPU**, numbers recorded.
- Zero console errors, zero CSP violations.
- If chat: groundedness ≥ 95%, hallucinated facts = 0, recall@6 ≥ 0.90, adversarial 100%, zero false refusals.
- Content integrity: every number traces to a source; no aggregate stats; no tag leaks.

## 9. Tiers

- **Tier 1** (no optional keys): complete site, contact via pre-filled `mailto:`, chat flag off (doesn't render). Adding keys later is a 5-minute change, no refactor.
- **Tier 2** (Supabase + Groq + embeddings + Resend + Turnstile): live chat agent + ticketing pipeline.
