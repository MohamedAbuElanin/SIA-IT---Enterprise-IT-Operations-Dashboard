// src/store/useMaintenanceStore.ts
// Zustand store for maintenance records — backed by Cloud Firestore.

import { create } from 'zustand';
import { MaintenanceRecord, TicketStatus, FirestoreStoreState } from '../types';
import {
  subscribeToMaintenance,
  createMaintenanceDoc,
  updateMaintenanceDoc,
  updateMaintenanceStatusDoc,
  deleteMaintenanceDoc,
} from '../lib/firestore/maintenanceService';

interface MaintenanceStore extends FirestoreStoreState {
  records: MaintenanceRecord[];
  selectedRecord: MaintenanceRecord | null;
  // UI-only filters
  searchQuery: string;
  priorityFilter: string;
  statusFilter: string;
  viewMode: 'kanban' | 'table';
  _unsubscribe: (() => void) | null;

  // Subscription lifecycle
  subscribe: () => void;
  unsubscribe: () => void;

  // UI state setters
  setSearchQuery: (query: string) => void;
  setPriorityFilter: (priority: string) => void;
  setStatusFilter: (status: string) => void;
  setViewMode: (mode: 'kanban' | 'table') => void;
  setSelectedRecord: (record: MaintenanceRecord | null) => void;

  // Firestore CRUD
  createRecord: (record: Omit<MaintenanceRecord, 'id' | 'ticketNumber' | 'timeline'>) => Promise<void>;
  updateRecordStatus: (id: string, status: TicketStatus) => Promise<void>;
  updateRecord: (id: string, updated: Partial<MaintenanceRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useMaintenanceStore = create<MaintenanceStore>((set, get) => ({
  // ── Firestore state ────────────────────────────────────────────────────────
  records: [],
  loading: true,
  error: null,
  _unsubscribe: null,

  // ── UI state ───────────────────────────────────────────────────────────────
  selectedRecord: null,
  searchQuery: '',
  priorityFilter: 'ALL',
  statusFilter: 'ALL',
  viewMode: 'table',

  // ── Subscription lifecycle ─────────────────────────────────────────────────
  subscribe: () => {
    if (get()._unsubscribe) return;
    const unsub = subscribeToMaintenance(
      (records) => set({ records, loading: false, error: null }),
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
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedRecord: (record) => set({ selectedRecord: record }),

  // ── Firestore CRUD ─────────────────────────────────────────────────────────
  createRecord: async (recordData) => {
    try {
      const newId = await createMaintenanceDoc(recordData);
      const newRecord: MaintenanceRecord = {
        ...recordData,
        id: newId,
        ticketNumber: `INC-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
        timeline: [
          {
            id: `tl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: 'IT Officer',
            note: `Ticket created. Problem: ${recordData.problem.substring(0, 100)}`,
            status: 'Open',
          },
        ],
      };
      set((state) => {
        if (state.records.some((r) => r.id === newId)) return state;
        return { records: [newRecord, ...state.records], error: null };
      });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  updateRecordStatus: async (id, status) => {
    try {
      set((state) => ({
        records: state.records.map((r) => (r.id === id ? { ...r, status } : r)),
        selectedRecord: state.selectedRecord?.id === id ? { ...state.selectedRecord, status } : state.selectedRecord,
      }));
      await updateMaintenanceStatusDoc(id, status);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  updateRecord: async (id, updated) => {
    try {
      set((state) => ({
        records: state.records.map((r) => (r.id === id ? { ...r, ...updated } : r)),
        selectedRecord: state.selectedRecord?.id === id ? { ...state.selectedRecord, ...updated } : state.selectedRecord,
      }));
      await updateMaintenanceDoc(id, updated);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },

  deleteRecord: async (id) => {
    try {
      set((state) => ({
        records: state.records.filter((r) => r.id !== id),
        selectedRecord: state.selectedRecord?.id === id ? null : state.selectedRecord,
      }));
      await deleteMaintenanceDoc(id);
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    }
  },
}));
