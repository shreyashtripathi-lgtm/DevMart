alter table public.products
add column if not exists price numeric(12, 2) not null default 0;

