import Link from "next/link";
import { ArrowUpRight, Tag } from "lucide-react";
import type { Product } from "@/types";
import { platformByName } from "@/lib/platforms";
import { ProductImage } from "@/components/product-image";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ProductCard({ product }: { product: Product }) {
  const platform = platformByName(product.store);
  const validDiscount = product.price !== null && product.oldPrice !== null && product.oldPrice > product.price;
  const discount = validDiscount ? Math.round((1 - product.price! / product.oldPrice!) * 100) : null;
  return (
    <article className="product-card group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
      <Link href={`/produto/${product.slug}`} className="product-media relative aspect-square overflow-hidden bg-[var(--soft)]">
        <ProductImage src={product.imageUrl} alt={product.title} categorySlug={product.categorySlug} className="product-image object-cover"/>
        <span className="product-sheen absolute inset-0" aria-hidden="true"/>
        {(product.featured || discount) && <span className="absolute left-2.5 top-2.5 rounded-full border border-white/15 bg-[#181713]/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur-sm">{discount ? `-${discount}%` : "Destaque"}</span>}
        {product.demo && <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-[#57534c] backdrop-blur-sm">Demonstração</span>}
        <span className="quick-view absolute bottom-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-full bg-[#17120e] text-white" aria-hidden="true"><ArrowUpRight size={16}/></span>
      </Link>
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider" style={{ color: platform?.ink || "var(--muted)" }}><span className="h-2 w-2 rounded-full" style={{ background: platform?.color || "var(--muted)" }}/><Tag size={11}/>{product.store}</div>
        <h3 className="mt-2 line-clamp-2 text-sm font-extrabold leading-5 tracking-[-.02em] sm:text-[15px]"><Link href={`/produto/${product.slug}`}>{product.title}</Link></h3>
        <div className="mt-3 min-h-11">
          {product.price !== null ? <><div className="text-lg font-black">{currency.format(product.price)}</div>{validDiscount && <div className="text-xs text-[#777] line-through">{currency.format(product.oldPrice!)}</div>}</> : <p className="text-xs leading-5 text-[#777]">Preço disponível na loja</p>}
        </div>
        {product.affiliateUrl ? <a href={`/go/${product.id}`} target="_blank" rel="sponsored noopener" className="btn product-button btn-primary mt-3 w-full px-2 text-xs sm:text-sm">Ver oferta <ArrowUpRight size={16}/></a> : <Link href={`/produto/${product.slug}`} className="btn product-button mt-3 w-full border border-[var(--line)] px-2 text-xs sm:text-sm">Ver detalhes <ArrowUpRight size={15}/></Link>}
      </div>
    </article>
  );
}
