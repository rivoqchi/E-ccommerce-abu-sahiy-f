import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginFormSkeleton } from "@/components/skeletons";

export const metadata: Metadata = {
  title: "Kirish",
  description: "Telegram botdagi kod orqali Sami hisobiga kiring.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="relative isolate min-h-[100dvh] overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--promo)_0%,_transparent_55%)] opacity-70 dark:opacity-30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-20 size-72 rounded-full bg-[radial-gradient(circle,_var(--hero-to)_0%,_transparent_70%)] opacity-40 blur-2xl dark:opacity-25"
      />

      <div className="relative z-10 mx-auto flex w-[90%] max-w-lg flex-col pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] md:w-full md:pt-10">
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
