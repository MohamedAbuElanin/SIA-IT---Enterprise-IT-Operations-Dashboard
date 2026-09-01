// src/store/useKBStore.ts
// Zustand store for KB Articles — backed by Cloud Firestore.

import { create } from 'zustand';
import { KBArticle, FirestoreStoreState } from '../types';
import {
  subscribeToKB,
  addKBDoc,
  updateKBDoc,
  deleteKBDoc,
  toggleKBFavoriteDoc,
  toggleKBPinDoc,
} from '../lib/firestore/kbService';

interface KBStore extends FirestoreStoreState {
  articles: KBArticle[];
  selectedArticle: KBArticle | null;
  searchQuery: string;
  categoryFilter: string;
  _unsubscribe: (() => void) | null;

  subscribe: () => void;
  unsubscribe: () => void;

  setSelectedArticle: (article: KBArticle | null) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;

  toggleFavorite: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  addArticle: (article: Omit<KBArticle, 'id'>) => Promise<void>;
  updateArticle: (id: string, updated: Partial<KBArticle>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
}

export const useKBStore = create<KBStore>((set, get) => ({
  articles: [],
  loading: true,
  error: null,
  _unsubscribe: null,

  selectedArticle: null,
  searchQuery: '',
  categoryFilter: 'ALL',

  subscribe: () => {
    if (get()._unsubscribe) return;
    const unsub = subscribeToKB(
      (articles) => set({ articles, loading: false, error: null }),
      (err) => set({ error: err.message, loading: false })
    );
    set({ _unsubscribe: unsub });
  },

  unsubscribe: () => {
    get()._unsubscribe?.();
    set({ _unsubscribe: null });
  },

  setSelectedArticle: (article) => set({ selectedArticle: article }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),

  toggleFavorite: async (id) => {
    try {
      const art = get().articles.find((a) => a.id === id);
      if (!art) return;
      await toggleKBFavoriteDoc(id, art.isFavorite ?? false);
      const sel = get().selectedArticle;
      if (sel?.id === id) set({ selectedArticle: { ...sel, isFavorite: !sel.isFavorite } });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  togglePin: async (id) => {
    try {
      const art = get().articles.find((a) => a.id === id);
      if (!art) return;
      await toggleKBPinDoc(id, art.isPinned ?? false);
      const sel = get().selectedArticle;
      if (sel?.id === id) set({ selectedArticle: { ...sel, isPinned: !sel.isPinned } });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  addArticle: async (articleData) => {
    try {
      await addKBDoc(articleData);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  updateArticle: async (id, updated) => {
    try {
      await updateKBDoc(id, updated);
      const sel = get().selectedArticle;
      if (sel?.id === id) set({ selectedArticle: { ...sel, ...updated } });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  deleteArticle: async (id) => {
    try {
      await deleteKBDoc(id);
      if (get().selectedArticle?.id === id) set({ selectedArticle: null });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },
}));
