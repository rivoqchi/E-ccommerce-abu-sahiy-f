export interface ProductSpec {
  label: string;
  value: string;
}

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
  image?: string;
  /** Active products in this category */
  productCount?: number;
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
  /** Oddiy (retail) narx — USD */
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
  /** Ombordagi maksimal miqdor (qo'shishda saqlanadi) */
  stock: number;
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
}

export const PRODUCT_IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80";
