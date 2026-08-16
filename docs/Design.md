# Design — Personal Portfolio

## 1. Tokens

```css
@theme {
  /* PRIME */
  --color-bg:         #000000;
  --color-surface:    #0a0a0c;
  --color-elevated:   #121214;
  --color-ink:        #f5f5f7;   /* 19.8:1 */
  --color-muted:      #86868b;   /*  5.9:1 — body-safe */
  --color-dim:        #48484a;   /*  3.0:1 — DECORATIVE ONLY, never text */
  --color-accent:     #2997ff;   /*  6.4:1 (default; overridable in Group 13) */
  --color-hair:       rgb(255 255 255 / 0.09);

  --font-sans: 'Inter Variable', -apple-system, 'SF Pro Display', system-ui;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;

  --text-hero:  clamp(2.4rem, 7.2vw, 6rem);   --tracking-hero: -0.035em;
  --text-h2:    clamp(1.9rem, 4.4vw, 3.2rem); --tracking-h2:   -0.03em;
  --text-h3:    1.375rem;
  --text-body:  1.0625rem;
  --text-micro: 0.6875rem;                     /* uppercase kickers */

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-io:  cubic-bezier(0.4, 0, 0.2, 1);
  --dur-fast: 180ms;  --dur-base: 400ms;  --dur-slow: 700ms;

  --radius-card: 20px;  --radius-pill: 100px;
}

[data-theme='warp'] {
  --color-bg: #05070a;  --color-surface: #0a1014;
  --color-ink: #d8fff0; --color-muted: #5f8f82;
  --color-accent: #39ff9e;
  --font-sans: var(--font-mono);
  --radius-card: 4px;
}
```

**Contrast law.** `--color-dim` (3.0:1) is banned as text at any size — fails WCAG AA. Add a lint rule. No hex literals outside `globals.css`.

## 2. Type scale

| Token | Size | Weight | Tracking | Leading | Use |
|---|---|---|---|---|---|
| hero | clamp(2.4rem,7.2vw,6rem) | 600 | -0.035em | 1.03 | Hero headline, `#fff→#a1a1a6` gradient clip |
| h2 | clamp(1.9rem,4.4vw,3.2rem) | 600 | -0.03em | 1.1 | Section headings (blur-resolve) |
| h3 | 1.375rem | 600 | -0.01em | 1.2 | Card titles |
| body | 1.0625rem | 400 | 0 | 1.55 | Prose |
| micro | 0.6875rem | 600 | 0.18em | 1 | Uppercase kickers |

The `#fff → #a1a1a6` vertical gradient clip on the hero is the cheapest premium signal available.

## 3. Spacing & layout

- 8px base. Section rhythm `clamp(80px, 14vh, 160px)`.
- Container `max-width: 1120px`, gutter `clamp(20px, 5vw, 48px)`.
- Breakpoints: sm 640 · md 768 · lg 1024 · xl 1280. **`md` (768) is the hard line where the frame sequence stops loading.**

## 4. The signature interaction — resolution from noise

One idea, five surfaces:

| Surface | Resolution |
|---|---|
| Hero | point cloud → figure |
| Section headings | per-char blur 8px → 0, 22ms stagger |
| Work cards | grain overlay → clean on scroll-in |
| Chat | tokens stream, then citations resolve in |
| Dimension | full-screen dissolve |

## 5. Motion table

| Element | Property | Duration | Easing |
|---|---|---|---|
| Section reveal | opacity + `y:24→0` | 700ms | `--ease-out` |
| Heading resolve | blur + stagger | 620ms | `--ease-out` |
| Card hover | transform + border | 400ms | `--ease-out` |
| Nav hide/show | `y:-100%` | 280ms | `--ease-io` |
| Hero phase swap | opacity + `y:22px` | 500ms | `--ease-io` |
| Dimension warp | dissolve + token crossfade | 620ms | `--ease-io` |

**Motion law:**
1. Nothing animates on load except the hero. Scroll-triggered only.
2. Reveals fire once. Re-animating on scroll-back is nauseating.
3. Nothing loops except the streaming caret.
4. `prefers-reduced-motion` → durations 0.01ms, opacity only, sequence never fetched. Genuinely off.
5. Animate `transform`/`opacity` only. Never a layout-triggering property.

## 6. Component specs

- **Work card:** `--radius-card`, `linear-gradient(180deg,#121214,#0a0a0c)`, hairline border. Hover `translateY(-5px)` over `--dur-base --ease-out`, border → `rgba(41,151,255,.35)`, radial accent glow from top edge. Stack chips 11px on `rgba(255,255,255,.05)`. Colour transitions at `--dur-fast`, movement at `--dur-base`.
- **Nav:** frosted 48px, `backdrop-filter: saturate(180%) blur(20px)`, `contain: layout paint`, own layer via `translateZ(0)`. Hairline border. `@supports not (backdrop-filter)` → solid `rgba(0,0,0,0.85)`.
- **Hobbies tile:** full-bleed image, dark scrim, title bottom-left. Hover lifts scrim 20%, image scales 1.04. Equal visual weight across all three.
- **Button/Field/Chip/Reveal:** in `components/ui/`. `Reveal` is the single scroll-reveal primitive, fires once via IntersectionObserver.
- **Metrics strip (§5.5a):** `--font-mono`, tabular figures, delta emphasised over absolute where a before/after exists. Each figure shows its measurement method as visible text (not a tooltip). **Never a progress bar, gauge, or percentage ring** — those imply precision a 50-question eval set does not have. Three states only: measured / "Not measured" / row absent.
- **Résumé button (§5.5b):** accent-outlined, right-aligned in nav next to Dimension entry, visible at every scroll position on desktop; on mobile sits in the top bar itself, never in the overlay. `target="_blank" rel="noopener noreferrer"`. ≥44×44px. If no PDF provided, render nothing.
- **Stack tiers (§5.5):** two visually distinct groups — *interviewable* (Group 8 Q27) and *familiar with* (Q28). Never merged; never seeded from a lockfile.
- **Project 3 in-progress card (§5.5c):** same geometry + `--radius-card`, but **dashed** hairline border; flat `--color-surface` (no gradient, no radial glow); no hover lift / no pointer cursor unless a public repo link exists; body at `--color-muted`; status line `In progress · since {date}` in `--font-mono` at `--text-micro`; always last in grid. One `WorkCard` branching on `status` — never a second component.

## 8. Scroll smoothness budget

Recorded at 1× and 4× CPU throttle: **p95 frame ≤ 16ms, worst single frame ≤ 32ms**, zero long tasks (>50ms) and zero purple layout bars during scroll. A frame over 32ms is a defect. If the backdrop-filter nav is the cost, the mitigation ladder ends in a solid `rgba(0,0,0,0.85)` fallback under `@supports not (backdrop-filter: blur(1px))` — take it and write the decision entry.

## 7. Accessibility (WCAG 2.2 AA)

- Body contrast ≥ 4.5:1, large text ≥ 3:1, `--color-dim` never on text.
- 2px accent focus ring at 2px offset, visible on every interactive element. `outline:none` without replacement is a bug.
- Canvas `role="img"` + descriptive label; **all hero copy is real DOM text**.
- Chat `role="log" aria-live="polite"`, `aria-busy` while streaming.
- Full keyboard path; Escape closes chat and mobile menu. Skip-to-content is first focusable element. Touch targets ≥ 44×44px.
