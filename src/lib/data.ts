import { cache } from "react";
import { categories as fallbackCategories, demoProducts } from "@/lib/demo-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Category, Product } from "@/types";

type DbProduct = {
  id: string; slug: string; title: string; description: string | null; category_slug: string;
  store: Product["store"]; image_url: string; price: number | null; old_price: number | null;
  affiliate_url: string | null; featured: boolean; active: boolean; created_at: string;
};

const localProductImages = new Set([
  "/products/fone-catalogo.webp",
  "/products/furadeira-catalogo.webp",
  "/products/hub-catalogo.webp",
  "/products/kit-catalogo.webp",
  "/products/organizador-catalogo.webp",
  "/products/suporte-catalogo.webp"
]);

function imageSource(value: string) {
  if (value.startsWith("/")) return value;
  try {
    const url = new URL(value);
    // O banco exige HTTPS, mas estes arquivos pertencem ao proprio app. Entregar
    // o caminho local evita que o otimizador do Next os trate como host remoto.
    if (localProductImages.has(url.pathname)) return url.pathname;
  } catch { /* A validacao do cadastro continua sendo a fonte de verdade. */ }
  return value;
}

const mapProduct = (row: DbProduct): Product => ({
  id: row.id, slug: row.slug, title: row.title, description: row.description || "",
  categorySlug: row.category_slug, store: row.store, imageUrl: imageSource(row.image_url),
  price: row.price === null ? null : Number(row.price), oldPrice: row.old_price === null ? null : Number(row.old_price),
  affiliateUrl: row.affiliate_url, featured: row.featured, active: row.active, createdAt: row.created_at
});

export const getProducts = cache(async (): Promise<Product[]> => {
  if (!isSupabaseConfigured()) return demoProducts;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false });
    if (error) throw error;
    return (data as DbProduct[]).map(mapProduct);
  } catch { return demoProducts; }
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured()) return fallbackCategories;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("id,slug,name,description,icon").eq("active", true).order("position");
    if (error) throw error;
    return data as Category[];
  } catch { return fallbackCategories; }
});

export async function getProductBySlug(slug: string) {
  return (await getProducts()).find((product) => product.slug === slug) || null;
}

export async function getProductById(id: string) {
  return (await getProducts()).find((product) => product.id === id) || null;
}
