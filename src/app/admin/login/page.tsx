import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { login } from "./actions";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Acesso administrativo", robots: { index: false, follow: false } };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const error = (await searchParams).erro; const configured = isSupabaseConfigured();
  return <div className="container-site grid min-h-[65vh] place-items-center py-10"><div className="surface w-full max-w-md p-6 sm:p-8"><div className="grid h-11 w-11 place-items-center rounded-lg bg-[#fff1de] text-[#a9460c]"><LockKeyhole/></div><h1 className="mt-5 text-2xl font-black tracking-[-.04em]">Acesso administrativo</h1><p className="mt-2 text-sm leading-6 text-[#66635b]">Entre com uma conta autorizada no Supabase.</p>{!configured && <div className="mt-5 rounded-md border border-[#e9c56a] bg-[#fff8dd] p-3 text-sm"><strong>Modo demonstração.</strong><p className="mt-1">Configure as variáveis do Supabase para liberar o painel.</p></div>}{error && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">Não foi possível entrar. Verifique as credenciais e a configuração.</p>}<form action={login} className="mt-6 grid gap-4"><label className="grid gap-1.5 text-sm font-bold">E-mail<input name="email" type="email" autoComplete="email" required className="field"/></label><label className="grid gap-1.5 text-sm font-bold">Senha<input name="password" type="password" autoComplete="current-password" required minLength={8} className="field"/></label><button disabled={!configured} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50">Entrar</button></form><Link href="/" className="mt-5 block text-center text-sm font-bold text-[#66635b]">Voltar ao site</Link></div></div>;
}
