import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-orange-900/60 bg-[#0d0b09] text-white">
      <div className="container-site grid gap-9 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div><Logo/><p className="mt-4 max-w-sm text-sm leading-6 text-white/65">Curadoria de achadinhos e promoções. Preços e disponibilidade são confirmados na loja de destino.</p></div>
        <div><h2 className="font-black">Institucional</h2><nav className="mt-3 grid gap-2 text-sm text-white/70"><Link href="/sobre">Sobre o projeto</Link><Link href="/contato">Contato</Link><Link href="/privacidade">Política de Privacidade</Link><Link href="/termos">Termos de Uso</Link></nav></div>
        <div><h2 className="font-black">Transparência</h2><p className="mt-3 text-sm leading-6 text-white/70">Alguns links podem gerar comissão para o projeto, sem custo adicional para você. Sempre indicamos quando um destino é patrocinado.</p></div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50">© {new Date().getFullYear()} Garagem das Ofertas · Economia real começa com informação rápida.</div>
    </footer>
  );
}
