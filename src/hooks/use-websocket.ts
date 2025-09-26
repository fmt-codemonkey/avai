

import { useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useWebSocketStore, WSMessage } from '@/stores/websocket-store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://websocket.avai.life/ws';

export function useWebSocket() {
  const { user, isSignedIn } = useUser();
  const {
    isConnected,
    isConnecting,
    lastError,
    reconnectAttempts,
    connect,
    disconnect,
    sendMessage,
    subscribe,
  } = useWebSocketStore();
  
  const messageQueue = useRef<WSMessage[]>([]);
  
  // Generate persistent client ID using Clerk user ID when available
  const persistentClientId = useRef<string>('');
  
  // Initialize client ID using Clerk user data
  useEffect(() => {
    if (user?.id && !persistentClientId.current.includes(user.id)) {
      // Use Clerk user ID for authenticated users (persistent across sessions)
      persistentClientId.current = `avai_user_${user.id}`;
      console.log('🆔 Using Clerk user ID as client ID:', persistentClientId.current);
    } else if (!user && !persistentClientId.current) {
      // Generate anonymous ID for non-authenticated users (session-persistent)
      persistentClientId.current = `anon_${Math.random().toString(36).substr(2, 12)}`;
      console.log('🆔 Generated anonymous client ID:', persistentClientId.current);
    }
  }, [user]);

  // Auto-connect immediately when page loads (but don't show connection messages in UI)
  useEffect(() => {
    
    // Add a small delay to ensure Zustand store is fully initialized
    const timer = setTimeout(() => {
      try {
        connect(WS_URL);
      } catch (error) {
        console.error('❌ Initial WebSocket connection failed:', error);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [connect]); // Runs once on mount

  // Only disconnect when user signs out
  useEffect(() => {
    if (!isSignedIn && isConnected) {
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      if (!isSignedIn) {
        disconnect();
      }
    };
  }, [isSignedIn, isConnected, disconnect]);

  // Process queued messages when connected
  const processQueuedMessages = useCallback(() => {
    if (isConnected && messageQueue.current.length > 0) {
      const messages = [...messageQueue.current];
      messageQueue.current = [];
      
      messages.forEach(message => {
        sendMessage(message);
      });
    }
  }, [isConnected, sendMessage]);

  // Process queued messages when connected
  useEffect(() => {
    if (isConnected) {
      processQueuedMessages();
    }
  }, [isConnected, processQueuedMessages]);

  // Subscribe to messages with callback
  const subscribeToMessages = useCallback(
    (callback: (message: WSMessage) => void) => {
      return subscribe(callback);
    },
    [subscribe]
  );

  // Manual connect function
  const manualConnect = useCallback(() => {
    if (!isConnected && !isConnecting) {
      connect(WS_URL);
    }
  }, [isConnected, isConnecting, connect]);

  // Manual disconnect function
  const manualDisconnect = useCallback(() => {
    if (isConnected) {
      disconnect();
    }
  }, [isConnected, disconnect]);

  // Send analysis request with lazy connection and message queuing
  const sendAnalysisRequest = useCallback(
    (prompt: string, sessionId?: number): boolean => {
      // Use Clerk-based persistent client ID (same for entire session)
      const clientId = persistentClientId.current;
      
      if (!clientId) {
        console.error('No client ID available - cannot send message');
        return false;
      }
      
      const message: WSMessage = {
        type: 'analysis_request',
        prompt,
        client_id: clientId,
        session_data: {
          session_id: sessionId ? `supabase_${sessionId}` : clientId, // Use Supabase session ID when available
          user_id: user?.id || null,
          is_anonymous: !user,
          supabase_session_id: sessionId // Track the actual Supabase session ID
        }
      };

      // If connected, send immediately
      if (isConnected) {
        return sendMessage(message);
      }

      // If not connected, start connection and queue message
      if (!isConnecting) {
        messageQueue.current.push(message);
        connect(WS_URL);
        return true; // Return true because message is queued
      }

      // If connecting, queue message
      messageQueue.current.push(message);
      return true; // Return true because message is queued
    },
    [user, isConnected, isConnecting, connect, sendMessage, persistentClientId]
  );

  return {
    isConnected,
    isConnecting,
    lastError,
    reconnectAttempts,
    connect: manualConnect,
    disconnect: manualDisconnect,
    sendAnalysisRequest,
    subscribeToMessages,
  };
}