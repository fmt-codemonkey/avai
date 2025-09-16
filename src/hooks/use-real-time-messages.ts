"use client";

import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './use-websocket';
import { useProfessionalErrorHandler } from './use-professional-error-handler';
import { WSMessage } from '@/stores/websocket-store';

interface ProcessedMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'system';
  type: 'text' | 'error' | 'system';
  timestamp: string;
  metadata?: {
    isConnectionMessage?: boolean;
    eventType?: string;
    canRetry?: boolean;
  };
}

// Professional message mapping for all connection states
const professionalMessages = {
  // Connection Success
  connected: "🛡️ Connected to AVAI. Ready to help with your security analysis!",
  connection_restored: "✅ Connection restored! I'm back online and ready to help.",
  
  // Connection Issues
  connection_failed: "I'm having trouble connecting right now. Let me try a backup connection to ensure we can continue...",
  server_unavailable: "Our servers are being updated to serve you better. I'll reconnect automatically once this is complete.",
  network_issue: "It looks like there might be a network issue. I'll keep trying to connect in the background.",
  
  // Reconnection Process
  reconnecting: "Reconnecting to ensure the best experience for you. Please hold on...",
  retry_attempt: "Still working on the connection. Thank you for your patience...",
  
  // Fallback Modes
  fallback_active: "I'm using a backup connection to keep helping you. Everything will work normally, though responses might be slightly slower.",
  backup_connection: "✅ Backup connection established. Ready to continue with your analysis!",
  
  // Offline Handling
  offline_mode: "You're currently offline. I'll save your messages and send them once you're connected again.",
  queue_messages: "📝 Your messages are safely queued and will be sent when connection is restored.",
  
  // Error Recovery
  circuit_breaker: "I'm taking a brief pause to ensure the best service quality. Please try again in a few moments.",
  manual_retry_needed: "Please try sending your message again. I'm ready to help!",
  timeout_error: "The connection is taking longer than usual. Let me try a different approach...",
  
  // Maintenance
  scheduled_maintenance: "⚡ Quick maintenance in progress. I'll be back online shortly with improved performance!"
};

// Map WebSocket events to professional messages
const mapConnectionEvent = (wsEvent: string, errorType?: string, reconnectAttempts?: number) => {
  switch (wsEvent) {
    case 'open':
      return reconnectAttempts && reconnectAttempts > 0 ? 'connection_restored' : 'connected';
    case 'close':
      return errorType === 'network' ? 'network_issue' : 'connection_failed';
    case 'error':
      return 'connection_failed';
    case 'reconnecting':
      return reconnectAttempts && reconnectAttempts > 3 ? 'retry_attempt' : 'reconnecting';
    case 'fallback_activated':
      return 'fallback_active';
    case 'circuit_breaker_open':
      return 'circuit_breaker';
    case 'timeout':
      return 'timeout_error';
    case 'max_attempts_reached':
      return 'manual_retry_needed';
    default:
      return 'connection_failed';
  }
};

// Convert raw log messages to professional thinking steps
const convertLogToProfessionalStep = (logMessage: string): string => {
  // Remove emojis and clean up the message
  const cleanMessage = logMessage.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  
  // Map common log patterns to professional messages
  if (cleanMessage.includes('Received analysis request')) {
    return 'Processing your request...';
  } else if (cleanMessage.includes('Analyzing prompt to determine analysis type')) {
    return 'Understanding your query...';
  } else if (cleanMessage.includes('Detected general analysis')) {
    return 'Routing to analysis engine...';
  } else if (cleanMessage.includes('Routing') && cleanMessage.includes('Real AI Engine')) {
    return 'Connecting to AI engine...';
  } else if (cleanMessage.includes('Starting Real AI Analysis')) {
    return 'Initializing AI analysis...';
  } else if (cleanMessage.includes('Prompt Analysis') && cleanMessage.includes('complexity')) {
    return 'Evaluating complexity...';
  } else if (cleanMessage.includes('Connecting to AI processing engine')) {
    return 'Establishing AI connection...';
  } else if (cleanMessage.includes('AI analysis complete')) {
    return 'Finalizing response...';
  } else {
    // Fallback: clean and shorten generic messages
    return cleanMessage.length > 50 
      ? cleanMessage.substring(0, 47) + '...'
      : cleanMessage || 'Processing...';
  }
};

