"use client";

import { useState, useCallback } from "react";
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
  CheckCircle,
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


import type { ChatSession } from '@/lib/supabase';

interface LeftSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
  currentChatId?: string;
  className?: string;
  sessions?: ChatSession[];
  isLoading?: boolean;
}

// Component for authenticated users
function AuthenticatedUserSection({ theme, setTheme }: { theme: string | undefined, setTheme: (theme: string) => void }) {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full p-3 h-auto justify-start hover:bg-muted/25 dark:hover:bg-muted/15 transition-all duration-200">
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
              <div className="text-xs text-muted-foreground">Basic plan</div>
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
            <div className="text-xs text-muted-foreground">Basic plan</div>
          </div>
          <CheckCircle className="w-4 h-4 text-primary ml-auto" />
        </div>
        
        <div className="py-2">
          <DropdownMenuItem 
            disabled
            className="px-4 py-2.5 flex items-center justify-between cursor-not-allowed opacity-60 rounded-md mx-2"
          >
            <span className="text-sm">Settings</span>
            <Badge variant="secondary" className="text-xs px-2 py-0.5">Coming Soon</Badge>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            disabled
            className="px-4 py-2.5 flex items-center justify-between cursor-not-allowed opacity-60 rounded-md mx-2"
          >
            <span className="text-sm">Language</span>
            <Badge variant="secondary" className="text-xs px-2 py-0.5">In Progress</Badge>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            disabled
            className="px-4 py-2.5 flex items-center justify-between cursor-not-allowed opacity-60 rounded-md mx-2"
          >
            <span className="text-sm">Get help</span>
            <Badge variant="secondary" className="text-xs px-2 py-0.5">Coming Soon</Badge>
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="mx-2" />
        
        <div className="py-2">
          <DropdownMenuItem 
            disabled
            className="px-4 py-2.5 flex items-center justify-between cursor-not-allowed opacity-60 rounded-md mx-2"
          >
            <span className="text-sm">Upgrade plan</span>
            <Badge variant="outline" className="text-xs px-2 py-0.5 border-primary/30 text-primary">Soon</Badge>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            disabled
            className="px-4 py-2.5 flex items-center justify-between cursor-not-allowed opacity-60 rounded-md mx-2"
          >
            <span className="text-sm">Learn more</span>
            <Badge variant="secondary" className="text-xs px-2 py-0.5">In Progress</Badge>
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
              className="flex-1 h-8 text-xs hover:bg-muted/25 dark:hover:bg-muted/15 transition-colors" 
              onClick={() => setTheme("light")}
            >
              <Sun className="w-3 h-3 mr-1.5" />
              Light
            </Button>
            <Button 
              variant={theme === "dark" ? "default" : "outline"} 
              size="sm" 
              className="flex-1 h-8 text-xs hover:bg-muted/25 dark:hover:bg-muted/15 transition-colors" 
              onClick={() => setTheme("dark")}
            >
              <Moon className="w-3 h-3 mr-1.5" />
              Dark
            </Button>
            <Button 
              variant={theme === "system" ? "default" : "outline"} 
              size="sm" 
              className="flex-1 h-8 text-xs hover:bg-muted/25 dark:hover:bg-muted/15 transition-colors" 
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
            className="px-4 py-2.5 cursor-pointer hover:bg-destructive/10 dark:hover:bg-destructive/15 rounded-md mx-2 text-destructive transition-colors"
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

// Component for authenticated users in collapsed state
function CollapsedAuthenticatedSection({ onToggle }: { onToggle?: () => void }) {
  const { user } = useUser();

  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      className="w-8 h-8 p-0 rounded-full hover:bg-muted/25 dark:hover:bg-muted/15 transition-colors"
      title={`${user?.fullName || user?.firstName || 'User'} - Click to expand`}
    >
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
    </Button>
  );
}

// Component for unauthenticated users in collapsed state
function CollapsedUnauthenticatedSection({ onToggle }: { onToggle?: () => void }) {
  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      className="w-8 h-8 p-0 rounded-full hover:bg-muted/25 dark:hover:bg-muted/15 transition-colors"
      title="Sign in - Click to expand"
    >
      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
        <User className="w-3 h-3 text-muted-foreground" />
      </div>
    </Button>
  );
}

