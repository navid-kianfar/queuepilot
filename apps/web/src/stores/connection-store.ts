import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ServerConnection } from '@queuepilot/shared';

interface ConnectionState {
  activeConnectionId: number | null;
  connections: ServerConnection[];
  setActiveConnection: (id: number | null) => void;
  setConnections: (connections: ServerConnection[]) => void;
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      activeConnectionId: null,
      connections: [],
      setActiveConnection: (id) => set({ activeConnectionId: id }),
      setConnections: (connections) => set({ connections }),
    }),
    {
      name: 'queuepilot-connection',
      partialize: (state) => ({ activeConnectionId: state.activeConnectionId }),
    },
  ),
);
