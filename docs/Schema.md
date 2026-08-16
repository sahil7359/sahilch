# Schema — Database DDL, Indexes, RPC, RLS

Migration order: `0001_extensions_documents` → `0002_tickets` → `0003_chat_sessions_turns` → `0004_semantic_cache` → `0005_rate_limits_budget` → `0006_rpc_hybrid` → `0007_rls_deny_all`.

## Extensions + documents (0001)

```sql
create extension if not exists vector;
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

create table public.documents (
  id                bigserial primary key,
  source            text not null,
  heading           text,
  url               text,
  chunk_index       int  not null,
  content           text not null,
  token_count       int  not null,
  embedding         vector(1024) not null,
  embedding_version text not null,
  fts tsvector generated always as (to_tsvector('english', content)) stored,
  metadata          jsonb not null default '{}',
  created_at        timestamptz not null default now(),
  unique (source, chunk_index)
);
create index on documents using hnsw (embedding vector_cosine_ops) with (m=16, ef_construction=64);
create index on documents using gin (fts);
create index on documents using gin (content gin_trgm_ops);
create index on documents (embedding_version);
```

> `vector(1024)` dims must match `EMBEDDING_DIMS` in `lib/ai/config.ts`. If the chosen embedding model has different dims, update BOTH the migration and the config before ingest.

## Tickets (0002)

```sql
create type ticket_status   as enum ('received','notified','read','replied','closed','spam');
create type delivery_status as enum ('pending','sent','delivered','bounced','failed');

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject text not null check (char_length(subject) between 1 and 150),
  message text not null check (char_length(message) between 10 and 4000),
  status ticket_status not null default 'received',
  delivery delivery_status not null default 'pending',
  idempotency_key text unique not null,
  ip_hash text not null,
  user_agent text, referrer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on tickets (delivery) where delivery = 'pending';

create sequence ticket_ref_seq;
create or replace function public.next_ticket_ref() returns text language sql volatile as $$
  select 'SC-' || to_char(now(),'YYYY') || '-' || lpad(nextval('ticket_ref_seq')::text, 4, '0');
$$;
```

`ref` comes from a **sequence**, never a count — deleting a ticket must not let a ref be reused.

## Chat sessions + turns (0003)

```sql
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  turns int not null default 0,
  created_at timestamptz not null default now()
);

create table public.chat_turns (
  id bigserial primary key,
  session_id uuid not null references chat_sessions(id) on delete cascade,
  question text not null,
  answer text,
  sources jsonb not null default '[]',
  top_score float,
  refused boolean not null default false,
  refusal_reason text,
  cached boolean not null default false,
  tokens_in int, tokens_out int,
  latency_ms int,
  created_at timestamptz not null default now()
);
```

## Semantic cache (0004)

```sql
create table public.semantic_cache (
  id bigserial primary key,
  q_embedding vector(1024) not null,
  question text not null,
  answer text not null,
  sources jsonb not null default '[]',
  embedding_version text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index on semantic_cache using hnsw (q_embedding vector_cosine_ops);
-- Lookup: cosine >= 0.97 AND expires_at > now() AND embedding_version = current.
```

## Rate limits + budget (0005)

```sql
create table public.rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (bucket, window_start)
);
create or replace function public.bump_rate_limit(p_bucket text, p_window timestamptz)
  returns int language plpgsql as $$
declare c int;
begin
  insert into rate_limits(bucket, window_start, count) values (p_bucket, p_window, 1)
  on conflict (bucket, window_start) do update set count = rate_limits.count + 1
  returning count into c;
  return c;
end $$;

create table public.daily_budget (
  day date primary key,
  tokens_used bigint not null default 0
);
create or replace function public.consume_budget(p_day date, p_tokens int, p_cap bigint)
  returns boolean language plpgsql as $$
declare used bigint;
begin
  insert into daily_budget(day, tokens_used) values (p_day, 0)
    on conflict (day) do nothing;
  select tokens_used into used from daily_budget where day = p_day for update;
  if used + p_tokens > p_cap then return false; end if;
  update daily_budget set tokens_used = tokens_used + p_tokens where day = p_day;
  return true;
end $$;
```

## Hybrid retrieval RPC (0006)

```sql
create or replace function public.match_documents_hybrid(
  query_embedding vector(1024), query_text text, current_version text,
  match_count int default 6, rrf_k int default 60
) returns table (id bigint, source text, heading text, url text, content text, score float)
language sql stable set search_path = public as $$
with vec as (
  select d.id, row_number() over (order by d.embedding <=> query_embedding) rnk
  from documents d where d.embedding_version = current_version
  order by d.embedding <=> query_embedding limit 20
),
kw as (
  select d.id, row_number() over (
    order by ts_rank_cd(d.fts, websearch_to_tsquery('english', query_text)) desc) rnk
  from documents d
  where d.embedding_version = current_version
    and d.fts @@ websearch_to_tsquery('english', query_text) limit 20
),
fused as (
  select coalesce(v.id,k.id) id,
         coalesce(1.0/(rrf_k+v.rnk),0) + coalesce(1.0/(rrf_k+k.rnk),0) score
  from vec v full outer join kw k on v.id = k.id
)
select d.id, d.source, d.heading, d.url, d.content, f.score
from fused f join documents d on d.id = f.id
order by f.score desc limit match_count;
$$;
```

MMR (λ=0.7) runs in TypeScript over these rows. The RPC filters on `current_version` so a stale-embedding mismatch returns **zero rows** — a loud failure, not silent wrong neighbours.

## Row Level Security (0007)

```sql
alter table public.documents      enable row level security;
alter table public.tickets        enable row level security;
alter table public.chat_sessions  enable row level security;
alter table public.chat_turns     enable row level security;
alter table public.semantic_cache enable row level security;
alter table public.rate_limits    enable row level security;
alter table public.daily_budget   enable row level security;
-- ZERO policies for anon on any table. RLS with no policies denies everything.
```

**RLS enabled on every table. Zero policies for `anon`.** The anon key will be scraped from the client bundle — assume it. Every server route uses the service-role key from `lib/db/admin.ts` (carries `import 'server-only'`). Test asserting anon can read+write nothing on every table must pass before anything else in the phase ships.
