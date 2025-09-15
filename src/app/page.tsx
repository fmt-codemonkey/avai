"use client";

import { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { ChatContainer, type Message } from "@/components/chat/ChatContainer";
import { ProgressCard } from "@/components/security/ProgressCard";
import { VulnerabilityCard } from "@/components/security/VulnerabilityCard";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function AVAISinglePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile
      if (mobile) {
        setLeftSidebarCollapsed(true);
        setRightSidebarOpen(false);
        setMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    
    // Load mock chat data based on selected chat
    const mockChatData = getChatMessages(chatId);
    setMessages(mockChatData);
    setRightSidebarOpen(true);
    
    // Close mobile menu if open
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Mock function to get chat messages based on chat ID
  const getChatMessages = (chatId: string): Message[] => {
    switch (chatId) {
      case "chat-1":
        return [
          {
            id: "1",
            sender: "user",
            content: "Analyze my React webapp for security vulnerabilities",
            timestamp: "2 hours ago",
          },
          {
            id: "2", 
            sender: "ai",
            content: "I'll analyze your React webapp for security vulnerabilities. Let me scan your codebase...\n\n**Analysis Complete** ✅\n\nI found **4 security vulnerabilities** in your React application:\n\n1. **XSS Vulnerability** - Unescaped user input in components\n2. **Insecure Direct Object References** - Missing authorization checks\n3. **Sensitive Data Exposure** - API keys in client-side code\n4. **Cross-Site Request Forgery** - Missing CSRF protection\n\nWould you like me to provide detailed remediation steps for each vulnerability?",
            timestamp: "2 hours ago",
          },
          {
            id: "3",
            sender: "user", 
            content: "Yes, please provide detailed remediation steps for the XSS vulnerability",
            timestamp: "2 hours ago",
          },
          {
            id: "4",
            sender: "ai",
            content: "## XSS Vulnerability Remediation\n\n**Issue**: Unescaped user input in React components\n**Severity**: High\n**Location**: `src/components/UserProfile.jsx:45`\n\n### Current Vulnerable Code:\n```jsx\nfunction UserProfile({ userData }) {\n  return (\n    <div dangerouslySetInnerHTML={{ __html: userData.bio }} />\n  );\n}\n```\n\n### Recommended Fix:\n```jsx\nimport DOMPurify from 'dompurify';\n\nfunction UserProfile({ userData }) {\n  const sanitizedBio = DOMPurify.sanitize(userData.bio);\n  return (\n    <div dangerouslySetInnerHTML={{ __html: sanitizedBio }} />\n  );\n}\n```\n\n### Additional Steps:\n1. Install DOMPurify: `npm install dompurify`\n2. Sanitize all user inputs before rendering\n3. Use Content Security Policy (CSP) headers\n4. Implement input validation on the backend",
            timestamp: "1 hour ago",
          },
        ];
        
      case "chat-2":
        return [
          {
            id: "1",
            sender: "user",
            content: "Please audit my Node.js API server for security issues",
            timestamp: "1 day ago",
          },
          {
            id: "2",
            sender: "ai", 
            content: "I'll perform a comprehensive security audit of your Node.js API server.\n\n**🔍 Scanning API endpoints, authentication, and database queries...**\n\n**⚠️ CRITICAL ISSUE DETECTED**\n\n**SQL Injection Vulnerability Found**\n- **Severity**: Critical (CVSS 9.8)\n- **Location**: `src/auth/login.js:42`\n- **Impact**: Complete database compromise possible\n\n**Additional Findings**:\n- 3 Medium severity authentication issues\n- 4 Low severity information disclosure risks  \n- Missing rate limiting on API endpoints\n\nThis is a **high-priority security risk** that should be addressed immediately. Would you like me to show you how to fix the SQL injection vulnerability?",
            timestamp: "1 day ago",
          },
        ];
        
      case "chat-3":
        return [
          {
            id: "1", 
            sender: "user",
            content: "Start a security audit on my frontend React application",
            timestamp: "3 minutes ago",
          },
          {
            id: "2",
            sender: "ai",
            content: "🔄 **Security Audit In Progress**\n\nScanning your React frontend application...\n\n✅ **Completed Steps**:\n- Dependency vulnerability scan\n- Component security analysis\n- Authentication flow review\n\n🔄 **Currently Processing**:\n- API security validation\n- Data sanitization checks\n- XSS prevention analysis\n\n**Estimated completion**: 2-3 minutes\n\nI'll provide a detailed report once the scan is complete.",
            timestamp: "2 minutes ago",
          },
        ];
        
      case "chat-4":
        return [
          {
            id: "1",
            sender: "user",
            content: "Audit my React Native mobile app for security vulnerabilities",
            timestamp: "3 days ago",
          },
          {
            id: "2",
            sender: "ai",
            content: "🎉 **Security Audit Complete - All Checks Passed!**\n\n**Mobile App Security Assessment Results**:\n\n✅ **Secure Areas**:\n- Authentication implementation is robust\n- API communications properly encrypted\n- Sensitive data storage follows best practices\n- No hardcoded secrets or API keys found\n- Proper certificate pinning implemented\n\n✅ **Security Score**: 98/100\n\n**Minor Recommendations**:\n1. Consider implementing biometric authentication\n2. Add additional API rate limiting\n3. Enable advanced threat detection\n\n**Overall Assessment**: Your mobile application follows excellent security practices. No critical or high-severity vulnerabilities detected.",
            timestamp: "3 days ago",
          },
        ];
        
      default:
        return [];
    }
  };



  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 text-foreground overflow-hidden">
      {/* Professional Mobile Header */}
      {isMobile && (
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-md z-50 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden hover:bg-primary/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              AVAI
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
              >
                Reports
              </Button>
            )}
          </div>
        </header>
      )}



      {/* Layout Container */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Left Sidebar - Chat History */}
        <LeftSidebar
          isCollapsed={leftSidebarCollapsed}
          onToggle={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          currentChatId={currentChatId || undefined}
          className={`
            ${isMobile 
              ? `fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
                 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
              : 'relative'
            }
          `}
        />

        {/* Mobile Overlay */}
        {isMobile && mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full bg-gradient-to-br from-background/50 to-background border-l border-r border-border/30 backdrop-blur-sm overflow-hidden">
          {currentChatId && messages.length > 0 ? (
            <>
              {/* Chat Header */}
              <div className="flex-shrink-0 border-b border-border/30 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div>
                        <h2 className="font-semibold text-foreground">Security Analysis Chat</h2>
                        <p className="text-sm text-muted-foreground">
                          {currentChatId === "chat-3" ? "Analysis in progress..." : "Analysis complete"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isMobile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {rightSidebarOpen ? "Hide Reports" : "Show Reports"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <ChatContainer
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                isEmpty={false}
                className="flex-1"
              />
            </>
          ) : (
            <ChatContainer
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isEmpty={messages.length === 0}
              className="h-full"
            />
          )}
        </div>

        {/* Right Sidebar - Reports & Results */}
        {rightSidebarOpen && (
          <RightSidebar
            isOpen={rightSidebarOpen}
            onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
            onClose={() => setRightSidebarOpen(false)}
            className={`
              ${isMobile 
                ? `fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 ease-in-out
                   ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
                : 'relative'
              }
            `}
          />
        )}

        {/* Right sidebar toggle button when closed (desktop only) */}
        {!rightSidebarOpen && messages.length > 0 && !isMobile && (
          <RightSidebar
            isOpen={false}
            onToggle={() => setRightSidebarOpen(true)}
          />
        )}
      </div>

      {/* Mobile Right Sidebar Overlay */}
      {isMobile && rightSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setRightSidebarOpen(false)}
        />
      )}
    </div>
  );
}
