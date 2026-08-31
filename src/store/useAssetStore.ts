import { create } from 'zustand';
import { ITAsset, AssetStatus } from '../types';
import initialAssets from '../data/assets.json';

interface AssetStore {
  assets: ITAsset[];
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
  locationFilter: string;
  selectedAsset: ITAsset | null;

  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: string) => void;
  setLocationFilter: (location: string) => void;
  setSelectedAsset: (asset: ITAsset | null) => void;
  addAsset: (asset: Omit<ITAsset, 'id'>) => void;
  updateAsset: (id: string, updated: Partial<ITAsset>) => void;
  deleteAsset: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

export const useAssetStore = create<AssetStore>((set) => ({
  assets: initialAssets as ITAsset[],
  searchQuery: '',
  categoryFilter: 'ALL',
  statusFilter: 'ALL',
  locationFilter: 'ALL',
  selectedAsset: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setLocationFilter: (location) => set({ locationFilter: location }),
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),

  addAsset: (assetData) =>
    set((state) => ({
      assets: [
        {
          ...assetData,
          id: `ast-${Date.now()}`,
        },
        ...state.assets,
      ],
    })),

  updateAsset: (id, updated) =>
    set((state) => ({
      assets: state.assets.map((ast) => (ast.id === id ? { ...ast, ...updated } : ast)),
      selectedAsset: state.selectedAsset?.id === id ? { ...state.selectedAsset, ...updated } : state.selectedAsset,
    })),

  deleteAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((ast) => ast.id !== id),
      selectedAsset: state.selectedAsset?.id === id ? null : state.selectedAsset,
    })),

  toggleFavorite: (id) =>
    set((state) => ({
      assets: state.assets.map((asset) => asset.id === id ? { ...asset, isFavorite: !asset.isFavorite } : asset),
      selectedAsset: state.selectedAsset?.id === id ? { ...state.selectedAsset, isFavorite: !state.selectedAsset.isFavorite } : state.selectedAsset,
    })),
}));
