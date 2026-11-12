import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-grid";
import { SearchForm } from "@/components/search-form";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Buscar ofertas", robots: { index: false, follow: true } };
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q?.trim() || ""; const [products, categories] = await Promise.all([getProducts(), getCategories()]); const needle = normalize(query);
  const results = query ? products.filter((product) => { const category = categories.find((item) => item.slug === product.categorySlug)?.name || ""; return normalize(`${product.title} ${product.description} ${category} ${product.store}`).includes(needle); }) : [];
  return <div className="container-site min-h-[55vh] py-8"><div className="mx-auto max-w-2xl"><p className="eyebrow">Busca local</p><h1 className="mb-5 text-3xl font-black tracking-[-.04em]">Encontre uma oferta</h1><SearchForm initial={query}/></div>{query && <section className="mt-9"><h2 className="mb-5 font-black">{results.length ? `${results.length} resultado${results.length > 1 ? "s" : ""} para “${query}”` : `Nenhum resultado para “${query}”`}</h2><ProductGrid products={results}/></section>}{!query && <p className="mt-10 text-center text-sm text-[#66635b]">Busque por produto, descrição ou categoria.</p>}</div>;
}
