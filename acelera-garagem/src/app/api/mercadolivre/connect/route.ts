import { isAdmin } from "@/lib/auth";
import { mercadoLivreRedirectUri } from "@/lib/mercadolivre";
import { createOAuthState } from "@/lib/oauth-state";

export async function POST(request: Request) {
  if (!isAdmin(request)) return Response.json({ error: "Token administrativo invalido" }, { status: 401 });
  try {
    const clientId = process.env.MERCADOLIVRE_CLIENT_ID;
    if (!clientId) throw new Error("Configure MERCADOLIVRE_CLIENT_ID na Vercel");
    const url = new URL("https://auth.mercadolivre.com.br/authorization");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", mercadoLivreRedirectUri());
    url.searchParams.set("state", createOAuthState());
    return Response.json({ url: url.toString() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Falha ao iniciar conexao" }, { status: 400 });
  }
}
