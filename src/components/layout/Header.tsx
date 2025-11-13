"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Menu, 
  X, 
  Search,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';


interface HeaderProps {
  onMenuToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ onMenuToggle, isSidebarOpen }: HeaderProps) {
  const [notifications] = useState(3); // Mock notification count

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left Section - Logo and Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Image
                src="/avai-logo.png"
                alt="AVAI Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gradient-cyber">AVAI</h1>
              <p className="text-xs text-muted-foreground leading-none">
                Security Platform
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Search (Hidden on Mobile) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search repositories, vulnerabilities..."
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Right Section - Actions and User */}
        <div className="flex items-center gap-2">
          {/* Search Button (Mobile Only) */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* Twitter Profile Button */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors hidden sm:flex"
            onClick={() => window.open('https://x.com/avai_canister', '_blank', 'noopener,noreferrer')}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-current"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Follow
          </Button>

          {/* Authentication */}
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors border border-transparent"
                >
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button 
                  variant="default" 
                  size="sm"
                  className="hover:bg-blue-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200 bg-primary"
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            {/* Notifications - Only shown after successful signup/signin */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </Button>
            
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
