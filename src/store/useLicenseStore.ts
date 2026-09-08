// src/store/useLicenseStore.ts
// Zustand store for software licenses — backed by Cloud Firestore.

import { create } from 'zustand';
import { SoftwareLicense, FirestoreStoreState } from '../types';
import {
  subscribeToLicenses,
  addLicenseDoc,
  updateLicenseDoc,
  deleteLicenseDoc,
} from '../lib/firestore/licenseService';

interface LicenseStore extends FirestoreStoreState {
  licenses: SoftwareLicense[];
  selectedLicense: SoftwareLicense | null;
  // UI-only filters
  categoryFilter: string;
  statusFilter: string;
  _unsubscribe: (() => void) | null;

  // Subscription lifecycle
  subscribe: () => void;
  unsubscribe: () => void;

  // UI state setters
  setSelectedLicense: (license: SoftwareLicense | null) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: string) => void;

  // Firestore CRUD
  addLicense: (license: Omit<SoftwareLicense, 'id'>) => Promise<void>;
  updateLicense: (id: string, updated: Partial<SoftwareLicense>) => Promise<void>;
  deleteLicense: (id: string) => Promise<void>;
}

export const useLicenseStore = create<LicenseStore>((set, get) => ({
  // ── Firestore state ────────────────────────────────────────────────────────
  licenses: [],
  loading: true,
  error: null,
  _unsubscribe: null,

  // ── UI state ───────────────────────────────────────────────────────────────
  selectedLicense: null,
  categoryFilter: 'ALL',
  statusFilter: 'ALL',

  // ── Subscription lifecycle ─────────────────────────────────────────────────
  subscribe: () => {
    if (get()._unsubscribe) return;
    const unsub = subscribeToLicenses(
      (licenses) => set({ licenses, loading: false, error: null }),
      (err) => set({ error: err.message, loading: false }),
    );
    set({ _unsubscribe: unsub });
  },

  unsubscribe: () => {
    get()._unsubscribe?.();
    set({ _unsubscribe: null });
  },

  // ── UI state setters ───────────────────────────────────────────────────────
  setSelectedLicense: (license) => set({ selectedLicense: license }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  // ── Firestore CRUD ─────────────────────────────────────────────────────────
  addLicense: async (licenseData) => {
    try {
      const newId = await addLicenseDoc(licenseData);
      const newLicense: SoftwareLicense = {
        ...licenseData,
        id: newId,
      };
      set((state) => {
        if (state.licenses.some((l) => l.id === newId)) return state;
        return { licenses: [newLicense, ...state.licenses], error: null };
      });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  updateLicense: async (id, updated) => {
    try {
      set((state) => ({
        licenses: state.licenses.map((l) => (l.id === id ? { ...l, ...updated } : l)),
        selectedLicense: state.selectedLicense?.id === id ? { ...state.selectedLicense, ...updated } : state.selectedLicense,
      }));
      await updateLicenseDoc(id, updated);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  deleteLicense: async (id) => {
    try {
      set((state) => ({
        licenses: state.licenses.filter((l) => l.id !== id),
        selectedLicense: state.selectedLicense?.id === id ? null : state.selectedLicense,
      }));
      await deleteLicenseDoc(id);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },
}));
