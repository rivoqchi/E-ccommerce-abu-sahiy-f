import { Skeleton } from "@/components/ui/skeleton";

export function AccountPageSkeleton() {
  return (
    <div
      className="mx-auto w-[90%] max-w-lg py-5 md:w-[80%] md:max-w-xl md:py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <div aria-hidden>
        {/* Header — AccountHeader */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-24 md:h-10 md:w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
          <Skeleton className="size-10 shrink-0 rounded-full md:hidden" />
        </header>

        {/* Hero profile card */}
        <div className="mt-8 overflow-hidden rounded-3xl bg-card shadow-[var(--shadow-soft)]">
          <Skeleton className="h-28 w-full rounded-none" />
          <div className="relative px-5 pb-6 pt-0">
            <div className="-mt-12 flex flex-col items-center">
              <Skeleton className="size-24 rounded-full ring-4 ring-card" />
              <Skeleton className="mt-4 h-7 w-44" />
              <Skeleton className="mt-2 h-4 w-28" />
              <Skeleton className="mt-3 h-6 w-36 rounded-full" />
            </div>
          </div>
        </div>

        {/* Editable fields card */}
        <div className="mt-4 rounded-3xl bg-card px-5 py-5 shadow-[var(--shadow-soft)]">
          <Skeleton className="h-4 w-36" />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>

          <div className="mt-3 space-y-1.5">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>

          <Skeleton className="mt-4 h-12 w-full rounded-full" />
        </div>

        {/* Theme card */}
        <div className="mt-4 flex items-center justify-between rounded-3xl bg-card px-5 py-4 shadow-[var(--shadow-soft)]">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="size-10 rounded-full" />
        </div>

        {/* Logout */}
        <Skeleton className="mt-4 h-12 w-full rounded-full" />
      </div>
    </div>
  );
}
