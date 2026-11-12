import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { login } from "./actions";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Acesso administrativo", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  campos: "Preencha o e-mail e a senha.",
  credenciais: "Não foi possível entrar. Verifique suas credenciais.",
  "nao-autorizado": "Esta conta não possui acesso administrativo.",
  configuracao: "A autenticação ainda não está configurada no servidor."
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const error = (await searchParams).erro;
  const configured = isSupabaseConfigured();
  return <div className="admin-login-shell relative isolate grid min-h-[72vh] place-items-center overflow-hidden px-4 py-12"><div className="admin-login-grid absolute inset-0 -z-20" aria-hidden="true"/><div className="admin-login-glow absolute -right-32 top-10 -z-10 h-96 w-96 rounded-full" aria-hidden="true"/><div className="admin-login-card w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_28px_80px_var(--shadow)] sm:p-8"><div className="flex items-center justify-between"><div className="admin-lock grid h-12 w-12 place-items-center rounded-xl"><LockKeyhole/></div><span className="rounded-full border border-[var(--line)] px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-muted">Área restrita</span></div><p className="eyebrow mt-6">Garagem das Ofertas</p><h1 className="mt-2 text-3xl font-black tracking-[-.05em]">Acesso administrativo</h1><p className="mt-3 text-sm leading-6 text-muted">Use uma conta criada no Supabase Auth e autorizada como administradora.</p>{!configured && <div className="admin-notice-warning mt-5 rounded-xl border p-4 text-sm"><strong>Modo demonstração</strong><p className="mt-1 leading-5">Configure as variáveis do Supabase para liberar o painel.</p></div>}{error && <p role="alert" className="admin-notice-error mt-4 rounded-xl border p-4 text-sm font-bold">{errorMessages[error] || "Não foi possível entrar."}</p>}<form action={login} className="mt-6 grid gap-4"><label className="grid gap-1.5 text-sm font-bold">E-mail<input name="email" type="email" inputMode="email" autoCapitalize="none" autoComplete="email" required className="field" placeholder="admin@seudominio.com"/></label><label className="grid gap-1.5 text-sm font-bold">Senha<input name="password" type="password" autoComplete="current-password" required minLength={8} className="field" placeholder="Sua senha segura"/></label><button disabled={!configured} className="btn btn-accent mt-1 disabled:cursor-not-allowed disabled:opacity-50">Entrar com segurança</button></form><div className="mt-6 border-t border-[var(--line)] pt-5 text-center"><Link href="/" className="text-sm font-bold text-muted transition hover:text-[var(--accent-strong)]">← Voltar ao site</Link></div></div></div>;
}
