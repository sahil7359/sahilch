# 0001 — Scaffold, design tokens, and toolchain pinning

**Type:** infrastructure
**Files:** package.json · tsconfig.json · next.config.ts · postcss.config.mjs · eslint.config.mjs · app/globals.css · app/layout.tsx · app/(prime)/* · app/(dimension)/* · components/nav/* · components/Footer.tsx · components/LenisProvider.tsx · components/ui/Reveal.tsx · lib/env.ts · lib/site.ts · lib/utils/cn.ts
**Commit:** feat: scaffold application shell and design system

## What changed
Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 scaffold. Full
design-token set in `@theme` including the `[data-theme='warp']` Dimension skin.
Root layout with variable fonts (`next/font`), skip-link and theme attribute.
Both route groups — `(prime)` and `(dimension)`. Nav (frosted, hide-on-scroll,
scroll-progress line), MobileMenu, Footer, a single Lenis rAF loop, and the
`Reveal` scroll primitive. `lib/env.ts` validates env at module load with Zod.

## Why
The tokens-as-CSS-variables choice is what makes Dimension a `data-theme` swap
rather than a second stylesheet — one component set, two skins. Validating env
at boot means a missing secret fails the build, not a request at 2am.

## How it works
Tailwind v4 reads `@theme` custom properties and generates utilities (`bg-bg`,
`text-ink`, `ease-out`). `[data-theme='warp']` re-binds the same variables to the
Dimension palette, so every component re-skins for free. Lenis owns the only rAF
loop; the Nav scroll handler writes directly to the DOM (no per-frame React
re-render) and is gated by a `ticking` flag.

## What breaks without it
No token system → the Dimension page becomes a duplicated stylesheet that drifts.
No env validation → the site boots and then 500s at the first chat/ticket call.
A second rAF loop → scroll jank, the one thing this site cannot ship with.

## The toolchain pin (the interesting part)
This environment's "latest" resolved to **TypeScript 7** and **ESLint 10**. The
build passed on both (Next uses its own TS pipeline), but `pnpm lint` failed:
`typescript-eslint` does not yet support TS 7, and ESLint 10 crashed
`eslint-config-next`'s `FlatCompat` bridge (a circular structure in
`eslint-plugin-react`'s flat config). Fixes:
- Pinned **TypeScript to 6.x** — the newest line `typescript-eslint` supports.
- Pinned **ESLint to 9.x**.
- Replaced the `eslint-config-next` / `FlatCompat` config with a **native flat
  config** that wires the Next and react-hooks rule sets in directly, skipping
  the react-plugin bridge entirely.

## If asked about this in an interview
"Why not just use the latest everything?" → Because the linter toolchain lags the
compiler by a release. `typescript-eslint` has to track the TS compiler API, so a
brand-new TS major will lint-fail until it catches up. Pinning TS one major back
is the standard, boring fix — and the native flat config removes a fragile
compat layer I don't control.
"Why one rAF loop?" → Every extra rAF loop competes for the same 16ms frame
budget. Lenis owns it; the nav, hero and reveals subscribe rather than spin their
own.
