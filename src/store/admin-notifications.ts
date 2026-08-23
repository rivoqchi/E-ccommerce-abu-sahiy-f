"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminNotificationType = "new_order" | "low_stock";

export type AdminNotification = {
  id: string;
  type: AdminNotificationType;
  title: string;
  body: string;
  href: string;
  createdAt: number;
  read: boolean;
  orderId?: string;
};

const MAX_ITEMS = 40;

interface AdminNotificationsState {
  items: AdminNotification[];
  add: (item: AdminNotification) => boolean;
  markRead: (id: string) => void;
  markTypeRead: (type: AdminNotificationType) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useAdminNotifications = create<AdminNotificationsState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (item) => {
        if (get().items.some((row) => row.id === item.id)) return false;
        set({
          items: [item, ...get().items].slice(0, MAX_ITEMS),
        });
        return true;
      },

      markRead: (id) => {
        set({
          items: get().items.map((row) =>
            row.id === id ? { ...row, read: true } : row,
          ),
        });
      },

      markTypeRead: (type) => {
        set({
          items: get().items.map((row) =>
            row.type === type ? { ...row, read: true } : row,
          ),
        });
      },

      markAllRead: () => {
        set({
          items: get().items.map((row) =>
            row.read ? row : { ...row, read: true },
          ),
        });
      },

      clear: () => set({ items: [] }),
    }),
    {
      name: "sami-admin-notifications",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function unreadCount(
  items: AdminNotification[],
  type?: AdminNotificationType,
) {
  return items.filter((row) => !row.read && (!type || row.type === type))
    .length;
}
