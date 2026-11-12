"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim(); const password = String(formData.get("password") || "");
  if (!email || !password) redirect("/admin/login?erro=campos");
  try { const supabase = await createClient(); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) redirect("/admin/login?erro=credenciais"); } catch { redirect("/admin/login?erro=configuracao"); }
  redirect("/admin");
}
