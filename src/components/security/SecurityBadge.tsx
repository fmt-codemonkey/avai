"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldX,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

const securityBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      severity: {
        critical: "bg-critical text-critical-foreground shadow-cyber",
        high: "bg-high text-high-foreground",
        medium: "bg-medium text-medium-foreground",
        low: "bg-low text-low-foreground",
        secure: "bg-secure text-secure-foreground",
        info: "bg-primary text-primary-foreground",
      },
      variant: {
        default: "",
        outline: "border bg-transparent",
        ghost: "bg-transparent",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      severity: "info",
      variant: "default",
      size: "md",
    },
    compoundVariants: [
      // Outline variants
      {
        severity: "critical",
        variant: "outline",
        class: "border-critical text-critical bg-critical/10",
      },
      {
        severity: "high", 
        variant: "outline",
        class: "border-high text-high bg-high/10",
      },
      {
        severity: "medium",
        variant: "outline", 
        class: "border-medium text-medium bg-medium/10",
      },
      {
        severity: "low",
        variant: "outline",
        class: "border-low text-low bg-low/10",
      },
      {
        severity: "secure",
        variant: "outline",
        class: "border-secure text-secure bg-secure/10",
      },
      // Ghost variants
      {
        severity: "critical",
        variant: "ghost",
        class: "text-critical hover:bg-critical/10",
      },
      {
        severity: "high",
        variant: "ghost", 
        class: "text-high hover:bg-high/10",
      },
      {
        severity: "medium",
        variant: "ghost",
        class: "text-medium hover:bg-medium/10",
      },
      {
        severity: "low",
        variant: "ghost",
        class: "text-low hover:bg-low/10",
      },
      {
        severity: "secure",
        variant: "ghost",
        class: "text-secure hover:bg-secure/10",
      },
    ],
  }
);

interface SecurityBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof securityBadgeVariants> {
  children?: React.ReactNode;
  showIcon?: boolean;
  count?: number;
  pulse?: boolean;
}

const severityConfig = {
  critical: {
    icon: ShieldX,
    label: "Critical",
    description: "Immediate attention required",
  },
  high: {
    icon: ShieldAlert, 
    label: "High",
    description: "High priority security issue",
  },
  medium: {
    icon: AlertTriangle,
    label: "Medium", 
    description: "Medium priority issue",
  },
  low: {
    icon: AlertCircle,
    label: "Low",
    description: "Low priority issue",
  },
  secure: {
    icon: ShieldCheck,
    label: "Secure",
    description: "No issues found",
  },
  info: {
    icon: Shield,
    label: "Info",
    description: "Informational",
  },
};

export function SecurityBadge({
  className,
  severity = "info",
  variant = "default", 
  size = "md",
  children,
  showIcon = true,
  count,
  pulse = false,
  ...props
}: SecurityBadgeProps) {
  const config = severityConfig[severity || "info"];
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        securityBadgeVariants({ severity, variant, size }),
        pulse && "animate-pulse-cyber",
        className
      )}
      title={config.description}
      {...props}
    >
      {showIcon && <IconComponent className="h-3 w-3" />}
      <span>
        {children || config.label}
        {count !== undefined && ` (${count})`}
      </span>
    </div>
  );
}

// Convenience components for common use cases
export function CriticalBadge({ count, ...props }: Omit<SecurityBadgeProps, "severity">) {
  return <SecurityBadge severity="critical" count={count} {...props} />;
}

export function HighBadge({ count, ...props }: Omit<SecurityBadgeProps, "severity">) {
  return <SecurityBadge severity="high" count={count} {...props} />;
}

export function MediumBadge({ count, ...props }: Omit<SecurityBadgeProps, "severity">) {
  return <SecurityBadge severity="medium" count={count} {...props} />;
}

export function LowBadge({ count, ...props }: Omit<SecurityBadgeProps, "severity">) {
  return <SecurityBadge severity="low" count={count} {...props} />;
}

export function SecureBadge({ count, ...props }: Omit<SecurityBadgeProps, "severity">) {
  return <SecurityBadge severity="secure" count={count} {...props} />;
}

// Severity summary component
interface SeveritySummaryProps {
  vulnerabilities: {
    critical: number;
    high: number; 
    medium: number;
    low: number;
  };
  className?: string;
}

export function SeveritySummary({ vulnerabilities, className }: SeveritySummaryProps) {
  const total = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);
  
  if (total === 0) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <SecureBadge>No vulnerabilities found</SecureBadge>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {vulnerabilities.critical > 0 && (
        <CriticalBadge count={vulnerabilities.critical} />
      )}
      {vulnerabilities.high > 0 && (
        <HighBadge count={vulnerabilities.high} />
      )}
      {vulnerabilities.medium > 0 && (
        <MediumBadge count={vulnerabilities.medium} />
      )}
      {vulnerabilities.low > 0 && (
        <LowBadge count={vulnerabilities.low} />
      )}
    </div>
  );
}
