import type { Category, Product } from "@/types";

export const categories: Category[] = [
  { id: "1", slug: "ferramentas", name: "Ferramentas", description: "Itens para oficina, obra e pequenos reparos.", icon: "wrench" },
  { id: "2", slug: "eletronicos", name: "Eletrônicos", description: "Tecnologia útil para a rotina.", icon: "cpu" },
  { id: "3", slug: "casa-e-cozinha", name: "Casa e cozinha", description: "Praticidade para todos os ambientes.", icon: "house" },
  { id: "4", slug: "automotivo", name: "Automotivo", description: "Acessórios e cuidados para seu veículo.", icon: "car" },
  { id: "5", slug: "acessorios", name: "Acessórios", description: "Itens compactos que facilitam o dia.", icon: "watch" },
  { id: "6", slug: "informatica", name: "Informática", description: "Periféricos e acessórios para o setup.", icon: "monitor" },
  { id: "7", slug: "utilidades", name: "Utilidades", description: "Soluções simples para problemas cotidianos.", icon: "package" }
];

export const demoProducts: Product[] = [
  {
    id: "demo-1", slug: "furadeira-de-impacto-exemplo", title: "Furadeira de impacto — exemplo",
    description: "Produto demonstrativo usado para visualizar o catálogo. Cadastre uma oferta real no painel para publicar preço e link.",
    categorySlug: "ferramentas", store: "Mercado Livre", imageUrl: "/products/furadeira-catalogo.webp", price: null, oldPrice: null,
    affiliateUrl: null, featured: true, active: true, createdAt: "2026-01-08T12:00:00Z", demo: true
  },
  {
    id: "demo-2", slug: "fone-sem-fio-exemplo", title: "Fone sem fio — exemplo",
    description: "Item demonstrativo sem preço ou destino comercial. Substitua pelos dados verificados da loja.",
    categorySlug: "eletronicos", store: "Shopee", imageUrl: "/products/fone-catalogo.webp", price: null, oldPrice: null,
    affiliateUrl: null, featured: true, active: true, createdAt: "2026-01-07T12:00:00Z", demo: true
  },
  {
    id: "demo-3", slug: "organizador-modular-exemplo", title: "Organizador modular — exemplo",
    description: "Conteúdo de demonstração claramente identificado, sem alegações comerciais.",
    categorySlug: "casa-e-cozinha", store: "TikTok Shop", imageUrl: "/products/organizador-catalogo.webp", price: null, oldPrice: null,
    affiliateUrl: null, featured: false, active: true, createdAt: "2026-01-06T12:00:00Z", demo: true
  },
  {
    id: "demo-4", slug: "suporte-automotivo-exemplo", title: "Suporte automotivo — exemplo",
    description: "Modelo visual para uma oferta futura. Nenhum preço ou popularidade foi inventado.",
    categorySlug: "automotivo", store: "Mercado Livre", imageUrl: "/products/suporte-catalogo.webp", price: null, oldPrice: null,
    affiliateUrl: null, featured: true, active: true, createdAt: "2026-01-05T12:00:00Z", demo: true
  },
  {
    id: "demo-5", slug: "hub-usb-exemplo", title: "Hub USB — exemplo",
    description: "Exemplo para a categoria de informática, sem link de afiliado ativo.",
    categorySlug: "informatica", store: "Shopee", imageUrl: "/products/hub-catalogo.webp", price: null, oldPrice: null,
    affiliateUrl: null, featured: false, active: true, createdAt: "2026-01-04T12:00:00Z", demo: true
  },
  {
    id: "demo-6", slug: "kit-organizador-exemplo", title: "Kit organizador — exemplo",
    description: "Exemplo neutro para demonstrar o grid responsivo do portal.",
    categorySlug: "utilidades", store: "TikTok Shop", imageUrl: "/products/kit-catalogo.webp", price: null, oldPrice: null,
    affiliateUrl: null, featured: false, active: true, createdAt: "2026-01-03T12:00:00Z", demo: true
  }
];
