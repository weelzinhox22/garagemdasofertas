create table if not exists public.automation_saved_searches (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  query text not null check (char_length(query) between 2 and 120),
  min_discount numeric(5,2) not null default 0 check (min_discount between 0 and 100),
  result_limit integer not null default 10 check (result_limit between 1 and 20),
  active boolean not null default true,
  last_checked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table if not exists public.automation_marketplace_credentials (
  marketplace text primary key,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.automation_saved_searches enable row level security;
alter table public.automation_marketplace_credentials enable row level security;

revoke all on table public.automation_saved_searches,
  public.automation_marketplace_credentials from anon, authenticated;

create index if not exists automation_saved_searches_active_idx
  on public.automation_saved_searches(active, created_at);

-- As credenciais sao lidas apenas pelas rotas de servidor com a chave secreta.
-- Nao crie policies publicas para estas tabelas.
