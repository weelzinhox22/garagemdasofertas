import "server-only";
import { sendOffer } from "@/lib/channels";
import { validatedFeedUrl } from "@/lib/feed-security";
import { searchMercadoLivre } from "@/lib/mercadolivre";
import { enqueueOffer, type OfferInput } from "@/lib/offers";
import { database } from "@/lib/supabase";

type FeedPayload = { offers?: OfferInput[] } | OfferInput[];

async function ingestFeeds() {
  const db = database();
  const { data: sources, error } = await db.from("automation_sources").select("id,name,feed_url,store").eq("active", true);
  if (error) throw new Error(error.message);
  let created = 0;
  for (const source of sources || []) {
    try {
      const feed = validatedFeedUrl(source.feed_url);
      const response = await fetch(feed, { signal: AbortSignal.timeout(12_000), headers: { accept: "application/json" } });
      if (!response.ok) throw new Error(`Feed respondeu ${response.status}`);
      const payload = await response.json() as FeedPayload;
      const items = Array.isArray(payload) ? payload : payload.offers || [];
      for (const item of items.slice(0, 50)) {
        const result = await enqueueOffer({ ...item, store: item.store || source.store }, `feed:${source.id}`);
        if (result.created) created += 1;
      }
      await db.from("automation_sources").update({ last_checked_at: new Date().toISOString(), last_error: null }).eq("id", source.id);
    } catch (sourceError) {
      await db.from("automation_sources").update({ last_checked_at: new Date().toISOString(), last_error: sourceError instanceof Error ? sourceError.message.slice(0, 300) : "Falha" }).eq("id", source.id);
    }
  }
  return created;
}

async function ingestMercadoLivre() {
  const db = database();
  const searches = await db.from("automation_saved_searches").select("id,query,min_discount,result_limit").eq("active", true);
  if (searches.error && ["42P01", "PGRST205"].includes(searches.error.code)) return 0;
  if (searches.error) throw new Error(searches.error.message);
  let created = 0;
  for (const search of searches.data || []) {
    try {
      const offers = await searchMercadoLivre(search.query, Number(search.min_discount), Number(search.result_limit));
      for (const offer of offers) {
        const result = await enqueueOffer(offer, `mercadolivre:${search.id}`);
        if (result.created) created += 1;
      }
      await db.from("automation_saved_searches").update({ last_checked_at: new Date().toISOString(), last_error: null }).eq("id", search.id);
    } catch (searchError) {
      await db.from("automation_saved_searches").update({ last_checked_at: new Date().toISOString(), last_error: searchError instanceof Error ? searchError.message.slice(0, 300) : "Falha" }).eq("id", search.id);
    }
  }
  return created;
}

async function dispatchQueue() {
  const db = database();
  const { data: jobs, error } = await db.from("automation_deliveries").select("id,offer_id,destination_id,attempts").eq("status", "pending").lte("scheduled_at", new Date().toISOString()).order("created_at").limit(30);
  if (error) throw new Error(error.message);
  let sent = 0;
  for (const job of jobs || []) {
    const [{ data: offer }, { data: destination }] = await Promise.all([
      db.from("automation_offers").select("title,description,image_url,affiliate_url,price,store").eq("id", job.offer_id).single(),
      db.from("automation_destinations").select("channel,external_id,template_name,template_language,opt_in_confirmed,active").eq("id", job.destination_id).single()
    ]);
    if (!offer || !destination?.active || (destination.channel === "whatsapp" && !destination.opt_in_confirmed)) {
      await db.from("automation_deliveries").update({ status: "skipped", last_error: "Destino indisponivel" }).eq("id", job.id);
      continue;
    }
    try {
      await sendOffer(offer, destination);
      await db.from("automation_deliveries").update({ status: "sent", sent_at: new Date().toISOString(), attempts: job.attempts + 1, last_error: null }).eq("id", job.id);
      sent += 1;
    } catch (sendError) {
      const attempts = job.attempts + 1;
      await db.from("automation_deliveries").update({ status: attempts >= 3 ? "failed" : "pending", attempts, last_error: sendError instanceof Error ? sendError.message.slice(0, 300) : "Falha" }).eq("id", job.id);
    }
  }
  return sent;
}

export async function runAutomation() {
  const [feedOffers, mercadoLivreOffers] = await Promise.all([ingestFeeds(), ingestMercadoLivre()]);
  const sent = await dispatchQueue();
  return { ingested: feedOffers + mercadoLivreOffers, feedOffers, mercadoLivreOffers, sent };
}
