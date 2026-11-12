import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-grid";
import { SortSelect } from "@/components/sort-select";
import { getProducts } from "@/lib/data";
import { sortProducts } from "@/lib/sort";

export const metadata: Metadata = { title: "Todas as ofertas", description: "Explore todas as ofertas selecionadas pela Garagem das Ofertas.", alternates: { canonical: "/ofertas" } };
export default async function OffersPage({ searchParams }: { searchParams: Promise<{ ordem?: string }> }) {
  const order = (await searchParams).ordem || "recentes"; const products = sortProducts(await getProducts(), order);
  return <div className="container-site py-8"><div className="flex flex-col gap-4 border-b border-[#dedbd2] pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Catálogo</p><h1 className="text-3xl font-black tracking-[-.04em]">Todas as ofertas</h1><p className="mt-2 text-sm text-[#66635b]">{products.length} {products.length === 1 ? "item encontrado" : "itens encontrados"}</p></div><SortSelect value={order}/></div><div className="mt-6"><ProductGrid products={products}/></div></div>;
}
