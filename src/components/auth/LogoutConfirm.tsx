"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

type LogoutConfirmProps = {
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  children: React.ReactNode;
  redirectTo?: string;
  onLoggedOut?: () => void;
};

export function LogoutConfirm({
  className,
  variant = "outline",
  size,
  children,
  redirectTo = "/login",
  onLoggedOut,
}: LogoutConfirmProps) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirmLogout() {
    setPending(true);
    try {
      await logout();
      setOpen(false);
      onLoggedOut?.();
      router.replace(redirectTo);
      router.refresh();
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
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "top-4 left-1/2 max-w-sm -translate-x-1/2 translate-y-0 gap-3 rounded-2xl p-4 shadow-lg",
            "data-open:slide-in-from-top-4 data-closed:slide-out-to-top-4",
            "data-open:zoom-in-100 data-closed:zoom-out-100",
          )}
        >
          <DialogTitle className="text-base font-semibold">
            Chiqishni tasdiqlaysizmi?
          </DialogTitle>
          <DialogDescription>
            Rostdan ham akkauntdan chiqmoqchimisiz?
          </DialogDescription>
          <div className="mt-1 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 flex-1 rounded-full"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Bekor qilish
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-10 flex-1 rounded-full"
              disabled={pending}
              onClick={confirmLogout}
            >
              {pending ? "Chiqilmoqda…" : "Ha, chiqish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
