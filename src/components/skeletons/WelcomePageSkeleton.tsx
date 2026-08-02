import { Skeleton } from "@/components/ui/skeleton";

export function WelcomePageSkeleton() {
  return (
    <section
      className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-muted"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-muted via-muted/80 to-foreground/20" />

      <div
        className="relative z-10 flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-10 md:pt-8"
        aria-hidden
      >
        <Skeleton className="h-4 w-24 bg-background/40" />
        <Skeleton className="size-10 rounded-full bg-background/40" />
      </div>

      <div
        className="relative z-10 mt-auto flex w-full flex-col gap-8 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-24 md:mx-auto md:max-w-xl md:px-10 md:pb-12"
        aria-hidden
      >
        <div className="space-y-3">
          <Skeleton className="h-10 w-[80%] bg-background/35 sm:h-12" />
          <Skeleton className="h-10 w-[60%] bg-background/35 sm:h-12" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full max-w-md bg-background/30" />
          <Skeleton className="h-4 w-[80%] max-w-sm bg-background/30" />
        </div>
        <Skeleton className="h-14 w-full rounded-full bg-background/40" />
      </div>
    </section>
  );
}
