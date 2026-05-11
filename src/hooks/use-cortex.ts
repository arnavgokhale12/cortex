'use client';

import { useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import { useCortexStore } from '@/lib/store';

const DELEGATE_PATTERN = /\[DELEGATE:(\w+)\]/gi;

const AGENT_NAME_MAP: Record<string, string> = {
  scout: 'researcher',
  forge: 'coder',
  sage: 'critic',
  muse: 'creative',
  nexus: 'orchestrator',
  researcher: 'researcher',
  coder: 'coder',
  critic: 'critic',
  creative: 'creative',
  orchestrator: 'orchestrator',
};

export function useCortex() {
  const {
    agents,
    thoughts,
    isProcessing,
    activeAgentId,
    apiKeys,
    setAgentStatus,
    addThought,
    updateThought,
    setProcessing,
    setActiveAgent,
    reset,
  } = useCortexStore();

  const conversationRef = useRef<string>('');

  const streamAgentResponse = useCallback(
    async (prompt: string, agentId: string): Promise<string> => {
      const agent = agents.find((a) => a.id === agentId);
      if (!agent) return '';

      setAgentStatus(agentId, 'thinking');
      setActiveAgent(agentId);

      const thoughtId = nanoid();
      addThought({
        id: thoughtId,
        agentId,
        content: '',
        timestamp: Date.now(),
        type: 'action',
      });

      try {
        // Get the API key for this agent's provider
        const providerKey = apiKeys[agent.modelConfig.provider as keyof typeof apiKeys];

        const response = await fetch('/api/cortex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            agentId,
            context: conversationRef.current,
            modelConfig: agent.modelConfig,
            apiKey: providerKey,
          }),
        });

        if (!response.ok) {
          let errorMessage = 'Failed to get response';
          try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } catch {
            errorMessage = `API error: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        let fullResponse = '';

        setAgentStatus(agentId, 'working');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          fullResponse += text;
          updateThought(thoughtId, fullResponse);
        }

        // Handle empty response
        if (!fullResponse.trim()) {
          updateThought(thoughtId, 'No response received. Please check your API key settings.');
        }

        // Add to conversation history
        conversationRef.current += `\n\n${agent.name}: ${fullResponse}`;

        setAgentStatus(agentId, 'complete');
        return fullResponse;
      } catch (error) {
        setAgentStatus(agentId, 'idle');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateThought(thoughtId, `Error: ${errorMessage}`);
        return '';
      }
    },
    [agents, apiKeys, setAgentStatus, setActiveAgent, addThought, updateThought]
  );

  const processWithAgents = useCallback(
    async (userPrompt: string) => {
      setProcessing(true);
      conversationRef.current = `User: ${userPrompt}`;

      const respondedAgents = new Set<string>();

      try {
        // Start with orchestrator
        const orchestratorResponse = await streamAgentResponse(userPrompt, 'orchestrator');
        respondedAgents.add('orchestrator');

        // Find all delegations from orchestrator
        const delegations: string[] = [];
        let match;
        DELEGATE_PATTERN.lastIndex = 0;

        while ((match = DELEGATE_PATTERN.exec(orchestratorResponse)) !== null) {
          const agentName = match[1].toLowerCase();
          const agentId = AGENT_NAME_MAP[agentName];
          if (agentId && !delegations.includes(agentId)) {
            delegations.push(agentId);
          }
        }

        // Process each delegated agent
        for (const agentId of delegations) {
          if (respondedAgents.has(agentId)) continue;

          const agent = agents.find((a) => a.id === agentId);

          // Add handoff
          addThought({
            id: nanoid(),
            agentId: 'orchestrator',
            content: `Handing off to ${agent?.name || agentId}...`,
            timestamp: Date.now(),
            type: 'handoff',
            targetAgentId: agentId,
          });

          await streamAgentResponse(`Based on the discussion, provide your perspective.`, agentId);
          respondedAgents.add(agentId);
        }

        // Reset all agents
        agents.forEach((agent) => setAgentStatus(agent.id, 'idle'));
        setActiveAgent(null);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setProcessing(false);
      }
    },
    [agents, streamAgentResponse, setProcessing, setAgentStatus, setActiveAgent, addThought]
  );

  return {
    agents,
    thoughts,
    isProcessing,
    activeAgentId,
    processWithAgents,
    reset,
  };
}
