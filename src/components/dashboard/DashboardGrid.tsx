"use client";

import { cn } from "@/lib/utils";

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 gap-6",
      "md:grid-cols-2",
      "lg:grid-cols-3", 
      "xl:grid-cols-4",
      "2xl:grid-cols-6",
      "auto-rows-min",
      className
    )}>
      {children}
    </div>
  );
}
