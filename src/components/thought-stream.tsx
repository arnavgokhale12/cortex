'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ThoughtNode, Agent } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface ThoughtStreamProps {
  thoughts: ThoughtNode[];
  agents: Agent[];
  onExampleClick?: (prompt: string) => void;
}

export function ThoughtStream({ thoughts, agents, onExampleClick }: ThoughtStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thoughts]);

  const getAgent = (agentId: string) => agents.find((a) => a.id === agentId);

  const getTypeIcon = (type: ThoughtNode['type']) => {
    switch (type) {
      case 'thought':
        return '...';
      case 'action':
        return '>';
      case 'result':
        return '*';
      case 'handoff':
        return '->';
      default:
        return '>';
    }
  };

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="space-y-2 p-4">
        <AnimatePresence mode="popLayout">
          {thoughts.map((thought, index) => {
            const agent = getAgent(thought.agentId);
            const targetAgent = thought.targetAgentId
              ? getAgent(thought.targetAgentId)
              : null;

            return (
              <motion.div
                key={thought.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className={cn(
                  'relative rounded-lg border bg-card/30 p-3 backdrop-blur-sm',
                  thought.type === 'handoff' && 'border-dashed'
                )}
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: agent?.color || 'var(--border)',
                }}
              >
                {/* Agent indicator */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: agent?.color }}
                  >
                    {agent?.avatar}
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: agent?.color }}
                  >
                    {agent?.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {getTypeIcon(thought.type)}
                  </span>
                  {targetAgent && (
                    <>
                      <span className="text-xs text-muted-foreground">to</span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: targetAgent.color }}
                      >
                        {targetAgent.name}
                      </span>
                    </>
                  )}
                </div>

                {/* Content */}
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {thought.content}
                </p>

                {/* Timestamp */}
                <span className="absolute top-2 right-2 text-[10px] text-muted-foreground font-mono">
                  {new Date(thought.timestamp).toLocaleTimeString()}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {thoughts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center px-8"
          >
            <div className="mb-6">
              <div className="text-4xl mb-2">...</div>
              <h3 className="text-lg font-semibold mb-2">Ready to collaborate</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Watch AI agents reason, delegate, and solve problems together in real-time.
                Try one of these examples:
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
                  className="text-left px-4 py-3 rounded-lg border bg-card/50 hover:bg-card hover:border-primary/50 transition-colors text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </ScrollArea>
  );
}
