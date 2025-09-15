// 🛡️ AVAI Security Icon System
// Cybersecurity-focused icon collection using Lucide React

import {
  // Core Security Icons
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ShieldOff,
  
  // Access Control
  Lock,
  Unlock,
  Key,
  KeyRound,
  Eye,
  EyeOff,
  
  // Alert & Status Icons
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  
  // Code & Development
  Code,
  Code2,
  FileCode,
  FileCode2,
  GitBranch,
  GitCommit,
  GitMerge,
  
  // Navigation & UI
  Search,
  Menu,
  X,
  Settings,
  User,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  
  // Actions
  Copy,
  Check,
  Download,
  Upload,
  Share,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  
  // System & Monitoring
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Server,
  Database,
  Cpu,
  HardDrive,
  
  // Communication
  Mail,
  MessageSquare,
  Bell,
  BellRing,
  BellOff,
  
  // Files & Documents
  File,
  FileText,
  Folder,
  FolderOpen,
  Archive,
  
  // Network & Connectivity
  Wifi,
  WifiOff,
  Globe,
  Link,
  Unlink,
  
  // UI Components
  Maximize2,
  Minimize2,
  Expand,
  Shrink,
  MoreHorizontal,
  MoreVertical,
  
  // Status & Progress
  Loader2,
  CircleDot,
  CheckSquare,
  Square,
  
  // Location & Navigation
  MapPin,
  Navigation,
  Compass,
  
  // Time & Calendar
  Calendar,
  CalendarDays,
  History,
  
  // Social & External
  Github,
  Twitter,
  Linkedin,
  
  // Miscellaneous
  Plus,
  Minus,
  Edit,
  Trash2,
  Filter,
  ScanLine,
  Bug,
  Lightbulb,
  
  // Additional icons
  Package,
  Play,
  Pause,
} from "lucide-react";

// Export all icons for easy importing
export {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  ShieldOff,
  Lock,
  Unlock,
  Key,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  Code,
  Code2,
  FileCode,
  FileCode2,
  GitBranch,
  GitCommit,
  GitMerge,
  Search,
  Menu,
  X,
  Settings,
  User,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Copy,
  Check,
  Download,
  Upload,
  Share,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Server,
  Database,
  Cpu,
  HardDrive,
  Mail,
  MessageSquare,
  Bell,
  BellRing,
  BellOff,
  File,
  FileText,
  Folder,
  FolderOpen,
  Archive,
  Wifi,
  WifiOff,
  Globe,
  Link,
  Unlink,
  Maximize2,
  Minimize2,
  Expand,
  Shrink,
  MoreHorizontal,
  MoreVertical,
  Loader2,
  CircleDot,
  CheckSquare,
  Square,
  MapPin,
  Navigation,
  Compass,
  Calendar,
  CalendarDays,
  History,
  Github,
  Twitter,
  Linkedin,
  Plus,
  Minus,
  Edit,
  Trash2,
  Filter,
  ScanLine,
  Bug,
  Lightbulb,
  Package,
  Play,
  Pause,
};

// Security-specific icon configurations
export const SecurityIcons = {
  // Vulnerability Severity
  critical: ShieldX,
  high: ShieldAlert,
  medium: AlertTriangle,
  low: AlertCircle,
  secure: ShieldCheck,
  
  // Audit Types
  codeAudit: Code,
  dependencyAudit: Package,
  secretScan: Key,
  compliance: CheckSquare,
  
  // Status States
  scanning: Search,
  analyzing: Activity,
  completed: CheckCircle,
  failed: XCircle,
  pending: Clock,
  
  // Actions
  startScan: Play,
  stopScan: Pause,
  rescan: RotateCcw,
  export: Download,
  share: Share,
  
  // Categories
  authentication: Lock,
  authorization: Key,
  dataProtection: Shield,
  networkSecurity: Wifi,
  codeQuality: Code2,
} as const;

// Icon size variants
export const iconSizes = {
  xs: "h-3 w-3",
  sm: "h-4 w-4", 
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
  "2xl": "h-10 w-10",
} as const;

// Utility function to get security icon by severity
export function getSeverityIcon(severity: keyof typeof SecurityIcons) {
  return SecurityIcons[severity] || SecurityIcons.secure;
}

// Utility function to apply cybersecurity styling to icons
export function getSecurityIconClasses(severity?: string, glowing = false) {
  let classes = "";
  
  switch (severity) {
    case "critical":
      classes = "text-critical";
      break;
    case "high":
      classes = "text-high";
      break;
    case "medium":
      classes = "text-medium";
      break;
    case "low":
      classes = "text-low";
      break;
    case "secure":
      classes = "text-secure";
      break;
    default:
      classes = "text-primary";
  }
  
  if (glowing) {
    classes += " glow-cyber";
  }
  
  return classes;
}

// All icons are imported above
