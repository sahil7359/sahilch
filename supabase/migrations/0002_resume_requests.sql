-- Résumé access log. Every gated download records who asked. Run in the Supabase
-- SQL editor. RLS on, zero anon policies (deny-all) — the server route uses the
-- service key.
create table if not exists public.resume_requests (
  id bigserial primary key,
  name text not null check (char_length(name) between 1 and 100),
  role text not null check (char_length(role) between 1 and 60),
  company text check (char_length(company) <= 120),
  ip text,
  user_agent text,
  referrer text,
  consented boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.resume_requests enable row level security;
