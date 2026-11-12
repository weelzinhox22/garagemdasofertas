"use client";

import Link from "next/link";
import { Menu, Search, Users, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  ["Mercado Livre", "/loja/mercado-livre"], ["Shopee", "/loja/shopee"],
  ["TikTok Shop", "/loja/tiktok-shop"]
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header sticky top-0 z-40 border-b border-[var(--line)] bg-[color:var(--surface-glass)] backdrop-blur-xl">
      <div className="promo-bar bg-[#d85b0b] px-3 py-1.5 text-center text-[10px] font-black tracking-[.08em] text-white sm:text-xs">CUPONS E OFERTAS MAIS BARATAS NOS GRUPOS GRATUITOS</div>
      <div className="container-site flex h-16 items-center justify-between gap-3">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-bold lg:flex" aria-label="Navegação principal">
          {links.map(([label, href]) => <Link key={href} href={href} className="nav-link">{label}</Link>)}
          <Link href="/ofertas" className="nav-link">Todas</Link>
        </nav>
        <div className="flex items-center gap-1">
          <Link href="/buscar" className="icon-button" aria-label="Buscar ofertas"><Search size={21}/></Link>
          <ThemeToggle />
          <button onClick={() => window.dispatchEvent(new Event("open-community"))} className="community-header-cta hidden min-h-11 items-center gap-2 rounded-lg bg-[#176f3b] px-4 text-sm font-black text-white md:inline-flex" aria-label="Entrar na comunidade de ofertas"><Users size={18}/>Grupos de ofertas</button>
          <button onClick={() => window.dispatchEvent(new Event("open-community"))} className="icon-button md:hidden" aria-label="Comunidade de ofertas"><Users size={21}/></button>
          <button onClick={() => setOpen((value) => !value)} className="icon-button lg:hidden" aria-expanded={open} aria-controls="menu-mobile" aria-label={open ? "Fechar menu" : "Abrir menu"}>{open ? <X/> : <Menu/>}</button>
        </div>
      </div>
      {open && <nav id="menu-mobile" className="container-site grid gap-1 border-t border-[var(--line)] py-3 lg:hidden" aria-label="Navegação mobile">
        {[...links, ["Todas as ofertas", "/ofertas"]].map(([label, href]) => <Link onClick={() => setOpen(false)} key={href} href={href} className="rounded-md px-3 py-3 font-bold hover:bg-[var(--soft)]">{label}</Link>)}
        <button onClick={() => { setOpen(false); window.dispatchEvent(new Event("open-community")); }} className="mt-2 min-h-11 rounded-md bg-[#176f3b] px-4 text-left font-black text-white">Entrar nos grupos e receber cupons</button>
      </nav>}
    </header>
  );
}
