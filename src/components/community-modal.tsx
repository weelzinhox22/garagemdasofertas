"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { isSafeCommunityUrl, siteConfig } from "@/lib/site-config";

const STORAGE_KEY = "garagem-community-prompt";
const DAY = 86_400_000;

export function CommunityModal() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const whatsapp = isSafeCommunityUrl(siteConfig.community.whatsapp, "whatsapp");
  const telegram = isSafeCommunityUrl(siteConfig.community.telegram, "telegram");

  const close = useCallback((joined = false) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ until: Date.now() + (joined ? 180 : 30) * DAY, joined }));
    } catch { /* O fechamento continua funcionando quando o navegador bloqueia storage. */ }
    setOpen(false);
    window.dispatchEvent(new Event("community-prompt-dismissed"));
    requestAnimationFrame(() => previousFocus.current?.focus());
  }, []);

  useEffect(() => {
    const onOpen = () => { previousFocus.current = document.activeElement as HTMLElement; setOpen(true); };
    window.addEventListener("open-community", onOpen);
    let shouldOpen = true;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as { until?: number } | null;
      shouldOpen = !saved?.until || saved.until <= Date.now();
    } catch { /* Um valor antigo invalido nao deve bloquear o convite. */ }
    const timer = shouldOpen ? window.setTimeout(onOpen, 4_500) : null;
    return () => {
      window.removeEventListener("open-community", onOpen);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key !== "Tab" || !dialog.current) return;
      const nodes = Array.from(dialog.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute("disabled"));
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, close]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-3" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="community-title" aria-describedby="community-description" className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#fff1de] text-[#a9460c]"><MessageCircle/></div>
          <button ref={closeButton} onClick={() => close()} className="grid h-11 w-11 place-items-center rounded-md hover:bg-[#f6f5f1]" aria-label="Fechar"><X/></button>
        </div>
        <p className="mt-5 text-xs font-black uppercase tracking-[.14em] text-[#d85b0b]">Economize antes de comprar</p>
        <h2 id="community-title" className="mt-2 text-2xl font-black leading-tight tracking-[-.04em]">Cupons e ofertas mais baratas direto no celular</h2>
        <p id="community-description" className="mt-3 text-sm leading-6 text-[var(--muted)]">Entre gratuitamente e receba achadinhos, cupons e quedas de preço antes de perder a oportunidade.</p>
        <ul className="mt-4 grid gap-2 text-xs font-bold text-[var(--muted)]"><li>✓ Sem mensalidade ou cadastro no site</li><li>✓ WhatsApp e Telegram disponíveis</li><li>✓ Você pode sair quando quiser</li></ul>
        <div className="mt-6 grid gap-2">
          {whatsapp ? <a onClick={() => close(true)} href={siteConfig.community.whatsapp} target="_blank" rel="noopener noreferrer" className="btn bg-[#168a45] text-white"><MessageCircle size={19}/>Entrar no grupo do WhatsApp</a> : <button disabled className="btn cursor-not-allowed bg-[#e6e6e3] text-[#777]" title="Configure o link no arquivo .env"><MessageCircle size={19}/>WhatsApp em configuração</button>}
          {telegram ? <a onClick={() => close(true)} href={siteConfig.community.telegram} target="_blank" rel="noopener noreferrer" className="btn bg-[#1976a8] text-white"><Send size={18}/>Entrar no Telegram</a> : <button disabled className="btn cursor-not-allowed bg-[#e6e6e3] text-[#777]" title="Configure o link no arquivo .env"><Send size={18}/>Telegram em configuração</button>}
          <button onClick={() => close()} className="min-h-11 text-sm font-bold text-[#66635b] underline decoration-[#bbb] underline-offset-4">Prefiro ver as ofertas</button>
        </div>
      </div>
    </div>
  );
}
