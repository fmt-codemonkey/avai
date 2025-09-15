"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Send, Plus, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSubmit?: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({ 
  onSubmit, 
  isLoading = false, 
  placeholder = "Reply to Claude...",
  className
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to match content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSubmit?.(value.trim());
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={cn("p-4 border-t border-border/20 bg-background/95 backdrop-blur-sm", className)}>
      {/* Claude AI style input container */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end gap-3 p-3 bg-background border border-border/30 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-md">
            {/* Action buttons on the left */}
            <div className="flex items-center gap-1 pb-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted/50"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted/50"
                disabled={isLoading}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>

            {/* Textarea input */}
            <div className="flex-1 min-w-0 pb-2">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                className={cn(
                  "min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent p-0",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60",
                  "text-sm leading-6"
                )}
                rows={1}
              />
            </div>

            {/* Send button */}
            <div className="pb-2">
              <Button
                type="submit"
                size="sm"
                disabled={!value.trim() || isLoading}
                className={cn(
                  "h-8 w-8 p-0 rounded-lg",
                  "bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground",
                  "transition-all duration-200"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Optional helper text */}
          <div className="mt-2 text-xs text-muted-foreground text-center">
            AVAI can make mistakes. Please use with discretion.
          </div>
        </form>
      </div>
    </div>
  );
}
