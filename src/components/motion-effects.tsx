"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MotionEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = reduced ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add("is-visible");
          observer?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6%" });

    const reveal = (item: HTMLElement) => {
      if (item.classList.contains("is-visible")) return;
      if (reduced) item.classList.add("is-visible");
      else observer?.observe(item);
    };
    const scan = (root: ParentNode) => {
      if (root instanceof HTMLElement && root.matches("[data-reveal]")) reveal(root);
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(reveal);
    };
    scan(document);

    // O App Router mantem o layout entre paginas. Observamos conteudo novo para
    // que elementos inseridos por navegacao/streaming nunca fiquem em opacity: 0.
    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) scan(node);
      }));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    let frame = 0;
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
      });
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      document.documentElement.style.setProperty("--scroll-progress", `${max > 0 ? (scrollY / max) * 100 : 0}%`);
      document.body.classList.toggle("is-scrolled", scrollY > 280);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      observer?.disconnect();
      mutationObserver.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  return null;
}
