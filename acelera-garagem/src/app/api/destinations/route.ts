import { isAdmin } from "@/lib/auth";
import { database } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!isAdmin(request)) return Response.json({ error: "Nao autorizado" }, { status: 401 });
  try {
    const body = await request.json();
    const channel = body.channel === "telegram" ? "telegram" : "whatsapp";
    if (channel === "whatsapp" && body.optInConfirmed !== true) throw new Error("Confirme o opt-in do destinatario");
    const externalId = String(body.externalId || "").replace(/[^\d-]/g, "");
    if (!externalId) throw new Error("Identificador invalido");
    const { data, error } = await database().from("automation_destinations").insert({
      name: String(body.name || "Destino").trim().slice(0, 80),
      channel,
      external_id: externalId,
      active: true,
      opt_in_confirmed: channel === "telegram" ? true : body.optInConfirmed === true,
      template_name: channel === "whatsapp" ? String(body.templateName || "").trim() || null : null,
      template_language: "pt_BR"
    }).select().single();
    if (error) throw new Error(error.message);
    return Response.json(data, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Destino invalido" }, { status: 400 });
  }
}
