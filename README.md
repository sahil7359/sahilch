<div align="center">

# sahilch.dev

**A personal site with a grounded RAG assistant that will refuse to make things up about me.**

[![Live](https://img.shields.io/badge/live-sahilch.vercel.app-000000?logo=vercel&logoColor=white)](https://sahilch.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3FCF8E?logo=supabase&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss&logoColor=white)

</div>

---

## What this is

A portfolio site, and an excuse to build the thing I actually care about: a retrieval-
augmented assistant that answers questions about my work **only from a corpus I wrote**,
and says "I don't know" the moment it runs out of grounding.

The interesting engineering isn't the chat — it's everything wrapped around it. An
assistant that represents you in front of recruiters has an unusual failure mode: a
confident hallucination about your own experience is worse than no answer at all. So the
whole design is built around refusing rather than guessing.

## The grounding contract

Every answer has to survive a chain of gates before it reaches the visitor. Any one of
them can refuse:

| Gate | What it catches |
|---|---|
| `invalid` | Input outside 3–500 characters |
| `rate_limited` | Too many requests from one visitor |
| `session_limit` | Per-session question cap |
| `budget` | Cost ceiling reached |
| `injection` | Prompt-injection attempt |
| `low_score` | No retrieved chunk clears the similarity threshold |
| `off_topic` | Question isn't about my work or background |
| `post_check` | The generated answer failed validation *after* generation |

Two decisions worth calling out:

- **Injection refusals are worded identically to off-topic refusals.** Confirming that
  an attack was *detected* hands the attacker free information about the defence. The
  refusal copy is deliberately indistinguishable.
- **`temperature: 0`.** Deterministic generation — grounding is a correctness property,
  and sampling variance is not a feature when the model is speaking on my behalf.

## Evaluation

The assistant is tested, not vibe-checked. Two suites live in `evals/`:

- **`golden.jsonl`** — questions that *should* be answered, with the grounding they
  should be answered from.
- **`adversarial.jsonl`** — questions that should be **refused**: instruction override,
  system-prompt extraction, persona jailbreaks, fake-system-block injection,
  translation-based exfiltration.

## Architecture

```
lib/ai/
├── config.ts     # single source of truth for model ids, dims, limits
├── embed.ts      # Jina v3 embeddings (1024-dim)
├── retrieve.ts   # pgvector similarity search over the corpus
├── guard.ts      # the refusal gates above
├── prompt.ts     # grounding contract + system prompt
├── answer.ts     # generation against retrieved context
└── cache.ts      # response caching
```

**Model identifiers live in exactly one file.** Hosted model ids get deprecated on short
notice, and changing one at fifteen call sites is how you end up with a half-migrated
system. `EMBEDDING_VERSION` is stamped onto every stored vector and filtered on at
retrieval time — so if the embedding model changes without a re-ingest, retrieval
returns nothing instead of silently comparing incompatible vectors.

| Concern | Choice |
|---|---|
| Framework | Next.js 16, App Router, route groups |
| Language | TypeScript, Zod for runtime validation |
| Vector store | Supabase Postgres + pgvector (`vector(1024)`) |
| Embeddings | Jina `jina-embeddings-v3` |
| Generation | `openai/gpt-oss-120b` via Groq (open-weights) |
| Content | Markdown + `gray-matter` frontmatter |
| Motion | `motion`, `lenis` smooth scroll |
| Email | Resend, with Svix-verified webhooks |
| Rate limiting | `lib/ratelimit.ts` |

## Routes

| Route | Purpose |
|---|---|
| `/` | Home |
| `/work/[slug]` | Individual case study |
| `/dimension` | Experimental visual route |
| `/privacy` | Privacy policy |
| `/api/chat` | RAG assistant endpoint |
| `/api/ticket` | Contact / enquiry |
| `/api/og` | Dynamic OG image generation |
| `/api/webhooks/resend` | Email delivery events |

## Running locally

```bash
git clone https://github.com/sahil7359/sahilch.git
```

```bash
cd sahilch && pnpm install
```

Create `.env.local` — see `lib/env.ts` for the validated schema (it fails fast on boot
if anything is missing):

```bash
cp .env.example .env.local
```

```bash
pnpm dev
```

The corpus in `content/` has to be embedded into Supabase before the assistant returns
anything. Apply the migrations in `supabase/migrations/`, then:

```bash
pnpm tsx scripts/ingest.ts
```

Other scripts worth knowing:

| Script | Purpose |
|---|---|
| `scripts/ingest.ts` | Embed `content/` into pgvector |
| `scripts/eval-rag.ts` | Run the golden + adversarial eval suites |
| `scripts/test-retrieve.ts` | Inspect what retrieval returns for a query |
| `scripts/test-rls.ts` | Verify Supabase row-level security |
| `scripts/build-corpus-review.ts` | Human review pass over the corpus |

## License

All rights reserved. The content in `content/` is mine; the code is here to be read,
not reused wholesale.
