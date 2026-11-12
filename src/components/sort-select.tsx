"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  return <label className="flex items-center gap-2 text-sm font-bold">Ordenar
    <select value={value} onChange={(e) => { const next = new URLSearchParams(params); next.set("ordem", e.target.value); router.push(`${pathname}?${next}`); }} className="field !w-auto !min-h-10 py-2">
      <option value="recentes">Mais recentes</option><option value="menor-preco">Menor preço</option><option value="maior-preco">Maior preço</option><option value="popularidade">Popularidade interna</option>
    </select>
  </label>;
}
