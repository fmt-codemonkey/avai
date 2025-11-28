"use client";

import { useState, useEffect } from "react";
import LeftSidebar from "@/components/layout/LeftSidebar";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { Header } from "@/components/layout/Header";
import SecurityAuditModal from "@/components/audit/SecurityAuditModal";
import { useIntegratedChat } from "@/hooks/use-integrated-chat";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";

export default function AVAISinglePage() {
  const { isSignedIn } = useUser();
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(true); // Start collapsed for clean UI
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBookNowOverlay, setShowBookNowOverlay] = useState(false); // Control overlay visibility
  const [showAuditModal, setShowAuditModal] = useState(false); // Control audit modal visibility

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
    clearMessages,
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
  const handleSendMessage = async (content: string, files?: File[], repoUrl?: string) => {
    if (!content.trim() && !files?.length && !repoUrl) return;

    try {
      // Prepare the message with audit context
      let auditMessage = content.trim();
      
      // If files are uploaded, mention them in the message
      if (files && files.length > 0) {
        const fileNames = files.map(f => f.name).join(', ');
        auditMessage = `${auditMessage}\n\n📁 Files uploaded for security audit: ${fileNames}`;
        
        // TODO: Process files for security analysis
        console.log('Files to process:', files);
      }
      
      // If GitHub URL is detected, mention it
      if (repoUrl) {
        auditMessage = `${auditMessage}\n\n🔗 GitHub Repository: ${repoUrl}\n\nPlease perform a comprehensive security audit of this repository.`;
      }

      // Send message through integrated system (handles WebSocket + Supabase)
      console.log('🔄 Sending message:', auditMessage || "Please start a security audit.");
      const success = await sendMessage(auditMessage || "Please start a security audit.");
      if (!success) {
        console.error('❌ Failed to send message - check WebSocket connection');
      } else {
        console.log('✅ Message sent successfully');
      }
      // Don't automatically open right sidebar - user can open it manually if needed
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleNewChat = () => {
    try {
      // Open the security audit modal instead of just clearing messages
      setShowAuditModal(true);
      console.log('🔄 Opening security audit modal');
    } catch (error) {
      console.error('Error opening audit modal:', error);
    }
  };

  const handleStartAudit = async (auditPrompt: string, repositoryLink?: string) => {
    try {
      // Clear existing messages first
      clearMessages();
      
      // Send the audit message
      await handleSendMessage(auditPrompt, undefined, repositoryLink);
      console.log('🚀 Security audit started');
    } catch (error) {
      console.error('Error starting security audit:', error);
    }
  };

  const handleHomeClick = () => {
    try {
      // Static mode - directly clear messages without creating sessions
      clearMessages();
      setLeftSidebarCollapsed(true); // Close sidebar on mobile/small screens
      console.log('🏠 Returned to home page');
    } catch (error) {
      console.error('Error returning to home:', error);
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

  const handleCloseOverlay = () => {
    setShowBookNowOverlay(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black text-green-100 overflow-hidden relative">
      {/* Cybersecurity Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,0,0.03),transparent_50%)] pointer-events-none"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(0,255,0,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,0,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'grid-move 30s linear infinite'
      }}></div>
      {/* Desktop Header */}
      {!isMobile && (
        <Header 
          onMenuToggle={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
          isSidebarOpen={!leftSidebarCollapsed}
          onHomeClick={handleHomeClick}
        />
      )}
      
      {/* Cybersecurity Mobile Header */}
      {isMobile && (
        <header className="flex-shrink-0 flex items-center justify-between p-4 bg-gradient-to-r from-black/90 to-gray-900/90 backdrop-blur-md z-50 shadow-lg shadow-green-500/10 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden hover:bg-green-500/20 text-green-400 transition-colors border border-green-500/30"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleHomeClick}
            title="Return to Home"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shadow-lg">
              <Image
                src="/avai-logo.png"
                alt="AVAI Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent animate-pulse">
              AVAI
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Twitter button for mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('https://x.com/avai_canister', '_blank', 'noopener,noreferrer')}
              className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-current"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Button>
            {messages.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHomeClick}
                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-colors text-xs px-2"
                  title="New Audit"
                >
                  New
                </Button>

              </>
            )}
          </div>
        </header>
      )}

      {/* Layout Container */}
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Left Sidebar - Only show when signed in */}
        {isSignedIn && (
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
        )}

        {/* Mobile Overlay */}
        {isMobile && mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full bg-gradient-to-br from-black/70 to-gray-900/70 border-l border-r border-green-500/20 backdrop-blur-md overflow-hidden relative">
          <ChatContainer
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isThinking}
            isEmpty={messages.length === 0}
            currentThinkingStep={currentThinkingStep}
            onRetryConnection={handleRetryConnection}
            showBookNowOverlay={showBookNowOverlay}
            onCloseOverlay={handleCloseOverlay}
            className="h-full"
          />
        </div>

      </div>

      {/* Security Audit Modal */}
      <SecurityAuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        onStartAudit={handleStartAudit}
      />
    </div>
  );
}