import { create } from 'zustand';

export type UserRole =
  | 'IT Senior Architect'
  | 'Tier 2 Support Lead'
  | 'Warehouse IT Specialist';

interface UiStore {
  isSidebarCollapsed: boolean;
  isCommandPaletteOpen: boolean;
  theme: 'dark' | 'light';
  activeRole: UserRole;
  globalSearchQuery: string;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setActiveRole: (role: UserRole) => void;
  setGlobalSearchQuery: (query: string) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isSidebarCollapsed: false,
  isCommandPaletteOpen: false,
  theme: 'dark',
  activeRole: 'IT Senior Architect',
  globalSearchQuery: '',

  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setTheme: (theme) => set({ theme }),
  setActiveRole: (role) => set({ activeRole: role }),
  setGlobalSearchQuery: (query) => set({ globalSearchQuery: query }),
}));
