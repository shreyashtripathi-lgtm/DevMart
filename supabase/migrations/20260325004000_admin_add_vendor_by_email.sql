create or replace function public.add_vendor_by_email(
  p_email text,
  p_display_name text
)
returns public.user_profiles
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  target_id uuid;
  result_row public.user_profiles;
begin
  if public.current_user_role() <> 'admin'::public.app_role then
    raise exception 'Insufficient privileges' using errcode = '42501';
  end if;

  select id
  into target_id
  from auth.users
  where lower(email) = lower(p_email)
  limit 1;

  if target_id is null then
    raise exception 'User not found for email %', p_email using errcode = 'P0002';
  end if;

  insert into public.user_profiles (id, role, display_name)
  values (target_id, 'vendor'::public.app_role, p_display_name)
  on conflict (id) do update
  set role = excluded.role,
    display_name = excluded.display_name;

  select *
  into result_row
  from public.user_profiles
  where id = target_id;

  return result_row;
end;
$$;

grant execute on function public.add_vendor_by_email(text, text) to authenticated;

