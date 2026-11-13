import { formattedPrice } from "@/lib/offers";

type Offer = { title: string; description: string; image_url: string; affiliate_url: string; price: number | null; store: string };
type Destination = { channel: "telegram" | "whatsapp"; external_id: string; template_name: string | null; template_language: string };

function caption(offer: Offer) {
  return [
    "🔥 OFERTA ENCONTRADA!",
    "",
    `🛍️ ${offer.title}`,
    `🏪 ${offer.store}`,
    `💰 ${formattedPrice(offer.price)}`,
    "",
    "👉 PEGUE A OFERTA:",
    offer.affiliate_url,
    "",
    "⚡ Preco e estoque podem mudar."
  ].join("\n");
}

async function telegram(offer: Offer, destination: Destination) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN ausente");
  const photo = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: destination.external_id, photo: offer.image_url, caption: caption(offer) })
  });
  if (photo.ok) return;
  const text = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: destination.external_id, text: caption(offer), disable_web_page_preview: false })
  });
  if (!text.ok) throw new Error(`Telegram respondeu ${text.status}`);
}

async function whatsapp(offer: Offer, destination: Destination) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.WHATSAPP_GRAPH_VERSION || "v23.0";
  if (!token || !phoneId) throw new Error("WhatsApp Cloud API nao configurada");
  if (!destination.template_name) throw new Error("Destino sem template aprovado");
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: destination.external_id,
      type: "template",
      template: {
        name: destination.template_name,
        language: { code: destination.template_language || "pt_BR" },
        components: [
          {
            type: "header",
            parameters: [{ type: "image", image: { link: offer.image_url } }]
          },
          {
            type: "body",
            parameters: [
              { type: "text", text: offer.title },
              { type: "text", text: formattedPrice(offer.price) },
              { type: "text", text: offer.affiliate_url }
            ]
          }
        ]
      }
    })
  });
  if (!response.ok) throw new Error(`WhatsApp respondeu ${response.status}`);
}

export async function sendOffer(offer: Offer, destination: Destination) {
  if (destination.channel === "telegram") return telegram(offer, destination);
  return whatsapp(offer, destination);
}
