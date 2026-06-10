-- ============================================================
-- Rewound community comments — Supabase schema
-- Paste this whole file into Supabase: SQL Editor → New query → Run.
-- Then enable anonymous sign-ins:
--   Authentication → Sign In / Providers → Anonymous sign-ins → ON
-- ============================================================

-- Comments left by travelers. sim_date = the simulated date the
-- author was living when they wrote it. The site only shows
-- comments with sim_date <= the viewer's own simulated date.
create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  video_id    text not null,
  author_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 30),
  body        text not null check (char_length(body) between 1 and 500),
  sim_date    date not null,
  hidden      boolean not null default false,
  created_at  timestamptz not null default now()
);

create index comments_video_simdate on public.comments (video_id, sim_date);
create index comments_author_recent on public.comments (author_id, created_at);

alter table public.comments enable row level security;

-- Rate limit: max 5 comments per author per 5 minutes.
-- security definer so the policy can count without being blocked by RLS.
create or replace function public.under_rate_limit()
returns boolean
language sql
security definer
set search_path = public
as $$
  select count(*) < 5
  from comments
  where author_id = auth.uid()
    and created_at > now() - interval '5 minutes';
$$;

create policy "anyone can read visible comments"
  on public.comments for select
  using (not hidden);

create policy "signed-in users post as themselves"
  on public.comments for insert
  to authenticated
  with check (author_id = auth.uid() and public.under_rate_limit());

create policy "authors can delete their own comments"
  on public.comments for delete
  to authenticated
  using (author_id = auth.uid());

-- ------------------------------------------------------------
-- Reports: any signed-in user can report a comment once.
-- 3 reports auto-hide the comment (you can un-hide in Table Editor).
-- ------------------------------------------------------------
create table public.reports (
  id          bigint generated always as identity primary key,
  comment_id  uuid not null references public.comments (id) on delete cascade,
  reporter_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (comment_id, reporter_id)
);

alter table public.reports enable row level security;

create policy "signed-in users can file reports"
  on public.reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

create or replace function public.apply_report_threshold()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from reports where comment_id = new.comment_id) >= 3 then
    update comments set hidden = true where id = new.comment_id;
  end if;
  return new;
end;
$$;

create trigger reports_threshold
  after insert on public.reports
  for each row execute function public.apply_report_threshold();

-- ------------------------------------------------------------
-- Moderation cheatsheet (run in SQL editor or use Table Editor):
--   hide:    update comments set hidden = true  where id = '...';
--   restore: update comments set hidden = false where id = '...';
--   recent:  select * from comments order by created_at desc limit 50;
-- ------------------------------------------------------------
