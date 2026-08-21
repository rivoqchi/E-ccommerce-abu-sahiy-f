"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LoginFormSkeleton } from "@/components/skeletons";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const BOT_USERNAME =
  process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "").trim() ||
  "samipricebot";

const TOKEN_LOGIN_TIMEOUT_MS = 45_000;

function safeNextPath(next: string): string {
  return next.startsWith("/") ? next : "/account";
}

function tokenLoginErrorMessage(err: unknown): string {
  if (err instanceof ApiClientError) return err.message;
  if (err instanceof TypeError) {
    return "API ga ulanib bo‘lmadi. Internetni tekshiring yoki botdan yangi link oling.";
  }
  return "Avtomatik kirish ishlamadi. Botdan yangi link yoki kod oling.";
}

const iconBtnClass =
  "rounded-full bg-card shadow-[var(--shadow-soft)] ring-1 ring-foreground/5";

function LoginTopBar({ onBack }: { onBack: () => void }) {
  return (
    <div className="mb-2 flex items-center justify-between md:mb-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={iconBtnClass}
        aria-label="Orqaga"
        onClick={onBack}
      >
        <ArrowLeft className="size-[18px]" strokeWidth={1.75} />
      </Button>
      <ThemeToggle className={iconBtnClass} />
    </div>
  );
}

function LoginLoading({ label }: { label: string }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 py-16">
      <Loader2 className="size-8 animate-spin text-foreground" />
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-center text-xs text-muted-foreground">
        Bir necha soniya kuting…
      </p>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyBotOtp = useAuthStore((s) => s.verifyBotOtp);
  const loginWithBotWebToken = useAuthStore((s) => s.loginWithBotWebToken);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const inTelegram = useAuthStore((s) => s.inTelegram);
  const telegramAuthStatus = useAuthStore((s) => s.telegramAuthStatus);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const nextPath = searchParams.get("next") || "/account";
  const webToken = searchParams.get("token");
  const dest = safeNextPath(nextPath);
  const [tokenPending, setTokenPending] = useState(() => Boolean(webToken));
  const [pending, startTransition] = useTransition();

  // Open Web ?token= bo‘lsa Mini App silent auth UI ni bloklamasin
  const telegramConnecting =
    !webToken &&
    inTelegram &&
    (telegramAuthStatus === "idle" ||
      telegramAuthStatus === "pending" ||
      (telegramAuthStatus === "done" && !!accessToken));

  useEffect(() => {
    if (hydrated && accessToken && !webToken && !tokenPending) {
      router.replace(dest);
    }
  }, [hydrated, accessToken, router, dest, webToken, tokenPending]);

  useEffect(() => {
    if (!hydrated || !webToken) return;

    setTokenPending(true);
    setError(null);

    const timeout = window.setTimeout(() => {
      if (useAuthStore.getState().accessToken) {
        router.replace(dest);
        return;
      }
      setError(
        "Avtomatik kirish juda uzoq davom etdi. Botdan yangi Open Web link oling yoki kod bilan kiring.",
      );
      setTokenPending(false);
    }, TOKEN_LOGIN_TIMEOUT_MS);

    void (async () => {
      try {
        await loginWithBotWebToken(webToken);
        window.clearTimeout(timeout);
        router.replace(dest);
      } catch (err) {
        window.clearTimeout(timeout);
        if (useAuthStore.getState().accessToken) {
          router.replace(dest);
          return;
        }
        setError(tokenLoginErrorMessage(err));
        setTokenPending(false);
      }
    })();

    return () => {
      window.clearTimeout(timeout);
    };
  }, [hydrated, webToken, loginWithBotWebToken, router, dest]);

  function handleVerify(code: string) {
    if (code.length < 6) return;
    setError(null);
    startTransition(async () => {
      try {
        await verifyBotOtp(code);
        router.replace(dest);
      } catch (err) {
        setError(
          err instanceof ApiClientError
            ? err.message
            : "Kod notoʻgʻri. Qayta urinib koʻring.",
        );
        setOtp("");
      }
    });
  }

  if (webToken && (!hydrated || tokenPending)) {
    return <LoginLoading label="Avtomatik kirish…" />;
  }

  if (!hydrated) {
    return <LoginFormSkeleton />;
  }

  if (tokenPending) {
    return <LoginLoading label="Avtomatik kirish…" />;
  }

  if (telegramConnecting) {
    return <LoginLoading label="Telegram orqali ulanilmoqda…" />;
  }

  if (hydrated && accessToken && !error) {
    return <LoginLoading label="Hisobga yo‘naltirilmoqda…" />;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col">
      <LoginTopBar
        onBack={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
          }
          router.push("/");
        }}
      />

      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">Sami</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Hisobga kirish
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
          Ro‘yxatdan o‘tish{" "}
          <span className="font-medium text-foreground">Sami bot</span> orqali.
          Botni ochib Start ni bosing va telefon raqamingizni yuboring.
          Allaqachon ro‘yxatdan o‘tgan bo‘lsangiz — botdagi{" "}
          <span className="font-medium text-foreground">Kod yuborish</span>{" "}
          tugmasi bilan 6 xonali kod oling.
        </p>
      </div>

      {telegramAuthStatus === "error" ? (
        <p
          role="status"
          className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground"
        >
          Telegram Mini App ulanmadi. Pastdagi bot orqali kod oling.
        </p>
      ) : null}

      <div className="mt-8 space-y-4">
        <Button
          type="button"
          className="h-14 w-full rounded-full text-base font-semibold"
          render={
            <a
              href={`https://t.me/${BOT_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <ExternalLink className="size-4" />
          Sami botda ro‘yxatdan o‘tish (@{BOT_USERNAME})
        </Button>

        <div className="space-y-6">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              if (value.length === 6) handleVerify(value);
            }}
            disabled={pending}
            containerClassName="w-full justify-between gap-2"
            autoFocus
          >
            <InputOTPGroup className="flex w-full justify-between gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className={cn(
                    "h-14 w-full min-w-0 flex-1 rounded-2xl border-0 bg-card text-lg font-semibold",
                    "shadow-[var(--shadow-soft)] ring-1 ring-foreground/8",
                    "first:rounded-2xl first:border-0 last:rounded-2xl",
                    "data-[active=true]:ring-2 data-[active=true]:ring-ring",
                  )}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {pending ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Tekshirilmoqda…
            </div>
          ) : null}
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
