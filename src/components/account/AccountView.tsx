"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  LayoutDashboard,
  Loader2,
  LogOut,
  Phone,
  User as UserIcon,
  AtSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountPageSkeleton } from "@/components/skeletons";
import { LogoutConfirm } from "@/components/auth/LogoutConfirm";
import { ApiClientError } from "@/lib/api";
import { fileToAvatarDataUrl } from "@/lib/avatar";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

export function AccountView() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const inTelegram = useAuthStore((s) => s.inTelegram);
  const telegramAuthStatus = useAuthStore((s) => s.telegramAuthStatus);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const updateAvatar = useAuthStore((s) => s.updateAvatar);

  const fileRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [avatarPending, startAvatarTransition] = useTransition();

  const telegramConnecting = inTelegram && telegramAuthStatus === "pending";

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? splitName(user.fullName).first);
    setLastName(user.lastName ?? splitName(user.fullName).last);
    setUsername(user.username ?? "");
    setPhone(user.phone ?? "");
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;
    const token = useAuthStore.getState().accessToken;
    if (!token) return;
    void useAuthStore
      .getState()
      .refreshMe()
      .catch(() => {
        /* keep cached user */
      });
  }, [hydrated]);

  if (!hydrated || telegramConnecting) {
    return <AccountPageSkeleton />;
  }

  if (!user) {
    return (
      <div className="mx-auto w-[90%] max-w-lg py-5 md:w-[80%] md:max-w-xl md:py-10">
        <AccountHeader />
        <Card className="mt-8 rounded-3xl border-0 bg-card py-0 shadow-[var(--shadow-soft)] ring-0">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-secondary">
              <UserIcon
                className="size-7 text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
            <p className="mt-5 text-lg font-semibold text-foreground">
              Hisob ulanmagan
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {inTelegram
                ? "Telegram ulanishi muvaffaqiyatsiz. Qayta urinib koʻring yoki telefon orqali kiring."
                : "Telefon orqali kiring. Telegram Mini App ichida avtomatik ulanasiz."}
            </p>
            <Button
              className="mt-6 h-11 rounded-full px-6"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Kirish
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = (
    (firstName || lastName || user.fullName || "?").trim().charAt(0) || "?"
  ).toUpperCase();

  const dirty =
    firstName !== (user.firstName ?? splitName(user.fullName).first) ||
    lastName !== (user.lastName ?? splitName(user.fullName).last) ||
    username !== (user.username ?? "") ||
    phone !== (user.phone ?? "");

  function onPickAvatar(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm fayllari qabul qilinadi");
      return;
    }
    setError(null);
    startAvatarTransition(async () => {
      try {
        const dataUrl = await fileToAvatarDataUrl(file);
        await updateAvatar(dataUrl);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        setError(
          err instanceof ApiClientError
            ? err.message
            : "Rasm yuklanmadi. Qayta urinib koʻring.",
        );
      }
    });
  }

  function onSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        const payload: {
          firstName?: string;
          lastName?: string;
          username?: string;
          phone?: string;
        } = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim().replace(/^@/, ""),
        };
        const nextPhone = phone.trim();
        if (nextPhone) {
          if (!/^\+[1-9]\d{7,14}$/.test(nextPhone)) {
            setError("Raqam E.164 formatida boʻlsin, masalan +998901234567");
            return;
          }
          payload.phone = nextPhone;
        }
        await updateProfile(payload);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        setError(
          err instanceof ApiClientError
            ? err.message
            : "Saqlab boʻlmadi. Qayta urinib koʻring.",
        );
      }
    });
  }

  return (
    <div className="mx-auto w-[90%] max-w-lg py-5 md:w-[80%] md:max-w-xl md:py-10">
      <AccountHeader />

      {/* Hero profile card */}
      <Card className="mt-8 overflow-hidden rounded-3xl border-0 bg-card py-0 shadow-[var(--shadow-soft)] ring-0">
        <div className="relative h-28 bg-[linear-gradient(135deg,var(--hero-from),var(--hero-via),var(--hero-to))]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
        </div>
        <CardContent className="relative px-5 pb-6 pt-0">
          <div className="-mt-12 flex flex-col items-center">
            <div className="relative">
              <Avatar className="size-24 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-4 ring-card after:hidden data-[size=default]:size-24">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                ) : null}
                <AvatarFallback className="bg-secondary text-2xl font-semibold text-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                disabled={avatarPending}
                onClick={() => fileRef.current?.click()}
                aria-label="Profil rasmini o‘zgartirish"
                className={cn(
                  "absolute bottom-0.5 right-0.5 flex size-9 items-center justify-center rounded-full",
                  "bg-primary text-primary-foreground shadow-md",
                  "transition hover:opacity-90 active:scale-95",
                  "disabled:opacity-60",
                )}
              >
                {avatarPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" strokeWidth={1.75} />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  onPickAvatar(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>

            <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-foreground">
              {[firstName, lastName].filter(Boolean).join(" ") || user.fullName}
            </h2>
            {username ? (
              <p className="mt-1 text-sm text-muted-foreground">@{username}</p>
            ) : null}
            {user.telegramId ? (
              <span className="mt-3 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                Telegram orqali ulangan
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Editable fields */}
      <Card className="mt-4 rounded-3xl border-0 bg-card py-0 shadow-[var(--shadow-soft)] ring-0">
        <CardContent className="space-y-4 px-5 py-5">
          <p className="text-sm font-semibold text-foreground">
            Shaxsiy maʼlumotlar
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Ism"
              value={firstName}
              onChange={setFirstName}
              placeholder="Ism"
              autoComplete="given-name"
            />
            <Field
              label="Familiya"
              value={lastName}
              onChange={setLastName}
              placeholder="Familiya"
              autoComplete="family-name"
            />
          </div>

          <Field
            label="Username"
            value={username}
            onChange={(v) => setUsername(v.replace(/\s/g, ""))}
            placeholder="username"
            autoComplete="username"
            leading={<AtSign className="size-4 text-muted-foreground" />}
          />

          <Field
            label="Telefon"
            value={phone}
            onChange={(v) => setPhone(v.replace(/[^\d+]/g, ""))}
            placeholder="+998901234567"
            autoComplete="tel"
            inputMode="tel"
            leading={<Phone className="size-4 text-muted-foreground" />}
          />

          {error ? (
            <p
              role="alert"
              className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <Button
            type="button"
            disabled={pending || !dirty}
            onClick={onSave}
            className="h-12 w-full rounded-full text-base font-semibold"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saqlanmoqda…
              </>
            ) : saved ? (
              <>
                <Check className="size-4" />
                Saqlandi
              </>
            ) : (
              "Oʻzgarishlarni saqlash"
            )}
          </Button>
        </CardContent>
      </Card>

      {user.role === "admin" ||
      normalizePhone(user.phone) === "+998947932005" ? (
        <Card className="mt-4 rounded-3xl border-0 bg-card py-0 shadow-[var(--shadow-soft)] ring-0">
          <CardContent className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Super Admin panel
              </p>
              
            </div>
            <Button
              className="h-11 rounded-full px-5"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  setError(null);
                  try {
                    const latest = await useAuthStore.getState().refreshMe();
                    if (latest.role === "admin") {
                      router.push("/admin");
                      return;
                    }
                    setError(
                      "Admin huquqi topilmadi. +998947932005 raqami bilan OTP orqali qayta kiring.",
                    );
                  } catch {
                    setError(
                      "Sessiya tugagan. Qayta login qilib, keyin Admin panelga kiring.",
                    );
                    router.push("/login?next=/admin");
                  }
                });
              }}
            >
              <LayoutDashboard className="size-4" strokeWidth={1.75} />
              Admin panel
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <LogoutConfirm
        className="mt-4 h-12 w-full rounded-full"
        redirectTo="/login"
      >
        <LogOut className="size-4" strokeWidth={1.75} />
        Chiqish
      </LogoutConfirm>
    </div>
  );
}

function AccountHeader() {
  return (
    <header>
      <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-4xl">
        Profil
      </h1>
     
    </header>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  inputMode,
  leading,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  leading?: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="relative">
        {leading ? (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2">
            {leading}
          </span>
        ) : null}
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          className={cn(
            "h-12 rounded-2xl border-0 bg-secondary/70 px-4 text-[15px] shadow-none ring-1 ring-foreground/6",
            "focus-within:ring-2 focus-within:ring-ring/40 md:text-[15px]",
            leading && "pl-10",
          )}
        />
      </div>
    </label>
  );
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    first: parts[0] ?? "",
    last: parts.slice(1).join(" "),
  };
}

function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const trimmed = phone.trim().replace(/[\s-]/g, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("998") && trimmed.length >= 12) return `+${trimmed}`;
  return trimmed;
}
