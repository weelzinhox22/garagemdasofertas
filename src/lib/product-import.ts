import "server-only";
import type { Store } from "@/types";

export type ImportedProductDraft = {
  sourceUrl: string;
  finalUrl: string;
  store: Store;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  categorySlug: string;
};

const platformHosts: { store: Store; hosts: string[] }[] = [
  { store: "Mercado Livre", hosts: ["mercadolivre.com.br", "mercadolivre.com", "meli.la", "mlstatic.com"] },
  { store: "Shopee", hosts: ["shopee.com.br", "shopee.com", "shope.ee", "s.shopee.com.br"] },
  { store: "TikTok Shop", hosts: ["shop.tiktok.com", "tiktok.com", "vt.tiktok.com"] }
];

function hostMatches(hostname: string, allowed: string) {
  return hostname === allowed || hostname.endsWith(`.${allowed}`);
}

function detectStore(url: URL): Store | null {
  return platformHosts.find((platform) => platform.hosts.some((host) => hostMatches(url.hostname.toLowerCase(), host)))?.store || null;
}

function assertSafeUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !detectStore(url)) throw new Error("Use um link do Mercado Livre, Shopee ou TikTok Shop.");
  if (url.username || url.password) throw new Error("O link não pode conter credenciais.");
  return url;
}

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ").trim();
}

function metaContent(html: string, keys: string[]) {
  const tags = html.match(/<meta\s+[^>]*>/gi) || [];
  for (const tag of tags) {
    const attrs: Record<string, string> = {};
    for (const match of tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/gi)) attrs[match[1].toLowerCase()] = match[2];
    const key = (attrs.property || attrs.name || attrs.itemprop || "").toLowerCase();
    if (keys.includes(key) && attrs.content) return decodeHtml(attrs.content);
  }
  return "";
}

function jsonLdProduct(html: string): Record<string, unknown> | null {
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];
  const findProduct = (value: unknown): Record<string, unknown> | null => {
    if (!value || typeof value !== "object") return null;
    if (Array.isArray(value)) { for (const item of value) { const product = findProduct(item); if (product) return product; } return null; }
    const record = value as Record<string, unknown>;
    if (record["@type"] === "Product" || (Array.isArray(record["@type"]) && record["@type"].includes("Product"))) return record;
    for (const nested of [record["@graph"], record.mainEntity, record.item]) { const product = findProduct(nested); if (product) return product; }
    return null;
  };
  for (const script of scripts) {
    try {
      const raw = script.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "").trim();
      const product = findProduct(JSON.parse(raw));
      if (product) return product;
    } catch { /* Sites frequentemente incluem blocos JSON-LD não padronizados. */ }
  }
  return null;
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 110) || `oferta-${Date.now()}`;
}

function inferCategory(text: string) {
  const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const rules: [string, string[]][] = [
    ["ferramentas", ["furadeira", "parafusadeira", "martelo", "chave", "serra", "ferramenta"]],
    ["eletronicos", ["fone", "smartwatch", "caixa de som", "camera", "eletronico"]],
    ["informatica", ["mouse", "teclado", "notebook", "usb", "hub", "monitor", "ssd"]],
    ["automotivo", ["carro", "automotivo", "veicular", "pneu", "moto"]],
    ["casa-e-cozinha", ["cozinha", "panela", "air fryer", "cafeteira", "casa", "organizador"]],
    ["acessorios", ["bolsa", "relogio", "oculos", "colar", "pulseira"]]
  ];
  return rules.find(([, terms]) => terms.some((term) => normalized.includes(term)))?.[0] || "utilidades";
}

async function fetchMarketplacePage(input: URL) {
  let current = input;
  for (let redirect = 0; redirect < 5; redirect += 1) {
    assertSafeUrl(current.toString());
    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(9_000),
      headers: { "user-agent": "Mozilla/5.0 (compatible; GaragemDasOfertas/1.0)", accept: "text/html,application/xhtml+xml" }
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("A loja retornou um redirecionamento inválido.");
      current = assertSafeUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) throw new Error("A loja não permitiu ler os dados desse produto.");
    if (!(response.headers.get("content-type") || "").includes("text/html")) throw new Error("O link não aponta para uma página de produto.");
    const size = Number(response.headers.get("content-length") || 0);
    if (size > 2_500_000) throw new Error("A página retornada é muito grande para importação automática.");
    return { html: (await response.text()).slice(0, 2_500_000), finalUrl: current };
  }
  throw new Error("O link passou por redirecionamentos demais.");
}

export async function inspectMarketplaceProduct(value: string): Promise<ImportedProductDraft> {
  const sourceUrl = assertSafeUrl(value.trim());
  const { html, finalUrl } = await fetchMarketplacePage(sourceUrl);
  const store = detectStore(finalUrl);
  if (!store) throw new Error("Não foi possível identificar a plataforma.");
  const structured = jsonLdProduct(html);
  const structuredImage = Array.isArray(structured?.image) ? structured?.image[0] : structured?.image;
  const title = decodeHtml(String(structured?.name || metaContent(html, ["og:title", "twitter:title"]) || ""));
  const description = decodeHtml(String(structured?.description || metaContent(html, ["og:description", "description", "twitter:description"]) || ""));
  const imageUrl = String(structuredImage || metaContent(html, ["og:image", "twitter:image", "twitter:image:src"]) || "");
  if (!title) throw new Error("A loja não disponibilizou o título automaticamente. Cadastre o produto manualmente.");
  if (imageUrl) { const image = new URL(imageUrl, finalUrl); if (image.protocol !== "https:") throw new Error("A imagem retornada pela loja não é segura."); }
  return {
    sourceUrl: sourceUrl.toString(), finalUrl: finalUrl.toString(), store, title: title.slice(0, 180),
    slug: slugify(title), description: description.slice(0, 1_500), imageUrl: imageUrl ? new URL(imageUrl, finalUrl).toString() : "",
    categorySlug: inferCategory(`${title} ${description}`)
  };
}
