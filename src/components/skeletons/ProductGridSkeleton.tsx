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
  if (variant === "featured") {
    return (
      <ul
        className="columns-2 gap-4 sm:gap-5 md:columns-3 lg:columns-4"
        aria-hidden
      >
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="mb-4 break-inside-avoid sm:mb-5">
            <ProductCardSkeleton />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul
      className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3"
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
