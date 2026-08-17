# 0005 — Launch polish: metadata, CSP, OG, Dimension, chat placeholder

**Type:** infrastructure
**Files:** next.config.ts · app/layout.tsx · app/robots.ts · app/sitemap.ts · app/not-found.tsx · app/error.tsx · app/api/og/route.tsx · app/(prime)/privacy/page.tsx · app/(dimension)/dimension/page.tsx · components/chat/ChatLauncher.tsx

## What changed
Security headers + CSP, dynamic OG image (`/api/og`), `robots.txt`, `sitemap.xml`,
JSON-LD (Person + WebSite), a styled 404 and error boundary, a privacy page, a
real Dimension page with live LeetCode/GitHub stats via ISR, and a "coming soon"
chat launcher (the RAG agent is built-but-deferred per the launch decision).

## The CSP decision (the interesting part)
The first attempt used a per-request **nonce CSP** via middleware. It broke the
site: statically-generated pages bake their inline scripts at build time with no
nonce, so a runtime nonce in the CSP mismatches and the browser blocks Next's
hydration scripts — surfacing as React error #412. A nonce CSP forces every page
dynamic, which throws away the static-generation win the whole site is built on.

Fix: a **static CSP** (no nonce) in `next.config` headers, with `'unsafe-inline'`
on `script-src`. That is safe here specifically because the site renders every
dynamic and user-supplied value as a **text node** — there is no
`dangerouslySetInnerHTML` except the static JSON-LD — so there is no injection
point for an inline script. Kept all the other hardening: `frame-ancestors none`,
`object-src none`, HSTS, `nosniff`, Referrer-Policy, Permissions-Policy.

## What breaks without it
No sharing previews (OG), no search presence (sitemap/JSON-LD), a broken-looking
Dimension link, and — with the nonce CSP — a site that doesn't hydrate at all.

## If asked about this in an interview
"Why unsafe-inline?" → Because the pages are static, a nonce would force dynamic
rendering. The XSS surface is closed a different way: nothing user-controlled is
ever rendered as HTML, only as text nodes, so there's no inline-script injection
point for the CSP to defend. The nonce would buy protection against a hole that
doesn't exist, at the cost of the site's performance model.
