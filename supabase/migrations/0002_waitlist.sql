-- ============================================================
-- GIGLY · 0002 · waitlist
--
-- Stores justgigly.com signups. Locked down to server-only access:
-- RLS is on with NO public policies, so the browser (anon key) can't
-- read or write it. The waitlist serverless functions use the
-- service_role key, which bypasses RLS.
-- ============================================================

create table public.waitlist (
  id          bigserial primary key,
  name        text not null,
  email       text unique not null,
  created_at  timestamptz default now()
);

alter table public.waitlist enable row level security;
-- (no policies on purpose — only the service role may touch this table)
