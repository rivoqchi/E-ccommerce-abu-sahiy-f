import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Soft filled field. Horizontal padding lives on the outer shell so
 * typed text never sits against the rounded edge.
 */
function Input({
  className,
  type,
  disabled,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div
      data-slot="input-shell"
      className={cn(
        "flex h-11 w-full min-w-0 items-center rounded-xl bg-secondary px-4",
        "focus-within:ring-2 focus-within:ring-ring/20",
        "has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50",
        "has-[[aria-invalid=true]]:ring-2 has-[[aria-invalid=true]]:ring-destructive/20",
        className
      )}
    >
      <input
        type={type}
        data-slot="input"
        disabled={disabled}
        className="h-full w-full min-w-0 border-0 bg-transparent p-0 text-base text-foreground outline-none placeholder:text-muted-foreground md:text-sm"
        {...props}
      />
    </div>
  )
}

export { Input }
