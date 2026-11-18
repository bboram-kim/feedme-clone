-- Saved article snapshots (owner-only access).
create table public.saved_articles (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  url text not null,
  title text,
  author text,
  site text not null,
  markdown text not null,
  saved_at timestamptz not null default now(),
  primary key (id),
  -- Saving the same URL again refreshes the existing row.
  unique (user_id, url)
);

create index saved_articles_user_saved_at_idx
  on public.saved_articles (user_id, saved_at desc);

-- Only signed-in users touch this table; anon gets nothing.
grant select, insert, update, delete on public.saved_articles to authenticated;
grant select, insert, update, delete on public.saved_articles to service_role;

alter table public.saved_articles enable row level security;

create policy "saved_articles_select_own" on public.saved_articles
  for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "saved_articles_insert_own" on public.saved_articles
  for insert to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "saved_articles_update_own" on public.saved_articles
  for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "saved_articles_delete_own" on public.saved_articles
  for delete to authenticated
  using ( (select auth.uid()) = user_id );
