import { Skeleton } from "@/components/ui/skeleton";

export function WishlistPageSkeleton() {
  return (
    <div
      className="mx-auto w-[90%] max-w-6xl py-5 md:w-[80%] md:py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <header aria-hidden>
        <Skeleton className="h-8 w-40 md:h-10 md:w-48" />
        <Skeleton className="mt-2 h-4 w-56 max-w-full" />
      </header>

      <div
        className="mt-8 flex flex-col items-center rounded-3xl bg-card px-6 py-16 shadow-[var(--shadow-soft)]"
        aria-hidden
      >
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="mt-5 h-6 w-44" />
        <Skeleton className="mt-2 h-4 w-64 max-w-full" />
        <Skeleton className="mt-6 h-11 w-40 rounded-full" />
      </div>
    </div>
  );
}
