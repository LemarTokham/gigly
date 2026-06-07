-- ============================================================
-- GIGLY · 0001 · initial schema
--
-- Sets up every table we'll need for MVP + v1.1. Tables we won't
-- query in MVP (notifications, comment_likes, etc.) are created
-- now so we don't have to refactor schemas later.
--
-- Read in order: tables → indexes → RLS policies → triggers.
-- ============================================================


-- ============================================================
-- TABLES
-- ============================================================

-- ------------------------------------------------------------
-- profiles · 1-to-1 with auth.users
--
-- Supabase manages auth.users (id, email, password hash, etc.).
-- We never write to it directly. profiles is OUR table for the
-- app-specific stuff. id is both PK and FK back to auth.users.
-- ------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  handle        text unique not null check (handle ~* '^[a-z0-9_]{2,20}$'),
  name          text not null,
  city          text default 'NYC',
  bio           text default '',
  avatar_color  text default 'olive' check (avatar_color in ('olive', 'terracotta', 'mustard', 'plum', 'indigo')),
  theme         text default 'cream' check (theme in ('cream', 'vellum', 'kraft', 'manila', 'newsprint', 'midnight')),
  -- Per-tier ordering for Top 3 + shelf sort. Mirrors current Zustand shape.
  rankings      jsonb default '{"loved": [], "mid": [], "nah": []}'::jsonb,
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- artists · catalog
--
-- slug is the primary key (e.g. 'metallica'). Lazily populated:
-- when someone logs a gig with a new artist, we upsert here.
-- ------------------------------------------------------------
create table public.artists (
  slug          text primary key,
  name          text not null,
  genre         text,
  bio           text,
  is_local      boolean default false,
  local_city    text,
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- venues · catalog
--
-- x, y are % coordinates on our hand-drawn map for now.
-- We'll add real lat/lng + Mapbox in v1.1.
-- ------------------------------------------------------------
create table public.venues (
  slug          text primary key,
  name          text not null,
  city          text not null,
  x             numeric default 50,
  y             numeric default 50,
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- gigs · the core entity
-- ------------------------------------------------------------
create table public.gigs (
  id            bigserial primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  artist_slug   text not null references public.artists(slug),
  venue_slug    text not null references public.venues(slug),
  tour          text,
  date          date not null,
  tier          text not null check (tier in ('loved', 'mid', 'nah')),
  note          text,
  review        text default '',
  tags          text[] default '{}',
  photo_url     text,
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- gig_likes · many-to-many between profiles and gigs
--
-- Composite PK means a user can only like a gig once.
-- ------------------------------------------------------------
create table public.gig_likes (
  user_id       uuid references public.profiles(id) on delete cascade,
  gig_id        bigint references public.gigs(id) on delete cascade,
  created_at    timestamptz default now(),
  primary key (user_id, gig_id)
);

-- ------------------------------------------------------------
-- comments · on a gig
-- ------------------------------------------------------------
create table public.comments (
  id            bigserial primary key,
  gig_id        bigint not null references public.gigs(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  body          text not null check (length(body) > 0 and length(body) <= 1000),
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- comment_likes
-- ------------------------------------------------------------
create table public.comment_likes (
  user_id       uuid references public.profiles(id) on delete cascade,
  comment_id    bigint references public.comments(id) on delete cascade,
  created_at    timestamptz default now(),
  primary key (user_id, comment_id)
);

-- ------------------------------------------------------------
-- follows · social graph between users
--
-- follower_id follows followee_id. CHECK prevents self-follow.
-- ------------------------------------------------------------
create table public.follows (
  follower_id   uuid references public.profiles(id) on delete cascade,
  followee_id   uuid references public.profiles(id) on delete cascade,
  created_at    timestamptz default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

-- ------------------------------------------------------------
-- artist_follows · users following artists
-- ------------------------------------------------------------
create table public.artist_follows (
  user_id       uuid references public.profiles(id) on delete cascade,
  artist_slug   text references public.artists(slug) on delete cascade,
  created_at    timestamptz default now(),
  primary key (user_id, artist_slug)
);

-- ------------------------------------------------------------
-- notifications · in-app inbox
--
-- Inserted by DB triggers in Phase 3 (when likes/comments/follows
-- happen). For Phase 1, the table just exists.
-- ------------------------------------------------------------
create table public.notifications (
  id            bigserial primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,  -- recipient
  kind          text not null check (kind in ('like', 'comment', 'follow', 'upcoming')),
  actor_id      uuid references public.profiles(id) on delete cascade,
  gig_id        bigint references public.gigs(id) on delete cascade,
  body          text not null,
  read          boolean default false,
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- upcoming_shows · concerts coming up
--
-- For MVP, manually seeded. v1.1 we'll auto-pull from setlist.fm
-- via an Edge Function on a cron schedule.
-- ------------------------------------------------------------
create table public.upcoming_shows (
  id            bigserial primary key,
  artist_slug   text not null references public.artists(slug),
  venue_slug    text not null references public.venues(slug),
  date          timestamptz not null,
  sold_out      boolean default false,
  genre         text,
  created_at    timestamptz default now()
);


-- ============================================================
-- INDEXES
--
-- Indexes speed up the queries we run most. Each one trades disk
-- space for query speed. We add them where queries are predictable.
-- ============================================================

create index gigs_user_id_date_idx       on public.gigs(user_id, date desc);
create index gigs_artist_slug_date_idx   on public.gigs(artist_slug, date desc);
create index gigs_venue_slug_date_idx    on public.gigs(venue_slug, date desc);
create index gigs_tier_artist_idx        on public.gigs(artist_slug, tier);  -- for "mostly loved" aggregates
create index gigs_city_date_idx          on public.gigs(date desc) include (id);  -- supports local-feed scans

create index comments_gig_id_idx         on public.comments(gig_id, created_at);
create index notifications_unread_idx    on public.notifications(user_id, created_at desc) where read = false;
create index follows_followee_id_idx     on public.follows(followee_id);
create index artist_follows_user_id_idx  on public.artist_follows(user_id);
create index upcoming_shows_date_idx     on public.upcoming_shows(date) where date > now();


-- ============================================================
-- ROW-LEVEL SECURITY
--
-- RLS = the database itself enforces who-can-do-what. Every table
-- starts with `enable row level security` (default-deny), then we
-- explicitly grant select/insert/update/delete via policies.
--
-- auth.uid() returns the signed-in user's ID; null if not signed in.
-- ============================================================

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles readable by anyone"
  on public.profiles for select using (true);

create policy "users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- ------------------------------------------------------------
-- artists  (lazily populated by any signed-in user)
-- ------------------------------------------------------------
alter table public.artists enable row level security;

create policy "artists readable by anyone"
  on public.artists for select using (true);

create policy "signed-in users can insert artists"
  on public.artists for insert with check (auth.uid() is not null);

-- ------------------------------------------------------------
-- venues  (same pattern)
-- ------------------------------------------------------------
alter table public.venues enable row level security;

create policy "venues readable by anyone"
  on public.venues for select using (true);

create policy "signed-in users can insert venues"
  on public.venues for insert with check (auth.uid() is not null);

-- ------------------------------------------------------------
-- gigs  (everyone can read; only owner can write)
-- ------------------------------------------------------------
alter table public.gigs enable row level security;

create policy "gigs readable by anyone"
  on public.gigs for select using (true);

create policy "users can insert their own gigs"
  on public.gigs for insert with check (auth.uid() = user_id);

create policy "users can update their own gigs"
  on public.gigs for update using (auth.uid() = user_id);

create policy "users can delete their own gigs"
  on public.gigs for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- gig_likes
-- ------------------------------------------------------------
alter table public.gig_likes enable row level security;

create policy "gig_likes readable by anyone"
  on public.gig_likes for select using (true);

create policy "users can like as themselves"
  on public.gig_likes for insert with check (auth.uid() = user_id);

create policy "users can unlike their own likes"
  on public.gig_likes for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- comments
-- ------------------------------------------------------------
alter table public.comments enable row level security;

create policy "comments readable by anyone"
  on public.comments for select using (true);

create policy "users can comment as themselves"
  on public.comments for insert with check (auth.uid() = user_id);

create policy "users can edit their own comments"
  on public.comments for update using (auth.uid() = user_id);

create policy "users can delete their own comments"
  on public.comments for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- comment_likes
-- ------------------------------------------------------------
alter table public.comment_likes enable row level security;

create policy "comment_likes readable by anyone"
  on public.comment_likes for select using (true);

create policy "users can like comments as themselves"
  on public.comment_likes for insert with check (auth.uid() = user_id);

create policy "users can unlike comments"
  on public.comment_likes for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- follows
-- ------------------------------------------------------------
alter table public.follows enable row level security;

create policy "follows readable by anyone"
  on public.follows for select using (true);

create policy "users can follow as themselves"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "users can unfollow"
  on public.follows for delete using (auth.uid() = follower_id);

-- ------------------------------------------------------------
-- artist_follows
-- ------------------------------------------------------------
alter table public.artist_follows enable row level security;

create policy "artist_follows readable by anyone"
  on public.artist_follows for select using (true);

create policy "users can follow artists as themselves"
  on public.artist_follows for insert with check (auth.uid() = user_id);

create policy "users can unfollow artists"
  on public.artist_follows for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- notifications  (each user sees only their own; inserts via
-- trigger in Phase 3 — no client insert policy here)
-- ------------------------------------------------------------
alter table public.notifications enable row level security;

create policy "users see only their own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "users can mark their notifications read"
  on public.notifications for update using (auth.uid() = user_id);

-- ------------------------------------------------------------
-- upcoming_shows  (everyone reads; admin manages via SQL for MVP)
-- ------------------------------------------------------------
alter table public.upcoming_shows enable row level security;

create policy "upcoming shows readable by anyone"
  on public.upcoming_shows for select using (true);


-- ============================================================
-- TRIGGERS
--
-- A trigger runs automatically when something happens in the DB.
-- This one fires after a new row in auth.users (sign-up) and
-- inserts a matching row in public.profiles so the user has a
-- profile on day 1. The `security definer` modifier lets it
-- bypass RLS — it runs as the function's owner, not the caller.
-- ============================================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  derived_handle text;
begin
  -- Try metadata first, else derive from email, else fall back to a UUID prefix.
  derived_handle := coalesce(
    new.raw_user_meta_data->>'handle',
    regexp_replace(lower(split_part(new.email, '@', 1)), '[^a-z0-9_]', '', 'g'),
    'user_' || substring(new.id::text, 1, 8)
  );

  -- Ensure the handle is 2-20 chars and unique. If clash, append a suffix.
  if length(derived_handle) < 2 then
    derived_handle := derived_handle || '_' || substring(new.id::text, 1, 6);
  end if;
  if length(derived_handle) > 20 then
    derived_handle := substring(derived_handle, 1, 20);
  end if;
  -- naive collision suffix; good enough for soft launch
  if exists (select 1 from public.profiles where handle = derived_handle) then
    derived_handle := substring(derived_handle, 1, 14) || '_' || substring(new.id::text, 1, 5);
  end if;

  insert into public.profiles (id, handle, name, city, avatar_color, theme)
  values (
    new.id,
    derived_handle,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'city', 'NYC'),
    coalesce(new.raw_user_meta_data->>'avatar_color', 'olive'),
    coalesce(new.raw_user_meta_data->>'theme', 'cream')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
