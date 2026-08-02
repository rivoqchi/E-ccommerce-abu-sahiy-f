"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

interface ThemeToggleProps {
  className?: string;
  size?: "icon" | "icon-sm" | "icon-lg";
}

export function ThemeToggle({ className, size = "icon" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn("rounded-full", className)}
      aria-label={isDark ? "Yorug' rejim" : "Qorong'u rejim"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="size-[18px]" strokeWidth={1.75} />
      ) : (
        <Moon className="size-[18px]" strokeWidth={1.75} />
      )}
    </Button>
  );
}
