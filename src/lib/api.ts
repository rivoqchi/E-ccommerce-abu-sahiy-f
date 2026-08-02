import { API_BASE_URL } from "@/lib/env";
import type { AuthTokens } from "@/types/auth";

type ApiSuccess<T> = { success: true; data: T };
type ApiError = {
  success: false;
  statusCode: number;
  message: string | string[];
};

function formatMessage(message: string | string[]): string {
  return Array.isArray(message) ? message.join(", ") : message;
}

export class ApiClientError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const { useAuthStore } = await import("@/store/auth");
    const { refreshToken, clearSession, setSession, user } =
      useAuthStore.getState();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const json = (await response.json()) as ApiSuccess<AuthTokens> | ApiError;
      if (!response.ok || !json.success) {
        clearSession();
        return null;
      }

      const tokens = json.data;
      if (user) {
        setSession({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      } else {
        useAuthStore.setState({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      }
      return tokens.accessToken;
    } catch {
      clearSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { token?: string; skipAuthRefresh?: boolean },
): Promise<T> {
  const { token, headers, skipAuthRefresh, ...rest } = init ?? {};
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const json = (await response.json()) as ApiSuccess<T> | ApiError;

  if (
    response.status === 401 &&
    token &&
    !skipAuthRefresh &&
    !normalizedPath.startsWith("/auth/refresh")
  ) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return apiFetch<T>(path, {
        ...init,
        token: nextToken,
        skipAuthRefresh: true,
      });
    }
  }

  if (!response.ok || !json.success) {
    const err = json as ApiError;
    throw new ApiClientError(
      err.statusCode ?? response.status,
      formatMessage(err.message ?? "So'rov muvaffaqiyatsiz tugadi"),
    );
  }

  return json.data;
}
