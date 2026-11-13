import "server-only";
import { createClient } from "@supabase/supabase-js";

export function database() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL no projeto acelera-garagem da Vercel");
  if (!secret) throw new Error("Falta SUPABASE_SECRET_KEY no projeto acelera-garagem da Vercel");
  return createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
}
