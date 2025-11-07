"use client";

import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
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
  showBookNowOverlay?: boolean; // New prop to control overlay
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

// Book Now Overlay Component
const BookNowOverlay = ({ onClose }: { onClose?: () => void }) => {
  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-md flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(10, 10, 11, 0.95)' }}>
      <div className="bg-card border border-muted rounded-lg p-6 shadow-2xl max-w-md w-full relative" style={{ backgroundColor: 'rgba(26, 26, 29, 0.95)', borderColor: 'rgba(45, 45, 48, 0.8)' }}>
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:pointer-events-none text-muted-foreground hover:text-foreground"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="sr-only">Close</span>
          </button>
        )}
        
        <div className="text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(0, 102, 255, 0.1)' }}>
              <svg className="w-8 h-8" style={{ color: '#0066FF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF' }}>
              Ready to Get Started?
            </h3>
            <p className="text-sm" style={{ color: '#A0A0A3' }}>
              Connect directly with our security experts for a personalized consultation and immediate assistance.
            </p>
          </div>
          
          <Link 
            href="https://docs.google.com/forms/d/e/1FAIpQLSda_4cS1bExxuj8x9UFoxw92Ei1lZK9bM_cBw9nHCug_hGgrQ/viewform?usp=send_form"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-6 py-3 font-medium rounded-md transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 touch-target hover:scale-[1.02] active:scale-[0.98]"
            style={{ 
              backgroundColor: '#0066FF',
              color: '#FFFFFF',
              boxShadow: '0 0 20px rgba(0, 102, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0052CC';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 102, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0066FF';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 102, 255, 0.3)';
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export function ChatContainer({
  messages = [],
  onSendMessage,
  isLoading = false,
  isEmpty = true,
  className,
  isHistoricalLoad = false,
  currentThinkingStep,
  onRetryConnection,
  showBookNowOverlay = true, // Default to true since backend is not running
}: ChatContainerProps) {
  // State to control overlay visibility
  const [isOverlayVisible, setIsOverlayVisible] = useState(showBookNowOverlay);

  // Update overlay visibility when prop changes
  useEffect(() => {
    setIsOverlayVisible(showBookNowOverlay);
  }, [showBookNowOverlay]);

  // Handle overlay close
  const handleCloseOverlay = useCallback(() => {
    setIsOverlayVisible(false);
  }, []);
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

      {/* Book Now Overlay - shown when backend is unavailable */}
      {isOverlayVisible && <BookNowOverlay onClose={handleCloseOverlay} />}
    </div>
  );
}

// Export types for other components
export type { Message, ChatContainerProps };
