create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role public.app_role;
begin
  new_role :=
    case
      when lower(new.email) = 'admin@example.com' then 'admin'::public.app_role
      else 'customer'::public.app_role
    end;

  insert into public.user_profiles (id, role, display_name)
  values (
    new.id,
    new_role,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

