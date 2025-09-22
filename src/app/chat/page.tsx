"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { ChatContainer, type Message } from "@/components/chat/ChatContainer";


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);



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
