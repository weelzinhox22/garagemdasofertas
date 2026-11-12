import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2" aria-label="Garagem das Ofertas — início">
      <Image src="/brand/logo-neon.png" alt="" width={44} height={44} priority className="h-11 w-11 rounded-full object-cover shadow-[0_0_16px_rgba(255,116,0,.28)]"/>
      <span className="hidden leading-[.9] font-black tracking-[-.04em] sm:block">GARAGEM<br/><span className="text-[.72rem] tracking-[.08em] text-[var(--accent-strong)]">DAS OFERTAS</span></span>
    </Link>
  );
}
