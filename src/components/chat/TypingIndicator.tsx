"use client";

import { cn } from "@/lib/utils";
import { Shield, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWebSocketStore } from "@/stores/websocket-store";

interface TypingIndicatorProps {
  className?: string;
  message?: string;
  currentStep?: string;
}

export function TypingIndicator({ 
  className, 
  message = "AVAI is thinking...",
  currentStep
}: TypingIndicatorProps) {
  const { isConnected, isConnecting } = useWebSocketStore();

  // Determine the appropriate message based on connection status
  const getStatusMessage = () => {
    if (isConnecting) return "Connecting to AVAI...";
    if (!isConnected) return "Reconnecting to AVAI...";
    // Use current step if available, otherwise fallback to generic message
    return currentStep || message;
  };

  return (
    <div className={cn("flex justify-start mb-6", className)}>
      <div className="flex items-start gap-3">
        <Avatar className="w-7 h-7 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary text-xs">
            {isConnecting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Shield className="w-3 h-3" />
            )}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* AI Name */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-foreground">AVAI</span>
          </div>

          {/* Professional thinking indicator like manus.im */}
          <div className="bg-muted/20 border border-border/30 rounded-lg px-3 py-2 max-w-fit">
            <div className="flex items-center gap-2">
              {/* Small animated thinking dots */}
              <div className="flex items-center gap-0.5">
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse"></div>
              </div>
              
              {/* Professional status message - small and subtle */}
              <span className="text-xs text-muted-foreground/80 font-medium">
                {getStatusMessage()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