export function useRealTimeMessages() {
  const { subscribeToMessages, isConnected, lastError, reconnectAttempts, connect } = useWebSocket();
  const { logError } = useProfessionalErrorHandler();
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ProcessedMessage[]>([]);
  const [thinkingTimeout, setThinkingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastConnectionState, setLastConnectionState] = useState<boolean>(false);
  const [currentThinkingStep, setCurrentThinkingStep] = useState<string>("");

  // Handle connection event messages
  const handleConnectionEvent = useCallback((eventType: string) => {
    const message = professionalMessages[eventType as keyof typeof professionalMessages] || 
      "I'm working on a connection issue. Please bear with me while I resolve this.";
    
    const systemMessage: ProcessedMessage = {
      id: `connection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'system',
      content: message,
      type: 'system',
      timestamp: new Date().toISOString(),
      metadata: {
        isConnectionMessage: true,
        eventType,
        canRetry: ['connection_failed', 'network_issue', 'manual_retry_needed', 'timeout_error'].includes(eventType)
      }
    };
    
    setMessages(prev => [...prev, systemMessage]);
  }, []);

  // Monitor connection state changes
  useEffect(() => {
    if (isConnected && !lastConnectionState && reconnectAttempts > 0) {
      // Connection restored after being disconnected
      handleConnectionEvent('connection_restored');
    } else if (!isConnected && lastConnectionState && lastError) {
      // Connection lost
      const eventType = mapConnectionEvent('close', 'network', reconnectAttempts);
      handleConnectionEvent(eventType);
    }
    
    setLastConnectionState(isConnected);
  }, [isConnected, lastConnectionState, lastError, reconnectAttempts, handleConnectionEvent]);

  const handleMessage = useCallback((wsMessage: WSMessage) => {
    console.log('Received WebSocket message:', wsMessage);

    try {
      switch (wsMessage.type) {
        case 'analysis_start':
          // Show thinking indicator with initial step
          setIsThinking(true);
          setCurrentThinkingStep("🚀 Starting analysis...");
          console.log('🧠 AVAI is thinking...');
          
          // Set timeout to prevent infinite thinking state
          const timeout = setTimeout(() => {
            console.warn('Analysis timeout - stopping thinking indicator');
            
            // Log timeout for debugging
            logError('analysis_timeout', {
              timestamp: new Date().toISOString(),
              timeoutDuration: 30000,
              wasThinking: true
            });
            
            setIsThinking(false);
            setCurrentThinkingStep("");
            handleConnectionEvent('timeout_error');
          }, 30000); // 30 second timeout
          
          setThinkingTimeout(timeout);
          break;

        case 'log':
          // Update thinking step with professional message during analysis
          if (isThinking && wsMessage.message) {
            // Convert log message to professional thinking step
            const professionalStep = convertLogToProfessionalStep(wsMessage.message);
            setCurrentThinkingStep(professionalStep);
          }
          console.log('📝 Background log:', wsMessage.message);
          break;

        case 'analysis_complete':
          // Clear thinking timeout
          if (thinkingTimeout) {
            clearTimeout(thinkingTimeout);
            setThinkingTimeout(null);
          }
          
          // Hide thinking indicator and clear step
          setIsThinking(false);
          setCurrentThinkingStep("");
          
          if (wsMessage.result?.ai_response) {
            const cleanResponse: ProcessedMessage = {
              id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              content: wsMessage.result.ai_response,
              sender: 'ai',
              type: 'text',
              timestamp: wsMessage.timestamp,
            };
            
            setMessages(prev => [...prev, cleanResponse]);
            console.log('✅ Analysis completed - showing clean response');
          } else {
            // Fallback message if no AI response
            const fallbackResponse: ProcessedMessage = {
              id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              content: 'Analysis completed successfully, but no detailed response was provided.',
              sender: 'ai',
              type: 'text',
              timestamp: wsMessage.timestamp,
            };
            
            setMessages(prev => [...prev, fallbackResponse]);
          }
          break;

        default:
          console.log('Unhandled message type:', wsMessage.type);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      
      // Log error for debugging
      logError('message_processing_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        messageType: wsMessage.type
      });
      
      // Clear thinking state on error
      setIsThinking(false);
      if (thinkingTimeout) {
        clearTimeout(thinkingTimeout);
        setThinkingTimeout(null);
      }
      
      // Show professional error message
      handleConnectionEvent('connection_failed');
    }
  }, [thinkingTimeout, logError, handleConnectionEvent, isThinking]);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(handleMessage);
    
    return () => {
      unsubscribe();
    };
  }, [subscribeToMessages, handleMessage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (thinkingTimeout) {
        clearTimeout(thinkingTimeout);
      }
    };
  }, [thinkingTimeout]);

  const addUserMessage = useCallback((content: string) => {
    const userMessage: ProcessedMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      sender: 'user',
      type: 'text',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
  }, []);

  // Add connection message manually (for retry functionality)
  const addConnectionMessage = useCallback((eventType: string) => {
    handleConnectionEvent(eventType);
  }, [handleConnectionEvent]);

  // Handle retry from system messages
  const handleRetryConnection = useCallback(() => {
    handleConnectionEvent('reconnecting');
    if (connect) {
      connect();
    }
  }, [handleConnectionEvent, connect]);

  return {
    isThinking,
    messages,
    currentThinkingStep,
    addUserMessage,
    addConnectionMessage,
    handleRetryConnection,
    // Reset function for new conversations
    clearMessages: () => {
      setMessages([]);
      setIsThinking(false);
      setCurrentThinkingStep("");
      if (thinkingTimeout) {
        clearTimeout(thinkingTimeout);
        setThinkingTimeout(null);
      }
    }
  };
}