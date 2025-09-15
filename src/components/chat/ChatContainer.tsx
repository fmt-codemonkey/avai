"use client";

import { cn } from "@/lib/utils";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { EmptyState } from "@/components/chat/EmptyState";

interface ChatContainerProps {
  messages?: Message[];
  onSendMessage?: (content: string) => void;
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
}

interface Message {
  id: string;
  sender: "user" | "ai" | "system";
  content: string | React.ReactNode;
  timestamp: string;
  avatar?: string;
  type?: "text" | "progress" | "vulnerability" | "error";
}

export function ChatContainer({
  messages = [],
  onSendMessage,
  isLoading = false,
  isEmpty = true,
  className,
}: ChatContainerProps) {
  return (
    <div className={cn(
      "flex flex-col h-full w-full relative",
      className
    )}>
      {/* Chat Messages Area - Fixed height with proper scrolling */}
      <div className="flex-1 overflow-hidden relative">
        {isEmpty ? (
          <div className="h-full overflow-y-auto scrollbar-gutter-stable">
            <EmptyState onStartAudit={onSendMessage} />
          </div>
        ) : (
          <div className="h-full overflow-y-auto scrollbar-gutter-stable">
            <MessageList 
              messages={messages} 
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      {/* Claude AI style Chat Input - Fixed at bottom */}
      <div className="flex-shrink-0 relative">
        <ChatInput 
          onSubmit={onSendMessage}
          isLoading={isLoading}
          placeholder={isEmpty ? 
            "Enter repository URL to start security audit..." : 
            "Ask AVAI about your security findings..."
          }
        />
      </div>
    </div>
  );
}

// Export types for other components
export type { Message, ChatContainerProps };
