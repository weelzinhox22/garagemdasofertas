import { isCron } from "@/lib/auth";
import { runAutomation } from "@/lib/automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isCron(request)) {
    return Response.json({ error: "Rota privada do agendador. Abra /painel para administrar a automacao." }, { status: 401 });
  }
  try {
    return Response.json({ ok: true, ...(await runAutomation()) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha no ciclo" }, { status: 500 });
  }
}
