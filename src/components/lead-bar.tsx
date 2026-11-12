"use client";

import { MessageCircle } from "lucide-react";
import { isSafeCommunityUrl, siteConfig } from "@/lib/site-config";

export function LeadBar() {
  const whatsapp = isSafeCommunityUrl(siteConfig.community.whatsapp, "whatsapp");
  const href = whatsapp ? siteConfig.community.whatsapp : undefined;
  const content = <><span className="whatsapp-ping absolute inset-0 rounded-full" aria-hidden="true"/><span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#168a45] text-white sm:h-12 sm:w-12"><MessageCircle size={27} strokeWidth={2.4}/></span><span className="hidden pr-4 text-left sm:block"><strong className="block text-sm leading-tight">Entrar no grupo</strong><span className="mt-0.5 block text-[10px] font-bold text-white/65">Ofertas no WhatsApp</span></span></>;
  const className = "whatsapp-float group relative flex items-center rounded-full border border-white/10 bg-[#102c1d] text-white shadow-[0_14px_40px_rgba(0,0,0,.4)]";
  return <div className="fixed bottom-4 right-4 z-30 sm:bottom-6 sm:right-6">{href ? <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label="Entrar no grupo de ofertas no WhatsApp">{content}</a> : <button onClick={() => window.dispatchEvent(new Event("open-community"))} className={className} aria-label="Ver como entrar no grupo de ofertas no WhatsApp">{content}</button>}</div>;
}
