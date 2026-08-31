import { create } from 'zustand';
import { MaintenanceRecord, TicketStatus } from '../types';
import initialRecords from '../data/maintenance.json';

interface MaintenanceStore {
  records: MaintenanceRecord[];
  selectedRecord: MaintenanceRecord | null;
  searchQuery: string;
  priorityFilter: string;
  statusFilter: string;
  viewMode: 'kanban' | 'table';

  setSearchQuery: (query: string) => void;
  setPriorityFilter: (priority: string) => void;
  setStatusFilter: (status: string) => void;
  setViewMode: (mode: 'kanban' | 'table') => void;
  setSelectedRecord: (record: MaintenanceRecord | null) => void;
  createRecord: (record: Omit<MaintenanceRecord, 'id' | 'ticketNumber' | 'timeline'>) => void;
  updateRecordStatus: (id: string, status: TicketStatus) => void;
  updateRecord: (id: string, updated: Partial<MaintenanceRecord>) => void;
  deleteRecord: (id: string) => void;
}

export const useMaintenanceStore = create<MaintenanceStore>((set) => ({
  records: initialRecords as MaintenanceRecord[],
  selectedRecord: null,
  searchQuery: '',
  priorityFilter: 'ALL',
  statusFilter: 'ALL',
  viewMode: 'table',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedRecord: (record) => set({ selectedRecord: record }),

  createRecord: (recordData) =>
    set((state) => {
      const ticketNum = `INC-2026-${Math.floor(885 + Math.random() * 100)}`;
      const newRecord: MaintenanceRecord = {
        ...recordData,
        id: `mnt-${Date.now()}`,
        ticketNumber: ticketNum,
        timeline: [
          {
            id: `tl-${Date.now()}-1`,
            timestamp: new Date().toISOString(),
            author: 'IT Officer',
            note: `Ticket created. Problem: ${recordData.problem.substring(0, 100)}...`,
            status: 'Open',
          },
        ],
      };
      return { records: [newRecord, ...state.records] };
    }),

  updateRecordStatus: (id, status) =>
    set((state) => ({
      records: state.records.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          status,
          timeline: [
            ...r.timeline,
            {
              id: `tl-${Date.now()}`,
              timestamp: new Date().toISOString(),
              author: 'IT Officer',
              note: `Status changed to: ${status}`,
              status,
            },
          ],
        };
      }),
      selectedRecord:
        state.selectedRecord?.id === id
          ? { ...state.selectedRecord, status }
          : state.selectedRecord,
    })),

  updateRecord: (id, updated) =>
    set((state) => ({
      records: state.records.map((r) => (r.id === id ? { ...r, ...updated } : r)),
      selectedRecord:
        state.selectedRecord?.id === id
          ? { ...state.selectedRecord, ...updated }
          : state.selectedRecord,
    })),

  deleteRecord: (id) =>
    set((state) => ({
      records: state.records.filter((r) => r.id !== id),
      selectedRecord: state.selectedRecord?.id === id ? null : state.selectedRecord,
    })),
}));
