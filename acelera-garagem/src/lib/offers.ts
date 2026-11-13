import { createHash } from "node:crypto";
import { database } from "@/lib/supabase";

export type OfferInput = {
  externalId?: string;
  title: string;
  description?: string;
  store: string;
  imageUrl: string;
  affiliateUrl: string;
  price?: number | null;
  oldPrice?: number | null;
};

function httpsUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error("A URL precisa usar HTTPS");
  return url.toString();
}

export function normalizeOffer(value: OfferInput): OfferInput {
  const title = String(value.title || "").trim().slice(0, 180);
  const store = String(value.store || "Outra").trim().slice(0, 60);
  if (title.length < 3) throw new Error("Titulo invalido");
  return {
    externalId: value.externalId ? String(value.externalId).slice(0, 180) : undefined,
    title,
    description: String(value.description || "").trim().slice(0, 1_500),
    store,
    imageUrl: httpsUrl(String(value.imageUrl || "")),
    affiliateUrl: httpsUrl(String(value.affiliateUrl || "")),
    price: Number.isFinite(Number(value.price)) ? Math.max(0, Number(value.price)) : null,
    oldPrice: Number.isFinite(Number(value.oldPrice)) ? Math.max(0, Number(value.oldPrice)) : null
  };
}

export function fingerprint(source: string, offer: OfferInput) {
  return createHash("sha256").update(`${source}|${offer.externalId || offer.affiliateUrl}`).digest("hex");
}

export async function enqueueOffer(input: OfferInput, source = "manual") {
  const db = database();
  const offer = normalizeOffer(input);
  const { data, error } = await db.from("automation_offers").insert({
    fingerprint: fingerprint(source, offer),
    source,
    external_id: offer.externalId || null,
    title: offer.title,
    description: offer.description || "",
    store: offer.store,
    image_url: offer.imageUrl,
    affiliate_url: offer.affiliateUrl,
    price: offer.price,
    old_price: offer.oldPrice
  }).select("id,title").single();
  if (error) {
    if (error.code === "23505") return { created: false, duplicate: true };
    throw new Error(error.message);
  }

  const { data: destinations, error: destinationError } = await db
    .from("automation_destinations").select("id,channel,opt_in_confirmed").eq("active", true);
  if (destinationError) throw new Error(destinationError.message);
  const rows = (destinations || [])
    .filter((item) => item.channel !== "whatsapp" || item.opt_in_confirmed)
    .map((item) => ({ offer_id: data.id, destination_id: item.id, status: "pending" }));
  if (rows.length) {
    const { error: queueError } = await db.from("automation_deliveries").insert(rows);
    if (queueError) throw new Error(queueError.message);
  }
  return { created: true, duplicate: false, offer: data, queued: rows.length };
}

export function formattedPrice(value: number | null) {
  return value === null ? "Consulte o preco" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
