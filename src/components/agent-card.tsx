'use client';

import { motion } from 'framer-motion';
import { Agent } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
}

export function AgentCard({ agent, isActive }: AgentCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-300',
        'bg-card/50 backdrop-blur-sm',
        isActive && 'ring-2 ring-offset-2 ring-offset-background',
        agent.status === 'thinking' && 'animate-pulse'
      )}
      style={{
        borderColor: isActive ? agent.color : 'var(--border)',
        ['--tw-ring-color' as string]: agent.color,
      }}
    >
      {/* Glow effect when active */}
      {isActive && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-xl opacity-20 blur-xl"
          style={{ backgroundColor: agent.color }}
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <Avatar className="h-10 w-10 border-2" style={{ borderColor: agent.color }}>
        <AvatarFallback
          className="text-sm font-bold text-white"
          style={{ backgroundColor: agent.color }}
        >
          {agent.avatar}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{agent.name}</span>
          <Badge
            variant="outline"
            className="text-xs capitalize"
            style={{
              borderColor: agent.color,
              color: agent.color,
            }}
          >
            {agent.role}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-1.5">
        <motion.div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: agent.color }}
          animate={
            agent.status === 'thinking' || agent.status === 'working'
              ? { scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }
              : {}
          }
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
      </div>
    </motion.div>
  );
}
