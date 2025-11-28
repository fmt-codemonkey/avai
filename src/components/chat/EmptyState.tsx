"use client";

import { cn } from "@/lib/utils";
import { Github, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onStartAudit?: (url: string, files?: File[]) => void;
  className?: string;
}

export function EmptyState({ className }: EmptyStateProps) {
  return (
    <div className={cn(
      "w-full flex flex-col items-center justify-center p-6 text-center relative", 
      className
    )}>
      {/* Minimal Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/5 via-transparent to-muted/5 pointer-events-none" />
      
      {/* Detached Shield Icon */}
      <div className="absolute -top-60 left-1/2 transform -translate-x-1/2 z-20">
        <div className="relative">
          <div className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full"></div>
          <svg 
            className="w-32 h-32 md:w-40 md:h-40 text-primary animate-pulse relative z-10" 
            fill="currentColor" 
            viewBox="0 0 24 24"
            style={{
              filter: 'drop-shadow(0 0 30px rgba(0, 102, 255, 0.6))'
            }}
          >
            <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.1 16,12.7V16.2C16,16.8 15.4,17.3 14.8,17.3H9.2C8.6,17.3 8,16.8 8,16.2V12.8C8,12.2 8.6,11.6 9.2,11.6V10.1C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11.5H13.6V9.5C13.6,8.7 12.8,8.2 12,8.2Z" />
          </svg>
        </div>
      </div>

      <div className="max-w-4xl space-y-8 relative z-10">
        {/* Main Content - Perfectly Centered */}
        <div className="space-y-8 flex flex-col items-center justify-center">
            {/* Main Title with Sequential Blinking Effect */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-center tracking-tight">
                <span className="text-primary animate-pulse" style={{ animationDelay: '0s' }}>AI-POWERED </span>
                <span className="text-primary animate-pulse" style={{ animationDelay: '0.5s' }}>SECURITY </span>
                <span className="text-primary animate-pulse" style={{ animationDelay: '1s' }}>AUDITING</span>
              </h2>
              
              {/* Subtitle with Matrix Effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent animate-pulse"></div>
                <p className="text-sm md:text-base text-green-400 font-mono text-center max-w-3xl mx-auto relative z-10 opacity-80">
                  &gt; START A CONVERSATION WITH OUR AI SECURITY EXPERT AND PROTECT YOUR CODE IN MINUTES
                  <span className="animate-pulse">_</span>
                </p>
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-8">
                <Button
                  onClick={() => window.open('https://calendly.com/ashishregmi2017/30min', '_blank')}
                  className="group bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2 border-0 shadow-lg hover:shadow-xl"
                  size="lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Book a Trial
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>

            </div>
        </div>


      </div>
    </div>
  );
}
