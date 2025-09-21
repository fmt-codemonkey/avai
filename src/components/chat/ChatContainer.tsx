"use client";

import { useCallback } from 'react';
import { cn } from "@/lib/utils";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { EmptyState } from "@/components/chat/EmptyState";
import { SubtleConnectionIndicator } from "@/components/chat/SubtleConnectionIndicator";
import { useWebSocket } from '@/hooks/use-websocket';
import { useRealTimeMessages } from '@/hooks/use-real-time-messages';

interface ChatContainerProps {
  messages?: Message[];
  onSendMessage?: (content: string) => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
  isHistoricalLoad?: boolean;
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
  messages: externalMessages = [],
  onSendMessage,
  isLoading: externalIsLoading = false,
  isEmpty: externalIsEmpty = true,
  className,
  isHistoricalLoad = false,
}: ChatContainerProps) {
  // WebSocket integration (auto-connect like Claude)
  const { sendAnalysisRequest, isConnected } = useWebSocket(true);
  
  // Claude-like real-time message handling with connection status
  const { 
    isThinking, 
    messages: realtimeMessages, 
    currentThinkingStep,
    addUserMessage, 
    handleRetryConnection 
  } = useRealTimeMessages();
  
  // Convert realtime messages to chat format
  const convertedRealtimeMessages: Message[] = realtimeMessages.map(msg => ({
    id: msg.id,
    sender: msg.sender,
    content: msg.content,
    timestamp: msg.timestamp,
    type: msg.type,
  }));
  
  // Merge all messages: external + realtime (includes user + AI responses)
  const allMessages = [...externalMessages, ...convertedRealtimeMessages];
  const isEmpty = externalIsEmpty && allMessages.length === 0;
  const isLoading = externalIsLoading || isThinking;

  // No need for manual WebSocket message processing - handled by useRealTimeMessages

  // Get input placeholder based on connection state
  const getInputPlaceholder = useCallback(() => {
    if (isConnected) {
      return isEmpty 
        ? "Enter repository URL to start security audit..." 
        : "Ask AVAI about your security findings...";
    } else {
      return "Reconnecting to AVAI...";
    }
  }, [isConnected, isEmpty]);

  // Enhanced message sending with WebSocket support and error handling
  const handleSendMessage = useCallback((content: string) => {
    if (!content.trim()) return;

    // Add user message to realtime messages (handled by useRealTimeMessages)
    addUserMessage(content.trim());

    // Send via WebSocket if connected with error handling
    if (isConnected && sendAnalysisRequest) {
      try {
        const success = sendAnalysisRequest(content.trim());
        if (!success) {
          // WebSocket send failed - show error message
          console.error('Failed to send analysis request via WebSocket');
          // The WebSocket store will handle error messaging internally
        }
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        // Fallback to external handler if available
        if (onSendMessage) {
          onSendMessage(content.trim());
        }
      }
    } else if (onSendMessage) {
      // Fallback to external handler when WebSocket not connected
      onSendMessage(content.trim());
    } else {
      // No connection and no fallback - this shouldn't happen but handle gracefully
      console.warn('No WebSocket connection and no fallback handler available');
    }
  }, [isConnected, sendAnalysisRequest, onSendMessage, addUserMessage]);

  return (
    <div className={cn(
      "flex flex-col h-full w-full relative",
      className
    )}>
      {/* Subtle connection indicator (only shown during issues) */}
      <SubtleConnectionIndicator />
      
      {/* Chat Messages Area - Fixed height with proper scrolling */}
      <div className="flex-1 overflow-hidden relative">
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
              onRetryConnection={handleRetryConnection}
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
          disabled={!isConnected}
          placeholder={getInputPlaceholder()}
        />
      </div>
    </div>
  );
}

// Export types for other components
export type { Message, ChatContainerProps };
