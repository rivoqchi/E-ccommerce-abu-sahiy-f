import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailsView } from "@/components/product/ProductDetailsView";
import { ProductCard } from "@/components/catalog/ProductCard";
import {
  fetchExchangeRate,
  fetchHamkorProductBySlug,
  fetchHamkorRelatedProducts,
  fetchProductDisplaySettings,
} from "@/lib/storefront-api";
import {
  breadcrumbJsonLd,
  jsonLdScript,
  productJsonLd,
} from "@/lib/seo";

export const revalidate = 0;
export const dynamic = "force-dynamic";

interface HamkorProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: HamkorProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchHamkorProductBySlug(slug);
  if (!product) {
    return { title: "Mahsulot topilmadi" };
  }

  return {
    title: product.name,
    description: product.description || product.name,
    alternates: {
      canonical: `/hamkor/product/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0], alt: product.name }],
      type: "website",
    },
  };
}

export default async function HamkorProductPage({
  params,
}: HamkorProductPageProps) {
  const { slug } = await params;
  const [product, exchangeRate, displaySettings] = await Promise.all([
    fetchHamkorProductBySlug(slug),
    fetchExchangeRate(),
    fetchProductDisplaySettings(),
  ]);

  if (!product) {
    notFound();
  }

  const related = await fetchHamkorRelatedProducts(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          productJsonLd(
            product,
            exchangeRate?.usdToUzs,
            displaySettings.hiddenFields.includes("price"),
          ),
        )}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { name: "Bosh sahifa", path: "/" },
            { name: "Katalog", path: "/catalog" },
            { name: product.name, path: `/hamkor/product/${product.slug}` },
          ]),
        )}
      />

      <div className="mx-auto w-full max-w-6xl md:w-[80%] md:py-10">
        <ProductDetailsView product={product} />

        {related.length > 0 ? (
          <section className="mt-6 hidden px-0 md:mt-16 md:block">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              O&apos;xshash mahsulotlar
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <li key={item.id}>
                  <ProductCard product={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
