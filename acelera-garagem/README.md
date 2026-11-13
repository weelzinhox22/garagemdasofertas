# Acelera Garagem

Plataforma independente de automacao de ofertas para afiliados. Ela recebe ofertas manuais ou de feeds JSON autorizados, elimina duplicatas, cria uma fila e distribui as publicacoes pelo Telegram e pela API oficial do WhatsApp Business.

O projeto reproduz o fluxo funcional de ferramentas de automacao de afiliados, mas nao copia marca, textos, codigo ou identidade visual de terceiros. Ele tambem nao automatiza WhatsApp Web, nao captura grupos de terceiros e nao tenta contornar limites das plataformas.

## Implantacao na Vercel

1. Crie um segundo projeto na Vercel usando o mesmo repositorio.
2. Em **Root Directory**, selecione `acelera-garagem`.
3. No Supabase, abra o SQL Editor e execute `supabase/setup.sql`.
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

A Vercel chama `/api/cron/dispatch` a cada hora. Em outro provedor, agende uma requisicao GET com `Authorization: Bearer <CRON_SECRET>`.
