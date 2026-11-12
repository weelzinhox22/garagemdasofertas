import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { SortSelect } from "@/components/sort-select";
import { getCategories, getProducts } from "@/lib/data";
import { sortProducts } from "@/lib/sort";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ ordem?: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const category = (await getCategories()).find((item) => item.slug === slug); if (!category) return {};
  return { title: category.name, description: category.description, alternates: { canonical: `/categoria/${slug}` } };
}
export async function generateStaticParams() { return (await getCategories()).map(({ slug }) => ({ slug })); }
export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params; const order = (await searchParams).ordem || "recentes";
  const [categories, allProducts] = await Promise.all([getCategories(), getProducts()]);
  const category = categories.find((item) => item.slug === slug); if (!category) notFound();
  const products = sortProducts(allProducts.filter((item) => item.categorySlug === slug), order);
  return <div className="container-site py-7"><nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-[#66635b]"><Link href="/">Início</Link><ChevronRight size={13}/><Link href="/ofertas">Ofertas</Link><ChevronRight size={13}/><span aria-current="page">{category.name}</span></nav><div className="mt-5 flex flex-col gap-4 border-b border-[#dedbd2] pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Categoria</p><h1 className="text-3xl font-black tracking-[-.04em]">{category.name}</h1><p className="mt-2 max-w-xl text-sm text-[#66635b]">{category.description}</p></div><SortSelect value={order}/></div><div className="mt-6"><ProductGrid products={products}/></div></div>;
}
