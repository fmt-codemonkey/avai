"use client";

import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface ThinkingIndicatorProps {
  className?: string;
}

export function ThinkingIndicator({ className }: ThinkingIndicatorProps) {
  const [dots, setDots] = useState('');
  const [phase, setPhase] = useState<'thinking' | 'analyzing' | 'generating'>('thinking');

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Phase rotation for more engagement
  useEffect(() => {
    const phases = ['thinking', 'analyzing', 'generating'] as const;
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length;
      setPhase(phases[currentIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getPhaseText = () => {
    switch (phase) {
      case 'thinking': return 'AVAI is thinking';
      case 'analyzing': return 'Analyzing your request';
      case 'generating': return 'Generating response';
      default: return 'AVAI is thinking';
    }
  };

  return (
    <div className={`flex items-start gap-3 p-4 ${className}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 shadow-md">
        <Bot className="w-4 h-4 text-primary-foreground" />
      </div>

      {/* Thinking bubble */}
      <div className="flex-1 max-w-2xl">
        <div className="bg-muted/50 dark:bg-muted/30 rounded-2xl rounded-tl-sm px-4 py-3 border border-border/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Animated thinking dots */}
            <div className="flex items-center gap-1 thinking-dots">
              <div className="w-2 h-2 rounded-full bg-primary/60" />
              <div className="w-2 h-2 rounded-full bg-primary/60" />
              <div className="w-2 h-2 rounded-full bg-primary/60" />
            </div>

            {/* Phase text */}
            <div className="text-sm text-muted-foreground">
              {getPhaseText()}{dots}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 w-full h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary/50 to-primary bg-primary/30 rounded-full loading-progress" />
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 mt-2 px-1">
          <span className="text-xs text-muted-foreground/60">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}