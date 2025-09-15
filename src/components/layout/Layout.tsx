"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function AppLayout({ 
  children, 
  showSidebar = true, 
  showFooter = true,
  className = ""
}: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header 
        onMenuToggle={showSidebar ? toggleSidebar : undefined}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar 
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
          />
        )}

        {/* Main Content */}
        <main 
          className={`flex-1 overflow-auto ${showSidebar ? 'lg:ml-0' : ''} ${className}`}
        >
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}

// Specialized layout components for different sections
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout showSidebar={true} showFooter={false}>
      {children}
    </AppLayout>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout showSidebar={false} showFooter={false} className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      {children}
    </AppLayout>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout showSidebar={false} showFooter={true}>
      {children}
    </AppLayout>
  );
}
