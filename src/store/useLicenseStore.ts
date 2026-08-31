import { create } from 'zustand';
import { SoftwareLicense } from '../types';
import initialLicenses from '../data/licenses.json';

interface LicenseStore {
  licenses: SoftwareLicense[];
  selectedLicense: SoftwareLicense | null;
  categoryFilter: string;
  statusFilter: string;

  setSelectedLicense: (license: SoftwareLicense | null) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: string) => void;
  addLicense: (license: Omit<SoftwareLicense, 'id'>) => void;
  updateLicense: (id: string, updated: Partial<SoftwareLicense>) => void;
  deleteLicense: (id: string) => void;
}

export const useLicenseStore = create<LicenseStore>((set) => ({
  licenses: initialLicenses as SoftwareLicense[],
  selectedLicense: null,
  categoryFilter: 'ALL',
  statusFilter: 'ALL',

  setSelectedLicense: (license) => set({ selectedLicense: license }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  setStatusFilter: (status) => set({ statusFilter: status }),

  addLicense: (licenseData) =>
    set((state) => ({
      licenses: [{ ...licenseData, id: `lic-${Date.now()}` }, ...state.licenses],
    })),

  updateLicense: (id, updated) =>
    set((state) => ({
      licenses: state.licenses.map((l) => (l.id === id ? { ...l, ...updated } : l)),
      selectedLicense: state.selectedLicense?.id === id ? { ...state.selectedLicense, ...updated } : state.selectedLicense,
    })),

  deleteLicense: (id) =>
    set((state) => ({
      licenses: state.licenses.filter((l) => l.id !== id),
      selectedLicense: state.selectedLicense?.id === id ? null : state.selectedLicense,
    })),
}));
