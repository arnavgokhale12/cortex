'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, Loader2 } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isProcessing: boolean;
}

export function PromptInput({ onSubmit, isProcessing }: PromptInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (!value.trim() || isProcessing) return;
    onSubmit(value.trim());
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mx-auto w-full"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-[18px] transition-all duration-300',
          'border border-[#241d18]/10 bg-[#fffdf7]/90 shadow-[0_24px_80px_rgba(68,54,35,0.18)] backdrop-blur-2xl',
          isFocused && 'border-[#7c5cff]/35 shadow-[0_24px_90px_rgba(97,77,190,0.2)]',
          isProcessing && 'opacity-60'
        )}
      >
        <div className="absolute left-0 top-0 grid h-full w-12 place-items-start pt-5 text-[#7c5cff]">
          <span className="font-mono text-sm">$</span>
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="What would you like to explore?"
          className={cn(
            'w-full min-h-[64px] max-h-[180px] resize-none bg-transparent',
            'px-12 py-5 pr-36 text-[15px] text-[#2d241d] placeholder:text-[#9b8e7d]',
            'focus:outline-none leading-relaxed'
          )}
          disabled={isProcessing}
        />

        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          {!isProcessing && value.trim() && (
            <span className="hidden text-[11px] uppercase tracking-[0.16em] text-[#9b8e7d] sm:block">
              Press Enter
            </span>
          )}

          <motion.button
            onClick={handleSubmit}
            disabled={!value.trim() || isProcessing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'h-10 px-4 rounded-xl font-mono text-xs uppercase tracking-[0.14em] transition-all duration-300',
              'bg-[#241d18] text-[#fff8ed] shadow-lg shadow-[#241d18]/20',
              'disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none',
              'hover:bg-[#352a22]'
            )}
          >
            {isProcessing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <span className="inline-flex items-center gap-1.5">
                Analyze <ArrowRight className="size-3.5" />
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
