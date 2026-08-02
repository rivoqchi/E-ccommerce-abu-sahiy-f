import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const BANNER_IMAGE =
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80";

export function PromoBanner() {
  return (
    <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-promo via-promo-via to-promo-to py-0 ring-0 shadow-[var(--shadow-soft)]">
      {/* Mobile: to'liq fon + overlay matn */}
      <div className="relative min-h-[200px] sm:hidden">
        <Image
          src={BANNER_IMAGE}
          alt="Oshxona jihozlari"
          fill
          sizes="100vw"
          priority
          className="object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-promo via-promo/85 to-promo/55" />
        <div className="relative z-10 flex h-full min-h-[200px] flex-col justify-end gap-1 p-5 pb-6">
          <p className="text-sm font-medium text-foreground/80">
            Maxsus taklif
          </p>
          <p className="text-[2rem] leading-none font-bold tracking-tight text-foreground">
            40% CHEGIRMA
          </p>
          <p className="mt-1 max-w-[18rem] text-sm leading-snug text-foreground/70">
            Oshxona jihozlari va maishiy texnikalar
          </p>
          <Button
            size="sm"
            variant="secondary"
            nativeButton={false}
            render={<Link href="/catalog" />}
            className="mt-3 h-10 w-fit rounded-full bg-card px-5 text-foreground shadow-sm hover:bg-card/90"
          >
            Ko&apos;proq ko&apos;rish
          </Button>
        </div>
      </div>

      {/* Desktop / tablet: matn + yon rasm */}
      <div className="relative z-10 hidden min-h-[200px] items-stretch sm:flex">
        <div className="flex flex-1 flex-col justify-center gap-1 p-6 md:p-8">
          <p className="text-sm font-medium text-foreground">Maxsus taklif</p>
          <p className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            40% CHEGIRMA
          </p>
          <p className="mt-1 max-w-[18rem] text-sm text-foreground/70">
            Oshxona jihozlari va maishiy texnikalar
          </p>
          <Button
            size="sm"
            variant="secondary"
            nativeButton={false}
            render={<Link href="/catalog" />}
            className="mt-4 w-fit rounded-full bg-card px-4 text-foreground shadow-sm hover:bg-card/90"
          >
            Ko&apos;proq ko&apos;rish
          </Button>
        </div>

        <div className="relative w-[46%]">
          <Image
            src={BANNER_IMAGE}
            alt="Oshxona jihozlari"
            fill
            sizes="40vw"
            priority
            className="object-cover object-[center_40%]"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-promo-via/20 to-promo-via" />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-8 hidden size-40 rounded-full border border-white/40 sm:block dark:border-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-8 -right-4 hidden size-28 rounded-full border border-white/30 sm:block dark:border-white/10"
      />
    </Card>
  );
}
