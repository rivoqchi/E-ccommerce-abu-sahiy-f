"use client";

import { useEffect, useRef } from "react";
import { WS_URL } from "@/lib/env";
import { ingestAdminAlert } from "@/lib/admin-alerts";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

type SocketClient = {
  on: (event: string, fn: (...args: unknown[]) => void) => void;
  emit: (event: string, payload?: unknown) => void;
  disconnect: () => void;
};

type PollOrder = {
  _id: string;
  total: number;
  currency?: string;
  shippingAddress?: { fullName?: string };
  items?: unknown[];
};

export function useAdminRealtime() {
  const token = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    if (!token || role !== "admin") return;

    let cancelled = false;
    let socket: SocketClient | null = null;
    let pollTimer: number | null = null;
    let seeded = false;

    const seedFromOrders = (orders: PollOrder[]) => {
      for (const order of orders) {
        seen.current.add(`new_order:${order._id}`);
      }
      seeded = true;
    };

    const ingestOrder = (order: PollOrder) => {
      ingestAdminAlert(
        {
          type: "new_order",
          orderId: order._id,
          total: order.total,
          currency: order.currency,
          customerName: order.shippingAddress?.fullName,
          itemCount: order.items?.length ?? 0,
        },
        seen.current,
      );
    };

    const poll = async () => {
      try {
        const orders = await apiFetch<PollOrder[]>("/orders", { token });
        if (cancelled) return;
        if (!seeded) {
          seedFromOrders(orders);
          return;
        }
        for (const order of orders) ingestOrder(order);
      } catch {
        // Ignore transient poll errors
      }
    };

    void (async () => {
      try {
        const { io } = await import("socket.io-client");
        if (cancelled) return;
        socket = io(`${WS_URL}/realtime`, {
          transports: ["websocket", "polling"],
          withCredentials: true,
        }) as unknown as SocketClient;

        socket.on("connect", () => {
          socket?.emit("join", { token });
        });

        socket.on("admin.alert", (...args: unknown[]) => {
          ingestAdminAlert(args[0], seen.current);
        });
      } catch {
        // Socket unavailable — polling still covers new orders
      }
    })();

    void poll();
    pollTimer = window.setInterval(() => {
      void poll();
    }, 25_000);

    return () => {
      cancelled = true;
      if (pollTimer != null) window.clearInterval(pollTimer);
      socket?.disconnect();
    };
  }, [token, role]);
}
