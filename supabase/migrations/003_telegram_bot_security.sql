create table if not exists public.telegram_updates (
  update_id bigint primary key,
  processed_at timestamptz not null default now()
);

alter table public.telegram_updates enable row level security;

-- O bot e o painel usam a service role no servidor. Clientes publicos nao escrevem.
revoke all on table public.categories, public.products, public.product_clicks,
  public.site_settings, public.admin_users, public.telegram_updates from anon, authenticated;
grant select on table public.categories, public.products to anon, authenticated;
grant select on table public.admin_users to authenticated;
revoke all on all sequences in schema public from anon, authenticated;
