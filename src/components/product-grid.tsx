import type { Product } from "@/types";
import { ProductCard } from "@/components/product-card";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) return <div className="surface py-14 text-center"><p className="font-black">Nenhuma oferta por aqui ainda.</p><p className="mt-2 text-sm text-[#66635b]">Volte em breve ou explore outra categoria.</p></div>;
  return <div className="product-grid grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div>;
}
