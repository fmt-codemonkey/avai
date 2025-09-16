"use client";

import { create } from "zustand";

export interface WSMessage {
  type: 'analysis_request' | 'analysis_start' | 'log' | 'analysis_complete';
  prompt?: string;
  client_id?: string;
  analysis_id?: string;
  level?: 'info' | 'success' | 'error';
  message?: string;
  result?: {
    ai_response?: string;
    analysis_data?: Record<string, unknown>;
    [key: string]: unknown;
  };
  timestamp: string;
}

interface WebSocketState {
  // Connection state
  ws: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  lastError: string | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  
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
    
    // Don't connect if already connected or connecting
    if (state.isConnected || state.isConnecting) {
      return;
    }

    set({ 
      isConnecting: true, 
      lastError: null 
    });

    try {
      const ws = new WebSocket(url);
      
      // Set a shorter timeout to prevent hanging
      const connectionTimeout = setTimeout(() => {
        console.error('WebSocket connection timeout');
        try {
          ws.close();
        } catch (e) {
          console.error('Error closing WebSocket on timeout:', e);
        }
        set({ 
          ws: null,
          isConnected: false,
          isConnecting: false,
          lastError: 'Connection timeout - service may be unavailable',
          reconnectAttempts: state.reconnectAttempts + 1
        });
        // Don't auto-reconnect on timeout to prevent infinite hanging
      }, 5000); // Reduced to 5 seconds

      ws.onopen = () => {
        console.log('WebSocket connected');
        clearTimeout(connectionTimeout);
        clearReconnectTimeout();
        set({ 
          ws,
          isConnected: true, 
          isConnecting: false, 
          reconnectAttempts: 0,
          lastError: null 
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
        console.log('WebSocket disconnected:', event.code, event.reason);
        clearTimeout(connectionTimeout);
        
        const wasConnected = get().isConnected;
        
        set((state) => ({ 
          ws: null,
          isConnected: false, 
          isConnecting: false,
          reconnectAttempts: state.reconnectAttempts + 1,
          lastError: wasConnected ? 'Connection lost' : 'Failed to connect'
        }));

        // Only auto-reconnect if we were previously connected and it wasn't a manual disconnect
        if (event.code !== 1000 && wasConnected && get().reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          console.log('Scheduling reconnection...');
          scheduleReconnect();
        } else if (get().reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.log('Max reconnection attempts reached, giving up');
          set({ lastError: 'Unable to maintain connection - please refresh the page' });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        clearTimeout(connectionTimeout);
        
        set((state) => ({ 
          ws: null,
          isConnected: false,
          lastError: 'Connection error - check your internet connection',
          isConnecting: false,
          reconnectAttempts: state.reconnectAttempts + 1
        }));
        
        // Don't auto-reconnect on error to prevent error loops
        console.log('WebSocket error occurred, not auto-reconnecting');
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