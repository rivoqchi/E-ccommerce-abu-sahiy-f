import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORY_PILLS } from "@/types/product";

interface HomeCategoryPillsProps {
  active?: string;
}

export function HomeCategoryPills({ active = "all" }: HomeCategoryPillsProps) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {CATEGORY_PILLS.map((cat) => {
        const isActive = active === cat.key;
        const href =
          cat.key === "all" ? "/catalog" : `/catalog?category=${cat.key}`;

        return (
          <Button
            key={cat.key}
            size="sm"
            variant={isActive ? "default" : "secondary"}
            nativeButton={false}
            render={<Link href={href} />}
            className={cn(
              "h-9 shrink-0 rounded-full px-5 text-sm font-medium",
              !isActive &&
                "bg-secondary text-foreground hover:bg-secondary/80",
            )}
          >
            {cat.label}
          </Button>
        );
      })}
    </div>
  );
}
