import "server-only";
import { database } from "@/lib/supabase";
import type { OfferInput } from "@/lib/offers";

type Credentials = { accessToken: string; refreshToken: string };
type Product = {
  id?: string;
  name?: string;
  permalink?: string;
  pictures?: Array<{ url?: string; secure_url?: string }>;
  buy_box_winner?: {
    item_id?: string;
    price?: number;
    original_price?: number | null;
  } | null;
};

async function credentials(): Promise<Credentials> {
  const db = database();
  const stored = await db.from("automation_marketplace_credentials")
    .select("access_token,refresh_token,expires_at")
    .eq("marketplace", "mercadolivre")
    .maybeSingle();
  const validStored = stored.data?.access_token && (!stored.data.expires_at || new Date(stored.data.expires_at).getTime() > Date.now() + 300_000);
  if (validStored) return { accessToken: stored.data!.access_token, refreshToken: stored.data!.refresh_token || "" };

  const accessToken = stored.data?.access_token || process.env.MERCADOLIVRE_ACCESS_TOKEN || "";
  const refreshToken = stored.data?.refresh_token || process.env.MERCADOLIVRE_REFRESH_TOKEN || "";
  if (!accessToken && !refreshToken) throw new Error("Credenciais do Mercado Livre nao configuradas");
  if (stored.data?.expires_at && refreshToken) return refreshCredentials(refreshToken);
  return { accessToken, refreshToken };
}

async function refreshCredentials(refreshToken: string): Promise<Credentials> {
  const clientId = process.env.MERCADOLIVRE_CLIENT_ID;
  const clientSecret = process.env.MERCADOLIVRE_CLIENT_SECRET;
  if (!clientId || !clientSecret || !refreshToken) throw new Error("Token do Mercado Livre expirou; configure Client ID, Client Secret e Refresh Token");

  const response = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken })
  });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) throw new Error(`Falha ao renovar token do Mercado Livre (${response.status})`);

  const next = { accessToken: String(payload.access_token), refreshToken: String(payload.refresh_token || refreshToken) };
  await database().from("automation_marketplace_credentials").upsert({
    marketplace: "mercadolivre",
    access_token: next.accessToken,
    refresh_token: next.refreshToken,
    expires_at: new Date(Date.now() + Number(payload.expires_in || 21_600) * 1000).toISOString(),
    updated_at: new Date().toISOString()
  });
  return next;
}

function affiliateLink(permalink: string) {
  const template = process.env.MERCADOLIVRE_AFFILIATE_TEMPLATE || "";
  const affiliateId = process.env.MERCADOLIVRE_AFFILIATE_ID || "";
  if (!template) return permalink;
  return template
    .replaceAll("{encoded_url}", encodeURIComponent(permalink))
    .replaceAll("{url}", permalink)
    .replaceAll("{affiliate_id}", affiliateId);
}

async function requestProducts(query: string, accessToken: string) {
  const url = new URL("https://api.mercadolibre.com/products/search");
  url.searchParams.set("status", "active");
  url.searchParams.set("site_id", "MLB");
  url.searchParams.set("q", query);
  return fetch(url, { headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" }, signal: AbortSignal.timeout(15_000) });
}

export async function searchMercadoLivre(query: string, minDiscount: number, limit: number): Promise<OfferInput[]> {
  let auth = await credentials();
  let response = await requestProducts(query, auth.accessToken);
  if (response.status === 401 && auth.refreshToken) {
    auth = await refreshCredentials(auth.refreshToken);
    response = await requestProducts(query, auth.accessToken);
  }
  if (!response.ok) throw new Error(`Mercado Livre respondeu ${response.status}`);
  const payload = await response.json() as { results?: Product[] };
  const offers: OfferInput[] = [];

  for (const product of payload.results || []) {
    const winner = product.buy_box_winner;
    const title = product.name?.trim();
    const permalink = product.permalink;
    const image = product.pictures?.[0]?.secure_url || product.pictures?.[0]?.url;
    const price = Number(winner?.price);
    const oldPrice = winner?.original_price == null ? null : Number(winner.original_price);
    const discount = oldPrice && oldPrice > price ? ((oldPrice - price) / oldPrice) * 100 : 0;
    if (!winner?.item_id || !title || !permalink || !image || !Number.isFinite(price) || discount < minDiscount) continue;
    offers.push({
      externalId: `${winner.item_id}:${price}`,
      title,
      description: discount > 0 ? `${Math.round(discount)}% de desconto no Mercado Livre` : "Oferta encontrada automaticamente no Mercado Livre",
      store: "Mercado Livre",
      imageUrl: image.replace(/^http:/, "https:"),
      affiliateUrl: affiliateLink(permalink),
      price,
      oldPrice
    });
    if (offers.length >= limit) break;
  }
  return offers;
}

export function mercadoLivreRedirectUri() {
  const value = process.env.MERCADOLIVRE_REDIRECT_URI;
  if (!value) throw new Error("MERCADOLIVRE_REDIRECT_URI nao configurada");
  return value;
}

export async function exchangeAuthorizationCode(code: string) {
  const clientId = process.env.MERCADOLIVRE_CLIENT_ID;
  const clientSecret = process.env.MERCADOLIVRE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Client ID ou Client Secret do Mercado Livre ausente");
  const response = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", client_id: clientId, client_secret: clientSecret, code, redirect_uri: mercadoLivreRedirectUri() })
  });
  const payload = await response.json();
  if (!response.ok || !payload.access_token || !payload.refresh_token) throw new Error(payload.message || payload.error_description || `Mercado Livre respondeu ${response.status}`);
  const { error } = await database().from("automation_marketplace_credentials").upsert({
    marketplace: "mercadolivre",
    access_token: String(payload.access_token),
    refresh_token: String(payload.refresh_token),
    expires_at: new Date(Date.now() + Number(payload.expires_in || 21_600) * 1000).toISOString(),
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(error.message);
}
