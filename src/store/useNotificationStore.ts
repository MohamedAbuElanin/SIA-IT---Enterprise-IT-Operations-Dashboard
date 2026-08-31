import { create } from 'zustand';
import { SystemAlert } from '../types';
import initialAlerts from '../data/alerts.json';

interface NotificationStore {
  alerts: SystemAlert[];
  unreadCount: number;
  isOpen: boolean;

  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAlert: (id: string) => void;
  addAlert: (alert: Omit<SystemAlert, 'id' | 'read'>) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  alerts: (initialAlerts as SystemAlert[]) || [],
  unreadCount: Array.isArray(initialAlerts) ? (initialAlerts as SystemAlert[]).filter((a) => !a.read).length : 0,
  isOpen: false,

  setIsOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  markAsRead: (id) =>
    set((state) => {
      const updated = state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
      return {
        alerts: updated,
        unreadCount: updated.filter((a) => !a.read).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, read: true })),
      unreadCount: 0,
    })),

  clearAlert: (id) =>
    set((state) => {
      const updated = state.alerts.filter((a) => a.id !== id);
      return {
        alerts: updated,
        unreadCount: updated.filter((a) => !a.read).length,
      };
    }),

  addAlert: (alertData) =>
    set((state) => {
      const newAlert: SystemAlert = {
        ...alertData,
        id: `alt-${Date.now()}`,
        read: false,
      };
      const updated = [newAlert, ...state.alerts];
      return {
        alerts: updated,
        unreadCount: updated.filter((a) => !a.read).length,
      };
    }),
}));
