import { isAdmin } from "@/lib/auth";
import { enqueueOffer } from "@/lib/offers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAdmin(request)) return Response.json({ error: "Nao autorizado" }, { status: 401 });
  try {
    const result = await enqueueOffer(await request.json(), "manual");
    return Response.json(result, { status: result.duplicate ? 409 : 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao cadastrar" }, { status: 400 });
  }
}
