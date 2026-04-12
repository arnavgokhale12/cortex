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

  // Auto-scroll to bottom when thoughts change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thoughts]);

  const getAgent = (agentId: string) => agents.find((a) => a.id === agentId);

  const getTypeLabel = (type: ThoughtNode['type']) => {
    switch (type) {
      case 'handoff':
        return 'delegating';
      default:
        return 'thinking';
    }
  };

  return (
    <div ref={containerRef} className="h-full overflow-y-auto scroll-smooth">
      <div className="space-y-3 p-4">
        <AnimatePresence mode="popLayout">
          {thoughts.map((thought) => {
            const agent = getAgent(thought.agentId);
            const targetAgent = thought.targetAgentId
              ? getAgent(thought.targetAgentId)
              : null;

            // Skip empty thoughts
            if (!thought.content) return null;

            return (
              <motion.div
                key={thought.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'relative rounded-xl border bg-card/40 p-4 backdrop-blur-sm',
                  thought.type === 'handoff' && 'border-dashed bg-card/20'
                )}
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: agent?.color || 'var(--border)',
                }}
              >
                {/* Agent header */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: agent?.color }}
                  >
                    {agent?.avatar}
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: agent?.color }}
                  >
                    {agent?.name}
                  </span>
                  {targetAgent && (
                    <>
                      <span className="text-xs text-muted-foreground">-&gt;</span>
                      <div
                        className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: targetAgent.color }}
                      >
                        {targetAgent.avatar}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ color: targetAgent.color }}
                      >
                        {targetAgent.name}
                      </span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {getTypeLabel(thought.type)}
                  </span>
                </div>

                {/* Content */}
                <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {thought.content || (
                    <span className="text-muted-foreground italic">Thinking...</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {thoughts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-[400px] text-center px-8"
          >
            <div className="mb-6">
              <div className="text-5xl mb-3 opacity-50">...</div>
              <h3 className="text-xl font-semibold mb-2">Ready to collaborate</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Watch AI agents reason, delegate, and solve problems together in real-time.
              </p>
            </div>
            <div className="grid gap-2 w-full max-w-md">
              {[
                'Design a REST API for a todo app',
                'Review this algorithm: bubble sort vs quick sort',
                'Brainstorm features for a fitness app',
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onExampleClick?.(prompt)}
                  className="text-left px-4 py-3 rounded-xl border bg-card/50 hover:bg-card hover:border-primary/50 transition-all text-sm hover:scale-[1.02]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
