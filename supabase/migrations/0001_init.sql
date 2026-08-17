-- Portfolio schema — run once in the Supabase SQL editor.
-- Embedding dims = 1024 (Jina jina-embeddings-v3), matching lib/ai/config.ts.

create extension if not exists vector;
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- ============================================================ documents (RAG)
create table if not exists public.documents (
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
create index if not exists documents_embedding_idx on public.documents using hnsw (embedding vector_cosine_ops) with (m=16, ef_construction=64);
create index if not exists documents_fts_idx on public.documents using gin (fts);
create index if not exists documents_trgm_idx on public.documents using gin (content gin_trgm_ops);
create index if not exists documents_version_idx on public.documents (embedding_version);

-- ============================================================ tickets
do $$ begin
  create type ticket_status   as enum ('received','notified','read','replied','closed','spam');
exception when duplicate_object then null; end $$;
do $$ begin
  create type delivery_status as enum ('pending','sent','delivered','bounced','failed');
exception when duplicate_object then null; end $$;

create table if not exists public.tickets (
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
create index if not exists tickets_pending_idx on public.tickets (delivery) where delivery = 'pending';

create sequence if not exists ticket_ref_seq;
create or replace function public.next_ticket_ref() returns text language sql volatile as $$
  select 'SC-' || to_char(now(),'YYYY') || '-' || lpad(nextval('ticket_ref_seq')::text, 4, '0');
$$;

-- ============================================================ chat logging
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  turns int not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.chat_turns (
  id bigserial primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade,
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

-- ============================================================ semantic cache
create table if not exists public.semantic_cache (
  id bigserial primary key,
  q_embedding vector(1024) not null,
  question text not null,
  answer text not null,
  sources jsonb not null default '[]',
  embedding_version text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists semantic_cache_emb_idx on public.semantic_cache using hnsw (q_embedding vector_cosine_ops);

-- ============================================================ rate limits + budget
create table if not exists public.rate_limits (
  bucket text not null,
  window_start timestamptz not null,
  count int not null default 0,
  primary key (bucket, window_start)
);
create or replace function public.bump_rate_limit(p_bucket text, p_window timestamptz)
  returns int language plpgsql as $$
declare c int;
begin
  insert into public.rate_limits(bucket, window_start, count) values (p_bucket, p_window, 1)
  on conflict (bucket, window_start) do update set count = public.rate_limits.count + 1
  returning count into c;
  return c;
end $$;

create table if not exists public.daily_budget (
  day date primary key,
  tokens_used bigint not null default 0
);
create or replace function public.consume_budget(p_day date, p_tokens int, p_cap bigint)
  returns boolean language plpgsql as $$
declare used bigint;
begin
  insert into public.daily_budget(day, tokens_used) values (p_day, 0)
    on conflict (day) do nothing;
  select tokens_used into used from public.daily_budget where day = p_day for update;
  if used + p_tokens > p_cap then return false; end if;
  update public.daily_budget set tokens_used = tokens_used + p_tokens where day = p_day;
  return true;
end $$;

-- ============================================================ hybrid retrieval RPC
create or replace function public.match_documents_hybrid(
  query_embedding vector(1024), query_text text, current_version text,
  match_count int default 6, rrf_k int default 60
) returns table (id bigint, source text, heading text, url text, content text, score float)
language sql stable set search_path = public as $$
with vec as (
  select d.id, row_number() over (order by d.embedding <=> query_embedding) rnk
  from public.documents d where d.embedding_version = current_version
  order by d.embedding <=> query_embedding limit 20
),
kw as (
  select d.id, row_number() over (
    order by ts_rank_cd(d.fts, websearch_to_tsquery('english', query_text)) desc) rnk
  from public.documents d
  where d.embedding_version = current_version
    and d.fts @@ websearch_to_tsquery('english', query_text) limit 20
),
fused as (
  select coalesce(v.id,k.id) id,
         coalesce(1.0/(rrf_k+v.rnk),0) + coalesce(1.0/(rrf_k+k.rnk),0) score
  from vec v full outer join kw k on v.id = k.id
)
select d.id, d.source, d.heading, d.url, d.content, f.score
from fused f join public.documents d on d.id = f.id
order by f.score desc limit match_count;
$$;

-- ============================================================ RLS: deny-all for anon
alter table public.documents      enable row level security;
alter table public.tickets        enable row level security;
alter table public.chat_sessions  enable row level security;
alter table public.chat_turns     enable row level security;
alter table public.semantic_cache enable row level security;
alter table public.rate_limits    enable row level security;
alter table public.daily_budget   enable row level security;
-- No policies for anon on any table. RLS with zero policies denies everything.
-- Every server route uses the service (secret) key, which bypasses RLS.
