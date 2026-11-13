"use client";

import { MessageCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { isSafeCommunityUrl, siteConfig } from "@/lib/site-config";

export function LeadBar() {
  const [showNudge, setShowNudge] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const whatsapp = isSafeCommunityUrl(siteConfig.community.whatsapp, "whatsapp");
  const href = whatsapp ? siteConfig.community.whatsapp : undefined;

  const scheduleNudge = useCallback(() => {
    try {
      if (sessionStorage.getItem("garagem-whatsapp-nudge")) return;
      sessionStorage.setItem("garagem-whatsapp-nudge", "1");
    } catch { /* Em modo privado, a dica ainda pode aparecer sem persistencia. */ }
    showTimer.current = setTimeout(() => setShowNudge(true), 1_600);
    hideTimer.current = setTimeout(() => setShowNudge(false), 7_600);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("garagem-community-prompt") || "null") as { until?: number } | null;
      if (saved?.until && saved.until > Date.now()) scheduleNudge();
    } catch { /* O botao continua disponivel mesmo sem armazenamento. */ }
    window.addEventListener("community-prompt-dismissed", scheduleNudge);
    return () => {
      window.removeEventListener("community-prompt-dismissed", scheduleNudge);
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [scheduleNudge]);

  const content = <><span className="whatsapp-ping absolute inset-0 rounded-full" aria-hidden="true"/><span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#168a45] text-white sm:h-12 sm:w-12"><MessageCircle size={27} strokeWidth={2.4}/></span><span className="hidden pr-4 text-left sm:block"><strong className="block text-sm leading-tight">Entrar no grupo</strong><span className="mt-0.5 block text-[10px] font-bold text-white/65">Ofertas no WhatsApp</span></span></>;
  const className = "whatsapp-float group relative flex items-center rounded-full border border-white/10 bg-[#102c1d] text-white shadow-[0_14px_40px_rgba(0,0,0,.4)]";
  return <div className="fixed bottom-4 right-4 z-30 sm:bottom-6 sm:right-6"><div aria-hidden="true" className={`absolute bottom-[calc(100%+.65rem)] right-0 w-max max-w-[13rem] rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--ink)] shadow-xl transition duration-300 ${showNudge ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}>Cupons e ofertas no WhatsApp<span className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-[var(--line)] bg-[var(--surface)]"/></div>{href ? <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label="Entrar no grupo de ofertas no WhatsApp">{content}</a> : <button onClick={() => window.dispatchEvent(new Event("open-community"))} className={className} aria-label="Ver como entrar no grupo de ofertas no WhatsApp">{content}</button>}</div>;
}
