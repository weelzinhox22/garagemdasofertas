import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { inspectMarketplaceProduct } from "@/lib/product-import";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TelegramMessage = {
  chat?: { id?: number };
  from?: { id?: number };
  text?: string;
};

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
};

const helpText = [
  "Comandos da Garagem das Ofertas:",
  "/adicionar <link> — importa e publica um produto",
  "/remover <slug ou UUID> — desativa um produto",
  "/listar — mostra os 10 produtos ativos mais recentes",
  "/ajuda — exibe esta ajuda"
].join("\n");

function safeEqual(received: string, expected: string) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function authorizedUser(userId: number | undefined) {
  if (userId === undefined) return false;
  const allowed = (process.env.TELEGRAM_ADMIN_USER_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allowed.includes(String(userId));
}

async function sendMessage(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Telegram nao configurado");
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true })
  });
  if (!response.ok) throw new Error("Falha ao responder pelo Telegram");
}

async function uniqueSlug(base: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("products").select("id").eq("slug", base).maybeSingle();
  return data ? `${base.slice(0, 100)}-${Date.now().toString(36)}` : base;
}

async function addProduct(url: string) {
  const draft = await inspectMarketplaceProduct(url);
  if (!draft.imageUrl) throw new Error("A loja nao forneceu uma imagem segura. Use o painel para completar o cadastro.");

  const slug = await uniqueSlug(draft.slug);
  const { error } = await createAdminClient().from("products").insert({
    slug,
    title: draft.title,
    description: draft.description,
    category_slug: draft.categorySlug,
    store: draft.store,
    image_url: draft.imageUrl,
    affiliate_url: draft.sourceUrl,
    price: null,
    old_price: null,
    featured: false,
    active: true
  });
  if (error) throw new Error("Nao foi possivel salvar o produto no Supabase.");
  return `Produto publicado:\n${draft.title}\nSlug: ${slug}\nLoja: ${draft.store}`;
}

async function removeProduct(identifier: string) {
  const admin = createAdminClient();
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!uuid.test(identifier) && !slug.test(identifier)) throw new Error("Informe um slug ou UUID valido.");

  const query = admin.from("products").update({ active: false }).select("title");
  const { data, error } = uuid.test(identifier)
    ? await query.eq("id", identifier).maybeSingle()
    : await query.eq("slug", identifier).maybeSingle();
  if (error) throw new Error("Nao foi possivel desativar o produto.");
  if (!data) return "Nenhum produto encontrado com esse identificador.";
  return `Produto desativado: ${data.title}`;
}

async function listProducts() {
  const { data, error } = await createAdminClient()
    .from("products")
    .select("title,slug,store")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw new Error("Nao foi possivel listar os produtos.");
  if (!data?.length) return "Nenhum produto ativo cadastrado.";
  return ["Produtos ativos mais recentes:", ...data.map((item, index) => `${index + 1}. ${item.title}\n   ${item.store} · ${item.slug}`)].join("\n");
}

async function executeCommand(text: string) {
  const [rawCommand, ...parts] = text.trim().split(/\s+/);
  const command = rawCommand.toLowerCase().replace(/@[^\s]+$/, "");
  const argument = parts.join(" ").trim();

  if (command === "/adicionar") {
    if (!argument) return "Envie assim: /adicionar https://link-do-produto";
    return addProduct(argument);
  }
  if (command === "/remover") {
    if (!argument) return "Envie assim: /remover slug-do-produto";
    return removeProduct(argument.toLowerCase());
  }
  if (command === "/listar") return listProducts();
  return helpText;
}

export async function POST(request: Request) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET || "";
  const receivedSecret = request.headers.get("x-telegram-bot-api-secret-token") || "";
  if (!expectedSecret || !safeEqual(receivedSecret, expectedSecret)) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 100_000) return Response.json({ ok: false }, { status: 413 });

  let update: TelegramUpdate;
  try {
    update = JSON.parse(await request.text()) as TelegramUpdate;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const message = update.message;
  if (!authorizedUser(message?.from?.id)) return Response.json({ ok: true });
  if (!Number.isSafeInteger(update.update_id) || !Number.isSafeInteger(message?.chat?.id)) {
    return Response.json({ ok: true });
  }

  const admin = createAdminClient();
  const { error: replayError } = await admin.from("telegram_updates").insert({ update_id: update.update_id });
  if (replayError?.code === "23505") return Response.json({ ok: true });
  if (replayError) return Response.json({ ok: false }, { status: 503 });

  const chatId = message?.chat?.id as number;
  try {
    const text = (message?.text || "").slice(0, 4_096);
    const response = await executeCommand(text);
    await sendMessage(chatId, response);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Falha inesperada.";
    try { await sendMessage(chatId, `Nao foi possivel concluir: ${reason}`); } catch { /* Telegram repetiria a atualizacao; evitamos operacoes duplicadas. */ }
  }

  return Response.json({ ok: true });
}
