"use client";

import { useState } from "react";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { ChatContainer, type Message } from "@/components/chat/ChatContainer";
import { ProgressCard } from "@/components/security/ProgressCard";
import { VulnerabilityCard } from "@/components/security/VulnerabilityCard";

export default function AVAISinglePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

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

        // Open right sidebar with results
        setRightSidebarOpen(true);

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

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setRightSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    // In a real app, load chat messages from the selected chat
    // For now, just show the right sidebar
    setRightSidebarOpen(true);
  };

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Left Sidebar - Chat History (Claude.ai style) */}
      <LeftSidebar
        isCollapsed={leftSidebarCollapsed}
        onToggle={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId || undefined}
      />

      {/* Main Chat Area - Center Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-hidden">
          <ChatContainer
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isEmpty={messages.length === 0}
            className="h-full"
          />
        </main>
      </div>

      {/* Right Sidebar - Reports & Results (Claude.ai style) */}
      {rightSidebarOpen && (
        <RightSidebar
          isOpen={rightSidebarOpen}
          onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
          onClose={() => setRightSidebarOpen(false)}
        />
      )}

      {/* Right sidebar toggle button when closed */}
      {!rightSidebarOpen && messages.length > 0 && (
        <RightSidebar
          isOpen={false}
          onToggle={() => setRightSidebarOpen(true)}
        />
      )}
    </div>
  );
}
