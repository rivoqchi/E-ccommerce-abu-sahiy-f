"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWelcome = pathname === "/welcome";
  const isLogin = pathname === "/login";
  const isAdmin = pathname.startsWith("/admin");
  const isVideos = pathname.startsWith("/videos");
  const hideChrome = isWelcome || isLogin || isAdmin || isVideos;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (isAdmin) {
    return <>{children}</>;
  }

  if (isVideos) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main
        className={cn(
          "flex-1",
          !hideChrome && "pb-28 md:pb-0",
        )}
      >
        {children}
      </main>
      {!hideChrome ? (
        <div className="hidden md:block">
          <Footer />
        </div>
      ) : null}
    </>
  );
}
