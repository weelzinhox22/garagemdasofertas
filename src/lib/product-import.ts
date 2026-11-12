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
    if (keys.includes(key) && attrs.content) {
      const decoded = decodeHtml(attrs.content);
      // Ignora respostas genéricas de security check
      if (/security check/i.test(decoded)) continue;
      return decoded;
    }
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

function extractTitleFromUrl(url: URL): string {
  try {
    const pathname = decodeURIComponent(url.pathname);
    // Exemplo Shopee: /Nome-Do-Produto-i.12345.6789 ou /product/123/456
    const segments = pathname.split("/").filter(Boolean);
    for (const segment of segments) {
      if (segment.includes("-i.") || segment.includes("-")) {
        const clean = segment
          .replace(/-i\.\d+\.\d+$/i, "")
          .replace(/[-_]+/g, " ")
          .trim();
        if (clean.length > 5 && !/^(product|item|view|p)$/i.test(clean)) {
          return clean.charAt(0).toUpperCase() + clean.slice(1);
        }
      }
    }
  } catch {
    /* fallback silencioso */
  }
  return "";
}

function extractHtmlTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (!match) return "";
  const title = decodeHtml(match[1]);
  // Ignora telas de bloqueio / anti-bot
  if (/security check|captcha|verify you are human|acesso negado|atenção/i.test(title)) {
    return "";
  }
  // Limpar sufixos comuns como " | Shopee Brasil", " no Mercado Livre", etc.
  return title
    .replace(/\s*\|\s*Shopee.*$/i, "")
    .replace(/\s*\|\s*TikTok.*$/i, "")
    .replace(/\s*no Mercado Livre.*$/i, "")
    .replace(/\s*\|\s*Mercado Livre.*$/i, "")
    .trim();
}

async function fetchMarketplacePage(input: URL) {
  let current = input;
  // WhatsApp crawler UA permite passar pelo bot-guard da Shopee e ler tags OpenGraph/meta
  const crawlerUa = "WhatsApp/2.23.20.76 A";

  for (let redirect = 0; redirect < 8; redirect += 1) {
    assertSafeUrl(current.toString());
    let response: Response;
    try {
      response = await fetch(current, {
        redirect: "manual",
        signal: AbortSignal.timeout(10_000),
        headers: {
          "user-agent": crawlerUa,
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
        }
      });
    } catch {
      break;
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) break;
      try {
        current = assertSafeUrl(new URL(location, current).toString());
        continue;
      } catch {
        break;
      }
    }

    if (!response.ok) break;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) break;
    const size = Number(response.headers.get("content-length") || 0);
    if (size > 3_000_000) break;
    return { html: (await response.text()).slice(0, 3_000_000), finalUrl: current };
  }
  return { html: "", finalUrl: current };
}

export async function inspectMarketplaceProduct(value: string): Promise<ImportedProductDraft> {
  const sourceUrl = assertSafeUrl(value.trim());
  const { html, finalUrl } = await fetchMarketplacePage(sourceUrl);
  const store = detectStore(finalUrl) || detectStore(sourceUrl);
  if (!store) throw new Error("Não foi possível identificar a plataforma.");

  const structured = html ? jsonLdProduct(html) : null;
  const structuredImage = Array.isArray(structured?.image) ? structured?.image[0] : structured?.image;

  let title = decodeHtml(
    String(
      structured?.name ||
      metaContent(html, ["og:title", "twitter:title"]) ||
      extractHtmlTitle(html) ||
      ""
    )
  );

  // Fallback caso a loja bloqueie o HTML do crawler (comum em Shopee e TikTok Shop)
  if (!title) {
    title = extractTitleFromUrl(finalUrl) || extractTitleFromUrl(sourceUrl);
  }

  // Se mesmo assim não achar título da loja (ex: encurtador puro com antibot rígido), define sugestão para não travar
  if (!title) {
    title = `Produto ${store}`;
  }

  const description = decodeHtml(
    String(
      structured?.description ||
      metaContent(html, ["og:description", "description", "twitter:description"]) ||
      ""
    )
  );

  const imageUrl = String(
    structuredImage ||
    metaContent(html, ["og:image", "twitter:image", "twitter:image:src"]) ||
    ""
  );

  let safeImageUrl = "";
  if (imageUrl) {
    try {
      const image = new URL(imageUrl, finalUrl);
      if (image.protocol === "https:") {
        safeImageUrl = image.toString();
      }
    } catch {
      safeImageUrl = "";
    }
  }

  return {
    sourceUrl: sourceUrl.toString(),
    finalUrl: finalUrl.toString(),
    store,
    title: title.slice(0, 180),
    slug: slugify(title),
    description: description.slice(0, 1_500),
    imageUrl: safeImageUrl,
    categorySlug: inferCategory(`${title} ${description}`)
  };
}
