import { isAdmin } from "@/lib/auth";
import { database } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!isAdmin(request)) return Response.json({ error: "Token administrativo invalido" }, { status: 401 });
  try {
    const body = await request.json();
    const query = String(body.query || "").trim().slice(0, 120);
    if (query.length < 2) throw new Error("Informe o produto que deseja buscar");
    const { data, error } = await database().from("automation_saved_searches").insert({
      name: String(body.name || query).trim().slice(0, 80),
      query,
      min_discount: Math.min(100, Math.max(0, Number(body.minDiscount) || 0)),
      result_limit: Math.min(20, Math.max(1, Number(body.resultLimit) || 10)),
      active: true
    }).select().single();
    if (error) {
      if (["42P01", "PGRST205"].includes(error.code)) throw new Error("Execute supabase/mercadolivre-search.sql antes de criar buscas");
      throw new Error(error.message);
    }
    return Response.json(data, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Busca invalida" }, { status: 400 });
  }
}
