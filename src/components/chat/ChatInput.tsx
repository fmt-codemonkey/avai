"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSubmit?: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ChatInput({ 
  onSubmit, 
  isLoading = false, 
  placeholder = "Message AVAI...",
  className,
  disabled = false
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
    if (value.trim() && !isLoading && !disabled) {
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
    <div className={cn("px-4 py-4 bg-muted/30 border-t border-border/40", className)}>
      {/* Claude/ChatGPT style centered container */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          {/* Main input container - Claude/ChatGPT style */}
          <div className={cn(
            "relative flex items-end gap-3 p-4 bg-background",
            "border border-border/50 rounded-2xl shadow-md",
            "hover:border-border/70 focus-within:border-primary/60 focus-within:shadow-lg",
            "transition-all duration-200",
            disabled && "opacity-60 cursor-not-allowed"
          )}>
            
            {/* Textarea - matches Claude/ChatGPT input style */}
            <div className="flex-1 min-w-0">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  const newValue = e.target.value;
                  if (newValue.length <= 4000) {
                    setValue(newValue);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading || disabled}
                className={cn(
                  "min-h-[28px] max-h-[200px] resize-none border-0 bg-transparent py-2 px-0",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "placeholder:text-muted-foreground/50 text-foreground",
                  "text-[15px] leading-6 font-normal",
                  "disabled:cursor-not-allowed scrollbar-thin scrollbar-thumb-muted/30"
                )}
                rows={1}
                maxLength={4000}
              />
            </div>

            {/* Attachment button - like Claude */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0 rounded-lg shrink-0 mb-1",
                "hover:bg-muted/80 text-muted-foreground hover:text-foreground",
                "transition-colors duration-150",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
              disabled={isLoading || disabled}
              title="Attach files"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Send button - matches Claude/ChatGPT style */}
            <Button
              type="submit"
              size="sm"
              disabled={!value.trim() || isLoading || disabled}
              className={cn(
                "h-9 w-9 p-0 rounded-lg shrink-0 mb-1",
                // Active state (when has content)
                value.trim() && !isLoading && !disabled
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "bg-muted/50 text-muted-foreground cursor-not-allowed",
                "transition-all duration-150",
                "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1"
              )}
              title={value.trim() ? "Send message" : "Enter a message to send"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Bottom info text - like Claude */}
          <div className="mt-2 px-1 text-center">
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              AVAI can make mistakes. Check important info.
              <span className="hidden sm:inline ml-2 opacity-70">• Press Enter to send, Shift+Enter for new line</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
