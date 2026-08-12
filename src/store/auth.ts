"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/lib/api";
import type {
  AuthSession,
  AuthUser,
  SendOtpResponse,
} from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrated: boolean;
  /** Telegram Mini App silent auth lifecycle */
  inTelegram: boolean;
  telegramAuthStatus: "idle" | "pending" | "done" | "unavailable" | "error";
  setHydrated: (value: boolean) => void;
  setTelegramAuth: (payload: {
    inTelegram: boolean;
    status: AuthState["telegramAuthStatus"];
  }) => void;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  sendOtp: (phone: string) => Promise<SendOtpResponse>;
  verifyOtp: (phone: string, code: string) => Promise<AuthSession>;
  verifyBotOtp: (code: string) => Promise<AuthSession>;
  loginWithBotWebToken: (token: string) => Promise<AuthSession>;
  loginWithTelegram: (initData: string) => Promise<AuthSession>;
  linkTelegramContact: (contactData: string) => Promise<AuthSession>;
  refreshMe: () => Promise<AuthUser>;
  updateProfile: (payload: {
    firstName?: string;
    lastName?: string;
    username?: string;
    phone?: string;
  }) => Promise<AuthUser>;
  updateAvatar: (dataUrl: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hydrated: false,
      inTelegram: false,
      telegramAuthStatus: "idle",

      setHydrated: (value) => {
        if (get().hydrated === value) return;
        set({ hydrated: value });
      },

      setTelegramAuth: ({ inTelegram, status }) => {
        const current = get();
        if (
          current.inTelegram === inTelegram &&
          current.telegramAuthStatus === status
        ) {
          return;
        }
        set({ inTelegram, telegramAuthStatus: status });
      },

      setSession: (session) =>
        set({
          user: {
            ...session.user,
            priceTier:
              session.user.priceTier === "wholesale" ? "wholesale" : "retail",
          },
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          telegramAuthStatus: "done",
        }),

      clearSession: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        }),

      sendOtp: async (phone) => {
        return apiFetch<SendOtpResponse>("/auth/otp/send", {
          method: "POST",
          body: JSON.stringify({ phone }),
        });
      },

      verifyOtp: async (phone, code) => {
        const session = await apiFetch<AuthSession>("/auth/otp/verify", {
          method: "POST",
          body: JSON.stringify({ phone, code }),
        });
        get().setSession(session);
        return session;
      },

      verifyBotOtp: async (code) => {
        const session = await apiFetch<AuthSession>("/auth/bot-otp/verify", {
          method: "POST",
          body: JSON.stringify({ code }),
        });
        get().setSession(session);
        return session;
      },

      loginWithBotWebToken: async (token) => {
        const session = await apiFetch<AuthSession>("/auth/bot-web-login", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        get().setSession(session);
        return session;
      },

      loginWithTelegram: async (initData) => {
        const session = await apiFetch<AuthSession>("/auth/telegram", {
          method: "POST",
          body: JSON.stringify({ initData }),
        });
        get().setSession(session);
        return session;
      },

      linkTelegramContact: async (contactData) => {
        const token = get().accessToken;
        if (!token) throw new Error("Not authenticated");
        const session = await apiFetch<AuthSession>("/auth/telegram/contact", {
          method: "POST",
          token,
          body: JSON.stringify({ contactData }),
        });
        get().setSession(session);
        return session;
      },

      refreshMe: async () => {
        const token = get().accessToken;
        if (!token) throw new Error("Not authenticated");
        const user = await apiFetch<AuthUser>("/users/me", { token });
        const normalized: AuthUser = {
          ...user,
          priceTier: user.priceTier === "wholesale" ? "wholesale" : "retail",
        };
        set({ user: normalized });
        return normalized;
      },

      updateProfile: async (payload) => {
        const token = get().accessToken;
        if (!token) throw new Error("Not authenticated");
        const user = await apiFetch<AuthUser>("/users/me", {
          method: "PATCH",
          token,
          body: JSON.stringify(payload),
        });
        set({ user });
        return user;
      },

      updateAvatar: async (dataUrl) => {
        const token = get().accessToken;
        if (!token) throw new Error("Not authenticated");
        const user = await apiFetch<AuthUser>("/users/me/avatar", {
          method: "POST",
          token,
          body: JSON.stringify({ dataUrl }),
        });
        set({ user });
        return user;
      },

      logout: async () => {
        const token = get().accessToken;
        try {
          if (token) {
            await apiFetch("/auth/logout", {
              method: "POST",
              token,
            });
          }
        } catch {
          // ignore network/logout errors — always clear local session
        }
        get().clearSession();
      },
    }),
    {
      name: "sami-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("[auth] rehydrate failed", error);
        }
        // Prefer direct setState — action may be missing if rehydrate failed early
        if (state) {
          state.setHydrated(true);
        } else {
          queueMicrotask(() => {
            useAuthStore.setState({ hydrated: true });
          });
        }
      },
    },
  ),
);
