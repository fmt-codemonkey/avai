import { create } from "zustand";

export interface WSMessage {
  type: 'analysis_request' | 'analysis_start' | 'log' | 'analysis_complete' | 'response' | 'authenticate' | 'heartbeat' | 'auth_success' | 'auth_error';
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
  // New response format
  response?: {
    final_result?: {
      success: boolean;
      response: string;
      confidence?: number;
    };
  };
  session_id?: string;
  processing_time?: number;
  timestamp: string;
  
  // Authentication fields
  token?: string | null;
  userId?: string;
  anonymous?: boolean;
  success?: boolean;
  error?: string;
}

interface WebSocketState {
  // Connection state
  ws: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  isAuthenticated: boolean;
  lastError: string | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  
  // Authentication state
  currentUserId: string | null;
  
  // Graceful degradation
  isOfflineMode: boolean;
  appStillFunctional: boolean;
  
  // Message handling
  lastMessage: WSMessage | null;
  messageHistory: WSMessage[];
  
  // Actions
  connect: (url: string, authToken?: string | null, userId?: string) => void;
  disconnect: () => void;
  sendMessage: (message: WSMessage) => boolean;
  subscribe: (callback: (message: WSMessage) => void) => () => void;
  reset: () => void;
}

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

  const scheduleReconnect = (url: string, authToken?: string | null, userId?: string) => {
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
      connect(url, authToken, userId);
    }, delay);
  };

  const connect = (url: string, authToken?: string | null, userId?: string) => {
    const state = get();
    
    // Don't connect if already connected or connecting
    if (state.isConnected || state.isConnecting) {
      console.log('WebSocket: Already connected or connecting, skipping');
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

    // Build WebSocket URL with auth token as query parameter
    let wsUrl = url;
    if (authToken) {
      const separator = url.includes('?') ? '&' : '?';
      wsUrl = `${url}${separator}token=${encodeURIComponent(authToken)}`;
      if (userId) {
        wsUrl += `&userId=${encodeURIComponent(userId)}`;
      }
    }

    console.log('WebSocket: Attempting to connect to:', url.replace(/token=[^&]+/, 'token=***'));
    set({ 
      isConnecting: true, 
      lastError: null,
      ws: null,
      isAuthenticated: false,
      currentUserId: userId || null
    });

    try {
      const ws = new WebSocket(wsUrl);
      console.log('WebSocket: Created WebSocket instance');
      
      // Set a connection timeout
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
      }, 10000); // 10 second timeout

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
          
          // Handle authentication responses
          if (message.type === 'auth_success') {
            console.log('✅ WebSocket authentication successful');
            set({ isAuthenticated: true });
          } else if (message.type === 'auth_error') {
            console.error('❌ WebSocket authentication failed:', message.error);
            set({ 
              isAuthenticated: false,
              lastError: `Authentication failed: ${message.error}` 
            });
          }
          
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
          url: url // Don't log the full URL with token
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
        } else if (event.code === 1013) {
          errorMessage = 'Authentication failed or IP blocked';
        } else if (wasConnected) {
          errorMessage = 'Connection lost';
        }
        
        set((state) => ({ 
          ws: null,
          isConnected: false, 
          isConnecting: false,
          isAuthenticated: false,
          reconnectAttempts: state.reconnectAttempts + 1,
          lastError: errorMessage
        }));

        // Only auto-reconnect if we were previously connected and it wasn't a manual disconnect
        if (event.code !== 1000 && event.code !== 1001 && wasConnected && get().reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          console.log('Scheduling reconnection...');
          scheduleReconnect(url, authToken, userId);
        } else if (get().reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.log('Max reconnection attempts reached, giving up');
          set({ lastError: `Unable to connect after ${MAX_RECONNECT_ATTEMPTS} attempts - server may be down` });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error details:', {
          error,
          url: url, // Don't log token
          readyState: ws.readyState,
          timestamp: new Date().toISOString()
        });
        clearTimeout(connectionTimeout);
        
        set((state) => ({ 
          ws: null,
          isConnected: false,
          isAuthenticated: false,
          lastError: `Connection error to ${url} - server may be unavailable or overloaded`,
          isConnecting: false,
          reconnectAttempts: state.reconnectAttempts + 1
        }));
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      set((state) => ({ 
        ws: null,
        isConnected: false,
        isAuthenticated: false,
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
      isAuthenticated: false,
      currentUserId: null,
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

    // For non-auth messages, check if we're authenticated
    if (message.type !== 'authenticate' && !state.isAuthenticated && state.currentUserId) {
      console.error('WebSocket not authenticated - cannot send message');
      set({ lastError: 'Not authenticated - message not sent' });
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
        isAuthenticated: false,
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
      reconnectAttempts: 0,
      isAuthenticated: false,
      currentUserId: null
    });
  };

  return {
    // Initial state
    ws: null,
    isConnected: false,
    isConnecting: false,
    isAuthenticated: false,
    currentUserId: null,
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