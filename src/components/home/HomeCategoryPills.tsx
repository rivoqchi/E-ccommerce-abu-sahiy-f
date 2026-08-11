import Link from "next/link";
import { ProductImage } from "@/components/catalog/ProductImage";
import { cn } from "@/lib/utils";
import type { CatalogCategory } from "@/types/product";

interface HomeCategoryPillsProps {
  categories: CatalogCategory[];
  active?: string;
}

export function HomeCategoryPills({
  categories,
  active = "all",
}: HomeCategoryPillsProps) {
  if (!categories.length) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        Kategoriyalar
      </h2>

      <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-6 md:grid-cols-5 lg:grid-cols-6">
        {categories.map((cat) => {
          const isActive = active === cat.slug;
          const href = `/catalog?category=${cat.slug}`;
          const count = cat.productCount ?? 0;

          return (
            <Link
              key={cat.id}
              href={href}
              className="group flex flex-col items-center gap-2.5"
            >
              <span
                className={cn(
                  "relative flex size-20 items-center justify-center overflow-hidden rounded-full bg-secondary transition duration-200 sm:size-[5.5rem]",
                  "group-hover:scale-[1.04] group-hover:bg-muted",
                  isActive && "ring-2 ring-inset ring-foreground",
                )}
              >
                {cat.image ? (
                  <>
                    <ProductImage
                      src={cat.image}
                      alt={cat.name}
                      fill
                      fit="cover"
                      className="transition duration-200"
                    />
                    <span className="absolute inset-0 bg-black/35" aria-hidden />
                    <span className="relative z-10 text-xl font-bold tabular-nums text-white sm:text-2xl">
                      {count}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold tabular-nums text-muted-foreground sm:text-2xl">
                    {count}
                  </span>
                )}
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
