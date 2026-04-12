'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Agent } from '@/lib/types';

interface AgentNetworkProps {
  agents: Agent[];
  activeAgentId: string | null;
  thoughts: { agentId: string; targetAgentId?: string }[];
}

export function AgentNetwork({ agents, activeAgentId, thoughts }: AgentNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate positions in a circle
  const getAgentPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius + radius + 40,
      y: Math.sin(angle) * radius + radius + 40,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const radius = 80;
    const size = (radius + 40) * 2;
    canvas.width = size;
    canvas.height = size;

    let animationFrame: number;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);

      // Draw connections between agents
      agents.forEach((agent, i) => {
        const pos = getAgentPosition(i, agents.length, radius);

        // Draw connections to other agents
        agents.forEach((targetAgent, j) => {
          if (i >= j) return;
          const targetPos = getAgentPosition(j, agents.length, radius);

          // Check if there's a recent handoff between these agents
          const hasConnection = thoughts.some(
            (t) =>
              (t.agentId === agent.id && t.targetAgentId === targetAgent.id) ||
              (t.agentId === targetAgent.id && t.targetAgentId === agent.id)
          );

          ctx.beginPath();
          ctx.moveTo(pos.x, pos.y);
          ctx.lineTo(targetPos.x, targetPos.y);

          if (hasConnection) {
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 + Math.sin(time * 3) * 0.2})`;
            ctx.lineWidth = 2;
          } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
          }

          ctx.stroke();
        });
      });

      // Draw agent nodes
      agents.forEach((agent, i) => {
        const pos = getAgentPosition(i, agents.length, radius);
        const isActive = agent.id === activeAgentId;

        // Glow effect
        if (isActive || agent.status !== 'idle') {
          const gradient = ctx.createRadialGradient(
            pos.x,
            pos.y,
            0,
            pos.x,
            pos.y,
            25
          );
          gradient.addColorStop(0, agent.color + '60');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = agent.color;
        ctx.fill();

        // Pulse ring for active agent
        if (isActive) {
          const pulseRadius = 12 + Math.sin(time * 4) * 4 + 4;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = agent.color + '80';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(agent.avatar, pos.x, pos.y + 4);
      });

      time += 0.016;
      animationFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrame);
  }, [agents, activeAgentId, thoughts]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center p-4"
    >
      <canvas
        ref={canvasRef}
        className="opacity-80"
        style={{ width: 240, height: 240 }}
      />
    </motion.div>
  );
}
