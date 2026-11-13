import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acelera Garagem — Automacao de ofertas",
  description: "Central de curadoria, filas e distribuicao de ofertas para afiliados."
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
