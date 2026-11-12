create extension if not exists pgcrypto;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '',
  icon text not null default 'tags',
  position integer not null default 0 check (position >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 180),
  description text not null default '',
  category_slug text not null references public.categories(slug) on update cascade on delete restrict,
  store text not null check (store in ('Shopee', 'Amazon', 'Mercado Livre', 'TikTok Shop', 'Outra')),
  image_url text not null check (image_url ~ '^https://'),
  affiliate_url text check (affiliate_url is null or affiliate_url ~ '^https://'),
  price numeric(12,2) check (price is null or price >= 0),
  old_price numeric(12,2) check (old_price is null or old_price > 0),
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_price_pair check (old_price is null or price is null or old_price > price)
);

create table public.product_clicks (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  store text not null,
  traffic_source text not null default 'direct' check (traffic_source in ('tiktok_1','tiktok_2','pinterest','instagram','direct','other')),
  campaign text check (campaign is null or char_length(campaign) <= 100),
  clicked_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key check (key in ('whatsapp_group_url','telegram_group_url')),
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create index products_category_active_idx on public.products(category_slug, active, created_at desc);
create index products_featured_idx on public.products(featured, active) where featured = true and active = true;
create index product_clicks_product_date_idx on public.product_clicks(product_id, clicked_at desc);
create index product_clicks_source_date_idx on public.product_clicks(traffic_source, clicked_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_clicks enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security;

create policy "Public reads active categories" on public.categories for select using (active = true);
create policy "Public reads active products" on public.products for select using (active = true);
create policy "Admin reads own membership" on public.admin_users for select to authenticated using (user_id = (select auth.uid()));

-- Escritas e relatórios usam a service role somente após validação administrativa no servidor.
-- Nenhuma policy de INSERT/UPDATE/DELETE é concedida a anon ou authenticated.

insert into public.categories (slug, name, description, icon, position) values
('ferramentas','Ferramentas','Itens para oficina, obra e pequenos reparos.','wrench',1),
('eletronicos','Eletrônicos','Tecnologia útil para a rotina.','cpu',2),
('casa-e-cozinha','Casa e cozinha','Praticidade para todos os ambientes.','house',3),
('automotivo','Automotivo','Acessórios e cuidados para seu veículo.','car',4),
('acessorios','Acessórios','Itens compactos que facilitam o dia.','watch',5),
('informatica','Informática','Periféricos e acessórios para o setup.','monitor',6),
('utilidades','Utilidades','Soluções simples para problemas cotidianos.','package',7)
on conflict (slug) do nothing;
