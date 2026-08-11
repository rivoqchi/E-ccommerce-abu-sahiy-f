import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export const metadata: Metadata = {
  title: "Rasmiylashtirish",
  description: "Buyurtmani rasmiylashtiring — ism, telefon va izoh.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/checkout",
  },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto w-[90%] max-w-6xl py-6 md:w-[80%] md:py-10">
      <CheckoutForm />
    </div>
  );
}
