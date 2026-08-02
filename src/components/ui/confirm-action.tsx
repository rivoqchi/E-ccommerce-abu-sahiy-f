"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ConfirmActionProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  pendingLabel?: string;
  cancelLabel?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  disabled?: boolean;
  children: React.ReactNode;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmAction({
  title,
  description,
  confirmLabel = "Ha, oʻchirish",
  pendingLabel = "Oʻchirilmoqda…",
  cancelLabel = "Bekor qilish",
  className,
  variant = "ghost",
  size = "icon-sm",
  disabled,
  children,
  onConfirm,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || pending}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "top-4 left-1/2 max-w-sm -translate-x-1/2 translate-y-0 shadow-lg",
            "data-open:slide-in-from-top-4 data-closed:slide-out-to-top-4",
            "data-open:zoom-in-100 data-closed:zoom-out-100",
          )}
        >
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          <div className="mt-1 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 flex-1 rounded-full"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-10 flex-1 rounded-full"
              disabled={pending}
              onClick={() => void handleConfirm()}
            >
              {pending ? pendingLabel : confirmLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
