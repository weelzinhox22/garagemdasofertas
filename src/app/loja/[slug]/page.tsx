import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Store } from "lucide-react";
import { ProductGrid } from "@/components/product-grid";
import { SortSelect } from "@/components/sort-select";
import { getProducts } from "@/lib/data";
import { platformBySlug, platforms } from "@/lib/platforms";
import { sortProducts } from "@/lib/sort";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ ordem?: string }> };

export function generateStaticParams() {
  return platforms.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const platform = platformBySlug((await params).slug);
  if (!platform) return {};
  return { title: `Achadinhos ${platform.preposition} ${platform.label}`, description: `Achadinhos e ofertas selecionadas ${platform.preposition} ${platform.label}.`, alternates: { canonical: `/loja/${platform.slug}` } };
}

export default async function PlatformPage({ params, searchParams }: Props) {
  const platform = platformBySlug((await params).slug);
  if (!platform) notFound();
  const order = (await searchParams).ordem || "recentes";
  const products = sortProducts((await getProducts()).filter((product) => product.store === platform.name), order);

  return <div className="container-site py-7"><nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted"><Link href="/">Início</Link><ChevronRight size={13}/><Link href="/ofertas">Ofertas</Link><ChevronRight size={13}/><span aria-current="page">{platform.label}</span></nav><div className="mt-5 flex flex-col gap-4 border-b border-[var(--line)] pb-7 sm:flex-row sm:items-end sm:justify-between" data-reveal><div><div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-[var(--line)]" style={{ background: `${platform.color}22`, color: platform.ink, boxShadow: `0 12px 35px ${platform.color}1f` }}><Store/></div><p className="eyebrow">Curadoria por plataforma</p><h1 className="mt-1 text-4xl font-black leading-none tracking-[-.055em] sm:text-5xl">Achadinhos {platform.preposition} {platform.label}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-muted">{platform.description} Preços e disponibilidade devem ser confirmados na loja.</p></div><SortSelect value={order}/></div><div className="mt-8"><ProductGrid products={products}/></div></div>;
}
