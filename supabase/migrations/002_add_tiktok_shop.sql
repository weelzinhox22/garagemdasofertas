alter table public.products drop constraint if exists products_store_check;
alter table public.products add constraint products_store_check
  check (store in ('Shopee', 'Amazon', 'Mercado Livre', 'TikTok Shop', 'Outra'));
