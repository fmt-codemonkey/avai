"use client";

import { cn } from "@/lib/utils";
import { 
  Search,
  Shield,
  FileCode,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "error";
  progress?: number;
  duration?: string;
}

interface ProgressCardProps {
  title: string;
  description?: string;
  steps: ProgressStep[];
  overallProgress: number;
  status: "idle" | "scanning" | "completed" | "error";
  className?: string;
  showTimeEstimate?: boolean;
  estimatedTime?: string;
}

const statusIcons = {
  pending: Clock,
  "in-progress": Loader2,
  completed: CheckCircle,
  error: AlertTriangle,
};

const statusColors = {
  pending: "text-muted-foreground",
  "in-progress": "text-primary animate-spin",
  completed: "text-secure",
  error: "text-critical",
};

export function ProgressCard({
  title,
  description,
  steps,
  overallProgress,
  status,
  className,
  showTimeEstimate = true,
  estimatedTime,
}: ProgressCardProps) {
  const getStepIcon = (step: ProgressStep) => {
    switch (step.id) {
      case "scan":
        return Search;
      case "analyze":
        return Shield;
      case "review":
        return FileCode;
      default:
        return statusIcons[step.status];
    }
  };

  const completedSteps = steps.filter(step => step.status === "completed").length;
  const totalSteps = steps.length;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className={cn(
                "h-5 w-5",
                status === "scanning" && "animate-pulse-cyber text-primary",
                status === "completed" && "text-secure",
                status === "error" && "text-critical"
              )} />
              {title}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <Badge 
            variant={status === "error" ? "destructive" : "secondary"}
            className={cn(
              status === "scanning" && "animate-pulse-cyber",
              status === "completed" && "bg-secure/10 text-secure"
            )}
          >
            {status === "idle" && "Ready"}
            {status === "scanning" && "Scanning..."}
            {status === "completed" && "Complete"}
            {status === "error" && "Error"}
          </Badge>
        </div>
        
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress 
            value={overallProgress} 
            className="h-2"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedSteps} of {totalSteps} steps completed</span>
            {showTimeEstimate && estimatedTime && (
              <span>ETA: {estimatedTime}</span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const StepIcon = getStepIcon(step);
            const isActive = step.status === "in-progress";
            const isCompleted = step.status === "completed";
            const hasError = step.status === "error";

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
                  isActive && "border-primary/50 bg-primary/5 shadow-cyber",
                  isCompleted && "border-secure/50 bg-secure/5",
                  hasError && "border-critical/50 bg-critical/5",
                  !isActive && !isCompleted && !hasError && "border-border bg-muted/20"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                  isCompleted && "border-secure bg-secure text-secure-foreground",
                  isActive && "border-primary bg-primary/10 text-primary",
                  hasError && "border-critical bg-critical/10 text-critical",
                  !isActive && !isCompleted && !hasError && "border-muted-foreground bg-background"
                )}>
                  <StepIcon className={cn(
                    "h-4 w-4",
                    statusColors[step.status],
                    step.status === "in-progress" && step.id !== "scan" && step.id !== "analyze" && step.id !== "review" && "animate-spin"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={cn(
                      "font-medium text-sm",
                      isCompleted && "text-secure",
                      isActive && "text-primary",
                      hasError && "text-critical"
                    )}>
                      {step.title}
                    </h4>
                    {step.duration && (
                      <span className="text-xs text-muted-foreground">
                        {step.duration}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>

                  {/* Individual step progress */}
                  {step.progress !== undefined && step.status === "in-progress" && (
                    <div className="mt-2 space-y-1">
                      <Progress value={step.progress} className="h-1" />
                      <div className="text-xs text-muted-foreground">
                        {step.progress}% complete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Preset configurations for common audit types
export const auditSteps = {
  codeAnalysis: [
    {
      id: "scan",
      title: "Repository Scan", 
      description: "Scanning codebase for security vulnerabilities",
      status: "pending" as const,
    },
    {
      id: "analyze",
      title: "Security Analysis",
      description: "Analyzing code patterns and dependencies",
      status: "pending" as const,
    },
    {
      id: "review",
      title: "Vulnerability Review", 
      description: "Categorizing and prioritizing findings",
      status: "pending" as const,
    },
  ],
  
  dependencyAudit: [
    {
      id: "dependencies",
      title: "Dependency Scan",
      description: "Checking for vulnerable dependencies", 
      status: "pending" as const,
    },
    {
      id: "licenses",
      title: "License Check",
      description: "Validating dependency licenses",
      status: "pending" as const,
    },
    {
      id: "report", 
      title: "Generate Report",
      description: "Compiling security recommendations",
      status: "pending" as const,
    },
  ],
};
