drop table if exists public.products cascade;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.user_profiles(id) on delete cascade,
  category_id uuid,
  name text not null,
  slug text not null,
  description text,
  price numeric not null default 0,
  price_cents bigint not null default 0,
  currency text not null default 'USD',
  stock_quantity integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists products_vendor_id_idx on public.products (vendor_id);
alter table public.products enable row level security;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

drop policy if exists "Vendors can read own products" on public.products;
create policy "Vendors can read own products"
on public.products
for select
using (vendor_id = auth.uid());

drop policy if exists "Vendors can insert own products" on public.products;
create policy "Vendors can insert own products"
on public.products
for insert
with check (vendor_id = auth.uid());

drop policy if exists "Vendors can update own products" on public.products;
create policy "Vendors can update own products"
on public.products
for update
using (vendor_id = auth.uid())
with check (vendor_id = auth.uid());

drop policy if exists "Vendors can delete own products" on public.products;
create policy "Vendors can delete own products"
on public.products
for delete
using (vendor_id = auth.uid());

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
on public.products
for select
using (public.current_user_role() = 'admin'::public.app_role);

drop policy if exists "Admins can insert all products" on public.products;
create policy "Admins can insert all products"
on public.products
for insert
with check (public.current_user_role() = 'admin'::public.app_role);

drop policy if exists "Admins can update all products" on public.products;
create policy "Admins can update all products"
on public.products
for update
using (public.current_user_role() = 'admin'::public.app_role)
with check (public.current_user_role() = 'admin'::public.app_role);

drop policy if exists "Admins can delete all products" on public.products;
create policy "Admins can delete all products"
on public.products
for delete
using (public.current_user_role() = 'admin'::public.app_role);

