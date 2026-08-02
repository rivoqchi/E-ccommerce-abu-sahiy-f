"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LoginFormSkeleton } from "@/components/skeletons";
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  isValidNational,
  toE164,
  type CountryOption,
} from "@/lib/countries";
import { ApiClientError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

type Step = "phone" | "otp";

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

export function LoginForm() {
  const router = useRouter();
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const inTelegram = useAuthStore((s) => s.inTelegram);
  const telegramAuthStatus = useAuthStore((s) => s.telegramAuthStatus);

  const [step, setStep] = useState<Step>("phone");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY.code);
  const [national, setNational] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneE164, setPhoneE164] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const country = useMemo(
    () => COUNTRIES.find((c) => c.code === countryCode) ?? DEFAULT_COUNTRY,
    [countryCode],
  );

  const telegramConnecting =
    inTelegram &&
    (telegramAuthStatus === "idle" ||
      telegramAuthStatus === "pending" ||
      (telegramAuthStatus === "done" && !!accessToken));

  useEffect(() => {
    if (hydrated && accessToken) {
      router.replace("/account");
    }
  }, [hydrated, accessToken, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [cooldown]);

  function handleSend() {
    setError(null);
    if (!isValidNational(country, national)) {
      setError("Telefon raqamini toʻliq kiriting");
      return;
    }

    const phone = toE164(country.dial, national);
    startTransition(async () => {
      try {
        const res = await sendOtp(phone);
        setPhoneE164(phone);
        setStep("otp");
        setOtp("");
        setCooldown(res.cooldown || 60);
        setIsMock(Boolean(res.mock));
      } catch (err) {
        setError(
          err instanceof ApiClientError
            ? err.message
            : "Kod yuborib boʻlmadi. Qayta urinib koʻring.",
        );
      }
    });
  }

  function handleVerify(code: string) {
    if (code.length < 6) return;
    setError(null);
    startTransition(async () => {
      try {
        await verifyOtp(phoneE164, code);
        router.replace("/account");
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

  function handleResend() {
    if (cooldown > 0 || !phoneE164) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await sendOtp(phoneE164);
        setCooldown(res.cooldown || 60);
        setOtp("");
        setIsMock(Boolean(res.mock));
      } catch (err) {
        setError(
          err instanceof ApiClientError
            ? err.message
            : "Qayta yuborib boʻlmadi.",
        );
      }
    });
  }

  if (!hydrated || telegramConnecting || (hydrated && accessToken)) {
    return <LoginFormSkeleton />;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col">
      <LoginTopBar
        onBack={() => {
          if (step === "otp") {
            setStep("phone");
            setError(null);
            setOtp("");
            return;
          }
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
            return;
          }
          router.push("/");
        }}
      />

      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">UyTexnika</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {step === "phone" ? "Hisobga kirish" : "Kodni kiriting"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
          {step === "phone"
            ? "Telefon raqamingizni yozing — kod Telegram Verification Codes’ga keladi."
            : isMock
              ? "Hozir mock rejim: Telegramga kod yuborilmaydi. Test kodi: 123456"
              : `${phoneE164} raqamiga yuborilgan 6 xonali kodni kiriting.`}
        </p>
      </div>

      {telegramAuthStatus === "error" ? (
        <p
          role="status"
          className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-sm text-muted-foreground"
        >
          Telegram orqali ulanib boʻlmadi. Telefon orqali davom eting.
        </p>
      ) : null}

      <div className="mt-8 space-y-4">
        {step === "phone" ? (
          <PhoneStep
            country={country}
            countryCode={countryCode}
            national={national}
            pending={pending}
            onCountryChange={setCountryCode}
            onNationalChange={(value) =>
              setNational(value.replace(/[^\d\s]/g, ""))
            }
            onSubmit={handleSend}
          />
        ) : (
          <OtpStep
            otp={otp}
            pending={pending}
            cooldown={cooldown}
            isMock={isMock}
            onOtpChange={(value) => {
              setOtp(value);
              if (value.length === 6) handleVerify(value);
            }}
            onResend={handleResend}
          />
        )}

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

function PhoneStep({
  country,
  countryCode,
  national,
  pending,
  onCountryChange,
  onNationalChange,
  onSubmit,
}: {
  country: CountryOption;
  countryCode: string;
  national: string;
  pending: boolean;
  onCountryChange: (code: string) => void;
  onNationalChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {/* Single unified phone control — equal height, one surface */}
      <div
        className={cn(
          "flex h-14 w-full items-stretch overflow-hidden rounded-2xl bg-card",
          "shadow-[var(--shadow-soft)] ring-1 ring-foreground/8",
          "focus-within:ring-2 focus-within:ring-ring/40",
        )}
      >
        <Select
          value={countryCode}
          onValueChange={(value) => {
            if (value) onCountryChange(value);
          }}
        >
          <SelectTrigger
            aria-label="Mamlakat kodi"
            className={cn(
              "h-full! min-h-14 w-auto shrink-0 rounded-none border-0 bg-transparent",
              "px-3.5 shadow-none ring-0",
              "data-[size=default]:h-full! data-[size=default]:min-h-14",
              "focus-visible:ring-0 focus-visible:border-transparent",
              "dark:bg-transparent dark:hover:bg-transparent",
            )}
          >
            <SelectValue>
              <span className="flex items-center gap-1.5 text-[15px] font-medium tabular-nums">
                <span aria-hidden className="text-base leading-none">
                  {country.flag}
                </span>
                <span>{country.dial}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="start" className="max-h-72 min-w-[16rem]">
            {COUNTRIES.map((item) => (
              <SelectItem key={item.code} value={item.code}>
                <span className="flex items-center gap-2">
                  <span aria-hidden>{item.flag}</span>
                  <span className="font-medium tabular-nums">{item.dial}</span>
                  <span className="text-muted-foreground">{item.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          aria-hidden
          className="my-3 w-px shrink-0 self-stretch bg-border"
        />

        <Input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="90 123 45 67"
          value={national}
          onChange={(e) => onNationalChange(e.target.value)}
          className={cn(
            "h-full min-h-14 flex-1 rounded-none border-0 bg-transparent px-4",
            "text-[15px] shadow-none ring-0 focus-within:ring-0",
            "dark:bg-transparent md:text-[15px]",
          )}
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="h-14 w-full rounded-full text-base font-semibold"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Yuborilmoqda…
          </>
        ) : (
          "Kod yuborish"
        )}
      </Button>
    </form>
  );
}

function OtpStep({
  otp,
  pending,
  cooldown,
  isMock,
  onOtpChange,
  onResend,
}: {
  otp: string;
  pending: boolean;
  cooldown: number;
  isMock: boolean;
  onOtpChange: (value: string) => void;
  onResend: () => void;
}) {
  return (
    <div className="space-y-6">
      {isMock ? (
        <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
          <p className="font-medium">Dev / mock rejim</p>
          <p className="mt-1 text-muted-foreground">
            Telegram Verification Codes’ga kod{" "}
            <span className="font-semibold text-foreground">kelmaydi</span>.
            Kirish uchun kod:{" "}
            <span className="font-semibold tabular-nums text-foreground">
              123456
            </span>
          </p>
        </div>
      ) : null}

      <InputOTP
        maxLength={6}
        value={otp}
        onChange={onOtpChange}
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

      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="text-muted-foreground">
          {isMock
            ? "Haqiqiy kod uchun Gateway token kerak"
            : "Kod Telegramdagi Verification Codes’ga keladi"}
        </p>
        <Button
          type="button"
          variant="ghost"
          disabled={pending || cooldown > 0}
          onClick={onResend}
          className="h-9 shrink-0 rounded-full px-3"
        >
          {cooldown > 0 ? `${cooldown}s` : "Qayta yuborish"}
        </Button>
      </div>

      {pending ? (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Tekshirilmoqda…
        </div>
      ) : null}
    </div>
  );
}
