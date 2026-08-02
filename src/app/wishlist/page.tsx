import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/WishlistView";

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
      </header>

      <WishlistView />
    </div>
  );
}
