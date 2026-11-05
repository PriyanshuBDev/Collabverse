// src/lib/stores/notification-toast-store.ts
import { notificationProps } from "@/app/interfaces";
import { create } from "zustand";

type NotificationToastStore = {
  notifications: notificationProps[];
  add: (notification: notificationProps) => void;
  dismiss: (id: string) => void;
};

export const useNotificationToastStore = create<NotificationToastStore>(
  (set) => ({
    notifications: [],

    add: (notification) =>
      set((state) => ({
        // Avoid showing the same notification twice.
        notifications: [
          ...state.notifications.filter(
            (item: notificationProps) => item.id !== notification.id,
          ),
          notification,
        ].slice(0, 4),
      })),

    dismiss: (id) =>
      set((state) => ({
        notifications: state.notifications.filter(
          (item: notificationProps) => item.id !== id,
        ),
      })),
  }),
);
