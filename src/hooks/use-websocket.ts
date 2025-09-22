

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
    console.log('🚀 Initial WebSocket connection attempt...');
    
    try {
      connect(WS_URL);
    } catch (error) {
      console.warn('Initial WebSocket connection failed (non-critical):', error);
    }
  }, [connect]); // Runs once on mount

  // Only disconnect when user signs out
  useEffect(() => {
    if (!isSignedIn && isConnected) {
      console.log('User signed out, disconnecting WebSocket...');
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
      console.log('📤 Processing queued messages:', messageQueue.current.length);
      const messages = [...messageQueue.current];
      messageQueue.current = [];
      
      messages.forEach(message => {
        console.log('📤 Sending queued message:', message);
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
      console.log('Manually connecting to WebSocket...');
      connect(WS_URL);
    }
  }, [isConnected, isConnecting, connect]);

  // Manual disconnect function
  const manualDisconnect = useCallback(() => {
    if (isConnected) {
      console.log('Manually disconnecting from WebSocket...');
      disconnect();
    }
  }, [isConnected, disconnect]);

  // Send analysis request with lazy connection and message queuing
  const sendAnalysisRequest = useCallback(
    (prompt: string): boolean => {
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
          session_id: clientId, // Same session ID for all messages from this client
          user_id: user?.id || null,
          is_anonymous: !user
        }
      };

      // If connected, send immediately
      if (isConnected) {
        console.log('📤 Sending analysis request immediately:', message);
        return sendMessage(message);
      }

      // If not connected, start connection and queue message
      if (!isConnecting) {
        console.log('🔗 Starting WebSocket connection and queuing message...');
        messageQueue.current.push(message);
        connect(WS_URL);
        return true; // Return true because message is queued
      }

      // If connecting, queue message
      console.log('📥 Queuing message until connection completes...');
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