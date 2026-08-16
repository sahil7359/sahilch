# TechSpec — Personal Portfolio

## 1. Stack & rationale

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16, App Router, TS strict | RSC keeps client bundle small; route handlers = backend without a second deploy |
| Styling | Tailwind CSS v4 + CSS custom properties | Tokens as CSS vars make Dimension a `data-theme` swap, not a second stylesheet |
| UI motion | Motion (`motion/react`) | Layout animations, spring physics |
| Scroll | Lenis + native CSS scroll-driven animations | Lenis only where inertia matters |
| Hero | Hand-rolled canvas, no animation library | 180 `drawImage` calls don't need GSAP; fewer deps, full control |
| Database | Supabase Postgres | Tickets, vectors, rate limits, budget in one free tier |
| Vectors | pgvector, HNSW index | Colocated with relational data |
| Inference | Groq, streaming | Fastest tokens/sec at zero cost; open-weights narrative rhymes with LACRE |
| Embeddings | Hosted free-tier API, same model ingest+query | §5.6 symmetry rule |
| Email | Resend | Free tier, React Email, clean webhooks |
| Bot defence | Cloudflare Turnstile | Free, privacy-preserving, no CAPTCHA friction |
| Hosting | Vercel Hobby | Zero cost, edge CDN, preview deploys |
| Package manager | pnpm | Fast, strict, disk-efficient |

**Model version pinning.** Every model id (chat + embedding) lives only in `lib/ai/config.ts`. `EMBEDDING_VERSION` makes an embedding-model change detectable (requires re-ingest) rather than silent.

## 2. Folder structure

```
app/
├─ layout.tsx                     root: fonts, theme attr, skip-link
├─ globals.css                    @theme tokens, resets, motion prefs
├─ (prime)/
│  ├─ layout.tsx                  Nav + Footer + Lenis + ChatLauncher
│  ├─ page.tsx                    composed landing page
│  └─ work/[slug]/page.tsx        generateStaticParams from content/work
├─ (dimension)/
│  ├─ layout.tsx                  data-theme="warp"
│  └─ dimension/page.tsx          ISR, revalidate 86400
├─ api/
│  ├─ chat/route.ts               POST, streaming SSE, nodejs runtime
│  ├─ ticket/route.ts             POST
│  ├─ webhooks/resend/route.ts    POST, svix-verified
│  └─ og/route.tsx                GET, dynamic OG images
├─ sitemap.ts · robots.ts · not-found.tsx · error.tsx
components/
├─ hero/    ScrollyCanvas · useFrameSequence · usePinnedProgress · HeroPhases · HeroFallback
├─ chat/    ChatLauncher · ChatPanel · Message · SourceChips · useChatStream
├─ sections/ Goals · Work · WorkCard · Stack · Timeline · Hobbies · Certifications · Contact
├─ nav/     Nav · MobileMenu · DimensionPortal
└─ ui/      Button · Field · Chip · Reveal
lib/
├─ ai/      config · embed · retrieve · prompt · guard · cache
├─ db/      server · admin · types
├─ email/   send · templates/
├─ env.ts · ratelimit.ts · utils/
content/
├─ corpus/  bio · experience · education · certifications · skills · faq
│           projects/{datachat,quorum,lacre,electricity-forecasting,portfolio}.md
└─ work/    *.mdx   frontmatter: status('in-progress'|'shipped') · statusDate
                    metrics[]{label,value,method} · limitations · repo · demo
scripts/    extract-frames.sh · optimize-frames.mjs · ingest.ts · eval-rag.ts
supabase/migrations/
evals/      golden.jsonl · adversarial.jsonl
public/hero/ frame_0000.webp … manifest.json
```

**Barrel files are banned** (defeat tree-shaking, unreadable import graphs).

## 3. API contracts

### POST /api/chat  (streaming SSE, nodejs runtime)
Request: `{ message: string, sessionId: string }`
Stream events (SSE `data:` JSON lines):
- `{ type: "token", value: string }` — streamed answer tokens
- `{ type: "sources", value: SourceChip[] }` — resolved citations after generation
- `{ type: "refusal", reason: "low_score"|"off_topic"|"injection"|"rate_limited"|"budget"|"post_check", copy: string }`
- `{ type: "done" }`
Errors: 400 invalid body · 429 rate_limited (also surfaced as refusal event) · 503 feature disabled.

