"use client";

import { useEffect, useCallback, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useWebSocketStore, WSMessage } from '@/stores/websocket-store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://avai-backend.onrender.com/ws';

export function useWebSocket(autoConnect: boolean = false) {
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

  // Send authentication message after WebSocket connection
  const authenticate = useCallback(async () => {
    if (!isConnected || hasAuthenticated.current) return;

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
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
    }
  }, [isConnected, isSignedIn, user, getToken, sendMessage]);

  // Auto-connect when user is authenticated (optional)
  useEffect(() => {
    if (autoConnect && isSignedIn && user && !isConnected && !isConnecting) {
      console.log('User authenticated, auto-connecting to WebSocket...');
      connect(WS_URL);
    } else if (!isSignedIn && isConnected) {
      console.log('User not authenticated, disconnecting WebSocket...');
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      if (!isSignedIn) {
        disconnect();
      }
    };
  }, [autoConnect, isSignedIn, user, isConnected, isConnecting, connect, disconnect]);

  // Authenticate after connection is established
  useEffect(() => {
    if (isConnected && !hasAuthenticated.current) {
      console.log('🔗 WebSocket connected, sending authentication...');
      authenticate();
    }
    
    // Reset authentication flag when disconnected
    if (!isConnected) {
      hasAuthenticated.current = false;
    }
  }, [isConnected, authenticate]);

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

  // Send analysis request with error handling
  const sendAnalysisRequest = useCallback(
    (prompt: string): boolean => {
      if (!user) {
        console.error('User not authenticated');
        return false;
      }

      if (!isConnected) {
        console.error('WebSocket not connected');
        return false;
      }

      const message: WSMessage = {
        type: 'analysis_request',
        prompt,
        client_id: `avai_user_${user.id}`,
        timestamp: new Date().toISOString(),
      };

      console.log('Sending analysis request:', message);
      const success = sendMessage(message);
      return success;
    },
    [user, isConnected, sendMessage]
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