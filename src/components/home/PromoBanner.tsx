import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PromoBanner() {
  return (
    <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-promo via-promo-via to-promo-to py-0 ring-0 shadow-[var(--shadow-soft)]">
      <div className="relative z-10 flex min-h-[168px] items-stretch md:min-h-[200px]">
        <div className="flex flex-1 flex-col justify-center gap-1 p-5 sm:p-6 md:p-8">
          <p className="text-xs font-medium text-foreground/70">
            Chegirmalar mavjud
          </p>
          <p className="text-sm font-medium text-foreground">
            Maxsus taklif
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            40% CHEGIRMA
          </p>
          <Button
            size="sm"
            variant="secondary"
            nativeButton={false}
            render={<Link href="/catalog" />}
            className="mt-3 w-fit rounded-full bg-card px-4 text-foreground shadow-sm hover:bg-card/90"
          >
            Ko&apos;proq ko&apos;rish
          </Button>
        </div>

        <div className="relative hidden w-[42%] sm:block">
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80"
            alt="Maxsus taklif"
            fill
            sizes="40vw"
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-promo-via/20 to-promo-via" />
        </div>

        <div className="relative w-[38%] sm:hidden">
          <Image
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80"
            alt=""
            fill
            sizes="40vw"
            priority
            className="object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-promo" />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-8 size-40 rounded-full border border-white/40 dark:border-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-8 -right-4 size-28 rounded-full border border-white/30 dark:border-white/10"
      />
    </Card>
  );
}
