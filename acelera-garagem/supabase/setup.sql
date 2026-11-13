create extension if not exists pgcrypto;

create table if not exists public.automation_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  store text not null,
  feed_url text not null check (feed_url ~ '^https://'),
  active boolean not null default true,
  last_checked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table if not exists public.automation_destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  channel text not null check (channel in ('telegram','whatsapp')),
  external_id text not null,
  active boolean not null default true,
  opt_in_confirmed boolean not null default false,
  template_name text,
  template_language text not null default 'pt_BR',
  created_at timestamptz not null default now(),
  constraint whatsapp_requires_opt_in check (channel <> 'whatsapp' or opt_in_confirmed = true),
  unique (channel, external_id)
);

create table if not exists public.automation_offers (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  source text not null,
  external_id text,
  title text not null check (char_length(title) between 3 and 180),
  description text not null default '',
  store text not null,
  image_url text not null check (image_url ~ '^https://'),
  affiliate_url text not null check (affiliate_url ~ '^https://'),
  price numeric(12,2) check (price is null or price >= 0),
  old_price numeric(12,2) check (old_price is null or old_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.automation_deliveries (
  id bigint generated always as identity primary key,
  offer_id uuid not null references public.automation_offers(id) on delete cascade,
  destination_id uuid not null references public.automation_destinations(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','sent','failed','skipped')),
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz,
  attempts integer not null default 0 check (attempts between 0 and 10),
  last_error text,
  created_at timestamptz not null default now(),
  unique (offer_id, destination_id)
);

create index if not exists automation_deliveries_queue_idx on public.automation_deliveries(status, scheduled_at);
create index if not exists automation_offers_created_idx on public.automation_offers(created_at desc);

alter table public.automation_sources enable row level security;
alter table public.automation_destinations enable row level security;
alter table public.automation_offers enable row level security;
alter table public.automation_deliveries enable row level security;

revoke all on table public.automation_sources, public.automation_destinations,
  public.automation_offers, public.automation_deliveries from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- Todas as operacoes passam pelas rotas protegidas do servidor usando a chave secreta.
-- Nao crie policies publicas para estas tabelas.
