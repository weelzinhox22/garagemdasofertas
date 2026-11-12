"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { inspectMarketplaceProduct, type ImportedProductDraft } from "@/lib/product-import";

const stores = ["Shopee", "Amazon", "Mercado Livre", "TikTok Shop", "Outra"];
export type ProductImportState = { error: string; draft: ImportedProductDraft | null };

export async function inspectProductLink(_previous: ProductImportState, formData: FormData): Promise<ProductImportState> {
  await requireAdmin();
  const url = String(formData.get("url") || "").trim();
  if (!url) return { error: "Cole o link do produto.", draft: null };
  try { return { error: "", draft: await inspectMarketplaceProduct(url) }; }
  catch (error) { return { error: error instanceof Error ? error.message : "Não foi possível analisar esse link.", draft: null }; }
}
function optionalNumber(value: FormDataEntryValue | null) { if (!value) return null; const number = Number(value); return Number.isFinite(number) && number >= 0 ? number : null; }
function productData(formData: FormData) {
  const store = String(formData.get("store") || "Outra");
  return { slug: String(formData.get("slug") || "").trim().toLowerCase(), title: String(formData.get("title") || "").trim(), description: String(formData.get("description") || "").trim(), category_slug: String(formData.get("category_slug") || ""), store: stores.includes(store) ? store : "Outra", image_url: String(formData.get("image_url") || "").trim(), affiliate_url: String(formData.get("affiliate_url") || "").trim() || null, price: optionalNumber(formData.get("price")), old_price: optionalNumber(formData.get("old_price")), featured: formData.get("featured") === "on", active: formData.get("active") === "on" };
}
export async function saveProduct(formData: FormData) {
  await requireAdmin(); const id = String(formData.get("id") || ""); const data = productData(formData);
  if (!data.title || !data.slug || !data.category_slug || !data.image_url) redirect("/admin?erro=produto-invalido");
  const supabase = createAdminClient(); const query = id ? supabase.from("products").update(data).eq("id", id) : supabase.from("products").insert(data); const { error } = await query; if (error) redirect("/admin?erro=salvar");
  revalidatePath("/", "layout"); redirect("/admin?sucesso=produto-salvo");
}
export async function toggleProduct(formData: FormData) { await requireAdmin(); const id = String(formData.get("id")); const active = formData.get("active") === "true"; await createAdminClient().from("products").update({ active: !active }).eq("id", id); revalidatePath("/", "layout"); }
export async function deleteProduct(formData: FormData) { await requireAdmin(); const id = String(formData.get("id")); await createAdminClient().from("products").delete().eq("id", id); revalidatePath("/", "layout"); }
export async function saveSettings(formData: FormData) { await requireAdmin(); const admin = createAdminClient(); for (const key of ["whatsapp_group_url", "telegram_group_url"]) { const value = String(formData.get(key) || "").trim(); await admin.from("site_settings").upsert({ key, value }, { onConflict: "key" }); } redirect("/admin?sucesso=configuracao-salva"); }
export async function logout() { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/"); }
