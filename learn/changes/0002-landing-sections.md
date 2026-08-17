# 0002 — Landing sections from interview-sourced content

**Type:** feature
**Files:** content/work/*.mdx · lib/content/{work,stack,experience,certifications}.ts · components/sections/* · app/(prime)/work/[slug]/page.tsx · app/(prime)/page.tsx
**Commit:** feat: landing sections with interview-sourced content

## What changed
Every landing section, written entirely from the interview ledger (docs/interview.md)
and the GitHub READMEs — zero invented facts. Work cards (DataChat, Quorum,
FLAN-T5, Breast Cancer) with the §5.5a metrics-and-limitations contract and
`work/[slug]` detail pages; Yardstick as a single muted "currently building" line;
the two-tier flip-card Stack; the TCS→LTIMindtree→KIIT timeline; Goals (dated);
Certifications (verifiable); Hobbies (gradient placeholders); Contact (mailto,
until tickets land in Phase 6).

## Why
This is the site's whole reason to exist — the P0 audience opens it to see what he
built and whether the numbers are real. The metrics strip renders three states and
no fourth: measured (number + method), "Not measured" (literal, on FLAN-T5), and
absent (no row, on Breast Cancer). That honesty is the differentiator, not a caveat.

## How it works
`lib/content/work.ts` (server-only) parses MDX frontmatter with gray-matter into a
typed `WorkMeta`. `getFeaturedWork` renders full cards; `getInProgressWork` renders
the muted line. The detail page's `generateStaticParams` picks up every MDX file, so
completing Yardstick is a two-file drop (§5.5c) — flip `status: 'shipped'`, fill
`metrics[]`, and it becomes a full card with zero code change. The flip card is a
transform-only 3D rotation (composited), flipping on hover, focus, and tap.

## What breaks without it
Nothing renders. But more subtly: without the three-state metrics contract, an
unmeasured dimension either gets hidden (looks like there's nothing) or gets a
fabricated number (R1 violation). The literal "Not measured" is the honest third path.

## The bundle finding
First-load JS measured **141.8 KB gzip** against the 165 budget. A naive count read
180 KB, but 38.6 KB of that is Next's core-js polyfill chunk carrying a `nomodule`
attribute (React serialises it as `noModule=""`), so modern browsers never fetch it.
The chat panel is absent from the landing bundle entirely — it doesn't exist yet and
will be dynamically imported when it does.

## If asked about this in an interview
"How do you keep a rich landing page under budget?" → Most of it is React Server
Components — only Nav, the reveal primitive, the flip card, and the Lenis loop ship
JS. And the scary-looking polyfill chunk is nomodule, so it's legacy-only; the real
modern payload is ~142 KB.
