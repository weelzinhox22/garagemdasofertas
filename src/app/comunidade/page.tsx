import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BellRing, CheckCircle2, ExternalLink, Search, TicketPercent } from "lucide-react";
import { CommunityJoinButtons } from "@/components/community-join-buttons";

export const metadata: Metadata = {
  title: "Grupos gratuitos de ofertas e cupons",
  description: "Entre nos grupos gratuitos da Garagem das Ofertas e receba cupons, quedas de preço e achadinhos no celular.",
  alternates: { canonical: "/comunidade" }
};

const steps = [
  { icon: Search, title: "A gente garimpa", text: "A Garagem organiza achadinhos e oportunidades de diferentes categorias." },
  { icon: BellRing, title: "Você recebe primeiro", text: "Cupons e quedas de preço chegam pelo WhatsApp ou Telegram." },
  { icon: ExternalLink, title: "Você decide", text: "Confira os detalhes e compre diretamente na loja de destino." }
];

export default function CommunityPage() {
  return <>
    <section className="relative isolate overflow-hidden bg-[#090705] text-white">
      <div className="absolute inset-0 -z-20 bg-cover bg-[76%_center] opacity-55" style={{ backgroundImage: "url('/brand/hero-garagem-neon.png')" }}/>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,6,4,.98),rgba(8,6,4,.82)_55%,rgba(8,6,4,.28))]"/>
      <div className="container-site grid min-h-[560px] items-center py-12 lg:grid-cols-[.7fr_1fr]">
        <div className="max-w-xl"><Image src="/brand/logo-neon.png" alt="Garagem das Ofertas" width={112} height={112} priority className="h-24 w-24 rounded-full shadow-[0_0_32px_rgba(255,112,0,.35)]"/><p className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-orange-400"><TicketPercent size={16}/>Comunidade gratuita</p><h1 className="mt-3 text-4xl font-black leading-[.96] tracking-[-.055em] sm:text-5xl">Pague menos sem passar o dia procurando.</h1><p className="mt-5 text-lg leading-8 text-white/70">Receba cupons, ofertas selecionadas e quedas de preço direto no celular. Entre grátis e escolha somente o que fizer sentido para você.</p><div className="mt-7"><CommunityJoinButtons/></div><p className="mt-4 text-xs text-white/50">Sem mensalidade. Sem pedir seu telefone no site. Saia quando quiser.</p></div>
      </div>
    </section>

    <section className="container-site py-12"><div className="text-center"><p className="eyebrow">Simples e transparente</p><h2 className="section-title mt-2">Como funciona</h2></div><div className="mt-7 grid gap-4 md:grid-cols-3">{steps.map(({ icon: Icon, title, text }, index) => <article key={title} className="surface p-5"><div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-lg bg-orange-500/12 text-[var(--accent-strong)]"><Icon/></span><span className="text-3xl font-black text-[var(--line)]">0{index + 1}</span></div><h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{text}</p></article>)}</div></section>

    <section className="container-site pb-12"><div className="grid gap-7 rounded-xl border border-orange-500/50 bg-[#17110c] p-6 text-white md:grid-cols-[1fr_.7fr] md:items-center md:p-8"><div><p className="text-xs font-black uppercase tracking-[.14em] text-orange-400">O que você encontra</p><h2 className="mt-2 text-2xl font-black tracking-[-.035em]">Mais oportunidade, menos ruído.</h2><ul className="mt-5 grid gap-3 text-sm text-white/75"><li className="flex gap-2"><CheckCircle2 className="shrink-0 text-orange-400" size={19}/>Cupons e promoções quando estiverem realmente disponíveis.</li><li className="flex gap-2"><CheckCircle2 className="shrink-0 text-orange-400" size={19}/>Achadinhos de ferramentas, eletrônicos, casa, automotivo e mais.</li><li className="flex gap-2"><CheckCircle2 className="shrink-0 text-orange-400" size={19}/>Links que levam diretamente à loja responsável pela venda.</li></ul></div><div><CommunityJoinButtons stacked/><Link href="/ofertas" className="mt-4 flex min-h-11 items-center justify-center text-sm font-bold text-white/65 underline underline-offset-4">Prefiro explorar o catálogo</Link></div></div></section>
  </>;
}
