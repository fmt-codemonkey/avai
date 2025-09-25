"use client";

import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
  currentStep?: string;
}

export function TypingIndicator({ 
  className,
  currentStep
}: TypingIndicatorProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  
  // Elegant, minimal status messages
  const thinkingMessages = [
    "Thinking...",
    "Analyzing...",
    "Processing...",
    "Almost ready..."
  ];

  // Rotate through messages elegantly
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % thinkingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [thinkingMessages.length]);

  // Use custom step if provided, otherwise use rotating messages
  const displayMessage = currentStep || thinkingMessages[messageIndex];

  return (
    <div className={cn("flex items-start gap-3 py-4 thinking-entrance", className)}>
      {/* Minimal, elegant avatar */}
      <div className="w-6 h-6 rounded-full bg-muted/40 flex items-center justify-center flex-shrink-0 mt-1 transition-premium">
        <div className="w-2 h-2 rounded-full bg-primary/60" />
      </div>

      {/* Ultra-clean thinking bubble */}
      <div className="flex-1 max-w-3xl">
        <div className="inline-flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-2xl rounded-tl-md border border-border/30 hover-lift shadow-sm backdrop-blur-sm">
          {/* Perfect thinking dots with guaranteed visibility */}
          <div className="thinking-dots-container flex items-center gap-1">
            <div className="thinking-dot"></div>
            <div className="thinking-dot"></div>
            <div className="thinking-dot"></div>
          </div>
          
          {/* Clean, minimal text */}
          <span className="text-sm text-foreground/80 font-medium transition-premium">
            {displayMessage}
          </span>
        </div>
      </div>
    </div>
  );
}
