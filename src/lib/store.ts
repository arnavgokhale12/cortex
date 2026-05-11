import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Agent, ThoughtNode, APIKeys, DEFAULT_AGENTS } from './types';

interface CortexState {
  agents: Agent[];
  thoughts: ThoughtNode[];
  isProcessing: boolean;
  activeAgentId: string | null;
  apiKeys: APIKeys;
  settingsOpen: boolean;
  editingAgentId: string | null;

  setAgentStatus: (agentId: string, status: Agent['status']) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  addThought: (thought: ThoughtNode) => void;
  updateThought: (thoughtId: string, content: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  setActiveAgent: (agentId: string | null) => void;
  setAPIKey: (provider: keyof APIKeys, key: string) => void;
  setSettingsOpen: (open: boolean) => void;
  setEditingAgent: (agentId: string | null) => void;
  reset: () => void;
  resetAgents: () => void;
}

export const useCortexStore = create<CortexState>()(
  persist(
    (set) => ({
      agents: DEFAULT_AGENTS,
      thoughts: [],
      isProcessing: false,
      activeAgentId: null,
      apiKeys: {},
      settingsOpen: false,
      editingAgentId: null,

      setAgentStatus: (agentId, status) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === agentId ? { ...agent, status } : agent
          ),
        })),

      updateAgent: (agentId, updates) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === agentId ? { ...agent, ...updates } : agent
          ),
        })),

      addThought: (thought) =>
        set((state) => ({
          thoughts: [...state.thoughts, thought],
        })),

      updateThought: (thoughtId, content) =>
        set((state) => ({
          thoughts: state.thoughts.map((t) =>
            t.id === thoughtId ? { ...t, content } : t
          ),
        })),

      setProcessing: (isProcessing) => set({ isProcessing }),

      setActiveAgent: (agentId) => set({ activeAgentId: agentId }),

      setAPIKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),

      setSettingsOpen: (open) => set({ settingsOpen: open }),

      setEditingAgent: (agentId) => set({ editingAgentId: agentId }),

      reset: () =>
        set({
          thoughts: [],
          isProcessing: false,
          activeAgentId: null,
        }),

      resetAgents: () =>
        set({
          agents: DEFAULT_AGENTS,
        }),
    }),
    {
      name: 'cortex-storage',
      partialize: (state) => ({
        agents: state.agents,
        apiKeys: state.apiKeys,
      }),
    }
  )
);
