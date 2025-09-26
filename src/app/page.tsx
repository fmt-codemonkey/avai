"use client";

import { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useIntegratedChat } from "@/hooks/use-integrated-chat";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function AVAISinglePage() {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use the integrated chat system (combines WebSocket + Supabase)
  const {
    sessions,
    currentSession,
    messages,
    sendMessage,
    isThinking,
    currentThinkingStep,
    startNewChat,
    switchToSession,
    isHistoryLoading,
    handleRetryConnection,
  } = useIntegratedChat();

  // Monitor messages for debugging if needed
  useEffect(() => {
    // Messages updated
  }, [messages]);

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

  // Enhanced message handling with integrated chat system
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      // Send message through integrated system (handles WebSocket + Supabase)
      const success = await sendMessage(content.trim());
      if (!success) {
        console.error('Failed to send message');
      }
      // Don't automatically open right sidebar - user can open it manually if needed
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleNewChat = async () => {
    try {
      await startNewChat();
      setRightSidebarOpen(false);
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    try {
      const sessionId = parseInt(chatId, 10);
      if (!isNaN(sessionId)) {
        await switchToSession(sessionId);
        // Don't automatically open right sidebar - let user open it manually
      }
    } catch (error) {
      console.error('Error switching to session:', error);
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
          currentChatId={currentSession?.id?.toString()}
          sessions={sessions}
          isLoading={isHistoryLoading}
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
          <ChatContainer
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isThinking}
            isEmpty={messages.length === 0}
            currentThinkingStep={currentThinkingStep}
            onRetryConnection={handleRetryConnection}
            className="h-full"
          />
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