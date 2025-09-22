"use client";

import { create } from "zustand";

export interface WSMessage {
  type: 'analysis_request' | 'analysis_start' | 'log' | 'analysis_complete' | 'response' | 'authenticate' | 'heartbeat';
  prompt?: string;
  client_id?: string;
  analysis_id?: string;
  level?: 'info' | 'success' | 'error';
  message?: string;
  
  // New backend response format
  status?: 'success' | 'error' | 'processing';
  response?: string; // JSON string containing the actual response
  request_id?: string;
  processing_time?: string;
  source?: string;
  timestamp?: string;
  
  // Session data for requests
  session_data?: {
    session_id: string;
    user_id: string | null;
    is_anonymous: boolean;
  };
  
  // Authentication fields
  token?: string | null;
  userId?: string;
  anonymous?: boolean;
}

interface WebSocketState {
  // Connection state
  ws: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  lastError: string | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  
  // Graceful degradation
  isOfflineMode: boolean;
  appStillFunctional: boolean;
  
  // Message handling
  lastMessage: WSMessage | null;
  messageHistory: WSMessage[];
  
  // Actions
  connect: (url: string) => void;
  disconnect: () => void;
  sendMessage: (message: WSMessage) => boolean;
  subscribe: (callback: (message: WSMessage) => void) => () => void;
  reset: () => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://websocket.avai.life/ws';
const MAX_MESSAGE_HISTORY = 50;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVALS = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff

export const useWebSocketStore = create<WebSocketState>((set, get) => {
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let subscribers: ((message: WSMessage) => void)[] = [];
  let circuitBreakerOpen = false;
  let circuitBreakerTimeout: NodeJS.Timeout | null = null;
  
  console.log('🏪 WebSocket store initialized');

  const clearReconnectTimeout = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  const scheduleReconnect = () => {
    const state = get();
    if (state.reconnectAttempts >= state.maxReconnectAttempts) {
      set({ 
        lastError: `Failed to connect after ${state.maxReconnectAttempts} attempts`,
        isConnecting: false 
      });
      return;
    }

    const delay = RECONNECT_INTERVALS[Math.min(state.reconnectAttempts, RECONNECT_INTERVALS.length - 1)];
    
    reconnectTimeout = setTimeout(() => {
      console.log(`Reconnecting... Attempt ${state.reconnectAttempts + 1}`);
      connect(WS_URL);
    }, delay);
  };

  const connect = (url: string) => {
    const state = get();
    
    console.log('🔌 WebSocket connect() called with URL:', url);
    console.log('🔌 Current state:', {
      isConnected: state.isConnected,
      isConnecting: state.isConnecting,
      reconnectAttempts: state.reconnectAttempts,
      circuitBreakerOpen
    });
    
    // Circuit breaker: Don't connect if too many failures
    if (circuitBreakerOpen) {
      console.log('🚫 Circuit breaker open - preventing connection attempts');
      set({ lastError: 'Connection blocked - too many failures. Please wait 30 seconds.' });
      return;
    }
    
    // Don't connect if already connected or connecting
    if (state.isConnected || state.isConnecting) {
      console.log('WebSocket: Already connected or connecting, skipping');
      return;
    }
    
    // Open circuit breaker if too many failed attempts
    if (state.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log('🔴 Opening circuit breaker - too many failed attempts');
      circuitBreakerOpen = true;
      
      // Reset circuit breaker after 30 seconds (like production apps)
      circuitBreakerTimeout = setTimeout(() => {
        console.log('🔄 Circuit breaker reset - allowing new connection attempts');
        circuitBreakerOpen = false;
        set({ reconnectAttempts: 0 });
      }, 30000);
      
      set({ lastError: 'Too many connection failures. Please wait 30 seconds.' });
      return;
    }

    // Close existing connection if any
    if (state.ws) {
      try {
        state.ws.close();
        console.log('Closed existing WebSocket connection');
      } catch {
        // Silently handle close errors
      }
    }

    console.log('WebSocket: Attempting to connect to:', url);
    set({ 
      isConnecting: true, 
      lastError: null,
      ws: null
    });

    try {
      console.log('🔌 Creating new WebSocket connection...');
      const ws = new WebSocket(url);
      console.log('🔌 WebSocket instance created, waiting for connection...');
      
      // Set a connection timeout to prevent hanging
      const connectionTimeout = setTimeout(() => {
        console.error('❌ WebSocket connection timeout after 10 seconds');
        try {
          ws.close();
        } catch (e) {
          console.error('Error closing WebSocket on timeout:', e);
        }
        set({ 
          ws: null,
          isConnected: false,
          isConnecting: false,
          lastError: 'Connection timeout - server may be unavailable or overloaded',
          reconnectAttempts: state.reconnectAttempts + 1
        });
        
        // Try reconnecting if not too many attempts
        if (state.reconnectAttempts + 1 < MAX_RECONNECT_ATTEMPTS) {
          console.log('🔄 Scheduling reconnect after timeout...');
          scheduleReconnect();
        }
      }, 10000); // Increased to 10 seconds for better reliability

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully!');
        console.log('🔌 Connection details:', {
          url,
          readyState: ws.readyState,
          protocol: ws.protocol,
          extensions: ws.extensions
        });
        
        clearTimeout(connectionTimeout);
        clearReconnectTimeout();
        
        // Reset circuit breaker on successful connection
        circuitBreakerOpen = false;
        if (circuitBreakerTimeout) {
          clearTimeout(circuitBreakerTimeout);
          circuitBreakerTimeout = null;
        }
        
        set({ 
          ws,
          isConnected: true, 
          isConnecting: false, 
          reconnectAttempts: 0,
          lastError: null,
          isOfflineMode: false,
          appStillFunctional: true
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          
          set((state) => ({
            lastMessage: message,
            messageHistory: [
              ...state.messageHistory.slice(-(MAX_MESSAGE_HISTORY - 1)),
              message
            ]
          }));

          // Notify all subscribers
          subscribers.forEach(callback => {
            try {
              callback(message);
            } catch (error) {
              console.error('Error in message subscriber:', error);
            }
          });
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', {
          code: event.code, 
          reason: event.reason,
          wasClean: event.wasClean,
          url: url
        });
        clearTimeout(connectionTimeout);
        
        const wasConnected = get().isConnected;
        
        // Provide more specific error messages based on close codes
        let errorMessage = 'Failed to connect';
        if (event.code === 1006) {
          errorMessage = 'Connection closed abnormally - server may be down or overloaded';
        } else if (event.code === 1002) {
          errorMessage = 'WebSocket protocol error';
        } else if (event.code === 1011) {
          errorMessage = 'Server error - backend may be unhealthy';
        } else if (wasConnected) {
          errorMessage = 'Connection lost';
        }
        
        set((state) => ({ 
          ws: null,
          isConnected: false, 
          isConnecting: false,
          reconnectAttempts: state.reconnectAttempts + 1,
          lastError: errorMessage
        }));

        // Only auto-reconnect if we were previously connected and it wasn't a manual disconnect
        if (event.code !== 1000 && event.code !== 1001 && wasConnected && get().reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          console.log('Scheduling reconnection...');
          scheduleReconnect();
        } else if (get().reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.log('Max reconnection attempts reached, giving up');
          set({ lastError: `Unable to connect after ${MAX_RECONNECT_ATTEMPTS} attempts - server may be down` });
        }
      };

      ws.onerror = (error) => {
        try {
          // Enhanced error logging for debugging
          const errorDetails = {
            url,
            readyState: ws?.readyState || 'unknown',
            timestamp: new Date().toISOString(),
            errorType: error?.type || 'unknown',
            errorMessage: 'WebSocket connection error',
            networkState: navigator?.onLine ? 'online' : 'offline'
          };
          
          console.error('❌ WebSocket connection error:', errorDetails);
          console.error('❌ Error event:', error);
          
          clearTimeout(connectionTimeout);
          
          // More detailed error messages based on ready state
          let errorMessage = 'Connection failed';
          if (ws?.readyState === WebSocket.CONNECTING) {
            errorMessage = 'Failed to establish connection - server may be down or unreachable';
          } else if (ws?.readyState === WebSocket.CLOSING) {
            errorMessage = 'Connection was interrupted during closing';
          } else if (ws?.readyState === WebSocket.CLOSED) {
            errorMessage = 'Connection was closed unexpectedly';
          }
          
          // Update state with detailed error information
          set((state) => ({ 
            ws: null,
            isConnected: false,
            lastError: errorMessage,
            isConnecting: false,
            reconnectAttempts: state.reconnectAttempts + 1,
            isOfflineMode: true,
            appStillFunctional: true
          }));
          
          // Try reconnecting if not too many attempts
          if (get().reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            console.log('🔄 Scheduling reconnect after error...');
            scheduleReconnect();
          }
          
          console.log('🔄 WebSocket error handled - app remains functional');
        } catch (handlingError) {
          // Fallback error handling to prevent complete crash 
          console.error('❌ Critical error in WebSocket error handler:', handlingError);
          set({
            ws: null,
            isConnected: false,
            lastError: 'Critical connection error',
            isConnecting: false,
            isOfflineMode: true,
            appStillFunctional: true
          });
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      set((state) => ({ 
        ws: null,
        isConnected: false,
        lastError: error instanceof Error ? error.message : 'WebSocket creation failed',
        isConnecting: false,
        reconnectAttempts: state.reconnectAttempts + 1
      }));
    }
  };

  const disconnect = () => {
    const state = get();
    clearReconnectTimeout();
    
    if (state.ws) {
      state.ws.close(1000, 'Manual disconnect');
    }
    
    set({ 
      ws: null,
      isConnected: false, 
      isConnecting: false,
      reconnectAttempts: 0 
    });
  };

  const sendMessage = (message: WSMessage) => {
    const state = get();
    
    if (!state.ws || !state.isConnected) {
      console.error('WebSocket not connected - cannot send message');
      set({ lastError: 'Not connected - message not sent' });
      return false;
    }

    try {
      const messageStr = JSON.stringify(message);
      state.ws.send(messageStr);
      console.log('Message sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown send error';
      set({ lastError: `Send failed: ${errorMsg}` });
      
      // If send fails, the connection might be broken
      set({ 
        isConnected: false,
        ws: null
      });
      return false;
    }
  };

  const subscribe = (callback: (message: WSMessage) => void) => {
    subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  };

  const reset = () => {
    disconnect();
    subscribers = [];
    set({
      lastMessage: null,
      messageHistory: [],
      lastError: null,
      reconnectAttempts: 0
    });
  };

  return {
    // Initial state
    ws: null,
    isConnected: false,
    isConnecting: false,
    lastError: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS,
    
    // Graceful degradation state
    isOfflineMode: false,
    appStillFunctional: true,
    
    // Message handling
    lastMessage: null,
    messageHistory: [],
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    subscribe,
    reset
  };
});