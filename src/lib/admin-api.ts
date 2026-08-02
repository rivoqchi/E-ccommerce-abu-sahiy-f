"use client";

import { useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export function useAdminApi() {
  const adminFetch = useCallback(
    async <T,>(path: string, init?: RequestInit) => {
      const token = useAuthStore.getState().accessToken;
      if (!token) throw new Error("Not authenticated");
      return apiFetch<T>(path, { ...init, token });
    },
    [],
  );

  return { adminFetch };
}
