"use client";

import { useCallback } from "react";
import { apiDownload, apiFetch } from "@/lib/api";
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

  const adminDownload = useCallback(async (path: string, filename: string) => {
    const token = useAuthStore.getState().accessToken;
    if (!token) throw new Error("Not authenticated");
    return apiDownload(path, { token, filename });
  }, []);

  return { adminFetch, adminDownload };
}
