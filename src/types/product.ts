export interface ProductSpec {
  label: string;
  value: string;
}

export interface CatalogCategory {
  id: string;
  slug: string;
  name: string;
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
  description: string;
  price: number;
  compareAtPrice?: number;
  /** Category slug for URLs/filters */
  category: string;
  categoryLabel: string;
  brand: string;
  brandSlug?: string;
  images: string[];
  specs: ProductSpec[];
  featured?: boolean;
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
  price: number;
  image: string;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  brand: string;
}

export const PRODUCT_IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80";
