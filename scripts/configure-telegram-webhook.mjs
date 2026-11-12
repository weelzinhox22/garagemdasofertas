const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

if (!token || !secret || !siteUrl) {
  throw new Error("Defina TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET e NEXT_PUBLIC_SITE_URL.");
}

const url = new URL(siteUrl);
if (url.protocol !== "https:") throw new Error("NEXT_PUBLIC_SITE_URL precisa usar HTTPS em producao.");
if (!/^[A-Za-z0-9_-]{32,256}$/.test(secret)) {
  throw new Error("TELEGRAM_WEBHOOK_SECRET deve ter 32 a 256 caracteres seguros.");
}

const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    url: `${url.origin}/api/telegram/webhook`,
    secret_token: secret,
    allowed_updates: ["message"],
    drop_pending_updates: false
  })
});

const result = await response.json();
if (!response.ok || !result.ok) throw new Error(result.description || "Falha ao configurar o webhook.");
console.log("Webhook do Telegram configurado com sucesso.");
