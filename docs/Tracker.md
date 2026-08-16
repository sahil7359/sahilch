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

## Phase 3 — Skeleton
- [ ] Next.js 16 + TS strict + Tailwind v4 + pnpm
- [ ] Token set incl. `[data-theme='warp']`; root layout (fonts, skip-link, theme attr)
- [ ] Both route groups; Nav, MobileMenu, Footer; Lenis (off under reduced-motion)
- [ ] `lib/env.ts` Zod-validating at boot
- [ ] `pnpm build` green · learn/ change entry · commit `feat: scaffold application shell and design system`

## Phase 4 — Sections & content
- [ ] Every section per §5.5, copy from interview answers
- [ ] Work cards → `work/[slug]` MDX + `generateStaticParams`, metrics strip + limitations block (§5.5a)
- [ ] Résumé placement (§5.5b); Stack two tiers (§5.5)
- [ ] Project 3 in-progress slot + tested shipped-state swap fixture (§5.5c)
- [ ] One scroll-reveal pattern, fires once
- [ ] **Landing bundle measured ≤165KB, chat panel absent**
- [ ] `pnpm build` green · learn/ entry · commit `feat: landing sections with interview-sourced content`

## Phase 5 — Hero
- [ ] `HeroFallback` first, correct standalone
- [ ] Full fallback matrix (reduced-motion, <768px, no createImageBitmap, saveData, no-JS)
- [ ] Chosen path per Group 3; if footage, manifest <4MB verified
- [ ] `pnpm build` green · learn/ entry · commit `feat(hero): scrollycanvas with full fallback matrix`

## Phase 6 — Ticketing [conditional]
- [ ] Migrations in order; **RLS denial test passes first**
- [ ] Route: Turnstile server-verify → Zod → honeypot → rate limit → idempotent insert → ref → `Promise.allSettled` emails
- [ ] Resend templates; Svix-verified webhook; pending-delivery retry job
- [ ] Idempotency test: double-submit → one row
- [ ] `pnpm build` green · learn/ entry · commit `feat(tickets): ticketing pipeline with turnstile and resend`

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
