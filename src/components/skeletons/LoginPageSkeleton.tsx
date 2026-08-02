import { Skeleton } from "@/components/ui/skeleton";

/** Form-only skeleton for LoginForm hydrate state */
export function LoginFormSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col" aria-busy="true">
      <div className="mb-2 flex items-center justify-between md:mb-4" aria-hidden>
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="size-10 rounded-full" />
      </div>

      <div className="mt-4 space-y-3" aria-hidden>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-56 md:h-10" />
        <Skeleton className="h-4 w-full max-w-sm" />
        <Skeleton className="h-4 w-[75%] max-w-xs" />
      </div>

      <div className="mt-8 space-y-4" aria-hidden>
        <div className="flex gap-2">
          <Skeleton className="h-12 w-28 rounded-xl" />
          <Skeleton className="h-12 flex-1 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

/** Full-page skeleton matching /login chrome (no header/footer) */
export function LoginPageSkeleton() {
  return (
    <div
      className="relative isolate min-h-[100dvh] overflow-hidden bg-background"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--promo)_0%,_transparent_55%)] opacity-70 dark:opacity-30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-20 size-72 rounded-full bg-[radial-gradient(circle,_var(--hero-to)_0%,_transparent_70%)] opacity-40 blur-2xl dark:opacity-25"
      />

      <div className="relative z-10 mx-auto flex w-[90%] max-w-lg flex-col pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] md:w-full md:pt-10">
        <LoginFormSkeleton />
      </div>
    </div>
  );
}
