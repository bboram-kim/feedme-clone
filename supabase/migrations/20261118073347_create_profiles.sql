-- Profiles tied to auth users (owner-only access).
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  display_name text,
  primary key (id)
);

-- Only signed-in users touch this table; anon gets nothing.
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ( (select auth.uid()) = id );

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check ( (select auth.uid()) = id );

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- Create a profile row whenever a user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

-- The trigger is the only caller; keep it off the Data API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill users created before this migration.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
