# 0002 — RLS deny-all instead of anon policies

**Status:** accepted
**Date:** 2026-08-17

## Context
Supabase's tutorial pattern is to expose tables to the browser via the anon key
and write Row Level Security policies that scope what anon can see. The anon
(publishable) key ships in the client bundle and will be scraped — that is a
certainty, not a risk.

## Decision
Enable RLS on every table and write **zero policies for anon**. RLS with no
policies denies everything. The browser gets no database access at all. Every
server route uses the service (secret) key from `lib/db/admin.ts`, which carries
`import 'server-only'` so the build breaks if it is ever imported client-side.

## Alternatives considered
- **Anon + carefully scoped policies** — the tutorial path. One missed policy or
  a `USING (true)` copy-paste and the whole table is world-readable. The blast
  radius of a mistake is the entire dataset.
- **A separate backend service** — more moving parts, more cost, no benefit here
  since Next route handlers already give us a trusted server.

## Consequences
+ The scraped anon key grants access to nothing. Confirmed by a test that seeds a
  visible row as admin and proves anon reads it back as zero rows, and that anon
  writes are rejected on all seven tables.
+ Security is the default, not a per-table policy you have to get right each time.
− Every read/write goes through a server route. No direct-from-browser queries —
  which is exactly what we want, because Turnstile and rate limiting have to run
  server-side anyway.

## The honest version
The anon key is public. Designing as if it were secret is how these leaks happen.
Deny-all + service-role-in-a-route is more boilerplate and strictly safer, and on
a public portfolio the threat ("anon key used to read the database") is rated
*certain* — so the boring, safe option wins.
