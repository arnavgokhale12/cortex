'use client';

import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { useCortexStore } from '@/lib/store';
import { ThoughtNode } from '@/lib/types';

const DELEGATE_PATTERN = /\[DELEGATE:(\w+)\]\s*([\s\S]+?)(?=\[DELEGATE:|$)/g;

export function useCortex() {
  const {
    agents,
    thoughts,
    isProcessing,
    activeAgentId,
    setAgentStatus,
    addThought,
    setProcessing,
    setActiveAgent,
    reset,
  } = useCortexStore();

  const streamAgentResponse = useCallback(
    async (
      prompt: string,
      agentId: string,
      context: string = ''
    ): Promise<string> => {
      setAgentStatus(agentId, 'thinking');
      setActiveAgent(agentId);

      // Add initial thinking thought
      const thinkingThought: ThoughtNode = {
        id: nanoid(),
        agentId,
        content: 'Analyzing request...',
        timestamp: Date.now(),
        type: 'thought',
      };
      addThought(thinkingThought);

      try {
        const response = await fetch('/api/cortex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, agentId, context }),
        });

        if (!response.ok) throw new Error('Failed to get response');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        let fullResponse = '';
        let currentChunk = '';

        setAgentStatus(agentId, 'working');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          currentChunk += text;
          fullResponse += text;

          // Stream thoughts in chunks for visual effect
          if (currentChunk.length > 50 || done) {
            const streamThought: ThoughtNode = {
              id: nanoid(),
              agentId,
              content: currentChunk,
              timestamp: Date.now(),
              type: 'action',
            };
            addThought(streamThought);
            currentChunk = '';
          }
        }

        setAgentStatus(agentId, 'complete');
        return fullResponse;
      } catch (error) {
        setAgentStatus(agentId, 'idle');
        const errorThought: ThoughtNode = {
          id: nanoid(),
          agentId,
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now(),
          type: 'result',
        };
        addThought(errorThought);
        throw error;
      }
    },
    [setAgentStatus, setActiveAgent, addThought]
  );

  const processWithAgents = useCallback(
    async (userPrompt: string) => {
      setProcessing(true);

      try {
        // Start with orchestrator
        const orchestratorResponse = await streamAgentResponse(
          userPrompt,
          'orchestrator'
        );

        // Parse delegations
        const delegations: { agentId: string; task: string }[] = [];
        let match;

        while ((match = DELEGATE_PATTERN.exec(orchestratorResponse)) !== null) {
          const agentName = match[1].toLowerCase();
          const task = match[2].trim();

          // Map agent names to IDs
          const agentIdMap: Record<string, string> = {
            scout: 'researcher',
            forge: 'coder',
            sage: 'critic',
            muse: 'creative',
            researcher: 'researcher',
            coder: 'coder',
            critic: 'critic',
            creative: 'creative',
          };

          const agentId = agentIdMap[agentName];
          if (agentId) {
            delegations.push({ agentId, task });
          }
        }

        // Execute delegated tasks
        const context = `Original request: ${userPrompt}\n\nOrchestrator analysis:\n${orchestratorResponse}`;

        for (const delegation of delegations) {
          // Add handoff thought
          const handoffThought: ThoughtNode = {
            id: nanoid(),
            agentId: 'orchestrator',
            content: `Delegating: ${delegation.task}`,
            timestamp: Date.now(),
            type: 'handoff',
            targetAgentId: delegation.agentId,
          };
          addThought(handoffThought);

          await streamAgentResponse(delegation.task, delegation.agentId, context);
        }

        // Reset all agents to idle
        agents.forEach((agent) => setAgentStatus(agent.id, 'idle'));
        setActiveAgent(null);
      } catch (error) {
        console.error('Error processing with agents:', error);
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
