"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  className?: string;
  message?: string;
  showLogo?: boolean;
}

export function LoadingScreen({ 
  className,
  message = "Loading AVAI...",
  showLogo = true
}: LoadingScreenProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-screen bg-background text-foreground",
      className
    )}>
      {showLogo && (
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-12 h-12 text-primary animate-pulse" />
          <h1 className="text-4xl font-bold text-gradient-primary">AVAI</h1>
        </div>
      )}
      
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-8 h-8 border-4 border-muted rounded-full"></div>
          <div className="absolute top-0 left-0 w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>
      
      <div className="mt-8 text-xs text-muted-foreground">
        AI-Powered Security Auditing Platform
      </div>
    </div>
  );
}

export function InlineLoader({ 
  size = "sm",
  className 
}: { 
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-4"
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div className={cn(
        "border-muted rounded-full",
        sizeClasses[size]
      )}></div>
      <div className={cn(
        "absolute top-0 left-0 border-primary border-t-transparent rounded-full animate-spin",
        sizeClasses[size]
      )}></div>
    </div>
  );
}
