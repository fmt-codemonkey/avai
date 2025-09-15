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
}

export function MessageList({ 
  messages, 
  isLoading = false, 
  className,
  autoScroll = true 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, autoScroll]);

  return (
    <div className={cn("h-full w-full relative", className)}>
      <div className="space-y-6 p-6 max-w-4xl mx-auto min-h-full">
        {/* Welcome message for first interaction */}
        {messages.length === 0 && (
          <MessageBubble
            message={{
              id: "welcome",
              sender: "system",
              content: "👋 Welcome to AVAI! Send me a repository URL to start your security audit.",
              timestamp: new Date().toISOString(),
              type: "text"
            }}
          />
        )}

        {/* Render all messages */}
        {messages.map((message, index) => (
          <MessageBubble 
            key={message.id} 
            message={message}
            isLast={index === messages.length - 1}
          />
        ))}

        {/* Typing indicator when AI is processing */}
        {isLoading && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