export default function LeftSidebar({ 
  isCollapsed = false,
  onToggle,
  onNewChat,
  onSelectChat, 
  currentChatId,
  className,
  sessions = [],
  isLoading = false
}: LeftSidebarProps) {
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  // Memoize the date formatter to prevent re-creation on every render
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }, []);

  // Memoize hover handlers to prevent function recreation
  const handleMouseEnter = useCallback((sessionId: string) => {
    setHoveredChat(sessionId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredChat(null);
  }, []);

  if (isCollapsed) {
    return (
      <div className={cn("w-12 border-r border-border bg-card flex flex-col", className)}>
        {/* Collapsed header */}
        <div className="p-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-8 h-8 p-0 hover:bg-muted/25 dark:hover:bg-muted/15 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Collapsed navigation */}
        <div className="flex flex-col gap-2 p-2 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-8 h-8 p-0 hover:bg-muted/25 dark:hover:bg-muted/15 transition-colors"
            title="New Security Audit"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="w-8 h-8 p-0 hover:bg-muted/25 dark:hover:bg-muted/15 transition-colors"
            title="Recent Audits"
          >
            <History className="w-4 h-4" />
          </Button>
        </div>

        {/* Collapsed Authentication Section */}
        <div className="p-2 border-t border-border">
          <SignedIn>
            <CollapsedAuthenticatedSection onToggle={onToggle} />
          </SignedIn>
          <SignedOut>
            <CollapsedUnauthenticatedSection onToggle={onToggle} />
          </SignedOut>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-80 border-r border-border bg-card flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg text-foreground">AVAI</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <Button 
          onClick={onNewChat}
          size="sm"
          className="w-full h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Security Audit
        </Button>
      </div>

      {/* Chat History - Scrollable Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-3 flex-shrink-0 border-b border-border/50">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <History className="w-3.5 h-3.5" />
            Recent Audits
          </h3>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-1 px-2 pt-2 pb-3">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-md bg-muted/20 animate-pulse">
                    <div className="h-4 bg-muted/40 rounded mb-2"></div>
                    <div className="h-3 bg-muted/30 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-2">No chats yet</div>
                <div className="text-muted-foreground text-xs">Start a new security audit to begin</div>
              </div>
            ) : (
              sessions.map((session) => {
                return (
                  <button
                    key={session.id}
                    onClick={() => onSelectChat?.(session.id.toString())}
                    onMouseEnter={() => handleMouseEnter(session.id.toString())}
                    onMouseLeave={handleMouseLeave}
                    className={cn(
                      // Base styles
                      "w-full text-left p-3 rounded-md transition-all duration-200",
                      "group relative overflow-visible",
                      "focus:outline-none focus:ring-1 focus:ring-primary/30",
                      
                      // Active state (like Claude AI)
                      currentChatId === session.id.toString() 
                        ? "bg-primary/10 text-foreground shadow-sm border-l-2 border-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-transparent dark:hover:bg-[#0e0e0ead]",
                      
                      // Hover effects with glow shadow in dark mode
                      "hover:shadow-sm dark:hover:shadow-lg dark:hover:shadow-primary/20",
                      "hover:border-l-2 hover:border-primary/30",
                      
                      // Smooth transitions
                      "transition-all duration-300 ease-out"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn(
                          "font-medium text-sm truncate transition-colors duration-200",
                          currentChatId === session.id.toString() 
                            ? "text-foreground" 
                            : "text-foreground group-hover:text-foreground"
                        )}>
                          {session.title}
                        </h4>
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-3 h-3 text-secure" />
                        </div>
                      </div>
                      
                      <p className={cn(
                        "text-xs line-clamp-2 leading-relaxed transition-colors duration-200",
                        currentChatId === session.id.toString() 
                          ? "text-muted-foreground" 
                          : "text-muted-foreground group-hover:text-foreground/80"
                      )}>
                        Security audit session
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[10px] font-medium transition-colors duration-200",
                          currentChatId === session.id.toString() 
                            ? "text-muted-foreground/70" 
                            : "text-muted-foreground/60 group-hover:text-muted-foreground/80"
                        )}>
                          {formatDate(session.updated_at)}
                        </span>
                        
                        <div className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-thin",
                          "border transition-all duration-200",
                          "text-green-700 dark:text-green-400",
                          "bg-transparent border-transparent",
                          currentChatId === session.id.toString() 
                            ? "border-green-400 dark:border-green-500" 
                            : "group-hover:border-green-400 dark:group-hover:border-green-500"
                        )}>
                          Active
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Authentication Section - Fixed at Bottom */}
      <div className="flex-shrink-0 p-3 border-t border-border bg-card">
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


