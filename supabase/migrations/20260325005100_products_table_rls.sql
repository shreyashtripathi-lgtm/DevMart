do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'product_status'
  ) then
    create type public.product_status as enum ('active', 'pending');
  end if;
end $$;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.user_profiles(id) on delete cascade,
  name text not null,
  price numeric not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  status public.product_status not null default 'pending',
  image_data_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop index if exists products_vendor_id_idx;
create index products_vendor_id_idx on public.products (vendor_id);

alter table public.products enable row level security;

drop policy if exists "Vendors can read own products" on public.products;
create policy "Vendors can read own products"
on public.products
for select
using (
  vendor_id = auth.uid()
  or public.current_user_role() = 'admin'::public.app_role
);

drop policy if exists "Vendors can insert own products" on public.products;
create policy "Vendors can insert own products"
on public.products
for insert
with check (
  vendor_id = auth.uid()
  or public.current_user_role() = 'admin'::public.app_role
);

drop policy if exists "Vendors can update own products" on public.products;
create policy "Vendors can update own products"
on public.products
for update
using (
  vendor_id = auth.uid()
  or public.current_user_role() = 'admin'::public.app_role
)
with check (
  vendor_id = auth.uid()
  or public.current_user_role() = 'admin'::public.app_role
);

drop policy if exists "Vendors can delete own products" on public.products;
create policy "Vendors can delete own products"
on public.products
for delete
using (
  vendor_id = auth.uid()
  or public.current_user_role() = 'admin'::public.app_role
);

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