### POST /api/ticket
Request: `{ name, email, subject, message, turnstileToken, idempotencyKey, website? }` (`website` = honeypot)
- 201 `{ ref: "SC-2026-0042", status: "received" }`
- 400 `{ error: "validation" }` (generic; never echo Zod details)
- 403 `{ error: "turnstile_failed" }`
- 409 `{ ref, status: "received" }` — duplicate idempotency key, surfaced to user as **success**
- 429 `{ error: "rate_limited" }`

### POST /api/webhooks/resend  — svix-verified, updates `tickets.delivery`
### GET /api/og — dynamic OG image (edge)

## 4. Hero pipeline

`position: sticky` canvas over ~520vh container. Scroll progress → frame index across photographic sequence; 4 copy phases keyed to progress windows with silence at 0.20–0.22 and 0.70–0.74.

Asset pipeline: `ffmpeg fps=24 scale=1600:-2` → PNG → sharp WebP q72 effort6 → `public/hero/` + `manifest.json`. Budget **4MB / 180 frames**. Over budget → cut frames before quality.

Loading: frame 0 as real `<img priority>` (LCP); rest fetched as Blob → `createImageBitmap` off main thread; priority waves (every 6th first); draw nearest-loaded; `IntersectionObserver` cancels fetches when hero leaves viewport.

Scroll mapping: cache `getBoundingClientRect` on resize; scroll listener writes a number only; one rAF loop; smoothing `smooth += (p-smooth)*0.09`; skip draw when frame unchanged; DPR cap 2; `alpha:false`; cover-fit in draw call.

Fallback matrix (implement all): reduced-motion → static poster, sequence never fetched. <768px → poster + CSS parallax. No `createImageBitmap` → `<img>` swap reduced frames. `saveData` → poster only. No JS → poster + full copy SSR.

Generative fallback (option b): ~4200 points via rejection sampling in a drawn bust silhouette; scattered origins, stagger, drift; lerp by scroll with cubic ease; rim-light Lambert shading; slow push-in. Same component contract as photographic path.

## 5. RAG architecture

Pipeline: corpus md → chunk (500 tok, 80 overlap, heading-aware) → embed → `documents`. Query: L1 pre-filter → semantic cache (cos ≥ 0.97) → embed (same model) → hybrid search (vec top-20 ⊕ FTS top-20 → RRF k=60 → MMR λ=0.7 → 6) → L2 gate (top < 0.62 → refuse, LLM never called) → generate (Groq, streaming) → L4 post-check → persist. Details in `Guardrails.md`.

## 6. Performance budget

| Metric | Budget |
|---|---|
| LCP (mobile 4G) | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.05 |
| First-load JS (landing) | ≤ 165KB gzip |
| Hero sequence | ≤ 4MB, lazy, desktop only |
| Chat first token | ≤ 900ms p75 |
| Ticket round-trip | ≤ 1.2s p95 |
| Scroll, p95 / worst frame | ≤ 16ms / ≤ 32ms at 1× AND 4× CPU |

**Bundle discipline.** The 165KB landing budget is tight and the real constraint. Route-level code splitting is what makes it work: the **chat panel loads on interaction, never in the landing bundle**; `work/[slug]` MDX ships per route; the Dimension route group carries its own chunk. Measure at Phase 4, before chat + MDX grow it. If the landing bundle exceeds 165KB, check the chat panel first.

No library > 30KB gzip without a `learn/decisions/` justification. **Pre-approved** (do not re-litigate): `motion/react` (~32KB — layout animations + spring physics across every reveal surface), `lenis` (~8KB — wheel inertia). Anything else over 30KB needs a decision entry *before* install. Fonts variable via `next/font`, `display: swap`, Latin subset.

## 7. Environment variables

| Variable | Scope | Required for |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client (RLS-protected) | tickets, chat |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client (RLS-protected) | tickets, chat |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | tickets, chat |
| `GROQ_API_KEY` | server | chat |
| `EMBEDDING_API_KEY` | server | chat |
| `RESEND_API_KEY` | server | tickets |
| `RESEND_WEBHOOK_SECRET` | server | ticket delivery status |
| `TURNSTILE_SECRET_KEY` | server | tickets |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | client (public by design) | tickets |
| `IP_HASH_SALT` | server | rate limiting |
| `NEXT_PUBLIC_FEATURE_CHAT` | client | needs Groq + embeddings + Supabase |
| `NEXT_PUBLIC_FEATURE_TICKETS` | client | needs Supabase + Resend |

`lib/env.ts` validates all vars at module load (Zod); optional keys typed optional; missing required secret fails the build, not a 2am request.
