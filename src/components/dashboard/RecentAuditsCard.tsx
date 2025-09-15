"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SecurityBadge } from "@/components/security/SecurityBadge";
import { Clock, ExternalLink, Github } from "lucide-react";

interface AuditSummary {
  id: string;
  repository: string;
  status: "completed" | "running" | "failed";
  completedAt: string;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  score: string;
}

interface RecentAuditsCardProps {
  audits?: AuditSummary[];
  className?: string;
  maxItems?: number;
}

const mockAudits: AuditSummary[] = [
  {
    id: "audit-1",
    repository: "https://github.com/example/webapp",
    status: "completed",
    completedAt: "2 hours ago",
    vulnerabilities: { critical: 0, high: 1, medium: 3, low: 2 },
    score: "B+"
  },
  {
    id: "audit-2", 
    repository: "https://github.com/myorg/api-server",
    status: "completed",
    completedAt: "1 day ago",
    vulnerabilities: { critical: 1, high: 2, medium: 1, low: 4 },
    score: "C"
  },
  {
    id: "audit-3",
    repository: "https://github.com/company/frontend",
    status: "running",
    completedAt: "3 minutes ago",
    vulnerabilities: { critical: 0, high: 0, medium: 0, low: 0 },
    score: "-"
  }
];

export function RecentAuditsCard({ 
  audits = mockAudits, 
  className,
  maxItems = 5 
}: RecentAuditsCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-secure";
      case "running":
        return "text-primary";
      case "failed":
        return "text-critical";
      default:
        return "text-muted-foreground";
    }
  };

  const getRepoName = (url: string) => {
    return url.split('/').slice(-2).join('/');
  };

  const getTotalVulns = (vulns: AuditSummary['vulnerabilities']) => {
    return vulns.critical + vulns.high + vulns.medium + vulns.low;
  };

  return (
    <Card className={cn("col-span-1 lg:col-span-2", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Recent Audits</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <a href="/history" className="text-xs text-muted-foreground hover:text-foreground">
              View all
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {audits.slice(0, maxItems).map((audit) => (
          <div 
            key={audit.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-sm truncate">
                  {getRepoName(audit.repository)}
                </span>
                <Badge 
                  variant="secondary"
                  className={cn("text-xs", getStatusColor(audit.status))}
                >
                  {audit.status}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {audit.completedAt}
                  </span>
                </div>
                
                {audit.status === "completed" && (
                  <>
                    <div className="flex items-center gap-2">
                      {audit.vulnerabilities.critical > 0 && (
                        <SecurityBadge severity="critical" count={audit.vulnerabilities.critical} size="sm" />
                      )}
                      {audit.vulnerabilities.high > 0 && (
                        <SecurityBadge severity="high" count={audit.vulnerabilities.high} size="sm" />
                      )}
                      {audit.vulnerabilities.medium > 0 && (
                        <SecurityBadge severity="medium" count={audit.vulnerabilities.medium} size="sm" />
                      )}
                      {audit.vulnerabilities.low > 0 && (
                        <SecurityBadge severity="low" count={audit.vulnerabilities.low} size="sm" />
                      )}
                      {getTotalVulns(audit.vulnerabilities) === 0 && (
                        <SecurityBadge severity="secure" size="sm" />
                      )}
                    </div>
                    
                    <Badge variant="outline" className="text-xs font-mono">
                      {audit.score}
                    </Badge>
                  </>
                )}
                
                {audit.status === "running" && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-xs text-primary">In progress</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
