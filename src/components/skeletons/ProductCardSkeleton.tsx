import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div className={cn("flex flex-col", className)} aria-hidden>
      <Skeleton className="aspect-square w-full rounded-[28px]" />
      <Skeleton className="mt-2.5 h-10 w-full rounded-full" />
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-[80%]" />
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>
    </div>
  );
}
