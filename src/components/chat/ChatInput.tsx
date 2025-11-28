"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSubmit?: (content: string, files?: File[]) => void;
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      onSubmit?.(value.trim(), selectedFiles.length > 0 ? selectedFiles : undefined);
      setValue("");
      setSelectedFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    // Reset the input so the same file can be selected again
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="mx-auto">
        <form onSubmit={handleSubmit} className="relative space-y-2">
          {/* Selected Files Display */}
          {selectedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-2.5 py-1 bg-green-500/20 border border-green-500/30 rounded-md text-xs text-green-300"
                >
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-green-400 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.sql,.html,.css,.scss,.less,.json,.xml,.yaml,.yml,.md,.txt,.sol,.vy"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Main input container - Enhanced UI/UX styling */}
          <div className={cn(
            "relative flex items-end gap-3 p-3 bg-black/60 backdrop-blur-xl",
            "border border-green-500/40 rounded-2xl shadow-2xl",
            "hover:border-green-400/60 focus-within:border-green-500/80 focus-within:shadow-green-500/25",
            "transition-all duration-300 ease-out transform hover:scale-[1.01] focus-within:scale-[1.01]",
            "ring-0 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:ring-offset-2 focus-within:ring-offset-black/50",
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
                  "min-h-[32px] max-h-[160px] resize-none border-0 bg-transparent py-2.5 px-1",
                  "focus-visible:ring-0 focus-visible:ring-offset-0 outline-none",
                  "placeholder:text-green-400/70 text-green-100 font-sans",
                  "text-[16px] leading-6 font-normal tracking-tight",
                  "disabled:cursor-not-allowed scrollbar-thin scrollbar-thumb-green-500/30"
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
              onClick={handleFileSelect}
              className={cn(
                "h-10 w-10 p-0 rounded-xl shrink-0 mb-0.5",
                "hover:bg-green-500/20 text-green-400/70 hover:text-green-300",
                "transition-all duration-200 ease-out hover:scale-105",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "focus-visible:ring-2 focus-visible:ring-green-400/50",
                selectedFiles.length > 0 && "text-green-400 bg-green-500/20 shadow-lg"
              )}
              disabled={isLoading || disabled}
              title={selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : "Attach files"}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Send button - Cybersecurity style */}
            <Button
              type="submit"
              size="sm"
              disabled={!value.trim() || isLoading || disabled}
              className={cn(
                "h-10 w-10 p-0 rounded-xl shrink-0 mb-0.5 relative overflow-hidden",
                // Active state (when has content)
                value.trim() && !isLoading && !disabled
                  ? "bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400 shadow-xl shadow-green-500/40 hover:shadow-green-500/60 hover:scale-105"
                  : "bg-gray-600/40 text-gray-500 cursor-not-allowed",
                "transition-all duration-200 ease-out border border-green-500/30",
                "focus-visible:ring-2 focus-visible:ring-green-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
              )}
              title={value.trim() ? "[TRANSMIT_SECURE]" : "Enter security query"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-green-400" />
              ) : (
                <>
                  <Send className="h-4 w-4 relative z-10" />
                  {value.trim() && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent animate-pulse"></div>
                  )}
                </>
              )}
            </Button>
          </div>
          
          {/* Terminal info text - positioned below input */}
          <div className="px-1 text-center mt-3">
            <p className="text-xs font-mono leading-relaxed text-muted-foreground/80">
              <span className="text-green-400">[SECURE_CHANNEL]</span>
              <span className="text-green-300/60 ml-2">• All transmissions encrypted</span>
              <span className="hidden sm:inline text-green-300/40 ml-2">• ENTER to transmit • SHIFT+ENTER for new line</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
