// src/store/useNotificationStore.ts
// Zustand store for System Alerts — backed by Cloud Firestore.

import { create } from 'zustand';
import { SystemAlert, FirestoreStoreState } from '../types';
import {
  subscribeToAlerts,
  addAlertDoc,
  markAlertReadDoc,
  markAllAlertsReadDoc,
  clearAlertDoc,
} from '../lib/firestore/alertService';

interface NotificationStore extends FirestoreStoreState {
  alerts: SystemAlert[];
  unreadCount: number;
  isOpen: boolean;
  _unsubscribe: (() => void) | null;

  subscribe: () => void;
  unsubscribe: () => void;

  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAlert: (id: string) => Promise<void>;
  addAlert: (alert: Omit<SystemAlert, 'id' | 'read'>) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  alerts: [],
  unreadCount: 0,
  isOpen: false,
  loading: true,
  error: null,
  _unsubscribe: null,

  subscribe: () => {
    if (get()._unsubscribe) return;
    const unsub = subscribeToAlerts(
      (alerts) => {
        const unreadCount = alerts.filter((a) => !a.read).length;
        set({ alerts, unreadCount, loading: false, error: null });
      },
      (err) => set({ error: err.message, loading: false })
    );
    set({ _unsubscribe: unsub });
  },

  unsubscribe: () => {
    get()._unsubscribe?.();
    set({ _unsubscribe: null });
  },

  setIsOpen: (open) => set({ isOpen: open }),
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  markAsRead: async (id) => {
    try {
      await markAlertReadDoc(id);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllAlertsReadDoc();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  clearAlert: async (id) => {
    try {
      await clearAlertDoc(id);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  addAlert: async (alertData) => {
    try {
      await addAlertDoc(alertData);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },
}));
