"use client";

import { useState } from "react";

const fallbacks: Record<string, string> = {
  ferramentas: "/products/furadeira-catalogo.webp",
  eletronicos: "/products/fone-catalogo.webp",
  informatica: "/products/hub-catalogo.webp",
  automotivo: "/products/suporte-catalogo.webp",
  "casa-e-cozinha": "/products/organizador-catalogo.webp",
  acessorios: "/products/kit-catalogo.webp",
  utilidades: "/products/kit-catalogo.webp"
};

function safeSource(value: string, fallback: string) {
  if (value.startsWith("/")) return value;
  try { return new URL(value).protocol === "https:" ? value : fallback; }
  catch { return fallback; }
}

export function ProductImage({ src, alt, categorySlug, priority = false, className = "" }: {
  src: string;
  alt: string;
  categorySlug: string;
  priority?: boolean;
  className?: string;
}) {
  const fallback = fallbacks[categorySlug] || fallbacks.utilidades;
  const source = safeSource(src, fallback);
  return <ResilientImage key={`${source}:${fallback}`} src={source} fallback={fallback} alt={alt} priority={priority} className={className} />;
}

function ResilientImage({ src, fallback, alt, priority, className }: {
  src: string;
  fallback: string;
  alt: string;
  priority: boolean;
  className: string;
}) {
  const [current, setCurrent] = useState(src);

  // A URL externa e intencional: permite imagens de CDNs de qualquer marketplace.
  // eslint-disable-next-line @next/next/no-img-element
  return <img
    src={current}
    alt={alt}
    loading={priority ? "eager" : "lazy"}
    fetchPriority={priority ? "high" : "auto"}
    decoding="async"
    referrerPolicy="no-referrer"
    onError={() => { if (current !== fallback) setCurrent(fallback); }}
    className={`absolute inset-0 h-full w-full ${className}`}
  />;
}
