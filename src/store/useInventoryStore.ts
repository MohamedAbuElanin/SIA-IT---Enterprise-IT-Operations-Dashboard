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
      const newId = await addInventoryDoc(itemData);
      const newItem: InventoryItem = {
        ...itemData,
        id: newId,
      };
      set((state) => {
        if (state.inventory.some((i) => i.id === newId)) return state;
        return { inventory: [newItem, ...state.inventory], error: null };
      });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  updateStock: async (id, delta) => {
    try {
      const currentItem = get().inventory.find((i) => i.id === id);
      if (!currentItem) throw new Error(`Inventory item ${id} not found`);

      const newQty = Math.max(0, currentItem.quantityInStock + delta);
      let newStatus: InventoryItem['status'] = 'In Stock';
      if (newQty === 0) newStatus = 'Out of Stock';
      else if (newQty <= currentItem.minThreshold) newStatus = 'Low Stock';

      set((state) => ({
        inventory: state.inventory.map((i) =>
          i.id === id ? { ...i, quantityInStock: newQty, status: newStatus } : i
        ),
      }));

      await updateStockDoc(id, delta, currentItem);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  updateItem: async (id, updated) => {
    try {
      set((state) => ({
        inventory: state.inventory.map((i) => (i.id === id ? { ...i, ...updated } : i)),
      }));
      await updateInventoryDoc(id, updated);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  deleteItem: async (id) => {
    try {
      set((state) => ({
        inventory: state.inventory.filter((i) => i.id !== id),
      }));
      await deleteInventoryDoc(id);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },
}));
