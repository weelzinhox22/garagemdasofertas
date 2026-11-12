# Garagem das Ofertas

Portal mobile-first de achadinhos, construído com Next.js App Router, React, TypeScript, Tailwind CSS, Lucide e Supabase.

## Rodar localmente

Requisitos: Node.js 20.9 ou superior e npm.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`. Sem credenciais do Supabase, o catálogo usa itens claramente marcados como demonstração, sem preços e sem links comerciais.

## Configurar o Supabase

1. Crie um projeto no Supabase.
2. Cole e execute todo o arquivo `supabase/setup.sql` no SQL Editor.
3. Copie `.env.example` para `.env.local` e preencha a URL, a publishable key e a service role key.
4. Crie um usuário em Authentication > Users.
5. Autorize o usuário com SQL, substituindo os valores:

```sql
insert into public.admin_users (user_id, email)
select id, email from auth.users where email = 'email@dominio.com'
on conflict (user_id) do update set email = excluded.email;
```

Não crie uma tela pública de cadastro administrativo e nunca coloque e-mail ou senha no código. Crie ou convide o usuário em **Authentication > Users** no painel do Supabase e depois conceda acesso inserindo o UUID em `admin_users`. Para produção, use uma senha longa e exclusiva, habilite proteção contra senhas vazadas quando disponível, revise os limites de autenticação e considere MFA/TOTP.

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no navegador. Ela é usada apenas em Server Actions e Route Handlers, depois da verificação administrativa no servidor.

## Comunidades

Defina `NEXT_PUBLIC_WHATSAPP_GROUP_URL` e `NEXT_PUBLIC_TELEGRAM_GROUP_URL` com links HTTPS reais. Enquanto estiverem vazios, o modal mostra os canais como “em configuração”, sem inventar destinos.

O modal usa `localStorage`: 7 dias após fechar e 30 dias após entrar em um grupo. Ele inclui focus trap, Escape, devolução de foco e suporte a `prefers-reduced-motion`.

## Ofertas e cliques

O painel em `/admin` permite cadastrar, editar, ativar, desativar e excluir produtos. A saída `/go/[id]` valida o destino contra uma lista de lojas permitidas, registra origem/campanha e usa um cookie HTTP-only de 60 segundos para reduzir duplicações acidentais.

### Cadastro por link

Na primeira seção do painel, cole um link HTTPS do Mercado Livre, Shopee ou TikTok Shop. O servidor valida o domínio, segue apenas redirecionamentos entre domínios permitidos e tenta obter título, descrição e imagem por Open Graph ou Product JSON-LD. Revise a prévia e clique em **Adicionar ao catálogo**. Caso a loja bloqueie robôs ou não exponha metadados, use o formulário manual logo abaixo.

### Administração pelo Telegram

1. Crie o bot no `@BotFather` e guarde o token somente no ambiente do servidor.
2. Gere um segredo aleatório com pelo menos 32 caracteres.
3. Configure no provedor de deploy: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_ADMIN_USER_IDS`, `SUPABASE_SERVICE_ROLE_KEY` e a `NEXT_PUBLIC_SITE_URL` pública em HTTPS.
4. Em `TELEGRAM_ADMIN_USER_IDS`, informe apenas os IDs numéricos autorizados, separados por vírgula.
5. Depois do deploy, execute `npm run telegram:webhook` no mesmo ambiente para registrar o webhook.

Comandos disponíveis para os IDs autorizados:

- `/adicionar <link>` importa e publica um produto do Mercado Livre, Shopee ou TikTok Shop.
- `/remover <slug ou UUID>` desativa o produto sem apagar seu histórico.
- `/listar` mostra os dez produtos ativos mais recentes.
- `/ajuda` mostra a referência rápida.

O webhook valida o segredo enviado pelo Telegram, rejeita usuários fora da allowlist e registra o `update_id` para impedir reexecução da mesma mensagem. O token do bot, o segredo do webhook e a `service_role` nunca devem usar prefixo `NEXT_PUBLIC_` nem entrar no Git.

Origens UTM reconhecidas: `tiktok_1`, `tiktok_2`, `pinterest`, `instagram` e `direct`.

## Verificação

```bash
npm run typecheck
npm run lint
npm run build
```

## Deploy

Publique em um host compatível com Next.js, configure todas as variáveis de ambiente e defina `NEXT_PUBLIC_SITE_URL` com a URL final. Depois do primeiro deploy, valide o sitemap em `/sitemap.xml`, o robots em `/robots.txt` e os domínios de imagem permitidos em `next.config.ts`.

Antes de publicar ofertas reais, revise a política de privacidade, os termos, os canais de contato e a lista `ALLOWED_HOSTS` em `src/app/go/[id]/route.ts`.
