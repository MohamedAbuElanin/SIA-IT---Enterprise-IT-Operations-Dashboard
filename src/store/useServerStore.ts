import { create } from 'zustand';
import { ServerNode } from '../types';
import { FirestoreStoreState } from '../types';
import { subscribeToServers, addServer as addServerApi, updateServer as updateServerApi, deleteServer as deleteServerApi } from '../lib/firestore/servers';

interface ServerStore extends FirestoreStoreState {
  servers: ServerNode[];
  selectedServer: ServerNode | null;
  logs: { id: string; timestamp: string; level: 'INFO' | 'WARN' | 'ERROR'; message: string; serverId: string }[];

  setSelectedServer: (server: ServerNode | null) => void;
  rebootServer: (id: string) => void;
  addLogMessage: (log: { level: 'INFO' | 'WARN' | 'ERROR'; message: string; serverId: string }) => void;

  // New CRUD methods
  addServer: (server: Omit<ServerNode, 'id'>) => Promise<void>;
  updateServer: (id: string, data: Partial<ServerNode>) => Promise<void>;
  deleteServer: (id: string) => Promise<void>;
}

export const useServerStore = create<ServerStore>((set, get) => {
  // Initialize Firestore subscription
  subscribeToServers(
    (servers) => set({ servers, loading: false, error: null }),
    (error) => set({ error: error.message, loading: false })
  );

  return {
    servers: [],
    loading: true,
    error: null,
    selectedServer: null,
    logs: [],

    setSelectedServer: (server) => set({ selectedServer: server }),

    rebootServer: (id) =>
      set((state) => ({
        servers: state.servers.map((srv) => {
          if (srv.id !== id) return srv;
          return {
            ...srv,
            status: 'Maintenance',
            uptimeDays: 0,
          };
        }),
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            level: 'WARN',
            message: `Graceful system reboot initiated for server ${id}`,
            serverId: id,
          },
          ...state.logs,
        ],
      })),

    addLogMessage: (logData) =>
      set((state) => ({
        logs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            ...logData,
          },
          ...state.logs,
        ],
      })),

    addServer: async (serverData) => {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const newServer = { ...serverData, id: tempId } as ServerNode;
      set((state) => ({ servers: [...state.servers, newServer] }));

      try {
        await addServerApi(serverData);
      } catch (error) {
        // Revert on failure
        set((state) => ({ servers: state.servers.filter(s => s.id !== tempId) }));
        throw error;
      }
    },

    updateServer: async (id, data) => {
      // Optimistic update
      const originalServers = get().servers;
      set((state) => ({
        servers: state.servers.map(s => s.id === id ? { ...s, ...data } : s)
      }));

      try {
        await updateServerApi(id, data);
      } catch (error) {
        // Revert
        set({ servers: originalServers });
        throw error;
      }
    },

    deleteServer: async (id) => {
      // Optimistic delete
      const originalServers = get().servers;
      set((state) => ({
        servers: state.servers.filter(s => s.id !== id)
      }));

      try {
        await deleteServerApi(id);
      } catch (error) {
        // Revert
        set({ servers: originalServers });
        throw error;
      }
    },
  };
});
