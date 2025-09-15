import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cybersecurity-specific utility functions
export const severityConfig = {
  critical: {
    color: "text-critical",
    bg: "bg-critical",
    label: "Critical",
    icon: "🔴",
  },
  high: {
    color: "text-high", 
    bg: "bg-high",
    label: "High",
    icon: "🟠",
  },
  medium: {
    color: "text-medium",
    bg: "bg-medium", 
    label: "Medium",
    icon: "🟡",
  },
  low: {
    color: "text-low",
    bg: "bg-low",
    label: "Low", 
    icon: "🟢",
  },
  secure: {
    color: "text-secure",
    bg: "bg-secure",
    label: "Secure",
    icon: "✅",
  },
} as const

export type SeverityLevel = keyof typeof severityConfig

export function getSeverityStyles(severity: SeverityLevel) {
  return severityConfig[severity]
}

// Theme utilities for cybersecurity components
export const themeUtils = {
  cyber: {
    gradient: "text-gradient-cyber",
    glow: "glow-cyber", 
    shadow: "shadow-cyber",
    pulse: "animate-pulse-cyber",
    border: "border-gradient-cyber",
  },
  card: {
    base: "bg-card text-card-foreground border border-border rounded-lg",
    cyber: "bg-card/50 backdrop-blur-sm border-primary/20 shadow-cyber",
  },
  button: {
    cyber: "bg-primary hover:bg-primary/90 text-primary-foreground glow-cyber transition-all duration-200",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  },
} as const
