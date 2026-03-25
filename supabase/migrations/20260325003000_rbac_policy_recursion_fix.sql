create or replace function public.current_user_role()
returns public.app_role
language sql
security definer
set search_path = public
set row_security = off
as $$
  select role
  from public.user_profiles
  where id = auth.uid();
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  insert into public.user_profiles (id, role, display_name)
  values (
    new.id,
    case
      when lower(new.email) = 'admin@example.com' then 'admin'::public.app_role
      else 'customer'::public.app_role
    end,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles for select
using (id = auth.uid());

drop policy if exists "Users can update own profile (role locked)" on public.user_profiles;
create policy "Users can update own profile (role locked)"
on public.user_profiles for update
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = public.current_user_role()
);

drop policy if exists "Admins can read all profiles" on public.user_profiles;
create policy "Admins can read all profiles"
on public.user_profiles for select
using (public.current_user_role() = 'admin'::public.app_role);

drop policy if exists "Admins can update any profile" on public.user_profiles;
create policy "Admins can update any profile"
on public.user_profiles for update
using (public.current_user_role() = 'admin'::public.app_role)
with check (public.current_user_role() = 'admin'::public.app_role);

