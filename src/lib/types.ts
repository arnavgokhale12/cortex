export type AgentRole = 'orchestrator' | 'researcher' | 'coder' | 'critic' | 'creative';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: 'idle' | 'thinking' | 'working' | 'complete';
  avatar: string;
  color: string;
  description: string;
}

export interface ThoughtNode {
  id: string;
  agentId: string;
  content: string;
  timestamp: number;
  type: 'thought' | 'action' | 'result' | 'handoff';
  targetAgentId?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentId?: string;
  timestamp: number;
}

export const AGENTS: Agent[] = [
  {
    id: 'orchestrator',
    name: 'Nexus',
    role: 'orchestrator',
    status: 'idle',
    avatar: 'N',
    color: '#8b5cf6',
    description: 'Coordinates the team and breaks down complex tasks',
  },
  {
    id: 'researcher',
    name: 'Scout',
    role: 'researcher',
    status: 'idle',
    avatar: 'S',
    color: '#06b6d4',
    description: 'Gathers information and explores solutions',
  },
  {
    id: 'coder',
    name: 'Forge',
    role: 'coder',
    status: 'idle',
    avatar: 'F',
    color: '#22c55e',
    description: 'Writes and reviews code implementations',
  },
  {
    id: 'critic',
    name: 'Sage',
    role: 'critic',
    status: 'idle',
    avatar: 'S',
    color: '#f59e0b',
    description: 'Evaluates ideas and identifies potential issues',
  },
  {
    id: 'creative',
    name: 'Muse',
    role: 'creative',
    status: 'idle',
    avatar: 'M',
    color: '#ec4899',
    description: 'Generates creative solutions and alternatives',
  },
];
