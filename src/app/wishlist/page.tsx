import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sevimlilar",
  description: "Sevimli mahsulotlaringiz ro'yxati.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <div className="mx-auto w-[90%] max-w-6xl py-5 md:w-[80%] md:py-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-4xl">
          Sevimlilar
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keyinroq ko&apos;rish uchun saqlangan mahsulotlar.
        </p>
      </header>

      <Card className="mt-8 rounded-3xl border-0 bg-card py-0 shadow-[var(--shadow-soft)] ring-0">
        <CardContent className="flex flex-col items-center px-6 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
            <Heart className="size-7 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="mt-5 text-lg font-semibold text-foreground">
            Hali sevimlilar yo&apos;q
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Mahsulot kartasidagi yurak orqali sevimlilarga qo&apos;shing.
          </p>
          <Button
            className="mt-6 h-11 rounded-full px-6"
            nativeButton={false}
            render={<Link href="/catalog" />}
          >
            Katalogga o&apos;tish
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
