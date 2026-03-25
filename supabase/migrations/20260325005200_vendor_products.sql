create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.user_profiles(id) on delete cascade,
  name text not null,
  price numeric not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'pending' check (status in ('active', 'pending')),
  image_path text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_vendor_id_created_at_idx
on public.products (vendor_id, created_at desc);

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "Vendors can read own products" on public.products;
create policy "Vendors can read own products"
on public.products
for select
using (vendor_id = auth.uid());

drop policy if exists "Vendors can insert own products" on public.products;
create policy "Vendors can insert own products"
on public.products
for insert
with check (
  vendor_id = auth.uid()
  and public.current_user_role() = 'vendor'::public.app_role
);

drop policy if exists "Vendors can update own products" on public.products;
create policy "Vendors can update own products"
on public.products
for update
using (
  vendor_id = auth.uid()
  and public.current_user_role() = 'vendor'::public.app_role
)
with check (
  vendor_id = auth.uid()
  and public.current_user_role() = 'vendor'::public.app_role
);

drop policy if exists "Vendors can delete own products" on public.products;
create policy "Vendors can delete own products"
on public.products
for delete
using (
  vendor_id = auth.uid()
  and public.current_user_role() = 'vendor'::public.app_role
);

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
on public.products
for select
using (public.current_user_role() = 'admin'::public.app_role);

