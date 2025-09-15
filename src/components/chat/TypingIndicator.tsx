"use client";

import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface TypingIndicatorProps {
  className?: string;
  message?: string;
}

export function TypingIndicator({ 
  className, 
  message = "AVAI is thinking..." 
}: TypingIndicatorProps) {
  return (
    <div className={cn("flex justify-start gap-3", className)}>
      <Avatar className="w-8 h-8 border border-primary/20 glow-cyber animate-pulse-cyber">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Shield className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      
      <Card className="bg-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Animated dots */}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
            
            {/* Status message */}
            <span className="text-sm text-muted-foreground animate-pulse">
              {message}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
