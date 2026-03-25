insert into public.user_profiles (id, role, display_name)
select
  u.id,
  'admin'::public.app_role,
  coalesce(u.raw_user_meta_data->>'display_name', u.raw_user_meta_data->>'name', null)
from auth.users u
where lower(u.email) = 'admin@example.com'
on conflict (id) do update
set role = excluded.role,
  display_name = excluded.display_name;

