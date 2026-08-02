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
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 py-2 sm:gap-6 md:justify-start [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((cat) => {
        const isActive = active === cat.slug;
        const href = `/catalog?category=${cat.slug}`;
        const initial = cat.name.trim().charAt(0).toUpperCase() || "?";

        return (
          <Link
            key={cat.id}
            href={href}
            className="group flex w-20 shrink-0 flex-col items-center gap-2.5 sm:w-[5.5rem]"
          >
            <span
              className={cn(
                "relative flex size-20 items-center justify-center overflow-hidden rounded-full bg-secondary transition duration-200 sm:size-[5.5rem]",
                "group-hover:scale-[1.04] group-hover:bg-muted",
                isActive && "ring-2 ring-inset ring-foreground",
              )}
            >
              {cat.image ? (
                <ProductImage
                  src={cat.image}
                  alt={cat.name}
                  fill
                  fit="cover"
                  className="transition duration-200"
                />
              ) : (
                <span className="text-xl font-semibold text-muted-foreground sm:text-2xl">
                  {initial}
                </span>
              )}
            </span>
            <span
              className={cn(
                "line-clamp-2 w-full text-center text-[13px] leading-tight font-semibold tracking-tight text-foreground sm:text-sm",
                isActive && "underline decoration-foreground/40 underline-offset-4",
              )}
            >
              {cat.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
