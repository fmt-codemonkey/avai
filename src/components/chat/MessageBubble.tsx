"use client";

import { cn } from "@/lib/utils";
import { Shield, User, Info, Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Message } from "./ChatContainer";

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
  className?: string;
}

export function MessageBubble({ message, className }: MessageBubbleProps) {
  const { sender, content, timestamp, type = "text" } = message;

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

  // User messages (right-aligned)
  if (sender === 'user') {
    return (
      <div className={cn("flex justify-end gap-3", className)}>
        <div className="flex flex-col items-end max-w-[80%]">
          <Card className="bg-primary text-primary-foreground border-primary/20">
            <CardContent className="p-4">
              {typeof content === 'string' ? (
                <p className="text-sm leading-relaxed">{content}</p>
              ) : (
                content
              )}
            </CardContent>
          </Card>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatTime(timestamp)}
            </span>
          </div>
        </div>
        <Avatar className="w-8 h-8 border border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  // System messages (centered)
  if (sender === 'system') {
    return (
      <div className={cn("flex justify-center", className)}>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/30">
          <Info className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {typeof content === 'string' ? content : 'System message'}
          </span>
          <span className="text-xs text-muted-foreground/60">
            {formatTime(timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // AI messages (left-aligned)
  return (
    <div className={cn("flex justify-start gap-3", className)}>
      <Avatar className="w-8 h-8 border border-primary/20 glow-cyber">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Shield className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col max-w-[85%]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-foreground">AVAI</span>
          <Badge variant="secondary" className="text-xs">
            AI Assistant
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatTime(timestamp)}
          </span>
        </div>

        {/* Message content based on type */}
        {type === 'text' && (
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              {typeof content === 'string' ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-sm leading-relaxed mb-0 whitespace-pre-wrap">
                    {content}
                  </p>
                </div>
              ) : (
                content
              )}
            </CardContent>
          </Card>
        )}

        {type === 'progress' && typeof content === 'object' && (
          <div className="w-full">
            {content}
          </div>
        )}

        {type === 'vulnerability' && typeof content === 'object' && (
          <div className="w-full">
            {content}
          </div>
        )}

        {type === 'error' && (
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4">
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
            </CardContent>
          </Card>
        )}

        {/* Message actions */}
        <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyMessage}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
          
          {sender === 'ai' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                Good
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <ThumbsDown className="w-3 h-3 mr-1" />
                Poor
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
