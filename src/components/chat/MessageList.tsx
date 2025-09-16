"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";

import type { Message } from "@/components/chat/ChatContainer";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  className?: string;
  autoScroll?: boolean;
  isHistoricalLoad?: boolean; // New prop to indicate if this is loading historical messages
  onRetryConnection?: () => void;
  currentThinkingStep?: string;
}

export function MessageList({ 
  messages, 
  isLoading = false, 
  className,
  autoScroll = true,
  isHistoricalLoad = false,
  onRetryConnection,
  currentThinkingStep
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Only auto-scroll when it's NOT a historical load and user is near bottom
  useEffect(() => {
    if (!autoScroll || !messagesEndRef.current || isHistoricalLoad) return;

    // Check if user is near bottom before auto-scrolling
    const isNearBottom = () => {
      if (!scrollAreaRef.current) return true;
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const threshold = 150; // pixels from bottom
      return scrollHeight - scrollTop - clientHeight < threshold;
    };

    // Only scroll if user is near bottom or if it's loading state
    if (isNearBottom() || isLoading) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, autoScroll, isHistoricalLoad]);

  return (
    <div 
      ref={scrollAreaRef}
      className={cn("h-full w-full relative overflow-y-auto", className)}
    >
      <div className="px-4 py-6 max-w-4xl mx-auto min-h-full">


        {/* Render all messages */}
        {messages.map((message, index) => (
          <MessageBubble 
            key={message.id} 
            message={message}
            isLast={index === messages.length - 1}
            onRetryConnection={onRetryConnection}
          />
        ))}

        {/* Typing indicator when AI is processing */}
        {isLoading && (
          <div className="flex justify-start mb-6">
            <TypingIndicator currentStep={currentThinkingStep} />
          </div>
        )}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
