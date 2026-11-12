export type Store = "Shopee" | "Amazon" | "Mercado Livre" | "TikTok Shop" | "Outra";

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  store: Store;
  imageUrl: string;
  price: number | null;
  oldPrice: number | null;
  affiliateUrl: string | null;
  featured: boolean;
  active: boolean;
  createdAt: string;
  clicks?: number | null;
  demo?: boolean;
};
