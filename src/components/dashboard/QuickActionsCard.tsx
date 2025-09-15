"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Github, 
  Upload, 
  History, 
  Download,
  Share,
  Zap
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: "default" | "primary" | "secondary";
}

interface QuickActionsCardProps {
  actions?: QuickAction[];
  className?: string;
}

export function QuickActionsCard({ actions, className }: QuickActionsCardProps) {
  const defaultActions: QuickAction[] = [
    {
      id: "new-audit",
      title: "New Audit",
      description: "Start a fresh security analysis",
      icon: <Plus className="w-4 h-4" />,
      action: () => window.location.href = "/chat",
      variant: "primary"
    },
    {
      id: "github-scan",
      title: "GitHub Scan", 
      description: "Connect and scan repository",
      icon: <Github className="w-4 h-4" />,
      action: () => console.log("GitHub scan"),
      variant: "default"
    },
    {
      id: "upload-code",
      title: "Upload Code",
      description: "Upload source code files",
      icon: <Upload className="w-4 h-4" />,
      action: () => console.log("Upload code"),
      variant: "default"
    },
    {
      id: "view-history",
      title: "Audit History",
      description: "View previous audits",
      icon: <History className="w-4 h-4" />,
      action: () => window.location.href = "/history",
      variant: "default"
    },
    {
      id: "export-report",
      title: "Export Report",
      description: "Download latest audit report",
      icon: <Download className="w-4 h-4" />,
      action: () => console.log("Export report"),
      variant: "secondary"
    },
    {
      id: "share-findings",
      title: "Share Findings", 
      description: "Share security insights",
      icon: <Share className="w-4 h-4" />,
      action: () => console.log("Share findings"),
      variant: "secondary"
    }
  ];

  const actionsToShow = actions || defaultActions;

  const getButtonVariant = (variant?: string) => {
    switch (variant) {
      case "primary":
        return "default";
      case "secondary":
        return "outline";
      default:
        return "ghost";
    }
  };

  return (
    <Card className={cn("col-span-1 lg:col-span-2", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Actions
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actionsToShow.map((action) => (
            <Button
              key={action.id}
              variant={getButtonVariant(action.variant)}
              onClick={action.action}
              className={cn(
                "h-auto p-4 flex flex-col items-start text-left space-y-2 group",
                action.variant === "primary" && "bg-primary hover:bg-primary/90 glow-cyber",
                action.variant === "default" && "hover:bg-muted/50",
                action.variant === "secondary" && "border-border/50 hover:bg-muted/20"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <div className={cn(
                  "p-1 rounded",
                  action.variant === "primary" ? "text-primary-foreground" : "text-foreground group-hover:text-primary"
                )}>
                  {action.icon}
                </div>
                <span className={cn(
                  "font-medium text-sm",
                  action.variant === "primary" ? "text-primary-foreground" : "text-foreground"
                )}>
                  {action.title}
                </span>
              </div>
              <p className={cn(
                "text-xs leading-relaxed",
                action.variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {action.description}
              </p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
