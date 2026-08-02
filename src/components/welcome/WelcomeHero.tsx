"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function WelcomeHero() {
  return (
    <section className="relative isolate flex min-h-[100dvh] flex-col overflow-hidden bg-background">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=85"
          alt="UyTexnika do'koni"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_20%] md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/15 to-black/70 dark:from-black/50 dark:via-black/40 dark:to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_40%,rgba(0,0,0,0.35))]" />
      </div>

      <div className="relative z-10 flex items-center justify-between px-5 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-10 md:pt-8">
        <p className="text-sm font-semibold tracking-tight text-white/90">
          UyTexnika
        </p>
        <ThemeToggle className="bg-white/15 text-white backdrop-blur-md hover:bg-white/25 hover:text-white" />
      </div>

      <div className="relative z-10 mt-auto flex w-full flex-col gap-8 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-24 md:mx-auto md:max-w-xl md:px-10 md:pb-12">
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
          Kundalik{" "}
          <Badge className="relative -top-1 inline-flex h-auto rounded-xl bg-black px-3 py-1.5 text-[0.85em] font-bold text-white dark:bg-white dark:text-black">
            xarid
          </Badge>{" "}
          hamrohingiz!
        </h1>

        <p className="max-w-md text-base text-white/80 md:text-lg">
          Maishiy texnika va oshxona anjomlari — tez yetkazib berish, kafolat va
          sifatli brendlar.
        </p>

        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/" />}
          className="group h-14 w-full rounded-full bg-black px-2 text-base font-semibold text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-white/15 dark:bg-black/10">
            <Package className="size-5" strokeWidth={1.75} />
          </span>
          <span className="flex-1 text-center">Boshlash</span>
          <span className="flex items-center pr-2 text-white/70 transition-transform group-hover:translate-x-0.5 dark:text-black/50">
            <ChevronRight className="size-4 -mr-1.5" strokeWidth={2.5} />
            <ChevronRight className="size-4 -mr-1.5" strokeWidth={2.5} />
            <ChevronRight className="size-4" strokeWidth={2.5} />
          </span>
        </Button>
      </div>
    </section>
  );
}
