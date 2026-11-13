import { exchangeAuthorizationCode } from "@/lib/mercadolivre";
import { validOAuthState } from "@/lib/oauth-state";

export async function GET(request: Request) {
  const incoming = new URL(request.url);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || incoming.origin;
  const destination = new URL("/painel", appUrl);
  try {
    const code = incoming.searchParams.get("code") || "";
    const state = incoming.searchParams.get("state") || "";
    if (!code || !validOAuthState(state)) throw new Error("Retorno OAuth invalido ou expirado");
    await exchangeAuthorizationCode(code);
    destination.searchParams.set("mercadolivre", "connected");
  } catch (error) {
    destination.searchParams.set("mercadolivre", "error");
    destination.searchParams.set("reason", error instanceof Error ? error.message.slice(0, 160) : "Falha na conexao");
  }
  return Response.redirect(destination);
}
