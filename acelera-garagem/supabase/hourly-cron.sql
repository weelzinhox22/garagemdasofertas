-- Execute este arquivo no SQL Editor do Supabase depois do primeiro deploy.
-- Substitua os dois valores abaixo. Nao publique este arquivo preenchido
-- e nao envie os valores por chat.

create extension if not exists pg_cron with schema pg_catalog;
create schema if not exists extensions;
create extension if not exists pg_net with schema extensions;

select vault.create_secret(
  'https://SEU-PROJETO.vercel.app/api/cron/dispatch',
  'automation_endpoint',
  'Endpoint da automacao Acelera Garagem'
);

select vault.create_secret(
  'COLE_AQUI_O_MESMO_CRON_SECRET_DA_VERCEL',
  'automation_cron_secret',
  'Token do cron Acelera Garagem'
);

-- Executa aos 5 minutos de cada hora. O cron diario da Vercel roda apenas
-- como contingencia e permanece compativel com o plano Hobby.
select cron.schedule(
  'acelera-garagem-hourly',
  '5 * * * *',
  $$
    select net.http_get(
      url := (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'automation_endpoint'
        order by created_at desc
        limit 1
      ),
      headers := jsonb_build_object(
        'Authorization',
        'Bearer ' || (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'automation_cron_secret'
          order by created_at desc
          limit 1
        )
      ),
      timeout_milliseconds := 55000
    ) as request_id;
  $$
);

-- Consulte as ultimas execucoes com:
-- select * from cron.job_run_details order by start_time desc limit 20;
