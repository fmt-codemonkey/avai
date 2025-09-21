"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  User, 
  Copy, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle, 
  Loader2, 
  RefreshCw, 
  WifiOff, 
  Info,
  AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Message } from "./ChatContainer";

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
  className?: string;
  onRetryConnection?: () => void;
}

export function MessageBubble({ message, className, onRetryConnection }: MessageBubbleProps) {
  const { sender, content, timestamp, type = "text", metadata } = message;
  const [showActions, setShowActions] = useState(false);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const copyMessage = () => {
    if (typeof content === 'string') {
      navigator.clipboard.writeText(content);
    }
  };

  // Get icon for system/connection messages
  const getConnectionIcon = (eventType?: string) => {
    switch (eventType) {
      case 'connected':
      case 'connection_restored':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'reconnecting':
      case 'retry_attempt':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'fallback_active':
      case 'backup_connection':
        return <RefreshCw className="w-4 h-4 text-yellow-500" />;
      case 'offline_mode':
      case 'queue_messages':
        return <WifiOff className="w-4 h-4 text-gray-500" />;
      case 'connection_failed':
      case 'network_issue':
      case 'timeout_error':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // System/Connection messages (professional styling)
  if (sender === 'system' || metadata?.isConnectionMessage) {
    return (
      <div className={cn("flex justify-center my-3", className)}>
        <div className="bg-muted/30 border border-border/50 rounded-lg px-4 py-3 max-w-[90%]">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            {getConnectionIcon(metadata?.eventType)}
            <span className="mx-3 text-center">
              {typeof content === 'string' ? content : 'System message'}
            </span>
            {metadata?.canRetry && onRetryConnection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetryConnection}
                className="ml-2 h-6 px-2 text-xs"
              >
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User messages (right-aligned, simple)
  if (sender === 'user') {
    return (
      <div className={cn("flex justify-end mb-6", className)}>
        <div className="flex items-start gap-3 max-w-[85%]">
          <div className="flex flex-col items-end">
            <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 max-w-full">
              {typeof content === 'string' ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {content}
                </p>
              ) : (
                content
              )}
            </div>
            <span className="text-xs text-muted-foreground mt-1 px-1">
              {formatTime(timestamp)}
            </span>
          </div>
          <Avatar className="w-7 h-7 flex-shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              <User className="w-3 h-3" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  // AI messages (left-aligned, Claude/ChatGPT style)
  return (
    <div 
      className={cn("flex justify-start mb-6 group", className)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3 max-w-[85%] w-full">
        <Avatar className="w-7 h-7 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary text-xs">
            <Shield className="w-3 h-3" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* AI Name and timestamp */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-foreground">AVAI</span>
            <span className="text-xs text-muted-foreground">
              {formatTime(timestamp)}
            </span>
          </div>

          {/* Message content */}
          <div className="text-sm leading-relaxed text-foreground">
            {type === 'text' && typeof content === 'string' ? (
              <div className="whitespace-pre-wrap break-words">
                {content}
              </div>
            ) : type === 'error' ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-destructive text-sm">⚠️</span>
                  <div>
                    <p className="text-sm text-destructive font-medium mb-1">
                      Error occurred
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {typeof content === 'string' ? content : 'An unexpected error occurred'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {content}
              </div>
            )}
          </div>

          {/* AI Response Metadata - show confidence and processing time */}
          {sender === 'ai' && metadata && (metadata.confidence || metadata.processingTime) && (
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              {metadata.confidence && (
                <div className="flex items-center gap-1">
                  <span className="text-xs">🎯</span>
                  <span>Confidence: {Math.round(metadata.confidence * 100)}%</span>
                </div>
              )}
              {metadata.processingTime && (
                <div className="flex items-center gap-1">
                  <span className="text-xs">⚡</span>
                  <span>{metadata.processingTime.toFixed(2)}s</span>
                </div>
              )}
            </div>
          )}

          {/* Message actions (show on hover like Claude) */}
          <div className={cn(
            "flex items-center gap-1 mt-3 transition-opacity duration-200",
            showActions ? "opacity-100" : "opacity-0"
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyMessage}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            
            {sender === 'ai' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Good
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  Poor
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
