'use client';

import { useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import { useCortexStore } from '@/lib/store';
import { ThoughtNode } from '@/lib/types';

const DELEGATE_PATTERN = /\[DELEGATE:(\w+)\]\s*([\s\S]+?)(?=\[DELEGATE:|$)/gi;

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
    setAgentStatus,
    addThought,
    updateThought,
    setProcessing,
    setActiveAgent,
    reset,
  } = useCortexStore();

  const conversationRef = useRef<string>('');

  const streamAgentResponse = useCallback(
    async (
      prompt: string,
      agentId: string,
      fromAgentId?: string
    ): Promise<{ response: string; delegations: { agentId: string; task: string }[] }> => {
      setAgentStatus(agentId, 'thinking');
      setActiveAgent(agentId);

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
          body: JSON.stringify({
            prompt,
            agentId,
            context: conversationRef.current,
          }),
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
          updateThought(thoughtId, fullResponse);
        }

        // Add to conversation history
        const agentName = agents.find(a => a.id === agentId)?.name || agentId;
        conversationRef.current += `\n\n**${agentName}**: ${fullResponse}`;

        // Parse any delegations from this agent's response
        const delegations: { agentId: string; task: string }[] = [];
        DELEGATE_PATTERN.lastIndex = 0;
        let match;

        while ((match = DELEGATE_PATTERN.exec(fullResponse)) !== null) {
          const targetAgentName = match[1].toLowerCase();
          const task = match[2].trim();
          const targetAgentId = AGENT_NAME_MAP[targetAgentName];

          if (targetAgentId && targetAgentId !== agentId) {
            // Avoid duplicates
            if (!delegations.some(d => d.agentId === targetAgentId)) {
              delegations.push({ agentId: targetAgentId, task });
            }
          }
        }

        setAgentStatus(agentId, 'complete');
        return { response: fullResponse, delegations };
      } catch (error) {
        setAgentStatus(agentId, 'idle');
        updateThought(thoughtId, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return { response: '', delegations: [] };
      }
    },
    [agents, setAgentStatus, setActiveAgent, addThought, updateThought]
  );

  const processWithAgents = useCallback(
    async (userPrompt: string) => {
      setProcessing(true);
      conversationRef.current = `**User**: ${userPrompt}`;

      // Track which agents have responded to avoid infinite loops
      const respondedAgents = new Set<string>();
      const maxRounds = 6; // Prevent infinite delegation chains
      let round = 0;

      // Queue of pending agent tasks
      let pendingTasks: { agentId: string; task: string; fromAgentId?: string }[] = [
        { agentId: 'orchestrator', task: userPrompt }
      ];

      try {
        while (pendingTasks.length > 0 && round < maxRounds) {
          const currentTask = pendingTasks.shift()!;
          round++;

          // Skip if this agent already responded this session (unless it's orchestrator)
          if (respondedAgents.has(currentTask.agentId) && currentTask.agentId !== 'orchestrator') {
            continue;
          }

          // Add handoff visual if coming from another agent
          if (currentTask.fromAgentId) {
            const fromAgent = agents.find(a => a.id === currentTask.fromAgentId);
            const toAgent = agents.find(a => a.id === currentTask.agentId);

            addThought({
              id: nanoid(),
              agentId: currentTask.fromAgentId,
              content: `Passing to ${toAgent?.name}...`,
              timestamp: Date.now(),
              type: 'handoff',
              targetAgentId: currentTask.agentId,
            });
          }

          // Get agent's response
          const { response, delegations } = await streamAgentResponse(
            currentTask.task,
            currentTask.agentId,
            currentTask.fromAgentId
          );

          respondedAgents.add(currentTask.agentId);

          // Add new delegations to the queue
          for (const delegation of delegations) {
            if (!respondedAgents.has(delegation.agentId)) {
              pendingTasks.push({
                ...delegation,
                fromAgentId: currentTask.agentId,
              });
            }
          }

          // Small delay between agents for visual effect
          if (pendingTasks.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
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
