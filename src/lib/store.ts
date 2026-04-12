import { create } from 'zustand';
import { Agent, ThoughtNode, Message, AGENTS } from './types';

interface CortexState {
  agents: Agent[];
  thoughts: ThoughtNode[];
  messages: Message[];
  isProcessing: boolean;
  activeAgentId: string | null;

  setAgentStatus: (agentId: string, status: Agent['status']) => void;
  addThought: (thought: ThoughtNode) => void;
  updateThought: (thoughtId: string, content: string) => void;
  addMessage: (message: Message) => void;
  setProcessing: (isProcessing: boolean) => void;
  setActiveAgent: (agentId: string | null) => void;
  reset: () => void;
}

export const useCortexStore = create<CortexState>((set) => ({
  agents: AGENTS,
  thoughts: [],
  messages: [],
  isProcessing: false,
  activeAgentId: null,

  setAgentStatus: (agentId, status) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId ? { ...agent, status } : agent
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

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setProcessing: (isProcessing) => set({ isProcessing }),

  setActiveAgent: (agentId) => set({ activeAgentId: agentId }),

  reset: () =>
    set({
      agents: AGENTS,
      thoughts: [],
      messages: [],
      isProcessing: false,
      activeAgentId: null,
    }),
}));
