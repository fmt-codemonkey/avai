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

  // Send a message (static mode - no external connections)
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return false;

    setIsProcessing(true);

    try {
      console.log('🔄 Sending message in static mode:', content);

      // Add user message to real-time state immediately (this triggers static response)
      addRealtimeUserMessage(content);

      console.log('✅ Message sent successfully (static mode)');
      return true;

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

  // Static mode - no auto-save to Supabase needed

  // Static mode - only use real-time messages
  const allMessages = useMemo(() => {
    return realtimeMessages;
  }, [realtimeMessages]);

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
    clearMessages: clearRealtimeMessages, // Expose clear function for static mode
  };
}