'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ThoughtNode, Agent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface ThoughtStreamProps {
  thoughts: ThoughtNode[];
  agents: Agent[];
  onExampleClick?: (prompt: string) => void;
}

export function ThoughtStream({ thoughts, agents, onExampleClick }: ThoughtStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thoughts]);

  const getAgent = (agentId: string) => agents.find((a) => a.id === agentId);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto scroll-smooth px-6 py-8">
      <AnimatePresence mode="popLayout">
        {thoughts.map((thought) => {
          const agent = getAgent(thought.agentId);
          const targetAgent = thought.targetAgentId
            ? getAgent(thought.targetAgentId)
            : null;

          if (!thought.content) return null;

          return (
            <motion.div
              key={thought.id}
              layout
              initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className={cn(
                'mb-4 max-w-3xl',
                thought.type === 'handoff' && 'max-w-md'
              )}
            >
              {thought.type === 'handoff' ? (
                // Handoff - minimal style
                <div className="flex items-center gap-3 py-3 px-4 rounded-full bg-white/[0.02] border border-white/[0.05]">
                  <div
                    className="h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-medium text-white"
                    style={{ backgroundColor: agent?.color }}
                  >
                    {agent?.avatar}
                  </div>
                  <span className="text-white/30 text-sm">
                    {thought.content}
                  </span>
                  {targetAgent && (
                    <div
                      className="h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-medium text-white ml-auto"
                      style={{ backgroundColor: targetAgent.color }}
                    >
                      {targetAgent.avatar}
                    </div>
                  )}
                </div>
              ) : (
                // Regular thought - card style
                <div
                  className="relative rounded-2xl p-5 bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm"
                  style={{
                    borderLeftWidth: 2,
                    borderLeftColor: agent?.color || 'transparent',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-medium text-white shadow-lg"
                      style={{
                        backgroundColor: agent?.color,
                        boxShadow: `0 4px 20px -5px ${agent?.color}50`
                      }}
                    >
                      {agent?.avatar}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white/90">{agent?.name}</span>
                      <span className="text-white/20 mx-2">·</span>
                      <span className="text-xs text-white/30">
                        {agent?.modelConfig.displayName.split('(')[0].trim()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-[15px] text-white/80 leading-relaxed whitespace-pre-wrap font-light">
                    {thought.content}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {thoughts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        >
          <motion.div
            className="mb-8"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 via-fuchsia-500/30 to-cyan-500/30 rounded-3xl blur-3xl" />
              <div className="relative text-6xl opacity-30">...</div>
            </div>
          </motion.div>

          <h3 className="text-2xl font-light text-white/90 mb-2 tracking-tight">
            Ready when you are
          </h3>
          <p className="text-sm text-white/30 max-w-sm mb-10 leading-relaxed">
            Watch multiple AI agents collaborate in real-time to solve your problems.
          </p>

          <div className="flex flex-col gap-3 w-full max-w-sm">
            {[
              'Design a REST API for a todo app',
              'Compare bubble sort vs quick sort',
              'Brainstorm a fitness app concept',
            ].map((prompt, i) => (
              <motion.button
                key={prompt}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onClick={() => onExampleClick?.(prompt)}
                className="group text-left px-5 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-300 text-sm text-white/60 hover:text-white/90"
              >
                <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                  {prompt}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
