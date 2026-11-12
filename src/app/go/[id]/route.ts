import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_HOSTS = ["shopee.com.br", "shope.ee", "amazon.com.br", "mercadolivre.com.br", "mercadolivre.com", "meli.la", "amzn.to", "s.shopee.com.br", "shop.tiktok.com", "tiktok.com", "vt.tiktok.com"];
function safeDestination(value: string) {
  try { const url = new URL(value); return url.protocol === "https:" && ALLOWED_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)) ? url : null; } catch { return null; }
}
function sourceFrom(request: NextRequest) {
  const source = (request.nextUrl.searchParams.get("utm_source") || "direct").toLowerCase();
  const allowed = ["tiktok_1", "tiktok_2", "pinterest", "instagram", "direct"];
  return allowed.includes(source) ? source : "other";
}
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const product = await getProductById((await params).id);
  if (!product?.affiliateUrl) return NextResponse.redirect(new URL("/ofertas?erro=destino-indisponivel", request.url), 307);
  const destination = safeDestination(product.affiliateUrl);
  if (!destination) return NextResponse.redirect(new URL("/ofertas?erro=destino-invalido", request.url), 307);
  const campaign = request.nextUrl.searchParams.get("utm_campaign")?.slice(0, 100) || null;
  const dedupeKey = `gd_click_${product.id}`; const duplicate = request.cookies.get(dedupeKey)?.value === "1";
  if (!duplicate && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try { const supabase = createAdminClient(); await supabase.from("product_clicks").insert({ product_id: product.id, store: product.store, traffic_source: sourceFrom(request), campaign }); } catch { /* O redirecionamento não depende da telemetria. */ }
  }
  const response = NextResponse.redirect(destination, 307); response.cookies.set(dedupeKey, "1", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60, path: "/go" }); return response;
}
