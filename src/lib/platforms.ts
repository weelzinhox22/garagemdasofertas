import type { Store } from "@/types";

export const platforms: { slug: string; name: Store; label: string; preposition: "no" | "na"; description: string; color: string; ink: string }[] = [
  { slug: "mercado-livre", name: "Mercado Livre", label: "Mercado Livre", preposition: "no", description: "Ferramentas, casa, eletrônicos e utilidades.", color: "#ffe600", ink: "#756100" },
  { slug: "shopee", name: "Shopee", label: "Shopee", preposition: "na", description: "Achadinhos, acessórios e itens para o dia a dia.", color: "#ee4d2d", ink: "#bd351d" },
  { slug: "tiktok-shop", name: "TikTok Shop", label: "TikTok Shop", preposition: "no", description: "Produtos em alta descobertos nos vídeos.", color: "#25f4ee", ink: "#007b78" }
];

export function platformBySlug(slug: string) {
  return platforms.find((platform) => platform.slug === slug);
}

export function platformByName(name: Store) {
  return platforms.find((platform) => platform.name === name);
}
