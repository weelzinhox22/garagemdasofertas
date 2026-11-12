import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";
import { platforms } from "@/lib/platforms";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const base = ["", "/ofertas", "/comunidade", "/sobre", "/contato", "/privacidade", "/termos"].map((path) => ({ url: `${siteConfig.url}${path}`, changeFrequency: "daily" as const }));
  return [...base, ...platforms.map((item) => ({ url: `${siteConfig.url}/loja/${item.slug}`, changeFrequency: "daily" as const })), ...categories.map((item) => ({ url: `${siteConfig.url}/categoria/${item.slug}`, changeFrequency: "daily" as const })), ...products.filter((p) => !p.demo).map((item) => ({ url: `${siteConfig.url}/produto/${item.slug}`, lastModified: item.createdAt, changeFrequency: "daily" as const }))];
}
