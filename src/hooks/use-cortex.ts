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
    updateThought,
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

      // Create a single thought that we'll update as content streams in
      const thoughtId = nanoid();
      const streamThought: ThoughtNode = {
        id: thoughtId,
        agentId,
        content: '',
        timestamp: Date.now(),
        type: 'action',
      };
      addThought(streamThought);

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

        setAgentStatus(agentId, 'working');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          fullResponse += text;

          // Update the same thought with accumulated content
          updateThought(thoughtId, fullResponse);
        }

        setAgentStatus(agentId, 'complete');
        return fullResponse;
      } catch (error) {
        setAgentStatus(agentId, 'idle');
        updateThought(thoughtId, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    },
    [setAgentStatus, setActiveAgent, addThought, updateThought]
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

        // Reset regex state
        DELEGATE_PATTERN.lastIndex = 0;

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
          if (agentId && !delegations.some(d => d.agentId === agentId)) {
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
            content: `Handing off to ${delegation.agentId}...`,
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
