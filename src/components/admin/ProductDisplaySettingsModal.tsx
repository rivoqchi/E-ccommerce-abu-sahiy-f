"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { showCenterToast } from "@/components/ui/center-toast";
import { useAdminApi } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import {
  PRODUCT_DISPLAY_FIELD_OPTIONS,
  sanitizeHiddenFields,
  sanitizeHiddenSpecLabels,
  type ProductDisplayField,
} from "@/lib/product-display";

function VisibilitySwitch({
  label,
  hint,
  visible,
  disabled,
  onToggle,
}: {
  label: string;
  hint?: string;
  visible: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl px-2 py-2.5 hover:bg-muted/60">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{label}</p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={visible}
        aria-label={`${label} — ${visible ? "koʻrinadi" : "yashirilgan"}`}
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          visible ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-6 rounded-full bg-white shadow-sm transition-[left]",
            visible ? "left-[1.35rem]" : "left-0.5",
          )}
        />
      </button>
    </li>
  );
}

export function ProductDisplaySettingsModal() {
  const { adminFetch } = useAdminApi();
  const [open, setOpen] = useState(false);
  const [hiddenFields, setHiddenFields] = useState<ProductDisplayField[]>([]);
  const [hiddenSpecLabels, setHiddenSpecLabels] = useState<string[]>([]);
  const [specLabels, setSpecLabels] = useState<string[]>([]);
  const [specQuery, setSpecQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setSpecQuery("");
    void adminFetch<{
      hiddenFields?: unknown;
      hiddenSpecLabels?: unknown;
      specLabels?: unknown;
    }>("/products/display-settings?labels=1")
      .then((data) => {
        if (cancelled) return;
        setHiddenFields(sanitizeHiddenFields(data.hiddenFields));
        setHiddenSpecLabels(sanitizeHiddenSpecLabels(data.hiddenSpecLabels));
        setSpecLabels(sanitizeHiddenSpecLabels(data.specLabels));
      })
      .catch((e: Error) => {
        if (!cancelled) {
          showCenterToast(e.message || "Sozlama yuklanmadi", "error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, adminFetch]);

  const filteredSpecLabels = useMemo(() => {
    const q = specQuery.trim().toLowerCase();
    if (!q) return specLabels;
    return specLabels.filter((label) => label.toLowerCase().includes(q));
  }, [specLabels, specQuery]);

  function toggleField(id: ProductDisplayField, visible: boolean) {
    setHiddenFields((prev) => {
      if (visible) return prev.filter((f) => f !== id);
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }

  function toggleSpecLabel(label: string, visible: boolean) {
    setHiddenSpecLabels((prev) => {
      if (visible) return prev.filter((item) => item !== label);
      if (prev.includes(label)) return prev;
      return [...prev, label];
    });
  }

  function save() {
    startTransition(async () => {
      try {
        const data = await adminFetch<{
          hiddenFields?: unknown;
          hiddenSpecLabels?: unknown;
        }>("/products/admin/display-settings", {
          method: "PATCH",
          body: JSON.stringify({ hiddenFields, hiddenSpecLabels }),
        });
        setHiddenFields(sanitizeHiddenFields(data.hiddenFields));
        setHiddenSpecLabels(sanitizeHiddenSpecLabels(data.hiddenSpecLabels));
        showCenterToast("Koʻrinish sozlamasi saqlandi");
        setOpen(false);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Saqlanmadi";
        showCenterToast(msg, "error");
      }
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={() => setOpen(true)}
      >
        <EyeOff className="size-4" />
        Koʻrinish
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Umumiy koʻrinish</DialogTitle>
            <DialogDescription>
              Oʻchirilgan maʼlumot va xususiyatlar barcha mahsulotlarda doʻkon
              sahifalarida chiqmaydi. Serverdagi mahsulotlar oʻzgarmaydi.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto">
              <section>
                <p className="mb-1 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Asosiy maʼlumotlar
                </p>
                <ul className="space-y-1">
                  {PRODUCT_DISPLAY_FIELD_OPTIONS.map((field) => (
                    <VisibilitySwitch
                      key={field.id}
                      label={field.label}
                      hint={field.hint}
                      visible={!hiddenFields.includes(field.id)}
                      disabled={pending}
                      onToggle={() =>
                        toggleField(field.id, hiddenFields.includes(field.id))
                      }
                    />
                  ))}
                </ul>
              </section>

              <section>
                <p className="mb-1 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Xususiyatlar
                </p>
                <ul className="space-y-1">
                  <VisibilitySwitch
                    label="Barchasi"
                    hint="Barcha xususiyatlarni yashirish"
                    visible={!hiddenFields.includes("specs")}
                    disabled={pending}
                    onToggle={() =>
                      toggleField("specs", hiddenFields.includes("specs"))
                    }
                  />
                </ul>
                {specLabels.length > 8 ? (
                  <Input
                    className="mb-2 h-10"
                    placeholder="Xususiyat qidirish…"
                    value={specQuery}
                    onChange={(e) => setSpecQuery(e.target.value)}
                  />
                ) : null}
                {specLabels.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-muted-foreground">
                    Hali xususiyatlar yoʻq
                  </p>
                ) : filteredSpecLabels.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-muted-foreground">
                    Topilmadi
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {filteredSpecLabels.map((label) => (
                      <VisibilitySwitch
                        key={label}
                        label={label}
                        visible={!hiddenSpecLabels.includes(label)}
                        disabled={pending}
                        onToggle={() =>
                          toggleSpecLabel(
                            label,
                            hiddenSpecLabels.includes(label),
                          )
                        }
                      />
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}

          <DialogFooter>
            <Button
              className="rounded-full"
              disabled={pending || loading}
              onClick={save}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
