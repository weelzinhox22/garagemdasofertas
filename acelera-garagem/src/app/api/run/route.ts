import { isAdmin } from "@/lib/auth";
import { runAutomation } from "@/lib/automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isAdmin(request)) return Response.json({ error: "Token administrativo invalido" }, { status: 401 });
  try {
    return Response.json({ ok: true, ...(await runAutomation()) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha na automacao" }, { status: 500 });
  }
}
