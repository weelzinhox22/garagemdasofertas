"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchForm({ initial = "", compact = false }: { initial?: string; compact?: boolean }) {
  const [query, setQuery] = useState(initial);
  const router = useRouter();
  function submit(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/buscar?q=${encodeURIComponent(value)}` : "/buscar");
  }
  return <form onSubmit={submit} role="search" className="relative w-full">
    <label htmlFor={compact ? "search-compact" : "search-main"} className="sr-only">Buscar ofertas</label>
    <input id={compact ? "search-compact" : "search-main"} value={query} onChange={(e) => setQuery(e.target.value)} className={`field pr-12 ${compact ? "bg-[#f6f5f1]" : "min-h-12"}`} placeholder="O que você está procurando?"/>
    <button className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-md bg-[#181713] text-white" aria-label="Buscar"><Search size={19}/></button>
  </form>;
}
