'use client';

import { motion } from 'framer-motion';
import { useCortex } from '@/hooks/use-cortex';
import { AgentCard } from './agent-card';
import { ThoughtStream } from './thought-stream';
import { PromptInput } from './prompt-input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AgentNetwork } from './agent-network';
import { AgentSettings } from './agent-settings';

export function Workspace() {
  const { agents, thoughts, isProcessing, activeAgentId, processWithAgents, reset } =
    useCortex();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AgentSettings />
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <motion.div
            className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 via-cyan-500 to-pink-500 flex items-center justify-center"
            animate={{
              boxShadow: isProcessing
                ? [
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                    '0 0 40px rgba(6, 182, 212, 0.3)',
                    '0 0 20px rgba(236, 72, 153, 0.3)',
                  ]
                : '0 0 20px rgba(139, 92, 246, 0.2)',
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-white font-bold text-lg">C</span>
          </motion.div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Cortex</h1>
            <p className="text-xs text-muted-foreground">AI Agent Workspace</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          disabled={isProcessing || thoughts.length === 0}
        >
          Clear
        </Button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Agent Panel */}
        <aside className="w-80 border-r bg-muted/30 flex flex-col">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              Active Agents
            </h2>
            <div className="space-y-2">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isActive={activeAgentId === agent.id}
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Agent Network Visualization */}
          <div className="hidden lg:block">
            <AgentNetwork
              agents={agents}
              activeAgentId={activeAgentId}
              thoughts={thoughts}
            />
          </div>

          <Separator className="hidden lg:block" />

          {/* Stats */}
          <div className="p-4 mt-auto">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-card/50 p-3">
                <div className="text-2xl font-bold text-foreground">
                  {thoughts.length}
                </div>
                <div className="text-xs text-muted-foreground">Thoughts</div>
              </div>
              <div className="rounded-lg bg-card/50 p-3">
                <div className="text-2xl font-bold text-foreground">
                  {agents.filter((a) => a.status !== 'idle').length}
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main area - Thought Stream */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Thought stream */}
          <div className="flex-1 overflow-hidden bg-gradient-to-b from-background to-muted/20">
            <ThoughtStream
              thoughts={thoughts}
              agents={agents}
              onExampleClick={processWithAgents}
            />
          </div>

          {/* Input area */}
          <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
            <PromptInput onSubmit={processWithAgents} isProcessing={isProcessing} />
          </div>
        </main>
      </div>
    </div>
  );
}
