# Tracker — Per-phase checklist

Legend: `[ ]` todo · `[~]` in progress · `[x]` done

## Phase 0 — Architecture docs
- [x] Repo hygiene: `.gitignore`, `.gitattributes`, `.env*` verified ignored
- [x] PRD.md · TechSpec.md · Design.md · Schema.md · Guardrails.md · Security.md · Tracker.md
- [ ] Commit `docs: architecture specification`

## Phase 1 — Interview (mode A: full up front)
- [ ] Procedural A/B (A chosen)
- [ ] GitHub username → fetch profile + repos
- [ ] Read READMEs: Datachat, Quorum, LACRE, Electricity Forecasting (+ any 5th) — capture every number
- [ ] Groups 1–13 answered; TCS title conflict resolved; Project 3 question asked
- [ ] Commit content notes separately from code (R5)

## Phase 2 — Credentials & flags
- [ ] `gh auth status`, `vercel whoami` (both required; browser reachable)
- [ ] Tier decision (1 or 2); per-service keys if full
- [ ] `.env.local` written (gitignore verified), `.env.example` created
- [ ] `NEXT_PUBLIC_FEATURE_CHAT` / `NEXT_PUBLIC_FEATURE_TICKETS` set; both states will be verified

## Phase 3 — Skeleton ✅
- [x] Next.js 16 + TS strict + Tailwind v4 + pnpm (TS pinned 6.x, ESLint 9.x — see learn/0001)
- [x] Token set incl. `[data-theme='warp']`; root layout (fonts, skip-link, theme attr)
- [x] Both route groups; Nav (hide-on-scroll + progress line), MobileMenu, Footer; Lenis (off under reduced-motion)
- [x] `lib/env.ts` Zod-validating at boot; `lib/site.ts` confirmed-facts source
- [x] `pnpm typecheck && lint && build` green · learn/changes/0001 · commit

## Phase 4 — Sections & content ✅ (résumé placement + swap-fixture test pending)
- [x] Every section per §5.5, copy from interview answers (Goals, Work, Stack, Experience+Education, Certifications, Hobbies, Contact)
- [x] Work cards → `work/[slug]` MDX + `generateStaticParams`, metrics strip (3-state) + limitations block (§5.5a)
- [~] Résumé placement (§5.5b) — hasResume=false (no PDF yet) → button hidden, in MISSING. Wire when PDF lands.
- [x] Stack two tiers as flip cards (§5.5 + user request)
- [x] Project 3 (Yardstick) muted in-progress line, same data shape (§5.5c). [ ] shipped-state swap fixture test — TODO before Phase 9
- [x] One scroll-reveal pattern (Reveal), fires once
- [x] **Landing bundle 141.8KB gz modern (nomodule polyfill excluded) ≤165 ✓; chat panel absent**
- [x] `pnpm build` green · learn/changes/0002 · commit

## Phase 5 — Hero ✅
- [x] `HeroFallback` first, correct standalone (static identity, real DOM text)
- [x] Fallback matrix: reduced-motion / <768px / saveData / no-JS → static poster via dynamic ssr:false store; canvas never downloaded
- [x] Generative point-cloud hero (Group 3 = option b): 4200-pt silhouette, 4 beats, rim-light, drift, IO-gated rAF, synchronous poster frame
- [x] Verified: build centred figure (18k lit px, centred), poster paints w/o rAF. Live scroll animation runs in real browser (rAF paused in hidden pane)
- [x] `pnpm build` green · learn/changes/0003 + decisions/0001 · commit

## Phase 6 — Ticketing ✅ (Tier 2)
- [x] Migration applied (user ran 0001_init.sql); **RLS denial test PASSED first** (7 tables, read+write)
- [x] Route: Turnstile server-verify → Zod → honeypot → hashed-IP rate limit → idempotent insert → sequence ref → allSettled emails
- [x] Resend send (notification + auto-reply, graceful); Svix-verified webhook (delivery status)
- [x] Idempotency test: double-submit → exactly one row ✓; ref format ✓; validation 400 ✓; honeypot 201 ✓; turnstile 403 ✓
- [x] `NEXT_PUBLIC_FEATURE_TICKETS=true`; `pnpm build` green · learn/changes/0004 + decisions/0002 · commit
- [ ] Happy-path (real Turnstile solve + email delivery) — manual check at deploy; pending-delivery retry job (Phase 10)

## Phase 7 — RAG agent [conditional]
- [ ] Corpus authored with provenance tags → **mandatory review checkpoint (claim table)**
- [ ] config → embed → ingest (tag-strip test) → hybrid RPC → retrieve+MMR → guard → prompt → cache → `/api/chat` SSE → chat UI
- [ ] 60 golden + 26 adversarial evals; `pnpm eval:rag` blocking in CI
- [ ] `pnpm build` green · learn/ entry · commit `feat(agent): rag pipeline with guardrails and evaluation harness`

## Phase 8 — Dimension & polish
- [ ] `(dimension)` under `warp`; View Transition; ISR feeds (last-good, hide-on-fail)
- [ ] metadata, sitemap.ts, robots.ts, JSON-LD Person + WebSite, `/api/og`, CSP + security headers, 404 + error boundary, privacy page
- [ ] `pnpm build` green · learn/ entry · commit `feat: dimension subsite and launch polish`

## Phase 9 — Verification
- [ ] `pnpm typecheck && pnpm lint && pnpm build`
- [ ] Playwright: desktop 1440×900, mobile 390×844, hero 0/33/66/100%
- [ ] Reduced-motion + mobile → zero frame_*.webp requests
- [ ] Keyboard pass, focus rings, Escape closes overlays; zero console/CSP errors
- [ ] Lighthouse mobile Perf ≥90 / A11y ≥95; JWT grep clean; both flag states
- [ ] Scroll p95 ≤16ms / worst ≤32ms at 1× and 4×, recorded
- [ ] Content-integrity checklist (every number traced, methods shown, limitations visible, no aggregates, TCS title correct, stack tiers, résumé placement, Project 3 rules, no tag leaks)
- [ ] If tickets: real message delivered, dedupe verified, anon denied
- [ ] If chat: eval gates + manual adversarial classes, false-premise rejected

## Phase 10 — Ship
- [ ] `gh repo create` + push; `vercel link` + env push + `vercel --prod`
- [ ] Turnstile domain, Resend webhook, `keepalive.yml`, CI, SPF/DKIM/DMARC
- [ ] Re-run Phase 9 against live URL; OG previews on LinkedIn/Twitter/WhatsApp
- [ ] Hand-off report (Tier, Lighthouse, bundle, hero, tickets, agent, cost, scroll numbers, metrics list, Project 3 swap, ASSUMED/MISSING/UPGRADE/ONLY HE CAN DO)
