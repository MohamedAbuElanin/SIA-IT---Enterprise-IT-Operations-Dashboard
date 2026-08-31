import { create } from 'zustand';
import { KBArticle } from '../types';
import initialArticles from '../data/kb_articles.json';

interface KBStore {
  articles: KBArticle[];
  selectedArticle: KBArticle | null;
  searchQuery: string;
  categoryFilter: string;

  setSelectedArticle: (article: KBArticle | null) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  toggleFavorite: (id: string) => void;
  togglePin: (id: string) => void;
  addArticle: (article: Omit<KBArticle, 'id'>) => void;
  updateArticle: (id: string, updated: Partial<KBArticle>) => void;
  deleteArticle: (id: string) => void;
}

export const useKBStore = create<KBStore>((set) => ({
  articles: (initialArticles as KBArticle[]) || [],
  selectedArticle: null,
  searchQuery: '',
  categoryFilter: 'ALL',

  setSelectedArticle: (article) => set({ selectedArticle: article }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),

  toggleFavorite: (id) =>
    set((state) => ({
      articles: state.articles.map((a) =>
        a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
      ),
      selectedArticle:
        state.selectedArticle?.id === id
          ? { ...state.selectedArticle, isFavorite: !state.selectedArticle.isFavorite }
          : state.selectedArticle,
    })),

  togglePin: (id) =>
    set((state) => ({
      articles: state.articles.map((a) =>
        a.id === id ? { ...a, isPinned: !a.isPinned } : a
      ),
      selectedArticle:
        state.selectedArticle?.id === id
          ? { ...state.selectedArticle, isPinned: !state.selectedArticle.isPinned }
          : state.selectedArticle,
    })),

  addArticle: (articleData) =>
    set((state) => ({
      articles: [
        {
          ...articleData,
          id: `kb-${Date.now()}`,
        },
        ...state.articles,
      ],
    })),

  updateArticle: (id, updated) =>
    set((state) => ({
      articles: state.articles.map((a) => (a.id === id ? { ...a, ...updated } : a)),
      selectedArticle:
        state.selectedArticle?.id === id
          ? { ...state.selectedArticle, ...updated }
          : state.selectedArticle,
    })),

  deleteArticle: (id) =>
    set((state) => ({
      articles: state.articles.filter((a) => a.id !== id),
      selectedArticle: state.selectedArticle?.id === id ? null : state.selectedArticle,
    })),
}));
