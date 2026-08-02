import { ProductCardSkeleton } from "@/components/skeletons/ProductCardSkeleton";

interface ProductGridSkeletonProps {
  count?: number;
  /** home featured: 2 cols / lg 4; catalog: 2 cols / xl 3 */
  variant?: "catalog" | "featured";
}

export function ProductGridSkeleton({
  count = 6,
  variant = "catalog",
}: ProductGridSkeletonProps) {
  const gridClass =
    variant === "featured"
      ? "grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4"
      : "grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3";

  return (
    <ul className={gridClass} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
