// src/store/useAssetStore.ts
// Zustand store for IT assets — backed by Cloud Firestore.
// All UI state (filters, selected item) remains local.
// All CRUD mutations go through the Firestore service layer.

import { create } from 'zustand';
import { ITAsset, AssetStatus, FirestoreStoreState } from '../types';
import {
  subscribeToAssets,
  addAssetDoc,
  updateAssetDoc,
  deleteAssetDoc,
  toggleAssetFavoriteDoc,
} from '../lib/firestore/assetService';

interface AssetStore extends FirestoreStoreState {
  assets: ITAsset[];
  // UI-only state (not persisted)
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
  locationFilter: string;
  selectedAsset: ITAsset | null;
  _unsubscribe: (() => void) | null;

  // Subscription lifecycle
  subscribe: () => void;
  unsubscribe: () => void;

  // UI state setters
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: string) => void;
  setLocationFilter: (location: string) => void;
  setSelectedAsset: (asset: ITAsset | null) => void;

  // Firestore CRUD
  addAsset: (asset: Omit<ITAsset, 'id'>) => Promise<void>;
  updateAsset: (id: string, updated: Partial<ITAsset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
}

export const useAssetStore = create<AssetStore>((set, get) => ({
  // ── Firestore state ────────────────────────────────────────────────────────
  assets: [],
  loading: true,
  error: null,
  _unsubscribe: null,

  // ── UI state ───────────────────────────────────────────────────────────────
  searchQuery: '',
  categoryFilter: 'ALL',
  statusFilter: 'ALL',
  locationFilter: 'ALL',
  selectedAsset: null,

  // ── Subscription lifecycle ─────────────────────────────────────────────────
  subscribe: () => {
    // Prevent duplicate subscriptions
    if (get()._unsubscribe) return;
    const unsub = subscribeToAssets(
      (assets) => set({ assets, loading: false, error: null }),
      (err) => set({ error: err.message, loading: false }),
    );
    set({ _unsubscribe: unsub });
  },

  unsubscribe: () => {
    get()._unsubscribe?.();
    set({ _unsubscribe: null });
  },

  // ── UI state setters ───────────────────────────────────────────────────────
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setLocationFilter: (location) => set({ locationFilter: location }),
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),

  // ── Firestore CRUD ─────────────────────────────────────────────────────────
  addAsset: async (assetData) => {
    try {
      await addAssetDoc(assetData);
      // onSnapshot will push the new doc into `assets` automatically
    } catch (err) {
      set({ error: (err as Error).message });
      throw err; // re-throw so the UI can show a toast
    }
  },

  updateAsset: async (id, updated) => {
    try {
      await updateAssetDoc(id, updated);
      // Optimistically refresh selectedAsset if it's the one being edited
      const sel = get().selectedAsset;
      if (sel?.id === id) set({ selectedAsset: { ...sel, ...updated } });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  deleteAsset: async (id) => {
    try {
      await deleteAssetDoc(id);
      const sel = get().selectedAsset;
      if (sel?.id === id) set({ selectedAsset: null });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  toggleFavorite: async (id) => {
    try {
      const asset = get().assets.find((a) => a.id === id);
      if (!asset) return;
      await toggleAssetFavoriteDoc(id, asset.isFavorite ?? false);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },
}));
