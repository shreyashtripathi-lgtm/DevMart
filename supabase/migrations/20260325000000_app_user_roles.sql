do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'app_role'
  ) then
    create type public.app_role as enum ('admin', 'vendor', 'customer');
  end if;
end $$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, role, display_name)
  values (
    new.id,
    'customer',
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute procedure public.set_updated_at();

alter table public.user_profiles enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles
for select
using (id = auth.uid());

drop policy if exists "Users can update own profile (role locked)" on public.user_profiles;
create policy "Users can update own profile (role locked)"
on public.user_profiles
for update
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = (select role from public.user_profiles where id = auth.uid())
);

drop policy if exists "Admins can read all profiles" on public.user_profiles;
create policy "Admins can read all profiles"
on public.user_profiles
for select
using (
  exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists "Admins can update any profile" on public.user_profiles;
create policy "Admins can update any profile"
on public.user_profiles
for update
using (
  exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.user_profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
);

create or replace function public.ping()
returns text
language sql
stable
as $$
  select 'ok';
$$;

grant usage on schema public to anon, authenticated;
grant execute on function public.ping() to anon, authenticated;

