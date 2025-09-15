"use client";

import { cn } from "@/lib/utils";
import { 
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Wifi,
  WifiOff,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Zap,
  Server,
  Database,
  Globe
} from "lucide-react";

type StatusType = "healthy" | "warning" | "critical" | "offline" | "pending";

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showPulse?: boolean;
  className?: string;
}

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    color: "text-secure",
    bgColor: "bg-secure/10",
    borderColor: "border-secure/30",
    label: "Healthy",
  },
  warning: {
    icon: AlertTriangle, 
    color: "text-medium",
    bgColor: "bg-medium/10",
    borderColor: "border-medium/30",
    label: "Warning",
  },
  critical: {
    icon: XCircle,
    color: "text-critical",
    bgColor: "bg-critical/10", 
    borderColor: "border-critical/30",
    label: "Critical",
  },
  offline: {
    icon: WifiOff,
    color: "text-muted-foreground",
    bgColor: "bg-muted/10",
    borderColor: "border-muted/30",
    label: "Offline",
  },
  pending: {
    icon: Clock,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30", 
    label: "Pending",
  },
} as const;

const sizeVariants = {
  sm: {
    container: "h-6 px-2 text-xs",
    icon: "h-3 w-3",
    dot: "w-2 h-2",
  },
  md: {
    container: "h-8 px-3 text-sm",
    icon: "h-4 w-4", 
    dot: "w-3 h-3",
  },
  lg: {
    container: "h-10 px-4 text-base",
    icon: "h-5 w-5",
    dot: "w-4 h-4",
  },
} as const;

export function StatusIndicator({
  status,
  label,
  size = "md",
  showIcon = true,
  showPulse = false,
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizeConfig = sizeVariants[size];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border transition-colors",
        config.bgColor,
        config.borderColor,
        sizeConfig.container,
        showPulse && "animate-pulse",
        className
      )}
    >
      {showIcon ? (
        <Icon className={cn(sizeConfig.icon, config.color)} />
      ) : (
        <div
          className={cn(
            "rounded-full",
            sizeConfig.dot,
            config.color.replace("text-", "bg-"),
            showPulse && "animate-pulse"
          )}
        />
      )}
      <span className={cn("font-medium", config.color)}>
        {displayLabel}
      </span>
    </div>
  );
}

// System Status Component
interface SystemStatusProps {
  className?: string;
}

export function SystemStatus({ className }: SystemStatusProps) {
  // Mock system status data
  const systemMetrics = {
    api: "healthy" as StatusType,
    database: "healthy" as StatusType, 
    scanner: "warning" as StatusType,
    security: "healthy" as StatusType,
  };

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <Activity className="h-4 w-4" />
        System Status
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <StatusIndicator
          status={systemMetrics.api}
          label="API Service"
          showIcon={false}
          showPulse={systemMetrics.api === "warning"}
        />
        <StatusIndicator
          status={systemMetrics.database}
          label="Database"
          showIcon={false}
          showPulse={systemMetrics.database === "warning"}
        />
        <StatusIndicator
          status={systemMetrics.scanner}
          label="Scanner"
          showIcon={false}
          showPulse={systemMetrics.scanner === "warning"}
        />
        <StatusIndicator
          status={systemMetrics.security}
          label="Security"
          showIcon={false}
          showPulse={systemMetrics.security === "warning"}
        />
      </div>
    </div>
  );
}

// Security Score Component
interface SecurityScoreProps {
  score: number;
  grade: string;
  className?: string;
}

export function SecurityScore({ score, grade, className }: SecurityScoreProps) {
  const getScoreStatus = (score: number): StatusType => {
    if (score >= 90) return "healthy";
    if (score >= 70) return "warning";
    return "critical";
  };

  const getGradeIcon = (grade: string) => {
    if (grade === "A" || grade === "A+") return ShieldCheck;
    if (grade === "B" || grade === "B+") return Shield;
    return ShieldAlert;
  };

  const status = getScoreStatus(score);
  const GradeIcon = getGradeIcon(grade);

  return (
    <div className={cn("flex items-center gap-3 p-4 rounded-lg border", statusConfig[status].bgColor, statusConfig[status].borderColor, className)}>
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background border-2 border-current">
        <GradeIcon className={cn("h-6 w-6", statusConfig[status].color)} />
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-2xl font-bold", statusConfig[status].color)}>
            {score}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("font-semibold", statusConfig[status].color)}>
            Grade {grade}
          </span>
          <StatusIndicator status={status} size="sm" />
        </div>
      </div>
    </div>
  );
}

// Connection Status Component
interface ConnectionStatusProps {
  isConnected: boolean;
  service: string;
  lastUpdated?: string;
  className?: string;
}

export function ConnectionStatus({ 
  isConnected, 
  service, 
  lastUpdated,
  className 
}: ConnectionStatusProps) {
  return (
    <div className={cn("flex items-center justify-between p-3 rounded-lg border", className)}>
      <div className="flex items-center gap-3">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-secure" />
        ) : (
          <WifiOff className="h-4 w-4 text-critical" />
        )}
        <div>
          <p className="font-medium text-sm">{service}</p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>
      </div>
      <StatusIndicator
        status={isConnected ? "healthy" : "offline"}
        size="sm"
      />
    </div>
  );
}

// Service Status Grid
export function ServiceStatusGrid({ className }: { className?: string }) {
  const services = [
    { name: "API Gateway", status: "healthy" as StatusType, uptime: "99.9%" },
    { name: "Auth Service", status: "healthy" as StatusType, uptime: "99.8%" }, 
    { name: "Scanner Engine", status: "warning" as StatusType, uptime: "98.5%" },
    { name: "Database", status: "healthy" as StatusType, uptime: "99.9%" },
    { name: "File Storage", status: "healthy" as StatusType, uptime: "99.7%" },
    { name: "Notification", status: "offline" as StatusType, uptime: "95.2%" },
  ];

  const getServiceIcon = (name: string) => {
    if (name.includes("API")) return Globe;
    if (name.includes("Database")) return Database;
    if (name.includes("Scanner")) return Zap;
    return Server;
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {services.map((service) => {
        const Icon = getServiceIcon(service.name);
        return (
          <div
            key={service.name}
            className="p-4 rounded-lg border bg-card hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{service.name}</span>
              </div>
              <StatusIndicator 
                status={service.status} 
                size="sm"
                showIcon={false}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {service.uptime}
            </p>
          </div>
        );
      })}
    </div>
  );
}
