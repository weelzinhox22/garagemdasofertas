import { isCron } from "@/lib/auth";
import { sendOffer } from "@/lib/channels";
import { validatedFeedUrl } from "@/lib/feed-security";
import { enqueueOffer, type OfferInput } from "@/lib/offers";
import { database } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

export async function GET(request: Request) {
  if (!isCron(request)) return Response.json({ error: "Nao autorizado" }, { status: 401 });
  try {
    const ingested = await ingestFeeds();
    const sent = await dispatchQueue();
    return Response.json({ ok: true, ingested, sent });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha no ciclo" }, { status: 500 });
  }
}
