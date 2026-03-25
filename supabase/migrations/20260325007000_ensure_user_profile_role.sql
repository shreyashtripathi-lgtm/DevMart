create or replace function public.ensure_user_profile_role(p_role public.app_role)
returns void
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  insert into public.user_profiles (id, role, display_name)
  select
    u.id,
    p_role,
    coalesce(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'name', null)
  from auth.users u
  where u.id = auth.uid()
  on conflict (id) do update
  set role = excluded.role,
    display_name = coalesce(excluded.display_name, public.user_profiles.display_name);
end;
$$;

grant execute on function public.ensure_user_profile_role(public.app_role) to authenticated;

