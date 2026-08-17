# 0001 — Hand-rolled canvas instead of GSAP / a scroll library

**Status:** accepted
**Date:** 2026-08-17

## Context
The hero resolves a ~4,200-point cloud into a portrait as you scroll — the
literal version of the site's "raw data → intelligence" signature. GSAP
ScrollTrigger is the standard answer and would take an afternoon.

## Decision
Hand-roll it: one rAF loop, manual scroll→progress mapping, manual canvas draw,
IntersectionObserver-gated so it stops when the hero leaves the viewport.

## Alternatives considered
- **GSAP ScrollTrigger** — battle-tested, but ~70KB and a paid licence for some
  commercial uses. Overkill for driving a single canvas draw.
- **Framer Motion `useScroll`** — great for element transforms, awkward for a
  per-frame canvas point simulation with drift and shading.
- **Native CSS scroll-driven animations** — excellent for the reveals (used
  there), but cannot drive a `<canvas>` draw call.
- **A photographic frame sequence** (the brief's option a) — needs 4MB of WebP
  and a shoot. The generative hero is ~3KB of JS, needs nothing from Sahil, and
  is coherent with the resolution signature.

## Consequences
+ ~70KB smaller than GSAP, full control of the draw loop, no licence question.
+ The point cloud is genuinely generative — it swaps to real footage later by
  changing only the draw call, with the component contract unchanged.
− Edge cases (resize, DPR, sub-pixel, visibility throttling) are ours to handle.
− No community answers when something breaks.

## The honest version
180 `drawImage`/`fillRect` calls a frame do not need a timeline library. The
reason to reach for GSAP is speed of delivery — and on a portfolio, the code IS
the product, so demonstrating the mechanism beats importing the wrapper.

## Verification note
rAF is paused for non-composited pages, so the live animation can't be watched in
a headless/hidden pane. It's verified structurally instead: the point-build
produces a centred silhouette (3,542 of ~4,200 lit points in the centre fifth),
mid-scroll renders 18k lit pixels at max brightness 241, and a synchronous poster
frame paints on mount independent of rAF.
