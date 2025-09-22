

import { useEffect, useCallback, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useWebSocketStore, WSMessage } from '@/stores/websocket-store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://websocket.avai.life/ws';

export function useWebSocket() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
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
  
  const hasAuthenticated = useRef(false);
  const isAuthenticating = useRef(false);
  const messageQueue = useRef<WSMessage[]>([]);
  const hasTriedInitialConnection = useRef(false);

  // Send authentication message after WebSocket connection
  const authenticate = useCallback(async () => {
    if (!isConnected || hasAuthenticated.current || isAuthenticating.current) {
      return;
    }

    // Set authenticating flag to prevent duplicate calls
    isAuthenticating.current = true;
    console.log('🔗 WebSocket connected, sending authentication...');

    try {
      let authMessage;
      
      if (isSignedIn && user) {
        // Get Clerk JWT token and send it
        const token = await getToken();
        authMessage = {
          type: 'authenticate',
          token: token,
          userId: user.id,
          anonymous: false,
          timestamp: new Date().toISOString()
        };
        console.log('🔐 Authenticating with Clerk token for user:', user.id);
      } else {
        // Fallback to anonymous
        authMessage = {
          type: 'authenticate', 
          anonymous: true,
          timestamp: new Date().toISOString()
        };
        console.log('🔐 Authenticating anonymously');
      }

      const success = sendMessage(authMessage as WSMessage);
      if (success) {
        hasAuthenticated.current = true;
        console.log('✅ Authentication message sent successfully');
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
    } finally {
      isAuthenticating.current = false;
    }
  }, [isConnected, isSignedIn, user, getToken, sendMessage]);

  // Auto-connect only once on mount (like Claude/ChatGPT)
  useEffect(() => {
    if (!hasTriedInitialConnection.current) {
      hasTriedInitialConnection.current = true;
      console.log('🚀 Initial WebSocket connection attempt...');
      
      try {
        connect(WS_URL);
      } catch (error) {
        console.warn('Initial WebSocket connection failed (non-critical):', error);
      }
    }
  }, [connect]); // Only include connect, runs once on mount

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

  // Process queued messages when connected and authenticated
  const processQueuedMessages = useCallback(() => {
    if (isConnected && hasAuthenticated.current && messageQueue.current.length > 0) {
      console.log('📤 Processing queued messages:', messageQueue.current.length);
      const messages = [...messageQueue.current];
      messageQueue.current = [];
      
      messages.forEach(message => {
        console.log('📤 Sending queued message:', message);
        sendMessage(message);
      });
    }
  }, [isConnected, sendMessage]);

  // Authenticate after connection is established
  useEffect(() => {
    if (isConnected && !hasAuthenticated.current && !isAuthenticating.current) {
      // Small delay to ensure connection is stable
      const authTimeout = setTimeout(() => {
        authenticate();
      }, 100);
      
      return () => clearTimeout(authTimeout);
    }
    
    // Reset authentication flags when disconnected
    if (!isConnected) {
      hasAuthenticated.current = false;
      isAuthenticating.current = false;
    }
  }, [isConnected, authenticate]);

  // Process queued messages after authentication
  useEffect(() => {
    if (isConnected && hasAuthenticated.current) {
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
      // Generate client ID for anonymous or authenticated users
      const clientId = user ? `avai_user_${user.id}` : `anon_${Math.random().toString(36).substr(2, 12)}`;
      
      const message: WSMessage = {
        type: 'analysis_request',
        prompt,
        client_id: clientId,
        session_data: {
          session_id: clientId,
          user_id: user?.id || null,
          is_anonymous: !user
        }
      };

      // If connected and authenticated, send immediately
      if (isConnected && hasAuthenticated.current) {
        console.log('📤 Sending analysis request immediately:', message);
        return sendMessage(message);
      }

      // If not connected, start connection and queue message
      if (!isConnected && !isConnecting) {
        console.log('🔗 Starting WebSocket connection and queuing message...');
        messageQueue.current.push(message);
        connect(WS_URL);
        return true; // Return true because message is queued
      }

      // If connecting or connected but not authenticated, queue message
      if (!hasAuthenticated.current) {
        console.log('📥 Queuing message until authentication completes...');
        messageQueue.current.push(message);
        return true; // Return true because message is queued
      }

      // Fallback
      console.error('WebSocket not connected and unable to queue');
      return false;
    },
    [user, isConnected, isConnecting, connect, sendMessage]
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