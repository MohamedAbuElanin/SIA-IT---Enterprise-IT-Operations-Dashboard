// src/store/useInventoryStore.ts
// Zustand store for inventory items — backed by Cloud Firestore.

import { create } from 'zustand';
import { InventoryItem, FirestoreStoreState } from '../types';
import {
  subscribeToInventory,
  addInventoryDoc,
  updateInventoryDoc,
  updateStockDoc,
  deleteInventoryDoc,
} from '../lib/firestore/inventoryService';

interface InventoryStore extends FirestoreStoreState {
  inventory: InventoryItem[];
  // UI-only filters
  searchQuery: string;
  categoryFilter: string;
  stockStatusFilter: string;
  _unsubscribe: (() => void) | null;

  // Subscription lifecycle
  subscribe: () => void;
  unsubscribe: () => void;

  // UI state setters
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setStockStatusFilter: (status: string) => void;

  // Firestore CRUD
  addItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateStock: (id: string, delta: number) => Promise<void>;
  updateItem: (id: string, updated: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  // ── Firestore state ────────────────────────────────────────────────────────
  inventory: [],
  loading: true,
  error: null,
  _unsubscribe: null,

  // ── UI state ───────────────────────────────────────────────────────────────
  searchQuery: '',
  categoryFilter: 'ALL',
  stockStatusFilter: 'ALL',

  // ── Subscription lifecycle ─────────────────────────────────────────────────
  subscribe: () => {
    if (get()._unsubscribe) return;
    const unsub = subscribeToInventory(
      (inventory) => set({ inventory, loading: false, error: null }),
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
  setStockStatusFilter: (status) => set({ stockStatusFilter: status }),

  // ── Firestore CRUD ─────────────────────────────────────────────────────────
  addItem: async (itemData) => {
    try {
      await addInventoryDoc(itemData);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  updateStock: async (id, delta) => {
    try {
      // Pass current item so the service can derive the new status
      const currentItem = get().inventory.find((i) => i.id === id);
      if (!currentItem) throw new Error(`Inventory item ${id} not found`);
      await updateStockDoc(id, delta, currentItem);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  updateItem: async (id, updated) => {
    try {
      await updateInventoryDoc(id, updated);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  deleteItem: async (id) => {
    try {
      await deleteInventoryDoc(id);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },
}));
