export type ProductSource = "store" | "hamkor";

export function productSourceOf(
  value?: ProductSource | null,
): ProductSource {
  return value === "hamkor" ? "hamkor" : "store";
}

export function productHref(product: {
  slug: string;
  source?: ProductSource | null;
}): string {
  return productSourceOf(product.source) === "hamkor"
    ? `/hamkor/product/${product.slug}`
    : `/product/${product.slug}`;
}

export function cartLineKey(
  source: ProductSource | undefined,
  productId: string,
): string {
  return `${productSourceOf(source)}:${productId}`;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface CatalogPartner {
  id: string;
  slug: string;
  name: string;
  image?: string;
}

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  image?: string;
  /** Active products in this category */
  productCount?: number;
  partnerId?: string;
}

export interface CatalogBrand {
  id: string;
  slug: string;
  name: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** Ichki mahsulot kodi */
  code?: string;
  description: string;
  /** Oddiy (retail) narx — USD (legacy; vitrinada optom×kurs×1.10) */
  price: number;
  /** Optom (wholesale) narx — USD */
  wholesalePrice: number;
  compareAtPrice?: number;
  /** Category slug for URLs/filters */
  category: string;
  categoryLabel: string;
  brand: string;
  brandSlug?: string;
  images: string[];
  specs: ProductSpec[];
  featured?: boolean;
  /** Ombordagi qoldiq */
  stock: number;
  inStock: boolean;
  rating?: number;
  /** Unique customers who purchased (paid/shipped/delivered). */
  buyerCount?: number;
  recentBuyers?: Array<{
    fullName: string;
    avatarUrl?: string;
  }>;
  source?: ProductSource;
  partnerId?: string;
  partnerName?: string;
  partnerLogo?: string;
  /** Karobka/dona — jami dona `quantity` da */
  boxQuantity?: number;
  pieceQuantity?: number;
  piecesPerBox?: number;
  /** ISO date — admin switch yoqilganda 30 kun «Yangi» badge */
  newHighlightUntil?: string;
  createdAt?: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  /** Oddiy narx */
  price: number;
  /** Optom narx */
  wholesalePrice: number;
  image: string;
  quantity: number;
  boxQuantity: number;
  pieceQuantity: number;
  piecesPerBox?: number;
  /** Ombordagi maksimal miqdor (qo'shishda saqlanadi) */
  stock: number;
  source?: ProductSource;
  partnerId?: string;
  partnerName?: string;
  partnerLogo?: string;
}

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  wholesalePrice: number;
  image: string;
  brand: string;
  stock?: number;
  source?: ProductSource;
  code?: string;
  partnerId?: string;
  partnerName?: string;
  partnerLogo?: string;
}

export const PRODUCT_IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80";
