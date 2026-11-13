import { isAdmin } from "@/lib/auth";
import { validatedFeedUrl } from "@/lib/feed-security";
import { database } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!isAdmin(request)) return Response.json({ error: "Nao autorizado" }, { status: 401 });
  try {
    const body = await request.json();
    const feed = validatedFeedUrl(body.feedUrl);
    const { data, error } = await database().from("automation_sources").insert({
      name: String(body.name || "Feed").trim().slice(0, 80),
      store: String(body.store || "Outra").trim().slice(0, 60),
      feed_url: feed.toString(),
      active: true
    }).select().single();
    if (error) throw new Error(error.message);
    return Response.json(data, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Feed invalido" }, { status: 400 });
  }
}
