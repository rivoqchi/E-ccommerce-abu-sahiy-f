import Link from "next/link";
import { ProductImage } from "@/components/catalog/ProductImage";
import { cn } from "@/lib/utils";
import type { CatalogCategory } from "@/types/product";

interface HomeCategoryPillsProps {
  categories: CatalogCategory[];
  active?: string;
  hrefFor?: (slug: string) => string;
  title?: string;
}

export function HomeCategoryPills({
  categories,
  active = "all",
  hrefFor,
  title = "Kategoriyalar",
}: HomeCategoryPillsProps) {
  if (!categories.length) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>

      <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-6 md:grid-cols-5 lg:grid-cols-6">
        {categories.map((cat) => {
          const isActive = active === cat.slug;
          const href = hrefFor
            ? hrefFor(cat.slug)
            : `/catalog?category=${cat.slug}`;
          const count = cat.productCount ?? 0;

          return (
            <Link
              key={cat.id}
              href={href}
              prefetch={false}
              aria-label={`${cat.name}, ${count} ta mahsulot`}
              className="group flex flex-col items-center gap-2"
            >
              <span
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-2xl bg-secondary transition duration-200",
                  "group-hover:scale-[1.03] group-hover:bg-muted",
                  isActive && "ring-2 ring-inset ring-foreground",
                )}
              >
                {cat.image ? (
                  <ProductImage
                    src={cat.image}
                    alt=""
                    fill
                    fit="cover"
                    sizes="(max-width: 640px) 30vw, (max-width: 1024px) 18vw, 12vw"
                    className="transition duration-200"
                  />
                ) : null}

                <span
                  className="absolute top-1.5 right-1.5 z-10 inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-foreground px-1 text-[11px] font-bold tabular-nums text-background sm:h-7 sm:min-w-7 sm:text-xs"
                  aria-hidden
                >
                  {count}
                </span>
              </span>
              <span
                className={cn(
                  "line-clamp-2 w-full text-center text-[13px] leading-tight font-semibold tracking-tight text-foreground sm:text-sm",
                  isActive &&
                    "underline decoration-foreground/40 underline-offset-4",
                )}
              >
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
