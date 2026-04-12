'use client';

import { motion } from 'framer-motion';
import { Agent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useCortexStore } from '@/lib/store';

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
}

export function AgentCard({ agent, isActive }: AgentCardProps) {
  const { setEditingAgent, isProcessing } = useCortexStore();

  const handleClick = () => {
    if (!isProcessing) {
      setEditingAgent(agent.id);
    }
  };

  return (
    <motion.div
      layout
      onClick={handleClick}
      whileHover={{ scale: isProcessing ? 1 : 1.02 }}
      whileTap={{ scale: isProcessing ? 1 : 0.98 }}
      className={cn(
        'relative group rounded-2xl p-4 transition-all duration-500',
        'bg-white/[0.02] hover:bg-white/[0.05]',
        'border border-white/[0.05] hover:border-white/[0.1]',
        !isProcessing && 'cursor-pointer',
        isActive && 'bg-white/[0.08] border-white/[0.15]'
      )}
    >
      {/* Active glow */}
      {isActive && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-2xl opacity-30 blur-2xl"
          style={{ backgroundColor: agent.color }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <motion.div
            className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-medium text-sm shadow-lg"
            style={{
              backgroundColor: agent.color,
              boxShadow: isActive ? `0 0 30px -5px ${agent.color}` : 'none'
            }}
            animate={
              agent.status === 'thinking' || agent.status === 'working'
                ? { scale: [1, 1.05, 1] }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {agent.avatar}
          </motion.div>

          {/* Status dot */}
          <motion.div
            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#050508]"
            style={{
              backgroundColor: agent.status === 'idle' ? 'rgba(255,255,255,0.3)' : agent.color
            }}
            animate={
              agent.status !== 'idle'
                ? { scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }
                : {}
            }
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white/90 text-sm">{agent.name}</span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium"
              style={{
                backgroundColor: `${agent.color}20`,
                color: agent.color
              }}
            >
              {agent.role}
            </span>
          </div>
          <p className="text-[11px] text-white/30 mt-0.5 truncate">
            {agent.modelConfig.displayName.split('(')[0].trim()}
          </p>
        </div>

        {/* Edit hint */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
