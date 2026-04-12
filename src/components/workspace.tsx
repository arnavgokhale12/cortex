'use client';

import { motion } from 'framer-motion';
import { useCortex } from '@/hooks/use-cortex';
import { AgentCard } from './agent-card';
import { ThoughtStream } from './thought-stream';
import { PromptInput } from './prompt-input';
import { Button } from '@/components/ui/button';
import { AgentSettings } from './agent-settings';

export function Workspace() {
  const { agents, thoughts, isProcessing, activeAgentId, processWithAgents, reset } =
    useCortex();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#050508]">
      <AgentSettings />

      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_rgba(88,28,135,0.15)_0%,_transparent_50%)]" />
        <div className="absolute bottom-[-30%] right-[-30%] w-[100%] h-[100%] bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 glass-strong">
        <div className="flex items-center gap-4">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl blur-xl opacity-50 animate-pulse-glow" />
            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-2xl">
              <span className="text-white font-semibold text-xl tracking-tight">C</span>
            </div>
          </motion.div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight gradient-text">Cortex</h1>
            <p className="text-xs text-white/40 tracking-wide uppercase">AI Agent Workspace</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          disabled={isProcessing || thoughts.length === 0}
          className="text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300"
        >
          Clear Session
        </Button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Agent Panel */}
        <aside className="w-[340px] glass flex flex-col border-r border-white/5">
          <div className="p-6">
            <h2 className="text-[11px] font-medium text-white/30 uppercase tracking-[0.2em] mb-4">
              Agents
            </h2>
            <div className="space-y-3">
              {agents.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <AgentCard
                    agent={agent}
                    isActive={activeAgentId === agent.id}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-auto p-6 border-t border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-light text-white/90 tabular-nums">
                  {thoughts.length}
                </div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                  Thoughts
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-light text-white/90 tabular-nums">
                  {agents.filter((a) => a.status !== 'idle').length}
                </div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                  Active
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main area - Thought Stream */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Thought stream */}
          <div className="flex-1 overflow-hidden">
            <ThoughtStream
              thoughts={thoughts}
              agents={agents}
              onExampleClick={processWithAgents}
            />
          </div>

          {/* Input area */}
          <div className="p-6 glass-strong border-t border-white/5">
            <PromptInput onSubmit={processWithAgents} isProcessing={isProcessing} />
          </div>
        </main>
      </div>
    </div>
  );
}
