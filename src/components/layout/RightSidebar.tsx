"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { 
  X, 
  Download, 
  Share, 
  ChevronRight,
  ChevronLeft,
  Shield,
  AlertTriangle
} from "lucide-react";

// Right sidebar content types for future use

interface RightSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  className?: string;
}

export function RightSidebar({ 
  isOpen = false, 
  onToggle, 
  onClose,
  className 
}: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "vulnerabilities" | "report">("overview");

  // No static data - will be populated when actual analysis is completed

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="fixed top-1/2 right-4 -translate-y-1/2 z-50 bg-card border border-border shadow-lg"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className={cn("w-96 border-l border-border bg-card flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Security Analysis</h2>
              <p className="text-xs text-muted-foreground">Comprehensive audit results</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onToggle} className="hover:bg-muted/50">
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-muted/50">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline" className="flex-1 bg-background/50 hover:bg-background">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button size="sm" variant="outline" className="flex-1 bg-background/50 hover:bg-background">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-background/30 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium rounded transition-all duration-200",
              activeTab === "overview" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-background/50 border border-border/30 dark:border-border/20"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("vulnerabilities")}
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium rounded transition-all duration-200",
              activeTab === "vulnerabilities"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50 border border-border/30 dark:border-border/20"
            )}
          >
            Issues
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium rounded transition-all duration-200",
              activeTab === "report"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50 border border-border/30 dark:border-border/20"
            )}
          >
            Report
          </button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          
          {activeTab === "overview" && (
            <Card className="bg-background/30 border-border/50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold text-lg">No Analysis Available</h3>
                    <p className="text-sm text-muted-foreground">
                      Send a message to start a security analysis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "vulnerabilities" && (
            <Card className="bg-background/30 border-border/50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold text-lg">No Issues Found</h3>
                    <p className="text-sm text-muted-foreground">
                      Security issues will appear here after analysis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "report" && (
            <Card className="bg-background/30 border-border/50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Download className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold text-lg">No Report Available</h3>
                    <p className="text-sm text-muted-foreground">
                      Analysis report will be generated after security scan
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
