'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
      className="relative max-w-3xl mx-auto w-full"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20 blur-xl"
        animate={{
          opacity: isFocused ? 0.6 : 0.2,
        }}
        transition={{ duration: 0.3 }}
      />

      <div
        className={cn(
          'relative rounded-2xl transition-all duration-300',
          'bg-white/[0.03] border border-white/[0.08]',
          isFocused && 'bg-white/[0.05] border-white/[0.15]',
          isProcessing && 'opacity-60'
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="What would you like to explore?"
          className={cn(
            'w-full min-h-[60px] max-h-[200px] resize-none bg-transparent',
            'px-6 py-5 pr-32 text-[15px] text-white/90 placeholder:text-white/20',
            'focus:outline-none font-light leading-relaxed'
          )}
          disabled={isProcessing}
        />

        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          {!isProcessing && value.trim() && (
            <span className="text-[11px] text-white/20 hidden sm:block">
              Press Enter
            </span>
          )}

          <motion.button
            onClick={handleSubmit}
            disabled={!value.trim() || isProcessing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'h-10 px-5 rounded-xl font-medium text-sm transition-all duration-300',
              'bg-gradient-to-r from-violet-500 to-fuchsia-500',
              'text-white shadow-lg shadow-violet-500/25',
              'disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none',
              'hover:shadow-xl hover:shadow-violet-500/30'
            )}
          >
            {isProcessing ? (
              <motion.div
                className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
