# 0004 — Ticketing pipeline with Turnstile, idempotency, and Resend

**Type:** feature
**Files:** supabase/migrations/0001_init.sql · lib/db/admin.ts · lib/ratelimit.ts · lib/utils/ip.ts · lib/email/send.ts · app/api/ticket/route.ts · app/api/webhooks/resend/route.ts · components/sections/ContactForm.tsx · Contact.tsx · scripts/test-rls.ts · scripts/test-ticket.ts

## What changed
A server-verified contact pipeline. `POST /api/ticket`: Turnstile verify → Zod →
honeypot → hashed-IP rate limit → idempotent insert (sequence ref) → both emails
via `Promise.allSettled` → 201. The ticket row is the source of truth; email
failure never fails the request. Gated by `NEXT_PUBLIC_FEATURE_TICKETS` — off
renders a pre-filled mailto instead, with no dead form.

## Why
Two things must happen server-side: Turnstile verification and rate limiting. A
browser insert (the Supabase tutorial pattern) bypasses both, so there is no
client database access at all — see decisions/0002.

## How it works
- **Idempotency:** the key is generated once when the form mounts. A duplicate
  key returns the existing ref as *success* (409 → 201 to the user) — they care
  that the message arrived, not that the server deduped. Enforced by a unique
  constraint; verified by `scripts/test-ticket.ts` (double insert → one row).
- **Honeypot:** a filled hidden field returns a fake success and inserts nothing,
  so a bot gets no signal it was caught.
- **Email header safety:** `From` is fixed, `Reply-To` is the validated sender,
  the subject is `[REF] ` + a newline-stripped, truncated subject. No user input
  reaches a header.
- **IPs** are salted-hashed, never stored raw.

## What breaks without it
Losing a message because SMTP hiccupped is the worst outcome for a job-search
site — so the row is written and acknowledged before emails are attempted, and a
`pending` row can be retried.

## Verified
RLS deny-all (7 tables, read + write), idempotency (one row), ref format,
validation 400, honeypot silent-201, Turnstile 403 on a missing token — all
against the live Supabase + a running server.

## If asked about this in an interview
"Why not insert from the browser?" → Turnstile and rate limiting must be
server-side; a client insert bypasses both and exposes the table. "How do you
stop double submits?" → An idempotency key minted at form-mount, unique-
constrained; the second insert 23505s and I return the first ref as success.
