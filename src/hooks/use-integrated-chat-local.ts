import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRealTimeMessages } from './use-real-time-messages';
import { useWebSocket } from './use-websocket';
import { useLocalChatHistory } from './use-local-chat-history';
import { useUser } from '@clerk/nextjs';

/**
 * Integrated chat hook that combines:
 * - Real-time WebSocket messaging
 * - Local storage session/history persistence (fallback while Supabase is being configured)
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

  // Local chat history (fallback while Supabase integration is being configured)
  const {
    sessions,
    currentSession,
    messages: persistedMessages,
    isLoading: isHistoryLoading,
    createSession,
    addMessage: addPersistedMessage,
    switchToSession: switchToSessionLocal,
    deleteSession,
    updateSessionTitle,
  } = useLocalChatHistory();

  // Start a new chat session
  const startNewChat = useCallback(async () => {
    const session = await createSession('New Chat');
    if (session) {
      clearRealtimeMessages(); // Clear real-time messages
    }
    return session;
  }, [createSession, clearRealtimeMessages]);

  // Switch to an existing session
  const switchToSession = useCallback(async (sessionId: number) => {
    await switchToSessionLocal(sessionId);
    clearRealtimeMessages(); // Clear real-time messages when switching
  }, [switchToSessionLocal, clearRealtimeMessages]);

  // Send a message (handles both real-time and persistence)
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return false;

    setIsProcessing(true);

    try {
      // 1. Ensure we have a session
      let session = currentSession;
      if (!session && isSignedIn) {
        console.log('📝 Creating new session for first message');
        session = await createSession('New Chat');
        if (!session) {
          console.error('Failed to create session');
          return false;
        }
        console.log('✅ New session created:', session);
      }

      // 2. Add user message to real-time chat
      addRealtimeUserMessage(content);

      // 3. Save user message to persistent storage and update session title if needed
      if (session && isSignedIn) {
        console.log('💾 Saving user message to local storage:', { sessionId: session.id, content });
        await addPersistedMessage(content, 'user');
        
        // Update session title with first message if it's still "New Chat"
        if (session.title === 'New Chat') {
          const shortTitle = content.length > 50 ? content.substring(0, 50) + '...' : content;
          await updateSessionTitle(session.id, shortTitle);
          console.log('📝 Updated session title:', shortTitle);
        }
      }

      // 4. Send analysis request via WebSocket
      const success = await sendAnalysisRequest(content);
      if (!success) {
        console.error('Failed to send analysis request');
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
    isSignedIn,
    createSession,
    addRealtimeUserMessage,
    addPersistedMessage,
    sendAnalysisRequest,
    updateSessionTitle,
  ]);

  // Combined messages from both real-time and persisted sources
  const allMessages = useMemo(() => {
    if (!isSignedIn) {
      // If not authenticated, only show real-time messages
      return realtimeMessages;
    }

    // Combine persisted and real-time messages, avoiding duplicates
    const persistedSet = new Set(persistedMessages.map(m => `${m.content}_${m.sender}`));
    
    const combined = [
      // Add all persisted messages
      ...persistedMessages.map(m => ({
        id: m.id.toString(),
        content: m.content,
        sender: m.sender as 'user' | 'ai',
        timestamp: new Date(m.created_at).toISOString(),
        type: 'persisted' as const
      })),
      // Add real-time messages that aren't already persisted
      ...realtimeMessages.filter(m => !persistedSet.has(`${m.content}_${m.sender}`))
    ];

    // Sort by timestamp (convert string timestamps to dates for comparison)
    return combined.sort((a, b) => {
      const timestampA = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : a.timestamp;
      const timestampB = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : b.timestamp;
      return timestampA - timestampB;
    });
  }, [isSignedIn, persistedMessages, realtimeMessages]);

  // Track processed AI messages to avoid duplicate saves
  const processedAIMessages = useRef(new Set<string>());

  // Save AI response to persistent storage when it arrives
  const saveAIResponse = useCallback(async (response: string) => {
    if (currentSession && isSignedIn) {
      await addPersistedMessage(response, 'ai');
    }
  }, [currentSession, isSignedIn, addPersistedMessage]);

  // Auto-save AI responses to local storage when they arrive via WebSocket
  useEffect(() => {
    if (!currentSession || !isSignedIn) return;

    // Check for new AI messages in real-time messages
    const newAIMessages = realtimeMessages.filter(
      msg => msg.sender === 'ai' && !processedAIMessages.current.has(msg.id)
    );

    // Save new AI messages to local storage
    newAIMessages.forEach(async (msg) => {
      processedAIMessages.current.add(msg.id);
      console.log('🔄 Auto-saving AI response to local storage:', msg.content);
      await addPersistedMessage(msg.content.toString(), 'ai');
    });

  }, [realtimeMessages, currentSession, isSignedIn, addPersistedMessage]);

  return {
    // Messages and state
    messages: allMessages,
    isThinking,
    currentThinkingStep,
    isProcessing,
    isConnected,
    isHistoryLoading,

    // Session management
    sessions,
    currentSession,
    startNewChat,
    switchToSession,
    deleteSession,
    updateSessionTitle,

    // Messaging
    sendMessage,
    clearRealtimeMessages,
    handleRetryConnection,
    saveAIResponse,

    // Authentication
    isAuthenticated: isSignedIn,
  };
}