"use client";

import { useCallback } from 'react';

interface WebSocketError {
  type: 'network_offline' | 'server_error' | 'timeout' | 'rate_limit' | 'unknown';
  message: string;
  code?: number;
  timestamp: string;
}

interface ProfessionalErrorResponse {
  message: string;
  canRetry: boolean;
  action: 'wait_for_network' | 'auto_retry' | 'fallback_mode' | 'wait_and_retry' | 'general_retry';
}

export function useProfessionalErrorHandler() {
  
  // Log technical details for debugging (while showing friendly messages to users)
  const logError = useCallback((type: string, details: Record<string, unknown>) => {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error(`[AVAI Error Logger] ${type}:`, details);
    }
    
    // In production, you would send this to your logging service
    // Example: sendToLoggingService({ type, details, timestamp: new Date().toISOString() });
  }, []);

  const getProfessionalErrorResponse = useCallback((error: WebSocketError): ProfessionalErrorResponse => {
    const responses: Record<WebSocketError['type'], ProfessionalErrorResponse> = {
      network_offline: {
        message: "It looks like you're offline. I'll automatically reconnect when your internet is back!",
        canRetry: false,
        action: 'wait_for_network'
      },
      server_error: {
        message: "I'm experiencing a temporary service interruption. Let me try to reconnect...",
        canRetry: true,
        action: 'auto_retry'
      },
      timeout: {
        message: "The connection is taking longer than usual. Switching to backup mode...",
        canRetry: false,
        action: 'fallback_mode'
      },
      rate_limit: {
        message: "I'm receiving a lot of requests right now. Please wait a moment before trying again.",
        canRetry: true,
        action: 'wait_and_retry'
      },
      unknown: {
        message: "I encountered an unexpected issue but I'm working to resolve it. Please bear with me!",
        canRetry: true,
        action: 'general_retry'
      }
    };
    
    return responses[error.type] || responses.unknown;
  }, []);

  const classifyError = useCallback((errorEvent: Event | CloseEvent | ErrorEvent): WebSocketError => {
    const timestamp = new Date().toISOString();
    
    // Check if it's a CloseEvent
    if ('code' in errorEvent) {
      const closeEvent = errorEvent as CloseEvent;
      
      switch (closeEvent.code) {
        case 1000: // Normal closure
        case 1001: // Going away
          return {
            type: 'network_offline',
            message: 'Connection closed normally',
            code: closeEvent.code,
            timestamp
          };
        case 1006: // Abnormal closure (no close frame)
          return {
            type: 'network_offline',
            message: 'Network connection lost',
            code: closeEvent.code,
            timestamp
          };
        case 1011: // Server error
          return {
            type: 'server_error',
            message: 'Server encountered an error',
            code: closeEvent.code,
            timestamp
          };
        case 1013: // Try again later
          return {
            type: 'rate_limit',
            message: 'Service temporarily overloaded',
            code: closeEvent.code,
            timestamp
          };
        default:
          return {
            type: 'unknown',
            message: `Connection closed with code ${closeEvent.code}`,
            code: closeEvent.code,
            timestamp
          };
      }
    }
    
    // Check if it's an ErrorEvent
    if ('error' in errorEvent) {
      return {
        type: 'server_error',
        message: 'WebSocket error occurred',
        timestamp
      };
    }
    
    // Default unknown error
    return {
      type: 'unknown',
      message: 'Unknown connection error',
      timestamp
    };
  }, []);

  const handleError = useCallback((errorEvent: Event | CloseEvent | ErrorEvent, addMessage?: (eventType: string) => void) => {
    // Classify the error
    const error = classifyError(errorEvent);
    
    // Log technical details for debugging
    logError('websocket_error', {
      type: error.type,
      message: error.message,
      code: error.code,
      timestamp: error.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
      connectionTime: Date.now()
    });
    
    // Get professional response for user
    const professionalResponse = getProfessionalErrorResponse(error);
    
    // Map error type to event type for messaging system
    const eventTypeMap: Record<WebSocketError['type'], string> = {
      network_offline: 'offline_mode',
      server_error: 'server_unavailable',
      timeout: 'timeout_error',
      rate_limit: 'circuit_breaker',
      unknown: 'connection_failed'
    };
    
    const eventType = eventTypeMap[error.type];
    
    // Add professional message if callback provided
    if (addMessage) {
      addMessage(eventType);
    }
    
    return {
      error,
      professionalResponse,
      eventType
    };
  }, [classifyError, logError, getProfessionalErrorResponse]);

  const handleNetworkChange = useCallback((isOnline: boolean, addMessage?: (eventType: string) => void) => {
    if (isOnline) {
      logError('network_restored', {
        timestamp: new Date().toISOString(),
        wasOffline: !navigator.onLine
      });
      
      if (addMessage) {
        addMessage('connection_restored');
      }
    } else {
      logError('network_lost', {
        timestamp: new Date().toISOString()
      });
      
      if (addMessage) {
        addMessage('offline_mode');
      }
    }
  }, [logError]);

  const createTimeoutError = useCallback((): WebSocketError => {
    return {
      type: 'timeout',
      message: 'Connection timeout',
      timestamp: new Date().toISOString()
    };
  }, []);

  const createRateLimitError = useCallback((): WebSocketError => {
    return {
      type: 'rate_limit',
      message: 'Too many requests',
      timestamp: new Date().toISOString()
    };
  }, []);

  return {
    handleError,
    handleNetworkChange,
    classifyError,
    getProfessionalErrorResponse,
    createTimeoutError,
    createRateLimitError,
    logError
  };
}