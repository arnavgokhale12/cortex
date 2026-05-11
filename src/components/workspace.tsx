'use client';

import { motion } from 'framer-motion';
import { useCortex } from '@/hooks/use-cortex';
import { PromptInput } from './prompt-input';
import { Button } from '@/components/ui/button';
import { AgentSettings } from './agent-settings';
import { cn } from '@/lib/utils';
import { useCortexStore } from '@/lib/store';
import {
  ArrowRight,
  AudioLines,
  Bot,
  Brain,
  Code2,
  Lightbulb,
  MessageSquareText,
  RefreshCcw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const NODE_POSITIONS: Record<string, { left: string; top: string }> = {
  orchestrator: { left: '47%', top: '9%' },
  researcher: { left: '22%', top: '28%' },
  coder: { left: '72%', top: '20%' },
  critic: { left: '76%', top: '56%' },
  creative: { left: '28%', top: '61%' },
};

const NODE_ICONS = {
  orchestrator: Brain,
  researcher: Search,
  coder: Code2,
  critic: ShieldCheck,
  creative: Lightbulb,
};

const EXAMPLES = [
  'Design a REST API for a todo app',
  'Compare bubble sort vs quick sort',
  'Brainstorm a fitness app concept',
];

export function Workspace() {
  const { agents, thoughts, isProcessing, activeAgentId, processWithAgents, reset } =
    useCortex();
  const { setEditingAgent } = useCortexStore();

  const latestThought = [...thoughts].reverse().find((thought) => thought.content.trim());
  const latestAgent = latestThought
    ? agents.find((agent) => agent.id === latestThought.agentId)
    : agents.find((agent) => agent.id === activeAgentId) || agents[0];
  const activeCount = agents.filter((agent) => agent.status !== 'idle').length;

  return (
    <div className="relative h-screen overflow-hidden bg-[#f7f3e9] text-[#241d18]">
      <AgentSettings />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(88,72,53,0.16)_1px,transparent_0)] bg-[length:22px_22px]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(247,243,233,0.35)_46%,rgba(238,231,216,0.8))]" />
      <div className="absolute right-0 top-0 h-64 w-64 bg-[radial-gradient(circle,rgba(20,184,166,0.14),transparent_68%)]" />
      <div className="absolute left-12 bottom-12 h-72 w-72 bg-[radial-gradient(circle,rgba(249,115,22,0.12),transparent_70%)]" />

      <header className="relative z-20 flex items-center justify-between px-5 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl border border-[#241d18]/10 bg-white/70 shadow-[0_10px_30px_rgba(76,59,38,0.12)] backdrop-blur">
            <Sparkles className="size-4 text-[#6d5dfc]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Cortex</h1>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#7c6f61]">
              agent canvas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden rounded-full border border-[#241d18]/10 bg-white/60 px-3 py-1.5 text-xs text-[#6f6256] shadow-sm backdrop-blur md:block">
            {activeCount || 5} agents connected
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={reset}
            disabled={isProcessing || thoughts.length === 0}
            className="size-9 rounded-full border border-[#241d18]/10 bg-white/60 text-[#6f6256] hover:bg-white"
            aria-label="Clear session"
          >
            <RefreshCcw className="size-4" />
          </Button>
        </div>
      </header>

      <div className="relative z-10 h-[calc(100vh-72px)]">
        <svg
          className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
          viewBox="0 0 1200 720"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M270 210 C420 120 500 170 565 245" className="canvas-path" />
          <path d="M820 160 C720 170 640 210 585 260" className="canvas-path" />
          <path d="M870 470 C740 430 650 370 585 310" className="canvas-path" />
          <path d="M380 520 C470 430 520 365 555 315" className="canvas-path" />
          <path
            d="M585 310 C610 385 620 445 610 505"
            className={cn('canvas-path-solid', isProcessing && 'canvas-path-active')}
          />
        </svg>

        <section className="absolute left-4 top-5 z-20 hidden w-[260px] rounded-[18px] border border-[#241d18]/10 bg-white/75 p-4 shadow-[0_18px_50px_rgba(68,54,35,0.12)] backdrop-blur-xl lg:block">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9b6a32]">
                Voice Note
              </p>
              <p className="mt-1 text-xs text-[#766a5c]">audio input standby</p>
            </div>
            <AudioLines className="size-4 text-[#9b6a32]" />
          </div>
          <div className="rounded-xl border border-[#241d18]/10 bg-[#f5efe4] p-3">
            <div className="mb-2 flex items-center gap-2">
              <div className="grid size-6 place-items-center rounded-full bg-white text-[#8b6d4a]">
                <span className="size-2 rounded-full bg-[#8b6d4a]" />
              </div>
              <div className="flex flex-1 items-end gap-0.5">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-0.5 rounded-full bg-[#8b6d4a]/50"
                    style={{ height: `${6 + ((i * 7) % 18)}px` }}
                  />
                ))}
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a8d7c]">
              ready to transcribe
            </p>
          </div>
        </section>

        {agents.map((agent, index) => {
          const Icon = NODE_ICONS[agent.role] || Bot;
          const active = activeAgentId === agent.id || agent.status !== 'idle';
          const position = NODE_POSITIONS[agent.id] || { left: '50%', top: '50%' };

          return (
            <motion.button
              key={agent.id}
              type="button"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => !isProcessing && setEditingAgent(agent.id)}
              className={cn(
                'absolute z-20 hidden -translate-x-1/2 rounded-[22px] text-left transition md:block',
                !isProcessing && 'hover:-translate-y-1'
              )}
              style={position}
            >
              <div
                className={cn(
                  'relative grid size-[92px] place-items-center rounded-full border bg-[#fffdf7]/92 shadow-[0_22px_60px_rgba(68,54,35,0.18)] backdrop-blur-xl',
                  active ? 'border-white ring-4 ring-white/70' : 'border-[#241d18]/12'
                )}
              >
                <div
                  className="absolute inset-2 rounded-full opacity-15 blur-xl"
                  style={{ backgroundColor: agent.color }}
                />
                <div
                  className="grid size-14 place-items-center rounded-full text-white shadow-lg"
                  style={{ backgroundColor: agent.color }}
                >
                  <Icon className="size-6" />
                </div>
                {active && (
                  <motion.span
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: agent.color }}
                    animate={{ scale: [1, 1.16, 1], opacity: [0.55, 0, 0.55] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-semibold text-[#342820]">{agent.name}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#8b7c6d]">
                  {agent.modelConfig.displayName.split('(')[0].trim()}
                </p>
              </div>
            </motion.button>
          );
        })}

        <main className="absolute left-1/2 top-[39%] z-30 w-[min(92vw,430px)] -translate-x-1/2 -translate-y-1/2 md:top-[44%]">
          <motion.div
            layout
            className="rounded-[24px] border border-[#7c5cff]/35 bg-[#fffdf7]/90 p-4 shadow-[0_24px_80px_rgba(74,53,129,0.18)] backdrop-blur-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: latestAgent?.color || '#7c5cff' }}
                />
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#7c5cff]">
                  {isProcessing ? 'synthesizing' : 'latest synthesis'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => latestAgent && setEditingAgent(latestAgent.id)}
                className="grid size-7 place-items-center rounded-full border border-[#241d18]/10 bg-white/70 text-[#7a6d60] hover:bg-white"
                aria-label="Open agent settings"
              >
                <Settings2 className="size-3.5" />
              </button>
            </div>

            <div className="min-h-[180px] rounded-[18px] border border-[#241d18]/8 bg-white/75 p-4">
              {latestThought?.content ? (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className="grid size-8 place-items-center rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: latestAgent?.color }}
                    >
                      {latestAgent?.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{latestAgent?.name}</p>
                      <p className="text-[11px] text-[#837668]">{latestAgent?.role}</p>
                    </div>
                  </div>
                  <p className="line-clamp-[8] whitespace-pre-wrap text-sm leading-6 text-[#4d4137]">
                    {latestThought.content}
                  </p>
                </div>
              ) : (
                <div className="flex h-[148px] flex-col items-center justify-center text-center">
                  <div className="relative mb-5">
                    <div className="absolute inset-0 rounded-full bg-[#7c5cff]/20 blur-xl" />
                    <div className="relative grid size-14 place-items-center rounded-full bg-white shadow-sm">
                      <MessageSquareText className="size-6 text-[#7c5cff]" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold">Drop a prompt into the canvas</p>
                  <p className="mt-1 max-w-[260px] text-xs leading-5 text-[#827568]">
                    Cortex will route it through the agent network and keep the latest synthesis here.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3 rounded-xl border border-[#241d18]/10 bg-white/60 p-3">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-[#7c5cff]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7c5cff]">
                  reasoning intent
                </p>
              </div>
              <p className="mt-1 text-xs text-[#6f6256]">
                {isProcessing ? 'Understanding your prompt...' : 'Waiting for the next prompt.'}
              </p>
            </div>
          </motion.div>
        </main>

        <aside className="absolute bottom-[116px] right-5 z-20 hidden w-[310px] rounded-[20px] border border-[#241d18]/10 bg-white/75 p-4 shadow-[0_18px_60px_rgba(68,54,35,0.13)] backdrop-blur-xl xl:block">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a7a68]">
              activity
            </p>
            <span className="rounded-full bg-[#241d18]/5 px-2 py-1 text-[10px] text-[#766a5c]">
              {thoughts.length} events
            </span>
          </div>
          <div className="space-y-2">
            {[...thoughts].reverse().slice(0, 4).map((thought) => {
              const agent = agents.find((item) => item.id === thought.agentId);

              return (
                <div
                  key={thought.id}
                  className="rounded-xl border border-[#241d18]/8 bg-white/70 p-3"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: agent?.color || '#7c5cff' }}
                    />
                    <p className="text-xs font-semibold text-[#3c3027]">{agent?.name}</p>
                    {thought.type === 'handoff' && <ArrowRight className="ml-auto size-3 text-[#9b8e7c]" />}
                  </div>
                  <p className="line-clamp-2 text-[11px] leading-4 text-[#766a5c]">
                    {thought.content || 'Thinking...'}
                  </p>
                </div>
              );
            })}
            {thoughts.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#241d18]/15 bg-white/40 p-4 text-xs leading-5 text-[#766a5c]">
                Agent activity will appear here once a prompt starts moving through the network.
              </div>
            )}
          </div>
        </aside>

        <div className="absolute bottom-5 left-1/2 z-40 w-[min(92vw,880px)] -translate-x-1/2">
          <div className="mb-3 hidden justify-center gap-2 md:flex">
            {EXAMPLES.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => processWithAgents(prompt)}
                disabled={isProcessing}
                className="rounded-full border border-[#241d18]/10 bg-white/55 px-3 py-1.5 text-xs text-[#6f6256] shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
          <PromptInput onSubmit={processWithAgents} isProcessing={isProcessing} />
        </div>
      </div>
    </div>
  );
}
