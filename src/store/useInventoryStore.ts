import { create } from 'zustand';
import { InventoryItem } from '../types';
import initialInventory from '../data/inventory.json';

interface InventoryStore {
  inventory: InventoryItem[];
  searchQuery: string;
  categoryFilter: string;
  stockStatusFilter: string;

  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setStockStatusFilter: (status: string) => void;
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateStock: (id: string, delta: number) => void;
  updateItem: (id: string, updated: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  inventory: initialInventory as InventoryItem[],
  searchQuery: '',
  categoryFilter: 'ALL',
  stockStatusFilter: 'ALL',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setStockStatusFilter: (status) => set({ stockStatusFilter: status }),

  addItem: (itemData) =>
    set((state) => ({
      inventory: [
        {
          ...itemData,
          id: `inv-${Date.now()}`,
        },
        ...state.inventory,
      ],
    })),

  updateStock: (id, delta) =>
    set((state) => ({
      inventory: state.inventory.map((item) => {
        if (item.id !== id) return item;
        const newQty = Math.max(0, item.quantityInStock + delta);
        let newStatus: InventoryItem['status'] = 'In Stock';
        if (newQty === 0) newStatus = 'Out of Stock';
        else if (newQty <= item.minThreshold) newStatus = 'Low Stock';

        return {
          ...item,
          quantityInStock: newQty,
          status: newStatus,
          lastRestocked: delta > 0 ? new Date().toISOString().split('T')[0] : item.lastRestocked,
        };
      }),
    })),

  updateItem: (id, updated) =>
    set((state) => ({
      inventory: state.inventory.map((item) => (item.id === id ? { ...item, ...updated } : item)),
    })),

  deleteItem: (id) =>
    set((state) => ({
      inventory: state.inventory.filter((item) => item.id !== id),
    })),
}));
