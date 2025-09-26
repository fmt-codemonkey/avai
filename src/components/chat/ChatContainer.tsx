"use client";

import { useCallback } from 'react';
import { cn } from "@/lib/utils";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { EmptyState } from "@/components/chat/EmptyState";
import { SubtleConnectionIndicator } from "@/components/chat/SubtleConnectionIndicator";

interface ChatContainerProps {
  messages?: Message[];
  onSendMessage?: (content: string) => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
  isHistoricalLoad?: boolean;
  currentThinkingStep?: string;
  onRetryConnection?: () => void;
}

interface Message {
  id: string;
  sender: "user" | "ai" | "system";
  content: string | React.ReactNode;
  timestamp: string;
  avatar?: string;
  type?: "text" | "progress" | "vulnerability" | "error" | "system";
  metadata?: {
    isConnectionMessage?: boolean;
    eventType?: string;
    canRetry?: boolean;
    confidence?: number;
    processingTime?: number;
    sessionId?: string;
  };
}

export function ChatContainer({
  messages = [],
  onSendMessage,
  isLoading = false,
  isEmpty = true,
  className,
  isHistoricalLoad = false,
  currentThinkingStep,
  onRetryConnection,
}: ChatContainerProps) {
  // Use messages directly from parent (single source of truth)
  const allMessages = messages;

  // Get input placeholder based on connection state
  const getInputPlaceholder = useCallback(() => {
    if (isEmpty) {
      return "Message AVAI...";
    }
    return "Send a message...";
  }, [isEmpty]);

  // Simplified message sending - delegate to parent
  const handleSendMessage = useCallback((content: string) => {
    if (!content.trim()) return;

    // Optional: Play subtle send sound for better UX
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch {
        // Ignore audio errors - not critical
      }
    }

    // Delegate all message handling to parent
    if (onSendMessage) {
      onSendMessage(content.trim());
    }
  }, [onSendMessage]);

  return (
    <div className={cn(
      "flex flex-col h-full w-full relative",
      className
    )}>
      {/* Subtle connection indicator (only shown during issues) */}
      <SubtleConnectionIndicator />
      
      {/* Chat Messages Area - Fixed height with proper scrolling */}
      <div className="flex-1 overflow-hidden">
        {isEmpty ? (
          <div className="h-full overflow-y-auto scrollbar-gutter-stable">
            <EmptyState onStartAudit={handleSendMessage} />
          </div>
        ) : (
          <div className="h-full overflow-y-auto scrollbar-gutter-stable">
            <MessageList 
              messages={allMessages} 
              isLoading={isLoading}
              isHistoricalLoad={isHistoricalLoad}
              onRetryConnection={onRetryConnection}
              currentThinkingStep={currentThinkingStep}
            />
          </div>
        )}
      </div>

      {/* Enhanced Chat Input with WebSocket status */}
      <div className="flex-shrink-0 relative">
        <ChatInput 
          onSubmit={handleSendMessage}
          isLoading={isLoading}
          disabled={false}
          placeholder={getInputPlaceholder()}
        />
      </div>
    </div>
  );
}

// Export types for other components
export type { Message, ChatContainerProps };
