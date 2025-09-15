"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { ChatContainer, type Message } from "@/components/chat/ChatContainer";
import { ProgressCard } from "@/components/security/ProgressCard";
import { VulnerabilityCard } from "@/components/security/VulnerabilityCard";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock vulnerability data
  const mockVulnerability = {
    id: "vuln-1",
    title: "SQL Injection Vulnerability",
    description: "User input is directly concatenated into SQL queries without proper sanitization",
    severity: "critical" as const,
    category: "Injection Attack",
    cwe: "89",
    cvss: 9.8,
    location: {
      file: "src/auth/login.ts",
      line: 42,
      column: 15,
      function: "authenticateUser",
    },
    codeSnippet: `function authenticateUser(username, password) {
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  return db.query(query);
}`,
    impact: "Attackers can bypass authentication, access sensitive data, or execute arbitrary database commands",
    recommendation: "Use parameterized queries or prepared statements to prevent SQL injection",
    fixes: [
      {
        title: "Use Parameterized Query",
        description: "Replace string concatenation with parameterized queries",
        code: `function authenticateUser(username, password) {
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  return db.query(query, [username, password]);
}`,
        difficulty: "easy" as const,
        estimatedTime: "5 minutes",
      },
    ],
    references: [
      { title: "OWASP SQL Injection", url: "https://owasp.org/www-community/attacks/SQL_Injection" },
    ],
    discoveredAt: "2 hours ago",
    status: "open" as const,
    assignee: "security-team",
  };

  // Mock progress data  
  const mockProgress = {
    title: "Security Audit in Progress",
    description: "Analyzing repository for security vulnerabilities",
    steps: [
      {
        id: "scan",
        title: "Repository Scan",
        description: "Scanning codebase for security vulnerabilities",
        status: "completed" as const,
        progress: 100,
        duration: "1m 30s",
      },
      {
        id: "analyze",
        title: "Security Analysis", 
        description: "Analyzing code patterns and dependencies",
        status: "in-progress" as const,
        progress: 75,
      },
      {
        id: "review",
        title: "Vulnerability Review",
        description: "Categorizing and prioritizing findings",
        status: "pending" as const,
      },
    ],
    overallProgress: 65,
    status: "scanning" as const,
    estimatedTime: "2 minutes",
  };

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content,
      timestamp: new Date().toISOString(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai", 
        content: `🛡️ Starting security audit for: ${content}\n\nI'll analyze this repository for vulnerabilities and provide detailed findings with actionable recommendations.`,
        timestamp: new Date().toISOString(),
        type: "text"
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show progress after a delay
      setTimeout(() => {
        const progressMessage: Message = {
          id: `progress-${Date.now()}`,
          sender: "ai",
          content: <ProgressCard {...mockProgress} />,
          timestamp: new Date().toISOString(),
          type: "progress"
        };

        setMessages(prev => [...prev, progressMessage]);

        // Show vulnerability after more delay
        setTimeout(() => {
          const vulnMessage: Message = {
            id: `vuln-${Date.now()}`,
            sender: "ai",
            content: <VulnerabilityCard {...mockVulnerability} />,
            timestamp: new Date().toISOString(),
            type: "vulnerability"
          };

          setMessages(prev => [...prev, vulnMessage]);
          setIsLoading(false);
        }, 3000);
      }, 2000);
    }, 1000);
  };

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
              <span className="text-sm text-primary border-b-2 border-primary">Chat</span>
              <Link href="/dashboard" className="text-sm hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/" className="text-sm hover:text-primary transition-colors">Home</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <ChatContainer
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isEmpty={messages.length === 0}
        />
      </main>
    </div>
  );
}
