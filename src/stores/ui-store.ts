import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NotificationItem } from "@/types";
import { MOCK_NOTIFICATIONS } from "@/data/mock";

interface UIState {
  sidebarCollapsed: boolean;
  commandOpen: boolean;
  shortcutsOpen: boolean;
  notifications: NotificationItem[];
  storageUsed: number;
  storageLimit: number;

  toggleSidebar: () => void;
  setCommandOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandOpen: false,
      shortcutsOpen: false,
      notifications: MOCK_NOTIFICATIONS,
      storageUsed: 18.4 * 1024 ** 3,
      storageLimit: 25 * 1024 ** 3,

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
    }),
    {
      name: "lumen-ui",
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
