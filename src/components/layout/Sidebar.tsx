"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  ShieldAlert, 
  Search,
  FileCode,
  BarChart3,
  History,
  Settings,
  Users,
  GitBranch,
  Clock,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavigationItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
  active?: boolean;
}

interface AuditHistoryItem {
  id: string;
  repository: string;
  status: "completed" | "in-progress" | "failed";
  severity: "critical" | "high" | "medium" | "low";
  timestamp: string;
  vulnerabilities: number;
}

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    icon: BarChart3,
    href: "/dashboard",
    active: true,
  },
  {
    title: "New Audit",
    icon: Search,
    href: "/audit/new",
  },
  {
    title: "Repositories", 
    icon: GitBranch,
    href: "/repositories",
    badge: "12",
  },
  {
    title: "Vulnerabilities",
    icon: ShieldAlert,
    href: "/vulnerabilities",
    badge: "4",
  },
  {
    title: "Code Analysis",
    icon: FileCode,
    href: "/analysis",
  },
  {
    title: "Reports",
    icon: FileCode,
    href: "/reports",
  },
];

const settingsItems: NavigationItem[] = [
  {
    title: "Team",
    icon: Users,
    href: "/settings/team",
  },
  {
    title: "Integrations",
    icon: Settings,
    href: "/settings/integrations",
  },
  {
    title: "Security",
    icon: Shield,
    href: "/settings/security",
  },
];

const mockAuditHistory: AuditHistoryItem[] = [
  {
    id: "1",
    repository: "api-gateway",
    status: "completed",
    severity: "critical",
    timestamp: "2 hours ago",
    vulnerabilities: 3,
  },
  {
    id: "2", 
    repository: "user-service",
    status: "in-progress",
    severity: "medium",
    timestamp: "5 hours ago",
    vulnerabilities: 1,
  },
  {
    id: "3",
    repository: "frontend-app",
    status: "completed",
    severity: "low",
    timestamp: "1 day ago",
    vulnerabilities: 0,
  },
  {
    id: "4",
    repository: "auth-service",
    status: "failed",
    severity: "high",
    timestamp: "2 days ago",
    vulnerabilities: 5,
  },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [activeItem, setActiveItem] = useState("/dashboard");

  const getStatusIcon = (status: AuditHistoryItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-secure" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-medium animate-pulse" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-critical" />;
    }
  };

  const getSeverityColor = (severity: AuditHistoryItem["severity"]) => {
    switch (severity) {
      case "critical":
        return "text-critical";
      case "high":
        return "text-high";
      case "medium":
        return "text-medium";
      case "low":
        return "text-low";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 transform bg-card border-r border-border transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary glow-cyber" />
            <span className="font-semibold text-gradient-cyber">AVAI</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)]">
          <div className="flex flex-col p-4 space-y-6">
            {/* Navigation */}
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant={activeItem === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2 h-10",
                    activeItem === item.href 
                      ? "bg-primary/10 text-primary border-primary/20" 
                      : "border border-border/30 dark:border-border/20 hover:border-border/50 dark:hover:border-border/40"
                  )}
                  onClick={() => setActiveItem(item.href)}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </nav>

            <Separator />

            {/* Recent Audits */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">Recent Audits</h3>
              </div>
              <div className="space-y-2">
                {mockAuditHistory.map((audit) => (
                  <div
                    key={audit.id}
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(audit.status)}
                          <p className="text-sm font-medium truncate">
                            {audit.repository}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            {audit.timestamp}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-medium", getSeverityColor(audit.severity))}>
                              {audit.vulnerabilities}
                            </span>
                            <ShieldAlert className={cn("h-3 w-3", getSeverityColor(audit.severity))} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Settings */}
            <nav className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Settings</h3>
              {settingsItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start gap-2 h-9 text-sm border border-border/30 dark:border-border/20 hover:border-border/50 dark:hover:border-border/40"
                  onClick={() => setActiveItem(item.href)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Button>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
