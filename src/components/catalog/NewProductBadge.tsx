import { cn } from "@/lib/utils";

interface NewProductBadgeProps {
  className?: string;
}

export function NewProductBadge({ className }: NewProductBadgeProps) {
  return (
    <span
      className={cn(
        "absolute top-3.5 left-3.5 z-20 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]",
        className,
      )}
    >
      Yangi
    </span>
  );
}
