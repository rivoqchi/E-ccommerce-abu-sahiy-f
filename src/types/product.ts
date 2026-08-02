export type ProductCategory = "appliances" | "cookware" | "tableware";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: ProductCategory;
  brand: string;
  images: string[];
  specs: ProductSpec[];
  featured?: boolean;
  inStock: boolean;
  rating?: number;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  appliances: "Texnika",
  cookware: "Idishlar",
  tableware: "Dasturxon",
};

export const CATEGORY_PILLS: { key: "all" | ProductCategory; label: string }[] =
  [
    { key: "all", label: "Barchasi" },
    { key: "appliances", label: "Texnika" },
    { key: "cookware", label: "Idishlar" },
    { key: "tableware", label: "Dasturxon" },
  ];
