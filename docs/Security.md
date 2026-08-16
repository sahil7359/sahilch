# Security — Threat Model, Secrets, Headers, Privacy

## 1. Threat model

| Threat | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Service-role key in client bundle | Low | **Critical** | `import 'server-only'` in `lib/db/admin.ts` + CI grep of `.next/static/` |
| LLM endpoint drained by a script | **High** | High | rate limit (10/10min/IP) + session cap (25) + daily token ceiling (250k) |
| Contact form spam | **High** | Medium | Turnstile server-verify + rate limit + honeypot |
| Prompt injection / exfiltration | **High** | Medium | L1–L4 defence layers (see Guardrails.md) |
| Anon key used to read the database | **Certain** | Critical if unguarded | RLS enabled + zero anon policies (deny-all) |
| XSS via chat output or MDX | Medium | High | text nodes only; no `dangerouslySetInnerHTML`; `rehype-sanitize` on MDX |
| Email header injection | Medium | Medium | strict Zod validation; no user input in headers; fixed `From`, `Reply-To` = validated address |
| Webhook forgery | Medium | Low | Svix signature verification on `/api/webhooks/resend` |

**The two that actually happen are the LLM drain and the anon key.** Everything else is hygiene.

## 2. Secrets handling

- `lib/env.ts` validates every variable at module load (Zod). A missing required secret fails the **build**, not a request at 2am. Optional keys typed optional.
- Service-role key: server only, `import 'server-only'` so the build breaks if imported client-side.
- IPs hashed with `IP_HASH_SALT`; raw IPs never stored.
- `.env*` gitignored before the first commit (verified with `git check-ignore -v`). `.env.example` carries names + empty values.
- CI: grep `.next/static/` for JWT-shaped strings (`eyJ[A-Za-z0-9_-]{20,}\.`) and fail the build on a hit; `gitleaks` on every PR.

## 3. Boundaries & validation

Zod at every boundary. Reject with a **generic** message — never echo the parse error (it maps the schema for an attacker). Model output and MDX render as text nodes only.

## 4. Rate limits & cost ceilings

| Guard | Value |
|---|---|
| Chat rate limit | 10 messages / 10 min / IP hash |
| Chat session cap | 25 messages |
| Daily global tokens | 250,000, then canned reply |
| Ticket rate limit | server-side, on hashed IP |
| Max chat input / output | 500 chars / 400 tokens |

Every feature degrades gracefully at its ceiling — never a bill (R4).

## 5. CSP + headers

```
default-src 'self';
script-src  'self' 'nonce-{NONCE}' https://challenges.cloudflare.com;
style-src   'self' 'unsafe-inline';
img-src     'self' data: blob: https:;
connect-src 'self' https://*.supabase.co;
frame-src   https://challenges.cloudflare.com https://www.youtube-nocookie.com;
object-src  'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
upgrade-insecure-requests;
```

`blob:` in `img-src` is required by `createImageBitmap`. Plus:
- HSTS `max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

## 6. Privacy posture

No cookies, no third-party pixels, no analytics that fingerprint. IPs hashed with a salt, used only for rate limiting. A privacy page states this plainly. Resume never gated behind the contact form.

## 7. Incident playbook

1. **Leaked secret** → rotate the key at the provider, update Vercel env + `.env.local`, redeploy, confirm CI grep clean. A secret committed once is a secret to rotate even after deletion.
2. **LLM drain in progress** → daily budget cap already halts generation; if abused before cap, lower the cap constant in `lib/ai/config.ts` and redeploy.
3. **Spam surge** → Turnstile + rate limit absorb it; tighten rate window if needed.
4. **Embedding model deprecated** → bump `EMBEDDING_VERSION`, re-ingest (`pnpm ingest`), redeploy. Retrieval RPC returns zero rows on mismatch (loud failure) until re-ingest completes.
5. **Supabase paused (free tier)** → `keepalive.yml` weekly ping prevents this; if it happens, un-pause in dashboard and confirm chat/tickets.
