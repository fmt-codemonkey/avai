"use client";

import { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { ChatContainer, type Message } from "@/components/chat/ChatContainer";


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
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

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

    // Professional fallback response when WebSocket is unavailable
    setTimeout(() => {
      const responseContent = `**AVAI Security Analysis Service**\n\n⚠️ **Service Temporarily Unavailable**\n\nOur AI security analysis service is currently experiencing connectivity issues. This may be due to:\n\n• Backend server maintenance\n• Network connectivity problems\n• High system load\n\n**What you can do:**\n\n1. **Try again in a few moments** - Service usually resumes quickly\n2. **Check your internet connection** - Ensure stable connectivity\n3. **Contact support** if the issue persists\n\n**For immediate assistance:**\n• Email: support@avai.security\n• Status page: status.avai.security\n\nWe apologize for the inconvenience and appreciate your patience while we resolve this issue.`;

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai", 
        content: responseContent,
        timestamp: new Date().toISOString(),
        type: "text"
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setRightSidebarOpen(false);
    setIsLoadingHistory(false);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setIsLoadingHistory(true);
    
    // Load mock chat data based on selected chat
    const mockChatData = getChatMessages(chatId);
    setMessages(mockChatData);
    setRightSidebarOpen(true);
    
    // Reset loading history flag after a brief delay to allow rendering
    setTimeout(() => {
      setIsLoadingHistory(false);
    }, 100);
    
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
            content: "https://github.com/vercel/next.js",
            timestamp: "2024-09-16T14:30:00Z",
            type: "text"
          },
          {
            id: "2", 
            sender: "ai",
            content: "I'll analyze the Next.js repository for security vulnerabilities. This is a large codebase, so I'll focus on the most critical areas.\n\n🔍 **Repository Analysis Started**\n- Repository: vercel/next.js\n- Language: TypeScript, JavaScript\n- Size: ~2.1M lines of code\n- Dependencies: 847 packages\n\nScanning for:\n• Authentication & authorization flaws\n• Input validation issues\n• Dependency vulnerabilities\n• Code injection risks\n• Information disclosure\n\n**Analysis Progress: 100%**\n\n⚠️ **Found 3 security issues:**\n\n**1. Potential XSS in HTML parsing** (Medium)\n• Location: packages/next/src/server/api-utils/index.ts:142\n• Risk: Client-side code execution\n\n**2. Dependency vulnerability** (High)\n• Package: semver@5.7.1\n• CVE: CVE-2022-25883\n• Fix: Update to semver@7.5.4\n\n**3. Path traversal risk** (Low)\n• Location: packages/next/src/server/serve-static.ts:89\n• Risk: Unauthorized file access\n\nWould you like detailed remediation steps for any of these issues?",
            timestamp: "2024-09-16T14:31:30Z",
            type: "text"
          },
          {
            id: "3",
            sender: "user", 
            content: "Show me details for the XSS vulnerability",
            timestamp: "2024-09-16T14:32:15Z",
            type: "text"
          },
          {
            id: "4",
            sender: "ai",
            content: "# XSS Vulnerability Analysis\n\n## Issue Details\n**Severity:** Medium (CVSS 6.1)\n**Type:** Reflected Cross-Site Scripting\n**Location:** `packages/next/src/server/api-utils/index.ts:142`\n**CWE:** CWE-79 (Cross-site Scripting)\n\n## Vulnerable Code\n```typescript\n// Current implementation\nexport function parseBody(req: IncomingMessage, limit: string | number) {\n  const contentType = req.headers['content-type'] || 'text/plain'\n  if (contentType.includes('application/json')) {\n    // Potential XSS: user input not sanitized\n    return JSON.parse(body.toString())\n  }\n}\n```\n\n## Security Risk\n• Unsanitized JSON parsing allows malicious payloads\n• Can execute JavaScript in user's browser\n• Affects server-side rendering contexts\n• Potential data theft and session hijacking\n\n## Recommended Fix\n```typescript\nimport { sanitize } from 'dompurify'\n\nexport function parseBody(req: IncomingMessage, limit: string | number) {\n  const contentType = req.headers['content-type'] || 'text/plain'\n  if (contentType.includes('application/json')) {\n    try {\n      const parsed = JSON.parse(body.toString())\n      // Sanitize before processing\n      return sanitizeObject(parsed)\n    } catch (e) {\n      throw new Error('Invalid JSON payload')\n    }\n  }\n}\n\nfunction sanitizeObject(obj: any): any {\n  if (typeof obj === 'string') {\n    return sanitize(obj)\n  }\n  // Handle nested objects...\n}\n```\n\n## Implementation Steps\n1. Install DOMPurify: `npm install isomorphic-dompurify`\n2. Create sanitization utility function\n3. Apply sanitization to all user inputs\n4. Add Content Security Policy headers\n5. Test with XSS payloads\n\n## Testing\nTest with payload: `{\"name\": \"<script>alert('XSS')</script>\"}`",
            timestamp: "2024-09-16T14:33:45Z",
            type: "text"
          },
        ];
        
      case "chat-2":
        return [
          {
            id: "1",
            sender: "user",
            content: "https://github.com/facebook/react",
            timestamp: "2024-09-15T09:15:00Z",
            type: "text"
          },
          {
            id: "2",
            sender: "ai", 
            content: "Analyzing the React repository for security vulnerabilities...\n\n🔍 **Repository Analysis**\n- Repository: facebook/react\n- Primary Language: JavaScript (78.2%)\n- Lines of Code: ~1.8M\n- Active Contributors: 1,600+\n\n**Scan Results:**\n\n🛡️ **Security Assessment: STRONG**\n\n✅ **Strengths Identified:**\n• Comprehensive input sanitization\n• Strong XSS protection mechanisms\n• Regular security audits and updates\n• Proper CSP implementation\n• Safe defaults for DOM manipulation\n\n⚠️ **Minor Issues Found:**\n\n**1. Prototype Pollution Risk** (Low)\n• Location: packages/shared/objectIs.js:23\n• Impact: Potential object property manipulation\n• Status: Theoretical risk, requires specific conditions\n\n**2. Dependency Alert** (Info)\n• Package: ws@6.2.2 in devDependencies\n• Recommendation: Update to latest version\n• Impact: Development environment only\n\n**Overall Security Score: 94/100**\n\nThe React codebase follows excellent security practices. The development team has implemented robust protections against common web vulnerabilities.\n\n**Recommendation:** Continue current security practices. Consider automated dependency scanning in CI/CD pipeline.",
            timestamp: "2024-09-15T09:16:45Z",
            type: "text"
          },
        ];
        
      case "chat-3":
        return [
          {
            id: "1", 
            sender: "user",
            content: "https://github.com/microsoft/vscode",
            timestamp: "2024-09-16T16:22:00Z",
            type: "text"
          },
          {
            id: "2",
            sender: "ai",
            content: "🔄 **Security Audit In Progress**\n\nAnalyzing VS Code repository...\n\n📊 **Repository Info:**\n- Repository: microsoft/vscode\n- Language: TypeScript (85.4%)\n- Size: ~3.2M lines of code\n- Electron-based application\n\n✅ **Completed Scans:**\n• Static code analysis (100%)\n• Dependency vulnerability check (100%)\n• Authentication flow review (100%)\n• File system access patterns (100%)\n\n🔄 **Current Analysis:**\n• Extension security model\n• Inter-process communication\n• Node.js integration security\n\n**Estimated completion:** 45 seconds\n\nI'll provide a comprehensive security report once analysis is complete...",
            timestamp: "2024-09-16T16:22:30Z",
            type: "text"
          },
        ];
        
      case "chat-4":
        return [
          {
            id: "1",
            sender: "user",
            content: "https://github.com/tailwindlabs/tailwindcss",
            timestamp: "2024-09-13T11:45:00Z",
            type: "text"
          },
          {
            id: "2",
            sender: "ai",
            content: "# Security Audit Complete ✅\n\n**Repository:** tailwindlabs/tailwindcss\n**Audit Date:** September 13, 2024\n**Audit Duration:** 2m 34s\n\n## 🛡️ Security Assessment\n\n**Overall Security Score: 96/100**\n\n### ✅ Security Strengths\n• **No critical vulnerabilities detected**\n• Strong input validation for CSS parsing\n• Safe PostCSS plugin architecture\n• Proper file path sanitization\n• No hardcoded secrets or API keys\n• Secure build process and CI/CD pipeline\n\n### 📋 Findings Summary\n**Total Issues:** 2 (both low severity)\n\n**1. Development Dependency Alert**\n• Package: `chokidar@3.5.1`\n• Severity: Low\n• Issue: Minor path traversal in development mode\n• Impact: Development environment only\n• Fix: Update to chokidar@3.5.3\n\n**2. Documentation Security**\n• Location: docs/src/pages/guides/\n• Issue: Some code examples lack input validation\n• Impact: Could mislead developers\n• Recommendation: Add security notes to examples\n\n### 🏆 Best Practices Observed\n• Comprehensive input sanitization\n• Safe CSS class name generation\n• Proper error handling\n• Regular dependency updates\n• Security-focused code reviews\n\n**Recommendation:** Excellent security posture. Minor updates suggested for development dependencies.",
            timestamp: "2024-09-13T11:47:34Z",
            type: "text"
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
              {/* Chat Header - Compact */}
              <div className="flex-shrink-0 border-b border-border/30 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm">
                <div className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div>
                        <h2 className="font-medium text-foreground">Security Analysis Chat</h2>
                        <p className="text-xs text-muted-foreground">
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
                          className="text-muted-foreground hover:text-foreground h-8 px-3 text-xs"
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
                className="flex-1 min-h-0"
                isHistoricalLoad={isLoadingHistory}
              />
            </>
          ) : (
            <ChatContainer
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isEmpty={messages.length === 0}
              className="h-full"
              isHistoricalLoad={isLoadingHistory}
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
