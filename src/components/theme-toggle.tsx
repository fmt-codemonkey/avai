"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "button" | "dropdown";
  size?: "sm" | "default" | "lg";
}

export function ThemeToggle({ 
  className, 
  variant = "dropdown",
  size = "default" 
}: ThemeToggleProps) {
  const { setTheme, theme, systemTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size={size === "sm" ? "sm" : "icon"}
        className={cn("h-9 w-9", className)}
        disabled
      >
        <Palette className="h-4 w-4" />
        <span className="sr-only">Loading theme toggle</span>
      </Button>
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;

  if (variant === "button") {
    return (
      <Button
        variant="ghost"
        size={size === "sm" ? "sm" : "icon"}
        onClick={() => {
          if (theme === "dark") {
            setTheme("light");
          } else if (theme === "light") {
            setTheme("system");
          } else {
            setTheme("dark");
          }
        }}
        className={cn(
          "h-9 w-9 transition-all duration-300 hover:scale-110",
          className
        )}
      >
        {currentTheme === "dark" ? (
          <Moon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        ) : currentTheme === "light" ? (
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        ) : (
          <Monitor className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={size === "sm" ? "sm" : "icon"}
          className={cn(
            "h-9 w-9 transition-all duration-300 hover:scale-110",
            className
          )}
        >
          {currentTheme === "dark" ? (
            <Moon className="h-4 w-4 rotate-0 scale-100 transition-all" />
          ) : currentTheme === "light" ? (
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "cursor-pointer gap-2",
            theme === "light" && "bg-accent text-accent-foreground"
          )}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === "light" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "cursor-pointer gap-2",
            theme === "dark" && "bg-accent text-accent-foreground"
          )}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "cursor-pointer gap-2",
            theme === "system" && "bg-accent text-accent-foreground"
          )}
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
          {theme === "system" && (
            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
