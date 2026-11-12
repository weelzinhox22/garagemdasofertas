"use client";

import { MessageCircle, Send } from "lucide-react";
import { isSafeCommunityUrl, siteConfig } from "@/lib/site-config";

export function CommunityBanner() {
  const whats = isSafeCommunityUrl(siteConfig.community.whatsapp, "whatsapp");
  const telegram = isSafeCommunityUrl(siteConfig.community.telegram, "telegram");
  return (
    <section id="grupos" data-reveal className="community-panel container-site relative my-12 overflow-hidden rounded-2xl border border-orange-500/60 bg-[#17110c] p-6 text-white shadow-[0_18px_45px_var(--shadow)] md:flex md:items-center md:justify-between md:gap-8 md:p-9">
      <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[18px] border-orange-500/20 shadow-[0_0_45px_rgba(255,106,0,.4)]" aria-hidden="true"/>
      <div className="relative"><p className="text-xs font-black uppercase tracking-[.14em] text-orange-400">Comunidade gratuita</p><h2 className="mt-2 text-xl font-black tracking-[-.03em] md:text-2xl">Cupons, quedas de preço e ofertas antes de todo mundo.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">Entre no canal que você já usa. A compra continua sendo feita com segurança na loja de destino.</p><div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-white/70"><span>✓ Sem mensalidade</span><span>✓ Sem cadastro no site</span><span>✓ Saída a qualquer momento</span></div></div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row md:mt-0">
        {whats && <a href={siteConfig.community.whatsapp} target="_blank" rel="noopener noreferrer" className="btn bg-[#176f3b] text-white"><MessageCircle size={18}/>WhatsApp</a>}
        {telegram && <a href={siteConfig.community.telegram} target="_blank" rel="noopener noreferrer" className="btn bg-[#176b98] text-white"><Send size={18}/>Telegram</a>}
        {!whats && !telegram && <button onClick={() => window.dispatchEvent(new Event("open-community"))} className="btn bg-[#ed6d0b] text-white">Ver como entrar</button>}
      </div>
    </section>
  );
}
