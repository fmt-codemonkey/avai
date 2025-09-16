"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, 
  Shield, 
  History,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  User,
  LogOut
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  useUser,
  useClerk
} from '@clerk/nextjs';

interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  status: "completed" | "running" | "failed";
  vulnerabilityCount?: number;
}

interface LeftSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string;
  className?: string;
}

const mockChatHistory: ChatHistoryItem[] = [
  {
    id: "chat-1",
    title: "webapp Security Audit", 
    preview: "Found 4 vulnerabilities in React app",
    timestamp: "2 hours ago",
    status: "completed",
    vulnerabilityCount: 4
  },
  {
    id: "chat-2",
    title: "API Server Analysis",
    preview: "Critical SQL injection detected",
    timestamp: "1 day ago", 
    status: "completed",
    vulnerabilityCount: 8
  },
  {
    id: "chat-3",
    title: "Frontend Security Check",
    preview: "Scanning in progress...",
    timestamp: "3 minutes ago",
    status: "running"
  },
  {
    id: "chat-4",
    title: "Mobile App Audit",
    preview: "All security checks passed",
    timestamp: "3 days ago",
    status: "completed", 
    vulnerabilityCount: 0
  },
  {
    id: "chat-5",
    title: "Legacy System Review",
    preview: "Multiple critical issues found", 
    timestamp: "1 week ago",
    status: "completed",
    vulnerabilityCount: 12
  }
];

