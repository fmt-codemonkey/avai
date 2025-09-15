"use client";

import Link from "next/link";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentAuditsCard } from "@/components/dashboard/RecentAuditsCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Code,
  Users,
  Activity
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary glow-cyber animate-pulse-cyber" />
                <span className="text-xl font-bold text-gradient-cyber">AVAI</span>
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/chat" className="text-sm hover:text-primary transition-colors">Chat</Link>
              <span className="text-sm text-primary border-b-2 border-primary">Dashboard</span>
              <Link href="/" className="text-sm hover:text-primary transition-colors">Home</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Security Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor your security posture and recent audit activities
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <DashboardGrid>
          
          {/* Stats Cards Row */}
          <StatsCard
            title="Security Score"
            value="87/100"
            change={{ value: 12, type: "increase", period: "last month" }}
            icon={<Shield className="w-5 h-5" />}
            description="Overall security rating across all audits"
          />
          
          <StatsCard
            title="Active Vulnerabilities" 
            value="23"
            change={{ value: -8, type: "decrease", period: "last week" }}
            icon={<AlertTriangle className="w-5 h-5" />}
            description="Open security issues requiring attention"
          />
          
          <StatsCard
            title="Fixed Issues"
            value="156"
            change={{ value: 24, type: "increase", period: "last month" }}
            icon={<CheckCircle className="w-5 h-5" />}
            description="Successfully resolved vulnerabilities"
          />
          
          <StatsCard
            title="Avg. Fix Time"
            value="2.3 days"
            change={{ value: -15, type: "decrease", period: "last month" }}
            icon={<Clock className="w-5 h-5" />}
            description="Average time to resolve security issues"
          />

          {/* Wider Stats Cards */}
          <StatsCard
            title="Monthly Audit Growth"
            value="+34%"
            change={{ value: 8, type: "increase", period: "vs last quarter" }}
            icon={<TrendingUp className="w-6 h-6" />}
            description="Security audit frequency has increased significantly"
            size="lg"
          />

          <StatsCard
            title="Code Coverage"
            value="94.2%"
            change={{ value: 3, type: "increase", period: "last week" }}
            icon={<Code className="w-5 h-5" />}
            description="Percentage of codebase analyzed"
          />

          <StatsCard
            title="Team Members"
            value="12"
            icon={<Users className="w-5 h-5" />}
            description="Active users on your security team"
          />

          <StatsCard
            title="API Health"
            value="99.9%"
            change={{ value: 0.2, type: "increase", period: "last month" }}
            icon={<Activity className="w-5 h-5" />}
            description="Platform uptime and availability"
          />

          {/* Action Cards Row */}
          <QuickActionsCard />
          
          {/* Recent Audits */}
          <RecentAuditsCard />
          
        </DashboardGrid>

        {/* Footer Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-card border border-border rounded-lg">
            <div className="text-2xl font-bold text-foreground mb-1">2.4M+</div>
            <div className="text-sm text-muted-foreground">Lines of Code Analyzed</div>
          </div>
          <div className="text-center p-6 bg-card border border-border rounded-lg">
            <div className="text-2xl font-bold text-foreground mb-1">1,247</div>
            <div className="text-sm text-muted-foreground">Vulnerabilities Detected</div>
          </div>
          <div className="text-center p-6 bg-card border border-border rounded-lg">
            <div className="text-2xl font-bold text-foreground mb-1">98.7%</div>
            <div className="text-sm text-muted-foreground">Issues Successfully Fixed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
