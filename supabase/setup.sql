-- GARAGEM DAS OFERTAS — configuracao completa para o SQL Editor do Supabase
-- Pode ser executado novamente com seguranca. Depois, crie o usuario em
-- Authentication > Users e autorize-o conforme o exemplo no fim deste arquivo.

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '',
  icon text not null default 'tags',
  position integer not null default 0 check (position >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 180),
  description text not null default '',
  category_slug text not null references public.categories(slug) on update cascade on delete restrict,
  store text not null,
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

alter table public.products drop constraint if exists products_store_check;
alter table public.products add constraint products_store_check
  check (store in ('Shopee', 'Amazon', 'Mercado Livre', 'TikTok Shop', 'Outra'));

create table if not exists public.product_clicks (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  store text not null,
  traffic_source text not null default 'direct'
    check (traffic_source in ('tiktok_1','tiktok_2','pinterest','instagram','direct','other')),
  campaign text check (campaign is null or char_length(campaign) <= 100),
  clicked_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key check (key in ('whatsapp_group_url','telegram_group_url')),
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.telegram_updates (
  update_id bigint primary key,
  processed_at timestamptz not null default now()
);

create index if not exists products_category_active_idx on public.products(category_slug, active, created_at desc);
create index if not exists products_featured_idx on public.products(featured, active) where featured = true and active = true;
create index if not exists product_clicks_product_date_idx on public.product_clicks(product_id, clicked_at desc);
create index if not exists product_clicks_source_date_idx on public.product_clicks(traffic_source, clicked_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_clicks enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security;
alter table public.telegram_updates enable row level security;

drop policy if exists "Public reads active categories" on public.categories;
create policy "Public reads active categories"
on public.categories for select to anon, authenticated
using (active = true);

drop policy if exists "Public reads active products" on public.products;
create policy "Public reads active products"
on public.products for select to anon, authenticated
using (active = true);

drop policy if exists "Admin reads own membership" on public.admin_users;
create policy "Admin reads own membership"
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

-- Defesa em profundidade: somente leitura publica do catalogo. Toda escrita,
-- configuracao e telemetria passam pela service role no servidor.
revoke all on table public.categories, public.products, public.product_clicks,
  public.site_settings, public.admin_users, public.telegram_updates from anon, authenticated;
grant select on table public.categories, public.products to anon, authenticated;
grant select on table public.admin_users to authenticated;
revoke all on all sequences in schema public from anon, authenticated;

insert into public.categories (slug, name, description, icon, position) values
  ('ferramentas','Ferramentas','Itens para oficina, obra e pequenos reparos.','wrench',1),
  ('eletronicos','Eletronicos','Tecnologia util para a rotina.','cpu',2),
  ('casa-e-cozinha','Casa e cozinha','Praticidade para todos os ambientes.','house',3),
  ('automotivo','Automotivo','Acessorios e cuidados para seu veiculo.','car',4),
  ('acessorios','Acessorios','Itens compactos que facilitam o dia.','watch',5),
  ('informatica','Informatica','Perifericos e acessorios para o setup.','monitor',6),
  ('utilidades','Utilidades','Solucoes simples para problemas cotidianos.','package',7)
on conflict (slug) do nothing;

-- PASSO FINAL (execute separadamente, trocando o e-mail):
-- insert into public.admin_users (user_id, email)
-- select id, email from auth.users where email = 'seu-email@exemplo.com'
-- on conflict (user_id) do update set email = excluded.email;
