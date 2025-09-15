"use client";

import { cn } from "@/lib/utils";
import { Shield, Github, Upload, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface EmptyStateProps {
  onStartAudit?: (url: string) => void;
  className?: string;
}

export function EmptyState({ className }: EmptyStateProps) {



  return (
    <div className={cn(
      "w-full h-full flex items-center justify-center p-6 text-center relative",
      className
    )}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      
      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-primary via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-5xl font-black bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  AVAI
                </h1>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                  AI Powered
                </Badge>
              </div>
              <div className="text-sm text-primary/80 uppercase tracking-[0.2em] font-semibold">
                Security Platform
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              AI-Powered Security Auditing
            </h2>
            <p className="text-muted-foreground">
              Start a conversation with our AI security expert and protect your code in minutes
            </p>
            
            {/* Quick Start Hint */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Try: &ldquo;Analyze my React app for vulnerabilities&rdquo;
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg"
            >
              <Github className="w-5 h-5 mr-2" />
              Audit GitHub Repository
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 text-primary"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Code Files
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              SOC 2 Compliant
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              Enterprise Ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
