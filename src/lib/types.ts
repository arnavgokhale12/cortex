export type AgentRole = 'orchestrator' | 'researcher' | 'coder' | 'critic' | 'creative';

export type ModelProvider = 'groq' | 'openai' | 'anthropic' | 'google' | 'perplexity';

export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  displayName: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  // Groq (Free)
  { provider: 'groq', model: 'llama-3.3-70b-versatile', displayName: 'Llama 3.3 70B (Groq - Free)' },
  { provider: 'groq', model: 'llama-3.1-8b-instant', displayName: 'Llama 3.1 8B (Groq - Free)' },
  { provider: 'groq', model: 'mixtral-8x7b-32768', displayName: 'Mixtral 8x7B (Groq - Free)' },
  // OpenAI
  { provider: 'openai', model: 'gpt-4o', displayName: 'GPT-4o (OpenAI)' },
  { provider: 'openai', model: 'gpt-4o-mini', displayName: 'GPT-4o Mini (OpenAI)' },
  // Anthropic
  { provider: 'anthropic', model: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4 (Anthropic)' },
  { provider: 'anthropic', model: 'claude-haiku-4-20250514', displayName: 'Claude Haiku 4 (Anthropic)' },
  // Google
  { provider: 'google', model: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash (Google)' },
  { provider: 'google', model: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro (Google)' },
  // Perplexity
  { provider: 'perplexity', model: 'sonar-pro', displayName: 'Sonar Pro (Perplexity)' },
  { provider: 'perplexity', model: 'sonar', displayName: 'Sonar (Perplexity)' },
];

export const RECOMMENDED_MODELS: Record<AgentRole, ModelConfig> = {
  orchestrator: { provider: 'openai', model: 'gpt-4o', displayName: 'GPT-4o (OpenAI)' },
  researcher: { provider: 'perplexity', model: 'sonar-pro', displayName: 'Sonar Pro (Perplexity)' },
  coder: { provider: 'anthropic', model: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4 (Anthropic)' },
  critic: { provider: 'google', model: 'gemini-2.0-flash', displayName: 'Gemini 2.0 Flash (Google)' },
  creative: { provider: 'groq', model: 'llama-3.3-70b-versatile', displayName: 'Llama 3.3 70B (Groq - Free)' },
};

export const PRESET_COLORS = [
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#22c55e', // green
  '#f59e0b', // amber
  '#ec4899', // pink
  '#ef4444', // red
  '#3b82f6', // blue
  '#f97316', // orange
];

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: 'idle' | 'thinking' | 'working' | 'complete';
  avatar: string;
  color: string;
  description: string;
  modelConfig: ModelConfig;
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

export interface APIKeys {
  groq?: string;
  openai?: string;
  anthropic?: string;
  google?: string;
  perplexity?: string;
}

export const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'orchestrator',
    name: 'Nexus',
    role: 'orchestrator',
    status: 'idle',
    avatar: 'N',
    color: '#8b5cf6',
    description: 'Coordinates the team and breaks down complex tasks',
    modelConfig: { provider: 'groq', model: 'llama-3.3-70b-versatile', displayName: 'Llama 3.3 70B (Groq - Free)' },
  },
  {
    id: 'researcher',
    name: 'Scout',
    role: 'researcher',
    status: 'idle',
    avatar: 'S',
    color: '#06b6d4',
    description: 'Gathers information and explores solutions',
    modelConfig: { provider: 'groq', model: 'llama-3.3-70b-versatile', displayName: 'Llama 3.3 70B (Groq - Free)' },
  },
  {
    id: 'coder',
    name: 'Forge',
    role: 'coder',
    status: 'idle',
    avatar: 'F',
    color: '#22c55e',
    description: 'Writes and reviews code implementations',
    modelConfig: { provider: 'groq', model: 'llama-3.3-70b-versatile', displayName: 'Llama 3.3 70B (Groq - Free)' },
  },
  {
    id: 'critic',
    name: 'Sage',
    role: 'critic',
    status: 'idle',
    avatar: 'S',
    color: '#f59e0b',
    description: 'Evaluates ideas and identifies potential issues',
    modelConfig: { provider: 'groq', model: 'llama-3.3-70b-versatile', displayName: 'Llama 3.3 70B (Groq - Free)' },
  },
  {
    id: 'creative',
    name: 'Muse',
    role: 'creative',
    status: 'idle',
    avatar: 'M',
    color: '#ec4899',
    description: 'Generates creative solutions and alternatives',
    modelConfig: { provider: 'groq', model: 'llama-3.3-70b-versatile', displayName: 'Llama 3.3 70B (Groq - Free)' },
  },
];
