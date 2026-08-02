import type { Metadata } from "next";
import { CartItems } from "@/components/cart/CartItems";
import { CartSummary } from "@/components/cart/CartSummary";

export const metadata: Metadata = {
  title: "Savat",
  description: "Savatdagi mahsulotlaringizni ko'rib chiqing va buyurtma bering.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/cart",
  },
};

export default function CartPage() {
  return (
    <div className="mx-auto w-[90%] max-w-6xl py-6 md:w-[80%] md:py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
          Savat
        </h1>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <CartItems />
        <CartSummary />
      </div>
    </div>
  );
}
