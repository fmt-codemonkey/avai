/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRealTimeMessages } from './use-real-time-messages';
import { useWebSocket } from './use-websocket';
import { useChatHistory } from './use-chat-history';
import { useUser } from '@clerk/nextjs';

/**
 * Integrated chat hook that combines:
 * - Real-time WebSocket messaging
 * - Supabase session/history persistence (with fallback to localStorage on auth errors)
 * - Seamless user experience
 */
export function useIntegratedChat() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { isSignedIn } = useUser();

  // Real-time messaging (WebSocket)
  const {
    messages: realtimeMessages,
    isThinking,
    currentThinkingStep,
    clearMessages: clearRealtimeMessages,
    addUserMessage: addRealtimeUserMessage,
    handleRetryConnection,
  } = useRealTimeMessages();

  // WebSocket connection
  const { sendAnalysisRequest, isConnected } = useWebSocket();

  // Supabase chat history
  const {
    sessions,
    currentSession,
    setCurrentSession,
    createSession,
    updateSessionTitle,
    deleteSession,
    messages: persistedMessages,
    saveMessage,
    loadMessages,
    isLoading: isHistoryLoading,
    isAuthenticated,
  } = useChatHistory();

  // Track processed AI messages to avoid duplicate saves
  const processedAIMessages = useRef(new Set<string>());

  // Start a new chat session
  const startNewChat = useCallback(async () => {
    const session = await createSession();
    if (session) {
      clearRealtimeMessages(); // Clear real-time messages
      setCurrentSession(session);
    }
    return session;
  }, [createSession, clearRealtimeMessages, setCurrentSession]);

  // Switch to an existing session
  const switchToSession = useCallback(async (sessionId: number) => {
    const session = sessions.find((s: any) => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      clearRealtimeMessages(); // Clear real-time messages
      await loadMessages(sessionId); // Load persisted messages
    }
  }, [sessions, setCurrentSession, clearRealtimeMessages, loadMessages]);

  // Send a message (handles both real-time and persistence)
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return false;

    setIsProcessing(true);

    try {
      // 1. Ensure we have a session
      let session = currentSession;
      if (!session && isAuthenticated) {
        session = await createSession();
        if (!session) {
          console.error('Failed to create session');
          return false;
        }
      }

      // 2. Add user message to real-time state immediately
      addRealtimeUserMessage(content);

      // 3. Save user message to Supabase (if authenticated)
      if (session && isAuthenticated) {
        console.log('💾 Saving user message to Supabase:', { sessionId: session.id, content });
        await saveMessage(content, 'user');
        
        // Auto-generate session title from first message (check title instead of message count)
        if (session.title === 'New Chat') {
          const title = content.length > 30 
            ? content.substring(0, 30) + '...' 
            : content;
          await updateSessionTitle(session.id, title);
          console.log('📝 Updated session title:', title);
        }
      }

      // 4. Send to WebSocket for AI processing
      const success = await sendAnalysisRequest(content);
      
      if (!success) {
        console.error('Failed to send message via WebSocket');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [
    currentSession,
    isAuthenticated,
    createSession,
    addRealtimeUserMessage,
    saveMessage,
    updateSessionTitle,
    sendAnalysisRequest
  ]);

  // Auto-save AI responses to Supabase when they arrive via WebSocket
  useEffect(() => {
    if (!currentSession || !isAuthenticated) return;

    // Check for new AI messages in real-time messages
    const newAIMessages = realtimeMessages.filter(
      msg => msg.sender === 'ai' && !processedAIMessages.current.has(msg.id)
    );

    // Save new AI messages to Supabase
    newAIMessages.forEach(async (msg) => {
      processedAIMessages.current.add(msg.id);
      console.log('🔄 Auto-saving AI response to Supabase:', msg.content);
      try {
        await saveMessage(msg.content.toString(), 'ai');
      } catch (error) {
        console.error('Failed to save AI response to Supabase:', error);
      }
    });

  }, [realtimeMessages, currentSession, isAuthenticated, saveMessage]);

  // Get combined messages (persisted + real-time) - memoized to prevent infinite re-renders
  const allMessages = useMemo(() => {
    if (!isAuthenticated) {
      // For anonymous users, only show real-time messages
      return realtimeMessages;
    }

    // For authenticated users, combine persisted and real-time
    const persistedSet = new Set(persistedMessages.map((m: any) => `${m.content}_${m.sender}`));
    const newRealtimeMessages = realtimeMessages.filter(m => 
      !persistedSet.has(`${m.content}_${m.sender}`)
    );

    return [
      ...persistedMessages.map((m: any) => ({
        id: m.id.toString(),
        content: m.content,
        sender: m.sender as 'user' | 'ai',
        timestamp: m.created_at,
        type: 'text' as const,
      })),
      ...newRealtimeMessages.map(m => ({
        ...m,
      }))
    ].sort((a, b) => {
      const timestampA = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp;
      const timestampB = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp;
      return timestampA - timestampB;
    });
  }, [isAuthenticated, persistedMessages, realtimeMessages]);

  // Save AI response when it arrives (triggered by real-time messages hook)
  const handleAIResponse = useCallback(async (response: string) => {
    if (currentSession && isAuthenticated) {
      await saveMessage(response, 'ai');
    }
  }, [currentSession, isAuthenticated, saveMessage]);

  return {
    // Session management
    sessions,
    currentSession,
    startNewChat,
    switchToSession,
    updateSessionTitle,
    deleteSession,
    
    // Messaging
    messages: allMessages,
    sendMessage,
    isProcessing,
    isThinking,
    currentThinkingStep,
    
    // Connection state
    isConnected,
    isHistoryLoading,
    isAuthenticated,
    
    // Actions
    handleRetryConnection,
    handleAIResponse,
  };
}