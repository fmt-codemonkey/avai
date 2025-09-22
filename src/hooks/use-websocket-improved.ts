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

  // Auto-connect when user is authenticated (optional)
  useEffect(() => {
    if (autoConnect && isSignedIn && user && !isConnected && !isConnecting) {
      console.log('User authenticated, auto-connecting to WebSocket...');
      connectWithAuth();
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
  }, [autoConnect, isSignedIn, user, isConnected, isConnecting]);

  // Enhanced connect function that includes auth in the connection
  const connectWithAuth = useCallback(async () => {
    if (isConnected || isConnecting) {
      console.log('WebSocket: Already connected or connecting, skipping');
      return;
    }

    try {
      let authToken = null;
      
      if (isSignedIn && user) {
        // Get Clerk JWT token for authentication
        authToken = await getToken();
        console.log('🔐 Connecting with Clerk token for user:', user.id);
      } else {
        console.log('🔐 Connecting anonymously');
      }

      // Connect with authentication token
      connect(WS_URL, authToken, user?.id);
      
    } catch (error) {
      console.error('❌ Connection with auth error:', error);
    }
  }, [isConnected, isConnecting, isSignedIn, user, getToken, connect]);

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
      connectWithAuth();
    }
  }, [isConnected, isConnecting, connectWithAuth]);

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