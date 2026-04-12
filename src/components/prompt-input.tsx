'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isProcessing: boolean;
}

export function PromptInput({ onSubmit, isProcessing }: PromptInputProps) {
  const [value, setValue] = useState('');
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
      className="relative"
    >
      <div
        className={cn(
          'relative rounded-2xl border bg-card/50 backdrop-blur-sm p-1',
          'focus-within:ring-2 focus-within:ring-primary/20 transition-all',
          isProcessing && 'opacity-70'
        )}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask the agents anything..."
          className={cn(
            'min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent',
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            'placeholder:text-muted-foreground/50 pr-24'
          )}
          disabled={isProcessing}
        />

        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">
            {isProcessing ? 'Processing...' : 'Enter to send'}
          </span>
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isProcessing}
            size="sm"
            className="h-8 px-4 rounded-xl"
          >
            {isProcessing ? (
              <motion.div
                className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              'Send'
            )}
          </Button>
        </div>
      </div>

      {/* Subtle gradient glow */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-pink-500/10 blur-xl opacity-50" />
    </motion.div>
  );
}
