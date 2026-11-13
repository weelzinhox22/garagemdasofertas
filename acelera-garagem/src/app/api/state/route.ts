import { isAdmin } from "@/lib/auth";
import { database } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAdmin(request)) return Response.json({ error: "Token administrativo invalido. Use AUTOMATION_ADMIN_TOKEN, nao CRON_SECRET." }, { status: 401 });
  const db = database();
  const [offers, sources, searches, destinations, deliveries] = await Promise.all([
    db.from("automation_offers").select("id,title,store,price,image_url,created_at").order("created_at", { ascending: false }).limit(20),
    db.from("automation_sources").select("id,name,store,feed_url,active,last_checked_at").order("created_at", { ascending: false }),
    db.from("automation_saved_searches").select("id,name,query,min_discount,result_limit,active,last_checked_at,last_error").order("created_at", { ascending: false }),
    db.from("automation_destinations").select("id,name,channel,external_id,active,opt_in_confirmed,template_name").order("created_at", { ascending: false }),
    db.from("automation_deliveries").select("id,status,attempts,last_error,created_at").order("created_at", { ascending: false }).limit(50)
  ]);
  const searchSetupRequired = searches.error ? ["42P01", "PGRST205"].includes(searches.error.code) : false;
  const error = offers.error || sources.error || (!searchSetupRequired && searches.error) || destinations.error || deliveries.error;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ offers: offers.data, sources: sources.data, searches: searches.data || [], destinations: destinations.data, deliveries: deliveries.data, searchSetupRequired });
}
