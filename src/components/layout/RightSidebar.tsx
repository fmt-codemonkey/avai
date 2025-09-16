"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Download, 
  Share, 
  ChevronRight,
  ChevronLeft,
  Shield,
  AlertTriangle,
  Code,
  ExternalLink
} from "lucide-react";
import { SecurityBadge } from "@/components/security/SecurityBadge";
import { ProgressCard } from "@/components/security/ProgressCard";
import { SecurityScore } from "@/components/security/StatusIndicator";

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

  // Mock data for demonstration
  const mockSummary = {
    repository: "https://github.com/example/webapp",
    scanDate: new Date().toISOString(),
    totalFiles: 247,
    linesOfCode: 15420,
    vulnerabilities: {
      critical: 1,
      high: 2, 
      medium: 5,
      low: 3
    },
    securityScore: 78,
    grade: "B-"
  };

  const mockProgress = {
    title: "Security Analysis Complete",
    description: "Comprehensive audit finished",
    steps: [
      {
        id: "scan",
        title: "Repository Scan",
        description: "Scanned 247 files for vulnerabilities",
        status: "completed" as const,
        progress: 100,
        duration: "1m 30s",
      },
      {
        id: "analyze", 
        title: "Security Analysis",
        description: "Analyzed code patterns and dependencies",
        status: "completed" as const,
        progress: 100,
        duration: "2m 15s",
      },
      {
        id: "report",
        title: "Generate Report",
        description: "Compiled findings and recommendations",
        status: "completed" as const,
        progress: 100,
        duration: "45s",
      },
    ],
    overallProgress: 100,
    status: "completed" as const,
  };

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
            <>
              {/* Security Score */}
              <Card className="bg-background/30 border-border/50">
                <CardContent className="p-6">
                  <SecurityScore score={mockSummary.securityScore} grade={mockSummary.grade} />
                </CardContent>
              </Card>

              {/* Repository Info */}
              <Card className="bg-background/30 border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Repository Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                    <Code className="w-5 h-5 text-primary" />
                    <span className="text-sm font-mono font-medium">{mockSummary.repository.split('/').slice(-2).join('/')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Total Files</span>
                      <div className="font-semibold text-lg">{mockSummary.totalFiles}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Lines of Code</span>
                      <div className="font-semibold text-lg">{mockSummary.linesOfCode.toLocaleString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vulnerability Summary */}
              <Card className="bg-background/30 border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Security Issues</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {mockSummary.vulnerabilities.critical > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-red-950/20 border border-red-900/30">
                        <SecurityBadge severity="critical" />
                        <span className="font-semibold text-lg">{mockSummary.vulnerabilities.critical}</span>
                      </div>
                    )}
                    {mockSummary.vulnerabilities.high > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-orange-950/20 border border-orange-900/30">
                        <SecurityBadge severity="high" />
                        <span className="font-semibold text-lg">{mockSummary.vulnerabilities.high}</span>
                      </div>
                    )}
                    {mockSummary.vulnerabilities.medium > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-950/20 border border-yellow-900/30">
                        <SecurityBadge severity="medium" />
                        <span className="font-semibold text-lg">{mockSummary.vulnerabilities.medium}</span>
                      </div>
                    )}
                    {mockSummary.vulnerabilities.low > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-950/20 border border-blue-900/30">
                        <SecurityBadge severity="low" />
                        <span className="font-semibold text-lg">{mockSummary.vulnerabilities.low}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Progress Status */}
              <ProgressCard {...mockProgress} className="border-none bg-transparent p-0" />
            </>
          )}

          {activeTab === "vulnerabilities" && (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                Found {Object.values(mockSummary.vulnerabilities).reduce((a, b) => a + b, 0)} security issues
              </div>
              
              {/* Mock vulnerabilities would go here */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-critical" />
                    <div>
                      <h4 className="font-medium text-sm">SQL Injection</h4>
                      <p className="text-xs text-muted-foreground">auth/login.ts:42</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    User input is directly concatenated into SQL queries without proper sanitization.
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="font-medium text-sm">XSS Vulnerability</h4>
                      <p className="text-xs text-muted-foreground">components/user.tsx:128</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                    Unescaped user content rendered in JSX component.
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "report" && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed">
                    Security audit completed for <strong>{mockSummary.repository.split('/').slice(-2).join('/')}</strong>. 
                    Analysis revealed {Object.values(mockSummary.vulnerabilities).reduce((a, b) => a + b, 0)} security 
                    issues requiring attention.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Security Score:</span>
                      <Badge variant="secondary">{mockSummary.grade}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk Level:</span>
                      <Badge variant="destructive">Medium</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Compliance:</span>
                      <Badge variant="outline">OWASP</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-critical mt-2 flex-shrink-0" />
                      <div className="text-xs">
                        <p className="font-medium mb-1">Immediate Action Required</p>
                        <p className="text-muted-foreground">Fix SQL injection vulnerability in authentication system</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <div className="text-xs">
                        <p className="font-medium mb-1">High Priority</p>
                        <p className="text-muted-foreground">Implement input sanitization for user-generated content</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                      <div className="text-xs">
                        <p className="font-medium mb-1">Medium Priority</p>
                        <p className="text-muted-foreground">Update dependencies to latest secure versions</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
