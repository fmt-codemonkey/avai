"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
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
    confidence?: number;
    processingTime?: number;
    sessionId?: string;
    requestId?: string;
    source?: string;
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
  } else if (cleanMessage.includes('Generating final response')) {
    return 'Preparing your answer...';
  } else if (cleanMessage.includes('Response ready')) {
    return 'Completing analysis...';
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
  const lastConnectionStateRef = useRef<boolean>(false);
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

  // Monitor connection state changes (but only after initial load)
  useEffect(() => {
    const previousState = lastConnectionStateRef.current;
    
    // Don't show connection messages on initial page load
    // Only show them if there was a previous connection attempt
    if (reconnectAttempts > 0 || previousState !== false) {
      if (isConnected && !previousState && reconnectAttempts > 0) {
        // Connection restored after being disconnected
        handleConnectionEvent('connection_restored');
      } else if (!isConnected && previousState && lastError) {
        // Connection lost
        const eventType = mapConnectionEvent('close', 'network', reconnectAttempts);
        handleConnectionEvent(eventType);
      }
    }
    
    // Update the ref with current state
    lastConnectionStateRef.current = isConnected;
  }, [isConnected, lastError, reconnectAttempts, handleConnectionEvent]);

  const handleMessage = useCallback((wsMessage: WSMessage) => {
    console.log('Received WebSocket message:', wsMessage);

    try {
      switch (wsMessage.type) {
        case 'analysis_start':
          // Show thinking indicator with initial step
          setIsThinking(true);
          setCurrentThinkingStep(""); // Let TypingIndicator handle the progression
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
          // Legacy format support - keep for backward compatibility
          // Clear thinking timeout
          if (thinkingTimeout) {
            clearTimeout(thinkingTimeout);
            setThinkingTimeout(null);
          }
          
          // Hide thinking indicator and clear step
          setIsThinking(false);
          setCurrentThinkingStep("");
          
          // Legacy format - just show completion message
          const completionResponse: ProcessedMessage = {
            id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content: 'Analysis completed successfully.',
            sender: 'ai',
            type: 'text',
            timestamp: wsMessage.timestamp || new Date().toISOString(),
          };
          
          setMessages(prev => [...prev, completionResponse]);
          console.log('✅ Analysis completed (legacy format)');
          break;

        case 'response':
          // New backend response format - handle final AI response
          // Clear thinking timeout
          if (thinkingTimeout) {
            clearTimeout(thinkingTimeout);
            setThinkingTimeout(null);
          }
          
          // Hide thinking indicator and clear step
          setIsThinking(false);
          setCurrentThinkingStep("");
          
          // Check if response was successful
          if (wsMessage.status === 'success' && wsMessage.response) {
            try {
              // Handle both string and object response formats
              let parsedResponse: { 
                message: string; 
                session_id?: string; 
                [key: string]: unknown 
              };
              if (typeof wsMessage.response === 'string') {
                parsedResponse = JSON.parse(wsMessage.response);
              } else {
                // Response is already an object
                parsedResponse = wsMessage.response as { 
                  message: string; 
                  session_id?: string; 
                  [key: string]: unknown 
                };
              }
              const aiResponse = parsedResponse.message;
              const processingTime = wsMessage.processing_time;
              const sessionId = parsedResponse.session_id;
              
              // Use clean response content (metadata will be shown separately in UI)
              const successResponse: ProcessedMessage = {
                id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content: aiResponse,
                sender: 'ai',
                type: 'text',
                timestamp: wsMessage.timestamp || new Date().toISOString(),
                metadata: {
                  processingTime: parseFloat(processingTime?.replace('s', '') || '0'),
                  sessionId,
                  requestId: wsMessage.request_id,
                  source: wsMessage.source
                }
              };
              
              setMessages(prev => [...prev, successResponse]);
              console.log('✅ AI Response received successfully', {
                processingTime,
                sessionId,
                requestId: wsMessage.request_id,
                source: wsMessage.source
              });
            } catch (parseError) {
              console.error('Failed to parse response JSON:', parseError);
              
              // Show raw response if JSON parsing fails
              const fallbackResponse: ProcessedMessage = {
                id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content: wsMessage.response,
                sender: 'ai',
                type: 'text', 
                timestamp: wsMessage.timestamp || new Date().toISOString(),
                metadata: {
                  processingTime: parseFloat(wsMessage.processing_time?.replace('s', '') || '0'),
                  requestId: wsMessage.request_id,
                  source: wsMessage.source
                }
              };
              
              setMessages(prev => [...prev, fallbackResponse]);
            }
          } else {
            // Handle failed response
            const errorResponse: ProcessedMessage = {
              id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              content: 'I encountered an issue processing your request. Please try again or rephrase your question.',
              sender: 'system',
              type: 'error',
              timestamp: wsMessage.timestamp || new Date().toISOString(),
              metadata: {
                isConnectionMessage: false,
                canRetry: true,
                requestId: wsMessage.request_id
              }
            };
            
            setMessages(prev => [...prev, errorResponse]);
            console.warn('❌ AI Response failed', {
              status: wsMessage.status,
              requestId: wsMessage.request_id
            });
          }
          break;

        default:
          // Handle messages without type field but with status/response (your server format)
          if (!wsMessage.type && wsMessage.status && wsMessage.response) {
            console.log('Processing response without type field (server format)');
            
            // Clear thinking indicators
            if (thinkingTimeout) {
              clearTimeout(thinkingTimeout);
              setThinkingTimeout(null);
            }
            setIsThinking(false);
            setCurrentThinkingStep("");
            
            if (wsMessage.status === 'success' && wsMessage.response) {
              try {
                // Handle both string and object response formats
                let parsedResponse: { 
                  message: string; 
                  session_id?: string; 
                  [key: string]: unknown 
                };
                if (typeof wsMessage.response === 'string') {
                  parsedResponse = JSON.parse(wsMessage.response);
                } else {
                  // Response is already an object
                  parsedResponse = wsMessage.response as { 
                    message: string; 
                    session_id?: string; 
                    [key: string]: unknown 
                  };
                }
                const aiResponse = parsedResponse.message;
                
                const successResponse: ProcessedMessage = {
                  id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  content: aiResponse,
                  sender: 'ai',
                  type: 'text',
                  timestamp: wsMessage.timestamp || new Date().toISOString(),
                  metadata: {
                    processingTime: parseFloat(wsMessage.processing_time?.replace('s', '') || '0'),
                    sessionId: parsedResponse.session_id,
                    requestId: wsMessage.request_id,
                    source: wsMessage.source
                  }
                };
                
                setMessages(prev => [...prev, successResponse]);
                console.log('✅ AI Response received successfully (server format)');
              } catch (error) {
                console.error('Failed to parse server response:', error);
                const errorResponse: ProcessedMessage = {
                  id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  content: 'Failed to process AI response. Please try again.',
                  sender: 'system',
                  type: 'error',
                  timestamp: new Date().toISOString(),
                  metadata: { isConnectionMessage: false, canRetry: true }
                };
                setMessages(prev => [...prev, errorResponse]);
              }
            } else {
              const errorResponse: ProcessedMessage = {
                id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                content: wsMessage.response || 'Unknown error occurred',
                sender: 'system',
                type: 'error',
                timestamp: new Date().toISOString(),
                metadata: { isConnectionMessage: false, canRetry: true }
              };
              setMessages(prev => [...prev, errorResponse]);
            }
          } else {
            // Handle progress/status messages that don't need UI updates
            if (wsMessage.status && ['processing', 'progress', 'completed'].includes(wsMessage.status)) {
              // These are normal progress messages, no need to log as unhandled
              return;
            }
            
            console.log('Unhandled message type:', wsMessage.type, 'Status:', wsMessage.status);
          }
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
    
    // Generate static AI response
    generateStaticResponse(content);
  }, []);

  // Static response generator
  const generateStaticResponse = useCallback((userInput: string) => {
    // Show thinking indicator first
    setIsThinking(true);
    setCurrentThinkingStep("Analyzing your security request...");

    // Simulate thinking progression
    setTimeout(() => {
      setCurrentThinkingStep("Processing security patterns...");
    }, 800);

    setTimeout(() => {
      setCurrentThinkingStep("Generating recommendations...");
    }, 1600);

    // Generate response after 3 seconds
    setTimeout(() => {
      setIsThinking(false);
      setCurrentThinkingStep("");

      // Generate contextual response based on user input
      let responseContent = "";
      const input = userInput.toLowerCase();

      if (input.includes("github") || input.includes("repository") || input.includes("repo")) {
        responseContent = `🔍 **Security Analysis Results**

I've analyzed the provided repository and found several areas for improvement:

**🔴 High Priority Issues:**
• Potential SQL injection vulnerabilities in authentication endpoints
• Missing input validation on user-submitted data
• Hardcoded API keys detected in configuration files

**🟡 Medium Priority Issues:**
• CORS configuration too permissive
• Missing rate limiting on API endpoints
• Outdated dependencies with known vulnerabilities

**🟢 Recommendations:**
1. Implement parameterized queries for all database interactions
2. Add comprehensive input validation using a validation library
3. Move sensitive credentials to environment variables
4. Update dependencies and implement security headers

**Next Steps:**
Would you like me to provide specific code examples for any of these fixes?`;
      } else if (input.includes("sql") || input.includes("injection")) {
        responseContent = `🛡️ **SQL Injection Analysis**

**Vulnerability Overview:**
SQL injection remains one of the most critical web application vulnerabilities. Here's what I found:

**Common Patterns to Fix:**
\`\`\`javascript
// ❌ Vulnerable
const query = "SELECT * FROM users WHERE id = " + userId;

// ✅ Secure
const query = "SELECT * FROM users WHERE id = ?";
db.query(query, [userId]);
\`\`\`

**Recommended Solutions:**
1. **Use Parameterized Queries** - Always use prepared statements
2. **Input Validation** - Validate all user inputs on both client and server
3. **Least Privilege** - Database users should have minimal required permissions
4. **Error Handling** - Don't expose database errors to users

Would you like me to review specific code snippets for SQL injection vulnerabilities?`;
      } else if (input.includes("password") || input.includes("auth") || input.includes("login")) {
        responseContent = `🔐 **Authentication Security Analysis**

**Security Recommendations:**

**Password Security:**
• Implement strong password requirements (12+ characters, mixed case, numbers, symbols)
• Use bcrypt or Argon2 for password hashing
• Implement account lockout after failed attempts

**Authentication Best Practices:**
• Implement multi-factor authentication (MFA)
• Use secure session management
• Implement proper logout functionality
• Set secure cookie attributes (httpOnly, secure, sameSite)

**Code Example:**
\`\`\`javascript
const bcrypt = require('bcrypt');

// Hash password
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);
\`\`\`

**Additional Security Measures:**
• Implement CAPTCHA for repeated failed attempts
• Use HTTPS for all authentication endpoints
• Implement proper session timeout

Need help implementing any of these security measures?`;
      } else if (input.includes("xss") || input.includes("script")) {
        responseContent = `⚠️ **Cross-Site Scripting (XSS) Prevention**

**XSS Vulnerability Types:**
1. **Stored XSS** - Malicious scripts stored in database
2. **Reflected XSS** - Scripts reflected in response
3. **DOM XSS** - Client-side script manipulation

**Prevention Strategies:**
\`\`\`javascript
// ❌ Vulnerable
element.innerHTML = userInput;

// ✅ Secure
element.textContent = userInput;
// or use DOMPurify for HTML sanitization
element.innerHTML = DOMPurify.sanitize(userInput);
\`\`\`

**Security Headers:**
\`\`\`javascript
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
\`\`\`

**Best Practices:**
• Always sanitize user input before displaying
• Use Content Security Policy (CSP) headers
• Validate input on both client and server
• Use templating engines that auto-escape by default

Want me to analyze specific code for XSS vulnerabilities?`;
      } else {
        // Analyze the user's input and provide contextual response
        const analysisKeywords = {
          greeting: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup', 'hiya'],
          help: ['help', 'assist', 'support', 'guide', 'how to', 'what is', 'explain'],
          audit: ['audit', 'analyze', 'check', 'review', 'scan', 'test', 'examine'],
          code: ['function', 'class', 'const', 'let', 'var', 'import', 'export', '{', '}', '=>'],
          security: ['secure', 'encrypt', 'hash', 'token', 'key', 'password', 'auth'],
          vulnerability: ['vuln', 'exploit', 'attack', 'malware', 'breach', 'hack'],
          web: ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'node'],
          api: ['api', 'endpoint', 'rest', 'graphql', 'POST', 'GET', 'PUT', 'DELETE'],
          database: ['database', 'db', 'mysql', 'postgres', 'mongodb', 'query'],
          network: ['network', 'firewall', 'ssl', 'tls', 'https', 'certificate'],
          blockchain: ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'smart contract', 'defi', 'nft', 'web3', 'solidity'],
          cloud: ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'serverless', 's3'],
          mobile: ['android', 'ios', 'mobile', 'app', 'swift', 'kotlin', 'react native'],
          devops: ['ci/cd', 'jenkins', 'github actions', 'deployment', 'pipeline', 'terraform']
        };

        // Non-security topics that should get contextual responses
        const nonSecurityTopics = {
          weather: ['weather', 'rain', 'sunny', 'cloudy', 'temperature', 'forecast', 'hot', 'cold', 'storm', 'snow'],
          time: ['time', 'date', 'clock', 'today', 'yesterday', 'tomorrow', 'when', 'what time'],
          food: ['food', 'eat', 'hungry', 'restaurant', 'recipe', 'cooking', 'cook', 'meal', 'dinner', 'lunch'],
          sports: ['football', 'basketball', 'soccer', 'tennis', 'game', 'sport', 'match', 'score', 'team'],
          entertainment: ['movie', 'music', 'song', 'tv', 'show', 'netflix', 'watch', 'listen', 'film'],
          finance: ['price', 'cost', 'value', 'bitcoin', 'ethereum', 'solana', 'crypto', 'stock', 'market', 'trading', 'investment'],
          general: ['love', 'life', 'philosophy', 'meaning', 'purpose', 'think', 'opinion', 'believe'],
          smallTalk: ['how are you', 'whats up', 'nice day', 'weekend', 'vacation', 'doing well', 'fine', 'great']
        };

        let detectedCategory = 'general';
        let maxMatches = 0;
        let nonSecurityCategory = '';

        // First, prioritize checking for greetings
        const greetingMatches = analysisKeywords.greeting.filter(keyword => input.includes(keyword)).length;
        if (greetingMatches > 0) {
          detectedCategory = 'greeting';
        } else {
          // Check for non-security topics
          let isNonSecurityTopic = false;
          let maxNonSecurityMatches = 0;
          
          Object.entries(nonSecurityTopics).forEach(([category, keywords]) => {
            const matches = keywords.filter(keyword => input.includes(keyword)).length;
            if (matches > maxNonSecurityMatches) {
              maxNonSecurityMatches = matches;
              isNonSecurityTopic = matches > 0;
              nonSecurityCategory = category;
            }
          });

          // If it's a non-security topic, handle it differently
          if (isNonSecurityTopic) {
            detectedCategory = 'non-security';
          } else {
            // Detect the most relevant security category (excluding greeting since we already checked)
            Object.entries(analysisKeywords).forEach(([category, keywords]) => {
              if (category === 'greeting') return; // Skip greeting check here
              const matches = keywords.filter(keyword => input.includes(keyword)).length;
              if (matches > maxMatches) {
                maxMatches = matches;
                detectedCategory = category;
              }
            });
          }
        }

        // Generate contextual response based on detected category
        switch (detectedCategory) {
          case 'non-security':
            // Handle non-security topics with appropriate contextual responses
            const topicResponses = {
              weather: `🌤️ **Weather Update**

I'm primarily a security assistant, but I can share some general weather thoughts! Unfortunately, I don't have access to real-time weather data, so I can't give you current conditions.

For accurate weather information, I'd recommend checking:
• Weather.com or AccuWeather
• Your local weather app
• National weather service websites

Is there anything else I can help you with today?`,
              
              time: `⏰ **Time Information**

I don't have access to real-time clock data, so I can't tell you the current time. 

To check the time, you can:
• Look at your device's clock
• Ask a voice assistant like Siri or Google
• Check time.gov for official time

Is there something else I can assist you with?`,

              food: `🍕 **Food & Cooking**

While I'm mainly focused on security topics, I understand you're asking about food! I don't have access to recipes or cooking databases, but I can suggest:

• Check cooking websites like AllRecipes or Food Network
• Try cooking apps like Yummly or Tasty
• Ask cooking-focused AI assistants for detailed recipes

If you have any questions about securing food delivery apps, restaurant payment systems, or protecting customer data in the food industry, I'd be happy to help with that!

What else can I assist you with?`,

              sports: `⚽ **Sports & Games**

I don't have access to current sports scores or game schedules, but for the latest sports information, you might want to check:

• ESPN or Sports Center
• Your favorite sports apps
• Team official websites
• Sports news websites

Is there anything else I can help you with today?`,

              entertainment: `🎬 **Entertainment**

I don't have access to current movie listings, music charts, or TV schedules, but for entertainment recommendations, you could try:

• Streaming platforms like Netflix, Hulu, or Disney+
• Music services like Spotify or Apple Music
• Movie review sites like IMDb or Rotten Tomatoes
• Entertainment news websites

Is there something else I can assist you with?`,

              finance: `💰 **Financial Information**

I don't have access to real-time financial data or cryptocurrency prices. For current market information, you can check:

• CoinGecko or CoinMarketCap for crypto prices
• Yahoo Finance or Google Finance for stocks
• Trading platforms like Binance or Coinbase
• Financial news websites

If you have questions about securing crypto wallets, DeFi protocols, or blockchain security, I'd be happy to help with those!

Is there anything else I can assist you with?`,

              general: `💭 **General Questions**

That's an interesting topic! While I don't have specialized knowledge in all areas, I try to be helpful where I can.

For more detailed information on various topics, you might want to:
• Check reliable online resources
• Consult subject matter experts
• Use specialized tools or databases

Is there anything specific I can help you with today?`,

              smallTalk: `😊 **Thanks for Asking!**

I'm doing well, thank you for asking! I'm here and ready to help with whatever you need.

How are you doing today? Is there anything I can assist you with?`,

              default: `🤔 **Interesting Question**

That's an interesting topic you've brought up! While "${userInput}" isn't something I specialize in, I'm always happy to chat.

For more detailed information on this topic, you might want to check specialized resources or experts in that field.

Is there anything else I can help you with today?`
            };

            responseContent = topicResponses[nonSecurityCategory] || topicResponses.default;
            break;

          case 'greeting':
            responseContent = `Hi there! 👋 I'm AVAI Agent, your Multi-Agent security auditing assistant. How can I help you today?`;
            break;

          case 'help':
            responseContent = `🆘 **AVAI Security Assistant - Help Guide**

I'm here to help with your security needs! Here's what I can do:

**📋 Available Services:**
• **Code Analysis**: Upload or paste code for security review
• **Vulnerability Assessment**: Identify potential security issues
• **Best Practice Guidance**: Get recommendations for secure coding
• **Security Architecture**: Design secure systems and workflows

**💬 How to Interact:**
• Ask specific questions about security topics
• Upload files for automated analysis
• Request security checklists for your technology stack
• Get guidance on implementing security controls

**🎯 Example Queries:**
• "How do I prevent SQL injection in Node.js?"
• "What are the best practices for API authentication?"
• "Check this code for security vulnerabilities"
• "Help me secure my React application"

**🔧 Supported Technologies:**
JavaScript, Python, Java, C#, PHP, React, Node.js, databases, APIs, and more!

What specific security challenge can I help you solve?`;
            break;

          case 'audit':
            responseContent = `🛡️ **Security Audit Services**

Ready to perform a comprehensive security audit! Here's what I can analyze:

**🔍 Audit Types Available:**
• **Code Security Audit**: Static code analysis for vulnerabilities
• **Web Application Audit**: Frontend and backend security review
• **API Security Audit**: Endpoint security and authentication review
• **Database Security Audit**: Query safety and access control review

**📋 Audit Process:**
1. **Upload/Share**: Provide code, URLs, or detailed descriptions
2. **Analysis**: I'll examine for common vulnerabilities and security issues
3. **Report**: Receive detailed findings with severity ratings
4. **Remediation**: Get step-by-step fixes and best practices

**🎯 Common Issues I Check For:**
• SQL Injection vulnerabilities
• Cross-Site Scripting (XSS)
• Authentication/Authorization flaws
• Data exposure risks
• Input validation issues
• Configuration security

**To Start Your Audit:**
• Upload code files using the attachment button
• Paste code snippets in the chat
• Describe your application architecture
• Share specific security concerns

What type of security audit would you like me to perform?`;
            break;

          case 'code':
            responseContent = `💻 **Code Security Analysis**

Based on your input, I've identified potential security considerations for your code:

**Code Security Best Practices:**
• **Input Sanitization**: Validate all user inputs before processing
• **Function Security**: Avoid eval() and similar dynamic code execution
• **Error Handling**: Don't expose sensitive information in error messages
• **Dependency Management**: Keep libraries updated and audit for vulnerabilities

**Specific Recommendations:**
\`\`\`javascript
// Good: Input validation
function processUserData(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }
  return sanitize(input);
}
\`\`\`

Would you like me to analyze specific code snippets or functions?`;
            break;

          case 'security':
            responseContent = `🔐 **Security Implementation Guide**

I see you're working with security concepts. Here's tailored guidance:

**Core Security Principles:**
• **Encryption**: Use AES-256 for data at rest, TLS 1.3 for transit
• **Authentication**: Implement strong password policies + MFA
• **Authorization**: Use principle of least privilege
• **Key Management**: Rotate keys regularly, use secure storage

**Implementation Checklist:**
✅ Secure password hashing (bcrypt/Argon2)
✅ Token-based authentication (JWT with short expiry)
✅ HTTPS everywhere with HSTS headers
✅ Input validation and output encoding

Need help implementing any specific security measures?`;
            break;

          case 'vulnerability':
            responseContent = `⚠️ **Vulnerability Assessment**

I've detected security vulnerability concerns in your query:

**Common Vulnerabilities to Address:**
• **OWASP Top 10**: Focus on injection, broken authentication, sensitive data exposure
• **Supply Chain**: Monitor third-party dependencies for known CVEs
• **Configuration**: Secure default settings and remove unnecessary services
• **Access Control**: Implement proper authentication and authorization

**Immediate Actions:**
1. Run security scans (npm audit, OWASP ZAP)
2. Update all dependencies to latest versions
3. Implement Content Security Policy (CSP)
4. Enable security headers (HSTS, X-Frame-Options)

Would you like specific vulnerability testing recommendations?`;
            break;

          case 'web':
            responseContent = `🌐 **Web Application Security**

For web application security, here are key areas to focus on:

**Frontend Security:**
• **XSS Prevention**: Sanitize user content, use CSP headers
• **CSRF Protection**: Implement anti-CSRF tokens
• **Secure Storage**: Use secure cookies, avoid localStorage for sensitive data

**Framework-Specific Guidelines:**
\`\`\`javascript
// React: Prevent XSS
const SafeComponent = ({ userInput }) => (
  <div dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(userInput)
  }} />
);
\`\`\`

Need guidance on specific web technologies or frameworks?`;
            break;

          case 'api':
            responseContent = `🔌 **API Security Analysis**

API security is crucial for your application. Here's what to implement:

**API Security Essentials:**
• **Authentication**: Use OAuth 2.0 or JWT tokens
• **Rate Limiting**: Prevent abuse with request throttling
• **Input Validation**: Validate all API parameters
• **HTTPS Only**: Never send credentials over HTTP

**Security Headers for APIs:**
\`\`\`
Content-Type: application/json
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Access-Control-Allow-Origin: https://yourdomain.com
\`\`\`

Would you like help securing specific API endpoints?`;
            break;

          case 'database':
            responseContent = `🗄️ **Database Security Assessment**

Database security is fundamental. Here's your security roadmap:

**Database Security Measures:**
• **SQL Injection Prevention**: Use parameterized queries only
• **Access Control**: Implement role-based database permissions
• **Encryption**: Encrypt sensitive columns and backup files
• **Monitoring**: Log all database access and changes

**Secure Query Example:**
\`\`\`sql
-- Good: Parameterized query
SELECT * FROM users WHERE email = ? AND status = ?

-- Bad: String concatenation
SELECT * FROM users WHERE email = '" + email + "'
\`\`\`

Need help with specific database security configurations?`;
            break;

          case 'blockchain':
            responseContent = `⛓️ **Blockchain Security Analysis**

Welcome to the decentralized world! Blockchain security has unique challenges:

**🔐 Smart Contract Security:**
• **Reentrancy Attacks**: Guard against recursive calls
• **Integer Overflow**: Use SafeMath libraries
• **Access Control**: Implement proper permission systems
• **Gas Optimization**: Prevent DoS through gas limit attacks

**🛡️ Common Vulnerabilities:**
\`\`\`solidity
// Bad: Vulnerable to reentrancy
function withdraw(uint amount) public {
    require(balances[msg.sender] >= amount);
    msg.sender.call.value(amount)("");
    balances[msg.sender] -= amount;
}

// Good: Checks-Effects-Interactions pattern
function withdraw(uint amount) public {
    require(balances[msg.sender] >= amount);
    balances[msg.sender] -= amount;
    msg.sender.transfer(amount);
}
\`\`\`

**🔍 Audit Checklist:**
✅ External contract calls handled safely
✅ Integer arithmetic protected
✅ Access control properly implemented
✅ Emergency pause mechanisms
✅ Upgrade patterns secure

Need help auditing smart contracts or blockchain infrastructure?`;
            break;

          case 'cloud':
            responseContent = `☁️ **Cloud Security Architecture**

Cloud security requires a shared responsibility model. Here's your guide:

**🛡️ AWS/Azure/GCP Security:**
• **Identity & Access Management (IAM)**: Least privilege principle
• **Network Security**: VPCs, security groups, NACLs
• **Data Encryption**: At rest and in transit
• **Monitoring**: CloudTrail, GuardDuty, Security Center

**🐳 Container Security:**
\`\`\`dockerfile
# Secure Dockerfile practices
FROM node:16-alpine  # Use minimal base images
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs  # Don't run as root
COPY --chown=nextjs:nodejs . .
\`\`\`

**☸️ Kubernetes Security:**
• Pod Security Standards
• Network Policies
• RBAC configuration
• Secrets management

**🔐 Infrastructure as Code Security:**
Scan Terraform/CloudFormation templates for misconfigurations.

Which cloud platform are you securing?`;
            break;

          case 'mobile':
            responseContent = `📱 **Mobile Application Security**

Mobile security spans both client and server-side protections:

**🍎 iOS Security Best Practices:**
• **Keychain Services**: Secure credential storage
• **App Transport Security (ATS)**: Force HTTPS
• **Code Obfuscation**: Protect against reverse engineering
• **Certificate Pinning**: Prevent MITM attacks

**🤖 Android Security Essentials:**
\`\`\`java
// Secure SharedPreferences
SharedPreferences prefs = getSharedPreferences(
    "secure_prefs", 
    Context.MODE_PRIVATE
);

// Use EncryptedSharedPreferences for sensitive data
EncryptedSharedPreferences.create(
    "secret_shared_prefs",
    masterKeyAlias,
    context,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
);
\`\`\`

**📊 OWASP Mobile Top 10:**
1. Improper Platform Usage
2. Insecure Data Storage
3. Insecure Communication
4. Insecure Authentication
5. Insufficient Cryptography

Need help with mobile app penetration testing or secure development?`;
            break;

          case 'devops':
            responseContent = `🚀 **DevSecOps - Security in CI/CD**

Integrating security into your development pipeline:

**🔒 Pipeline Security:**
• **Secrets Management**: Never commit credentials
• **Static Code Analysis**: SAST tools in CI/CD
• **Dependency Scanning**: Check for vulnerable libraries
• **Container Scanning**: Scan Docker images for CVEs

**⚙️ Secure CI/CD Configuration:**
\`\`\`yaml
# GitHub Actions security example
name: Secure Build
on: [push]
jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
      - name: SAST Scan
        uses: github/super-linter@v4
\`\`\`

**🛡️ Infrastructure Security:**
• **Infrastructure as Code (IaC)**: Terraform, CloudFormation security scanning
• **Secrets Rotation**: Automated credential management
• **Compliance Checks**: Policy as Code implementation
• **Security Gates**: Fail builds on critical vulnerabilities

**📋 DevSecOps Checklist:**
✅ Secrets never in code repositories
✅ Automated security testing integrated
✅ Container images regularly updated
✅ Access controls on deployment systems

Which part of your DevOps pipeline needs security hardening?`;
            break;

          case 'network':
            responseContent = `🌍 **Network Security Analysis**

Network security is your first line of defense:

**Network Security Fundamentals:**
• **SSL/TLS Configuration**: Use TLS 1.3, strong cipher suites
• **Firewall Rules**: Implement strict ingress/egress controls
• **Certificate Management**: Regular renewal and monitoring
• **Network Segmentation**: Isolate sensitive systems

**TLS Best Practices:**
\`\`\`
# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers on;
\`\`\`

Would you like help with SSL configuration or firewall rules?`;
            break;

          default:
            // Creative AI personality with security expertise
            const inputLength = userInput.trim().length;
            const randomResponses = [
              {
                condition: () => inputLength < 3,
                response: `🤖 **AVAI Neural Network Activated**

Minimal input detected: "${userInput}"

*Initializing security analysis protocols...*
*Scanning threat landscape...*
*Loading expert knowledge base...*

**🧠 AI Recommendation Engine:**
I need more context to provide optimal security guidance. Try these power queries:

• \`analyze my React app security\`
• \`scan for OWASP top 10 vulnerabilities\`
• \`secure coding best practices for Python\`
• \`penetration testing checklist\`

**🎯 Pro Tip:** The more specific your query, the more targeted my security intelligence becomes!

Ready to hack-proof your code? 🛡️`
              },
              {
                condition: () => input.includes('thanks') || input.includes('thank'),
                response: `🙏 **Mission Accomplished!**

You're welcome! Security is a team effort, and I'm glad I could assist.

**🛡️ Remember the Security Mantras:**
• "Trust, but verify" - Every input, every user, every system
• "Security is not a product, it's a process" - Keep evolving
• "The best defense is a good offense" - Stay proactive

**🚀 Keep Learning:**
Security threats evolve daily. Stay curious, keep testing, and never stop hardening your defenses!

*AVAI standing by for your next security mission...* 🤖✨`
              },
              {
                condition: () => input.includes('boring') || input.includes('tired'),
                response: `😴 **Security Fatigue Detected!**

I get it - security can feel overwhelming sometimes. Let's make it fun!

**🎮 Security Gamification:**
• Think like a hacker: "How would I break this?"
• Bug bounty mindset: "What's the weakest link?"
• Capture-the-flag mentality: "Every vulnerability is a puzzle"

**⚡ Quick Win Challenges:**
1. Find one hardcoded password in your codebase (5 min)
2. Add one security header to your app (10 min)
3. Update one outdated dependency (2 min)

**🏆 Achievement Unlocked:** "Security Ninja" - Making protection fun!

What's your favorite aspect of cybersecurity? Let's explore it together! 🥷`
              },
              {
                condition: () => input.includes('confused') || input.includes('lost'),
                response: `🧭 **Lost in the Security Maze?**

No worries! Even seasoned developers get overwhelmed by security.

**🗺️ Your Security GPS:**
📍 **You Are Here:** Seeking security guidance
🎯 **Destination:** Secure, robust applications
🛤️ **Path:** Let's break it down step by step

**🔍 Security Discovery Process:**
1. **Identify**: What are you building? (Web app, API, mobile?)
2. **Prioritize**: What's your biggest concern? (Data breaches, user safety?)
3. **Implement**: Start with the most critical security measures
4. **Iterate**: Security is continuous improvement

**💡 Confusion Buster:**
Instead of trying to secure everything at once, pick ONE area. Master it. Then move to the next.

What's the ONE thing you're building that needs securing most? 🎯`
              }
            ];

            // Check for special conditions first
            const specialResponse = randomResponses.find(r => r.condition());
            if (specialResponse) {
              responseContent = specialResponse.response;
            } else {
              // Creative default responses with variety
              const creativeResponses = [
                `🚀 **AVAI Threat Intelligence Engine**

Analyzing unconventional input: "${userInput}"

**🔮 Predictive Security Analysis:**
Your unique query suggests you're thinking outside the box - excellent for security!

**🎨 Creative Security Approaches:**
• **Red Team Thinking**: What would an attacker do with this?
• **Blue Team Defense**: How can we monitor and protect this?
• **Purple Team Synthesis**: Combining offense and defense strategies

**🧩 Pattern Recognition:**
I see you're exploring uncharted security territory. Here's my adaptive response framework:

\`\`\`
if (unique_query) {
  apply_security_lens();
  recommend_best_practices();
  suggest_threat_modeling();
}
\`\`\`

**🎯 Next Level Security:**
Transform any concept into a security conversation. What aspect interests you most?`,

                `🎭 **Security Theater vs. Real Protection**

Interesting input: "${userInput}"

Let me put on my security consultant hat... 🎩

**🔍 Deep Analysis Mode:**
Your query doesn't fit standard patterns, which is actually perfect! Real security threats don't follow scripts either.

**🌟 Security Wisdom:**
"The most dangerous vulnerabilities are the ones we haven't thought of yet."

**🎪 Breaking Down Your Query:**
• **Threat Surface**: What could this expose?
• **Attack Vectors**: How might this be exploited?
• **Mitigation Strategies**: What protections make sense?

**🛡️ Custom Security Framework:**
Every unique scenario deserves a tailored security approach. No cookie-cutter solutions here!

Ready to dive deeper into the security rabbit hole? 🐰🕳️`,

                `🎵 **The Rhythm of Security**

Your input "${userInput}" has a certain... je ne sais quoi!

**🎶 Security Symphony:**
🎵 First movement: Risk Assessment (Allegro)
🎵 Second movement: Vulnerability Analysis (Andante)  
🎵 Third movement: Threat Mitigation (Forte)
🎵 Finale: Continuous Monitoring (Crescendo)

**🎭 Plot Twist:**
What if your query is actually a social engineering attempt? 🤔
(Just kidding... or am I? 😏)

**🎪 Security Improv:**
"Yes, and..." approach to security:
• Yes, this input is unique, AND it could have security implications
• Yes, it's unconventional, AND that's where the best insights come from

What unexpected security angle shall we explore? 🎪✨`,

                `🧪 **Security Lab Experiment #${Math.floor(Math.random() * 9999)}**

Subject: "${userInput}"
Status: Under Analysis 🔬

**🧬 Hypothesis Generation:**
Every input is a potential security scenario waiting to be explored.

**⚗️ Security Chemistry:**
\`UserInput + SecurityMindset = UnexpectedInsights\`

**🔬 Experimental Variables:**
• **Control Group**: Standard security practices
• **Test Group**: Your unique perspective
• **Catalyst**: Creative problem-solving

**📊 Preliminary Results:**
Unconventional queries often reveal the most interesting security considerations!

**🚀 Next Phase:**
Let's design a custom security experiment around your concept. What's your hypothesis about potential security implications?

*Lab coat optional, security mindset required* 🥽`
              ];

              // Select a random creative response
              const randomIndex = Math.floor(Math.random() * creativeResponses.length);
              responseContent = creativeResponses[randomIndex];
            }
        }
      }

      // Create AI response
      const aiResponse: ProcessedMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: responseContent,
        sender: 'ai',
        type: 'text',
        timestamp: new Date().toISOString(),
        metadata: {
          processingTime: 2.8,
          source: 'static-response',
          confidence: 0.95
        }
      };

      setMessages(prev => [...prev, aiResponse]);
      console.log('✅ Static AI response generated');
    }, 3000);
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