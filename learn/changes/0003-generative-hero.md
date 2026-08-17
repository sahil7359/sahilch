# 0003 — Generative point-cloud hero with the full fallback matrix

**Type:** feature
**Files:** components/hero/{Hero,HeroFallback,GenerativeHero}.tsx · app/(prime)/page.tsx
**Commit:** feat(hero): generative point-cloud hero with fallback matrix

## What changed
The desktop hero is a `<canvas>` that resolves ~4,200 drifting points into a bust
silhouette as you scroll a 320vh container, with four copy beats keyed to scroll
windows (and deliberate silence between them). `HeroFallback` is the static
poster — the honest identity line — shown to mobile, no-JS, reduced-motion, and
save-data visitors. `Hero` decides between them with `useSyncExternalStore` and
dynamically imports the canvas (`ssr:false`), so those visitors never download it.

## Why
Most real traffic is mobile (P1), and mobile never loads the sequence — so the
static case had to be correct first and stand alone. The generative hero is the
craft signal for the desktop P0/P2 audience, at ~3KB instead of 4MB of frames.

## How it works
- Points are sampled by rejection against an off-screen silhouette, each with a
  scattered origin, a stagger delay, and a drift phase.
- The scroll handler only writes a number; one rAF loop reads it, smooths it
  (`smooth += (target-smooth)*0.09`), and draws. Geometry is cached on resize, so
  the loop never calls `getBoundingClientRect`.
- A rim-light angle rotates with progress; per-point brightness is a Lambert term.
- The loop is IntersectionObserver-gated (stops off-screen); a synchronous poster
  frame paints on mount so the hero is never blank before rAF starts.
- All four beats are real DOM text (a11y); the canvas carries `role="img"` + label.

## What breaks without it
The site's whole "how did they do that" signal. And without the fallback split,
mobile either downloads a canvas it will never animate well, or gets a blank hero.

## Gotcha logged
`useSyncExternalStore` replaced a `setState`-in-`useEffect` after the React 19
`react-hooks/set-state-in-effect` lint rule (correctly) flagged it. The store's
server snapshot is `false`, so SSR and hydration both render the fallback and the
client swaps to the canvas with no hydration mismatch.

## If asked about this in an interview
"Why not GSAP?" → See decisions/0001 — a single canvas draw doesn't need a
timeline library, and this keeps the bundle small and the mechanism mine.
"How do you keep it off mobile?" → `dynamic(..., { ssr:false })` behind a
media-query store, so the canvas module is never in the mobile download at all.
