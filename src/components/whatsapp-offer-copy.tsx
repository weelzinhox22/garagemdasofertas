"use client";

import { Check, MessageCircle, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ShareProduct = {
  id: string;
  title: string;
  store: string;
  price: number | null;
  oldPrice: number | null;
  affiliateUrl?: string | null;
};

function currency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function offerText(product: ShareProduct, origin: string) {
  const price = product.price === null ? null : Number(product.price);
  const oldPrice = product.oldPrice === null ? null : Number(product.oldPrice);
  const discount = price !== null && oldPrice !== null && oldPrice > price
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : null;

  // Leva direto para a loja / link de afiliado do produto se cadastrado; se não tiver, usa /go/:id
  const directUrl = product.affiliateUrl?.trim();
  const offerLink = directUrl && directUrl.startsWith("http")
    ? directUrl
    : new URL(`/go/${product.id}`, origin).toString();

  return [
    "🚨 *OFERTA ENCONTRADA!*",
    "",
    `🛍️ *${product.title}*`,
    `🏪 ${product.store}`,
    "",
    oldPrice !== null ? `❌ De: ~${currency(oldPrice)}~` : "",
    price !== null ? `🔥 Por: *${currency(price)}*` : "🔥 Confira o preço promocional no link!",
    discount !== null ? `💥 *${discount}% OFF*` : "",
    "",
    "👉 *PEGUE A OFERTA:*",
    offerLink,
    "",
    "⚡ O preço pode mudar a qualquer momento.",
    "🧡 Garagem das Ofertas"
  ].filter(Boolean).join("\n");
}

async function copyText(value: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) throw new Error("copy-failed");
}

export function WhatsAppOfferCopy({ product }: { product: ShareProduct }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function handleCopy() {
    try {
      await copyText(offerText(product, window.location.origin));
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2_500);
  }

  function handleShareDirect() {
    const text = encodeURIComponent(offerText(product, window.location.origin));
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  }

  const Icon = status === "copied" ? Check : status === "error" ? TriangleAlert : MessageCircle;
  const label = status === "copied" ? "Copiado!" : status === "error" ? "Erro" : "Copiar";

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleCopy}
        className="btn !min-h-9 whitespace-nowrap bg-[#147a3d] px-3 py-1 text-white shadow-[0_7px_18px_rgba(20,122,61,.2)] hover:bg-[#106432]"
        title="Copiar mensagem formatada para WhatsApp"
        aria-live="polite"
      >
        <Icon size={16} aria-hidden="true"/>
        {label}
      </button>
      <button
        type="button"
        onClick={handleShareDirect}
        className="btn !min-h-9 whitespace-nowrap border border-[#147a3d] bg-white px-2.5 py-1 text-[#147a3d] hover:bg-[#f0f9f3]"
        title="Abrir diretamente no WhatsApp"
      >
        Enviar
      </button>
    </div>
  );
}
