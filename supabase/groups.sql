-- ============================================================
-- Rewound group events — additive upgrade.
-- Run ONCE in Supabase: SQL Editor → New query → paste → Run.
-- Requires schema.sql to have been run first (comments tables).
-- ============================================================

-- A group/event = a shared timeline definition. Anyone with the
-- invite code can read it and join; the simulated date is computed
-- client-side from zero_sim + real_start, so members stay in
-- lockstep with no further server involvement.
create table if not exists public.groups (
  id         text primary key default substr(md5(gen_random_uuid()::text), 1, 8),
  name       text not null check (char_length(name) between 2 and 60),
  pace       text not null default 'locked' check (pace in ('locked', 'free')),
  subs       jsonb not null,
  zero_sim   date not null,
  real_start date not null,
  creator    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.groups enable row level security;

-- Rate limit: max 3 events per creator per hour.
create or replace function public.groups_rate_limit()
returns boolean
language sql
security definer
set search_path = public
as $$
  select count(*) < 3
  from groups
  where creator = auth.uid()
    and created_at > now() - interval '1 hour';
$$;

create policy "anyone can read events"
  on public.groups for select
  using (true);

create policy "signed-in users can create events"
  on public.groups for insert
  to authenticated
  with check (creator = auth.uid() and public.groups_rate_limit());

-- ------------------------------------------------------------
-- Membership (used only for the traveler count — the timeline
-- itself never needs the server).
-- ------------------------------------------------------------
create table if not exists public.group_members (
  group_id  text not null references public.groups (id) on delete cascade,
  member_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, member_id)
);

alter table public.group_members enable row level security;

create policy "members join as themselves"
  on public.group_members for insert
  to authenticated
  with check (member_id = auth.uid());

-- Member count exposed via RPC (keeps member ids private).
create or replace function public.group_member_count(gid text)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*) from group_members where group_id = gid;
$$;

grant execute on function public.group_member_count(text) to anon, authenticated;

-- ------------------------------------------------------------
-- Comments learn which group their author was in (nullable —
-- personal-timeline comments stay null). Used for the
-- "your group" badge; comments remain visible to everyone.
-- ------------------------------------------------------------
alter table public.comments add column if not exists group_id text;
