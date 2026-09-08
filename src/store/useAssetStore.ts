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
      const newId = await addAssetDoc(assetData);
      const newAsset: ITAsset = {
        ...assetData,
        id: newId,
      };
      set((state) => {
        if (state.assets.some((a) => a.id === newId)) return state;
        return { assets: [newAsset, ...state.assets], error: null };
      });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err; // re-throw so the UI can show a toast
    }
  },

  updateAsset: async (id, updated) => {
    try {
      set((state) => ({
        assets: state.assets.map((a) => (a.id === id ? { ...a, ...updated } : a)),
        selectedAsset: state.selectedAsset?.id === id ? { ...state.selectedAsset, ...updated } : state.selectedAsset,
      }));
      await updateAssetDoc(id, updated);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  deleteAsset: async (id) => {
    try {
      set((state) => ({
        assets: state.assets.filter((a) => a.id !== id),
        selectedAsset: state.selectedAsset?.id === id ? null : state.selectedAsset,
      }));
      await deleteAssetDoc(id);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  toggleFavorite: async (id) => {
    try {
      const asset = get().assets.find((a) => a.id === id);
      if (!asset) return;
      const nextVal = !(asset.isFavorite ?? false);
      set((state) => ({
        assets: state.assets.map((a) => (a.id === id ? { ...a, isFavorite: nextVal } : a)),
        selectedAsset: state.selectedAsset?.id === id ? { ...state.selectedAsset, isFavorite: nextVal } : state.selectedAsset,
      }));
      await toggleAssetFavoriteDoc(id, asset.isFavorite ?? false);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },
}));
