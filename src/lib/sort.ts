import type { Product } from "@/types";
export function sortProducts(products: Product[], order: string) {
  const list = [...products];
  if (order === "menor-preco") return list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  if (order === "maior-preco") return list.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
  if (order === "popularidade") return list.sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0));
  return list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
