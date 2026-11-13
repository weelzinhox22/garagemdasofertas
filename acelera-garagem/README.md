# Acelera Garagem

Plataforma independente de automacao de ofertas para afiliados. Ela recebe ofertas manuais ou de feeds JSON autorizados, elimina duplicatas, cria uma fila e distribui as publicacoes pelo Telegram e pela API oficial do WhatsApp Business.

O projeto reproduz o fluxo funcional de ferramentas de automacao de afiliados, mas nao copia marca, textos, codigo ou identidade visual de terceiros. Ele tambem nao automatiza WhatsApp Web, nao captura grupos de terceiros e nao tenta contornar limites das plataformas.

## Implantacao na Vercel

1. Crie um segundo projeto na Vercel usando o mesmo repositorio.
2. Em **Root Directory**, selecione `acelera-garagem`.
3. No Supabase, abra o SQL Editor e execute `supabase/setup.sql` e depois `supabase/mercadolivre-search.sql`.
4. Cadastre as variaveis de `.env.example` no ambiente de producao.
5. Gere valores longos e diferentes para `AUTOMATION_ADMIN_TOKEN` e `CRON_SECRET`.
6. Faça o deploy e abra `/painel` com o token de administracao.

Nunca exponha `SUPABASE_SECRET_KEY`, `TELEGRAM_BOT_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `AUTOMATION_ADMIN_TOKEN` ou `CRON_SECRET` em codigo, Git ou variaveis `NEXT_PUBLIC_*`.

## Feed de ofertas

Somente dominios presentes em `OFFER_FEED_ALLOWED_HOSTS` podem ser consultados. O endpoint deve usar HTTPS e responder com um array ou com `{ "offers": [...] }`:

```json
{
  "offers": [
    {
      "externalId": "sku-123",
      "title": "Furadeira 48V com maleta",
      "description": "Oferta por tempo limitado",
      "imageUrl": "https://cdn.exemplo.com/produto.webp",
      "affiliateUrl": "https://loja.exemplo.com/oferta",
      "price": 129.9,
      "store": "TikTok Shop"
    }
  ]
}
```

A imagem pode vir de qualquer CDN publica em HTTPS. A origem da imagem nao altera a loja escolhida: e possivel usar uma imagem hospedada pela Shopee e manter a oferta identificada como TikTok Shop.

Para realmente buscar ofertas de marketplaces, conecte um feed ou API para a qual voce tenha autorizacao e credenciais de afiliado. O sistema nao raspa paginas nem inventa ofertas.

## Busca automatica no Mercado Livre

Configure `MERCADOLIVRE_CLIENT_ID`, `MERCADOLIVRE_CLIENT_SECRET` e `MERCADOLIVRE_REDIRECT_URI` na Vercel. A Redirect URI deve ser exatamente `https://SEU-DOMINIO/api/mercadolivre/callback` e precisa ser cadastrada com o mesmo valor no aplicativo do Mercado Livre. Depois use **Conectar Mercado Livre** no painel; o sistema recebe, protege e renova os tokens automaticamente.

`MERCADOLIVRE_ACCESS_TOKEN` e `MERCADOLIVRE_REFRESH_TOKEN` continuam aceitos como alternativa para uma configuracao manual, mas nao sao necessarios quando o botao de conexao OAuth e usado.

Depois, abra `/painel`, cadastre uma busca, defina o desconto minimo e clique em **Executar agora**. O Supabase Cron repetira as buscas de hora em hora.

Se a Central de Afiliados tiver fornecido um formato oficial para gerar links, configure `MERCADOLIVRE_AFFILIATE_TEMPLATE` usando os placeholders `{url}`, `{encoded_url}` e `{affiliate_id}`. Sem esse modelo, a automacao usa o link comum do produto e nao pode garantir atribuicao de comissao.

## Telegram

Crie um bot pelo BotFather, coloque o token em `TELEGRAM_BOT_TOKEN` e adicione o bot como administrador do canal ou grupo. Cadastre o `chat_id` em Destinos no painel.

## WhatsApp Business

O envio usa a API oficial WhatsApp Cloud da Meta. Configure o telefone e o token em `WHATSAPP_PHONE_NUMBER_ID` e `WHATSAPP_ACCESS_TOKEN`.

Cadastre na Meta um template de marketing aprovado com um cabecalho de imagem e tres parametros no corpo, nesta ordem:

1. titulo da oferta;
2. preco;
3. link de afiliado.

O cabecalho recebe automaticamente a imagem publica da oferta. Depois informe o nome e o idioma do template no destino. O painel exige a confirmacao de opt-in. Esta versao envia a contatos que aceitaram receber mensagens; automacao de grupos so deve ser adicionada quando a conta tiver acesso oficial e elegivel ao recurso de grupos da Meta.

## Execucao local

```bash
npm install
npm run dev
```

No plano Hobby, a Vercel chama `/api/cron/dispatch` uma vez por dia como contingencia. Para buscar e enviar ofertas de hora em hora sem contratar o plano Pro, execute `supabase/hourly-cron.sql` no SQL Editor depois do primeiro deploy. Substitua os dois placeholders pelo dominio de producao e pelo mesmo `CRON_SECRET` configurado na Vercel; nunca salve o arquivo preenchido no Git.

O Supabase Cron executa a rota aos 5 minutos de cada hora. Acompanhe as execucoes em **Integrations -> Cron** no painel do Supabase. Em outro provedor, agende uma requisicao GET para `/api/cron/dispatch` com `Authorization: Bearer <CRON_SECRET>`.
