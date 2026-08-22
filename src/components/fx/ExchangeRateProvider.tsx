"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  fetchExchangeRate,
  type ExchangeRate,
} from "@/lib/storefront-api";

type ExchangeRateState = {
  usdToUzs: number;
  date: string | null;
};

const ExchangeRateContext = createContext<ExchangeRateState>({
  usdToUzs: 0,
  date: null,
});

export function ExchangeRateProvider({
  initial,
  children,
}: {
  initial: ExchangeRate | null;
  children: ReactNode;
}) {
  const [rate, setRate] = useState<ExchangeRate | null>(initial);

  useEffect(() => {
    if (initial && initial.usdToUzs > 0) return;
    let cancelled = false;
    void fetchExchangeRate().then((next) => {
      if (!cancelled && next) setRate(next);
    });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  return (
    <ExchangeRateContext.Provider
      value={{
        usdToUzs: rate?.usdToUzs && rate.usdToUzs > 0 ? rate.usdToUzs : 0,
        date: rate?.date ?? null,
      }}
    >
      {children}
    </ExchangeRateContext.Provider>
  );
}

export function useExchangeRate(): ExchangeRateState {
  return useContext(ExchangeRateContext);
}

export function useUsdToUzs(): number {
  return useContext(ExchangeRateContext).usdToUzs;
}