// Component for authenticated users
function AuthenticatedUserSection({ theme, setTheme }: { theme: string | undefined, setTheme: (theme: string) => void }) {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full p-3 h-auto justify-start hover:bg-muted/50">
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
              {user?.imageUrl ? (
                <Image 
                  src={user.imageUrl} 
                  alt="User Avatar" 
                  width={32} 
                  height={32} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium">
                {user?.fullName || user?.firstName || 'User'}
              </div>
              <div className="text-xs text-muted-foreground">Pro plan</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-72 bg-background/98 backdrop-blur-sm border-border/50 shadow-xl"
        side="right"
        sideOffset={12}
      >
        <div className="px-4 py-3 text-sm font-medium border-b border-border/30">
          {user?.primaryEmailAddress?.emailAddress || 'No email'}
        </div>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
          <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center overflow-hidden">
            {user?.imageUrl ? (
              <Image 
                src={user.imageUrl} 
                alt="User Avatar" 
                width={24} 
                height={24} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <User className="w-3 h-3 text-white" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium">
              {user?.fullName || user?.firstName || 'Personal'}
            </div>
            <div className="text-xs text-muted-foreground">Pro plan</div>
          </div>
          <CheckCircle className="w-4 h-4 text-primary ml-auto" />
        </div>
        
        <div className="py-2">
          <DropdownMenuItem className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md mx-2">
            <span className="text-sm">Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md mx-2">
            <span className="text-sm">Language</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuItem>
          
          <DropdownMenuItem className="px-4 py-2.5 cursor-pointer hover:bg-muted/50 rounded-md mx-2">
            <span className="text-sm">Get help</span>
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="mx-2" />
        
        <div className="py-2">
          <DropdownMenuItem className="px-4 py-2.5 cursor-pointer hover:bg-muted/50 rounded-md mx-2">
            <span className="text-sm">Upgrade plan</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md mx-2">
            <span className="text-sm">Learn more</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="mx-2" />
        
        {/* Theme Selector */}
        <div className="px-4 py-3">
          <div className="text-xs text-muted-foreground mb-3 font-medium">Theme</div>
          <div className="flex gap-2">
            <Button 
              variant={theme === "light" ? "default" : "outline"} 
              size="sm" 
              className="flex-1 h-8 text-xs hover:bg-muted/50" 
              onClick={() => setTheme("light")}
            >
              <Sun className="w-3 h-3 mr-1.5" />
              Light
            </Button>
            <Button 
              variant={theme === "dark" ? "default" : "outline"} 
              size="sm" 
              className="flex-1 h-8 text-xs hover:bg-muted/50" 
              onClick={() => setTheme("dark")}
            >
              <Moon className="w-3 h-3 mr-1.5" />
              Dark
            </Button>
            <Button 
              variant={theme === "system" ? "default" : "outline"} 
              size="sm" 
              className="flex-1 h-8 text-xs hover:bg-muted/50" 
              onClick={() => setTheme("system")}
            >
              <Monitor className="w-3 h-3 mr-1.5" />
              Auto
            </Button>
          </div>
        </div>
        
        <DropdownMenuSeparator className="mx-2" />
        
        <div className="py-2">
          <DropdownMenuItem 
            className="px-4 py-2.5 cursor-pointer hover:bg-destructive/10 rounded-md mx-2 text-destructive"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="text-sm">Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Component for unauthenticated users
function UnauthenticatedSection() {
  return (
    <div className="space-y-3">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
          <User className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1">Welcome to AVAI</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Sign in to access your security audits and personalized dashboard
        </p>
      </div>
      
      <div className="space-y-2">
        <SignInButton mode="modal">
          <Button className="w-full" variant="default">
            Sign In
          </Button>
        </SignInButton>
        
        <SignUpButton mode="modal">
          <Button className="w-full" variant="outline">
            Create Account
          </Button>
        </SignUpButton>
      </div>
      
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Secure your code with AI-powered auditing
        </p>
      </div>
    </div>
  );
}

export default function LeftSidebar({ 
  isCollapsed = false,
  onToggle,
  onNewChat,
  onSelectChat, 
  currentChatId,
  className
}: LeftSidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-3 h-3 text-secure" />;
      case "running":
        return <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />;
      case "failed":
        return <AlertTriangle className="w-3 h-3 text-critical" />;
      default:
        return <Clock className="w-3 h-3 text-muted-foreground" />;
    }
  };

  if (isCollapsed) {
    return (
      <div className={cn("w-12 border-r border-border bg-card flex flex-col", className)}>
        {/* Collapsed header */}
        <div className="p-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-8 h-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Collapsed navigation */}
        <div className="flex flex-col gap-2 p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="w-8 h-8 p-0"
            title="New Chat"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            title="History"
          >
            <History className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            title="History"
          >
            <History className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-80 border-r border-border bg-card flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary glow-cyber" />
            <span className="font-bold text-lg text-gradient-cyber">AVAI</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-8 h-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <Button 
          onClick={onNewChat}
          className="w-full bg-primary hover:bg-primary/90 glow-cyber"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Security Audit
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-hidden">
        <div className="p-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <History className="w-4 h-4" />
            Recent Audits
          </h3>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-2">
            {mockChatHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat?.(chat.id)}
                onMouseEnter={() => setHoveredChat(chat.id)}
                onMouseLeave={() => setHoveredChat(null)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border transition-all duration-200",
                  "hover:bg-muted/50 hover:border-primary/30",
                  currentChatId === chat.id 
                    ? "bg-primary/10 border-primary/50" 
                    : "bg-card border-border/50",
                  hoveredChat === chat.id && "shadow-md"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm truncate text-foreground">
                      {chat.title}
                    </h4>
                    {getStatusIcon(chat.status)}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {chat.preview}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {chat.timestamp}
                    </span>
                    
                    {chat.vulnerabilityCount !== undefined && (
                      <Badge 
                        variant={chat.vulnerabilityCount === 0 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {chat.vulnerabilityCount === 0 
                          ? "Secure" 
                          : `${chat.vulnerabilityCount} issues`
                        }
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Authentication Section */}
      <div className="p-3 border-t border-border">
        <SignedIn>
          <AuthenticatedUserSection theme={theme} setTheme={setTheme} />
        </SignedIn>
        <SignedOut>
          <UnauthenticatedSection />
        </SignedOut>
      </div>
    </div>
  );
}
