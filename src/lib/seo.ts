import type { Product } from "@/types/product";
import { CATEGORY_LABELS } from "@/types/product";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Maishiy texnika, pishirish va oshxona idishlari — UyTexnika onlayn do'koni.",
    logo: `${SITE_URL}/favicon.ico`,
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    category: CATEGORY_LABELS[product.category],
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "UZS",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function jsonLdScript(data: object) {
  return {
    __html: JSON.stringify(data),
  };
}
