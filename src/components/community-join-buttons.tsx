"use client";

import { MessageCircle, Send } from "lucide-react";
import { isSafeCommunityUrl, siteConfig } from "@/lib/site-config";

export function CommunityJoinButtons({ stacked = false }: { stacked?: boolean }) {
  const whatsapp = isSafeCommunityUrl(siteConfig.community.whatsapp, "whatsapp");
  const telegram = isSafeCommunityUrl(siteConfig.community.telegram, "telegram");
  const classes = stacked ? "grid gap-3" : "flex flex-col gap-3 sm:flex-row";

  if (!whatsapp && !telegram) {
    return <div className={classes}><button onClick={() => window.dispatchEvent(new Event("open-community"))} className="btn bg-[#ed6d0b] text-white">Canais em configuração</button><p className="self-center text-xs text-white/55">Os links reais serão liberados aqui.</p></div>;
  }

  return <div className={classes}>{whatsapp && <a href={siteConfig.community.whatsapp} target="_blank" rel="noopener noreferrer" className="btn bg-[#159447] text-white"><MessageCircle size={19}/>Entrar no WhatsApp</a>}{telegram && <a href={siteConfig.community.telegram} target="_blank" rel="noopener noreferrer" className="btn bg-[#1976a8] text-white"><Send size={18}/>Entrar no Telegram</a>}</div>;
}
