export const siteConfig = {
  name: "Garagem das Ofertas",
  shortName: "Garagem",
  description: "Achadinhos selecionados de ferramentas, eletrônicos, casa e muito mais.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  community: {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || "",
    telegram: process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL || ""
  },
  social: { instagram: "", tiktok: "", pinterest: "" }
} as const;

export function isSafeCommunityUrl(value: string, network: "whatsapp" | "telegram") {
  if (!value) return false;
  try {
    const url = new URL(value);
    const allowed = network === "whatsapp"
      ? ["chat.whatsapp.com", "whatsapp.com", "www.whatsapp.com"]
      : ["t.me", "telegram.me"];
    return url.protocol === "https:" && allowed.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}
