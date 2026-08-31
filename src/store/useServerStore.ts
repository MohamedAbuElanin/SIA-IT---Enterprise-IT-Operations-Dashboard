import { create } from 'zustand';
import { ServerNode } from '../types';
import initialServers from '../data/servers.json';

interface ServerStore {
  servers: ServerNode[];
  selectedServer: ServerNode | null;
  logs: { id: string; timestamp: string; level: 'INFO' | 'WARN' | 'ERROR'; message: string; serverId: string }[];

  setSelectedServer: (server: ServerNode | null) => void;
  rebootServer: (id: string) => void;
  addLogMessage: (log: { level: 'INFO' | 'WARN' | 'ERROR'; message: string; serverId: string }) => void;
}

export const useServerStore = create<ServerStore>((set) => ({
  servers: (initialServers as ServerNode[]) || [],
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
}));
