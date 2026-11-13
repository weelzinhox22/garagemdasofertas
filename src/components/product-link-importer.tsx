"use client";

import { useActionState } from "react";
import { Link2, LoaderCircle, Sparkles } from "lucide-react";
import { inspectProductLink, type ProductImportState, saveProduct } from "@/app/admin/actions";
import type { Category } from "@/types";

const initialState: ProductImportState = { error: "", draft: null };

export function ProductLinkImporter({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(inspectProductLink, initialState);
  return <section className="surface overflow-hidden border-orange-500/30">
    <div className="border-b border-[var(--line)] bg-[linear-gradient(120deg,rgba(237,109,11,.12),transparent)] p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-500/15 text-[var(--accent-strong)]"><Sparkles size={21}/></span><div><p className="eyebrow">Cadastro rápido</p><h2 className="section-title mt-1">Adicionar produto pelo link</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Cole uma URL do Mercado Livre, Shopee ou TikTok Shop. O servidor busca os dados públicos e prepara a oferta para sua revisão.</p></div></div><form action={action} className="mt-5 flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="product-url">Link do produto</label><div className="relative flex-1"><Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18}/><input id="product-url" name="url" type="url" required placeholder="https://..." className="field pl-10"/></div><button disabled={pending} className="btn btn-accent min-w-40 disabled:opacity-60">{pending ? <><LoaderCircle className="animate-spin" size={18}/>Analisando</> : "Analisar link"}</button></form>{state.error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">{state.error}</p>}</div>
    {state.draft && <form action={saveProduct} className="grid gap-4 p-5 sm:p-6 md:grid-cols-2">
      <input type="hidden" name="affiliate_url" value={state.draft.sourceUrl}/>
      <input type="hidden" name="store" value={state.draft.store}/>
      <input type="hidden" name="active" value="on"/>
      <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-[var(--accent-strong)]">Prévia da oferta</p>
          <p className="mt-1 text-sm text-muted">Preencha os valores antes de adicionar ao catálogo.</p>
        </div>
        <span className="rounded-full border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-black">{state.draft.store}</span>
      </div>

      <label className="grid gap-1 text-sm font-bold md:col-span-2">
        Título
        <input className="field" name="title" required defaultValue={state.draft.title}/>
      </label>

      <label className="grid gap-1 text-sm font-bold">
        Preço promocional (R$)
        <input className="field" name="price" type="number" step="0.01" min="0" placeholder="Ex: 49.90"/>
      </label>

      <label className="grid gap-1 text-sm font-bold">
        Preço anterior (R$)
        <input className="field" name="old_price" type="number" step="0.01" min="0" placeholder="Ex: 89.90"/>
      </label>

      <label className="grid gap-1 text-sm font-bold">
        Slug
        <input className="field" name="slug" required pattern="[a-z0-9-]+" defaultValue={state.draft.slug}/>
      </label>

      <label className="grid gap-1 text-sm font-bold">
        Categoria
        <select className="field" name="category_slug" required defaultValue={state.draft.categorySlug}>
          {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
        </select>
      </label>

      <label className="grid gap-1 text-sm font-bold md:col-span-2">
        Imagem da oferta (URL)
        <input className="field" name="image_url" type="text" required placeholder="https://... ou caminho da imagem" defaultValue={state.draft.imageUrl}/>
        <span className="text-xs font-normal text-muted">
          Caso o TikTok Shop ou Shopee proteja a foto por anti-bot, você pode alterar esse link colando a foto do produto ou mantendo a imagem ilustrativa da categoria.
        </span>
      </label>

      <label className="grid gap-1 text-sm font-bold md:col-span-2">
        Descrição
        <textarea className="field min-h-20" name="description" defaultValue={state.draft.description}/>
      </label>

      <label className="flex items-center gap-2 text-sm font-bold md:col-span-2">
        <input name="featured" type="checkbox"/> Marcar como destaque na página inicial
      </label>

      <button className="btn btn-primary md:col-span-2 w-full text-base py-3">Adicionar ao catálogo</button>
    </form>}
  </section>;
}
