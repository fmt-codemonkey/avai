'use client';

import { useAuth, useUser, SignInButton, SignOutButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function ClerkIntegrationDemo() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [wsConnected, setWsConnected] = useState(false);
  const [wsAuthenticated, setWsAuthenticated] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  // WebSocket connection
  useEffect(() => {
    if (!isSignedIn) {
      // Clean up WebSocket if user signs out
      if (socket) {
        socket.close();
        setSocket(null);
        setWsConnected(false);
        setWsAuthenticated(false);
      }
      return;
    }

    // Create WebSocket connection
    const ws = new WebSocket(
      process.env.NODE_ENV === 'production' 
        ? 'wss://avai-backend-production.onrender.com/websocket'
        : 'ws://localhost:3001/websocket'
    );

    ws.onopen = async () => {
      console.log('✅ WebSocket connected');
      setWsConnected(true);
      
      // Authenticate with Clerk token
      try {
        const token = await getToken();
        console.log('🔑 Sending Clerk token for authentication');
        
        ws.send(JSON.stringify({
          type: 'authenticate',
          token: token,
          messageId: Date.now().toString()
        }));
      } catch (error) {
        console.error('❌ Failed to get Clerk token:', error);
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 WebSocket message:', data);
      
      if (data.type === 'auth_success') {
        console.log('🎉 WebSocket authenticated successfully');
        setWsAuthenticated(true);
        setMessages(prev => [...prev, `✅ Authenticated as ${data.user.name} (${data.user.email})`]);
      } else if (data.type === 'auth_error' || data.type === 'error') {
        console.error('❌ WebSocket authentication failed:', data);
        setWsAuthenticated(false);
        setMessages(prev => [...prev, `❌ Authentication failed: ${data.message}`]);
      } else if (data.type === 'message_saved') {
        setMessages(prev => [...prev, `✅ Message sent successfully`]);
      }
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setWsConnected(false);
      setWsAuthenticated(false);
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [isSignedIn, getToken]);

  const sendMessage = () => {
    if (!socket || !wsAuthenticated || !inputMessage.trim()) return;

    const message = {
      type: 'send_message',
      content: inputMessage,
      threadId: 'demo-thread',
      messageId: Date.now().toString()
    };

    socket.send(JSON.stringify(message));
    setMessages(prev => [...prev, `📤 Sent: ${inputMessage}`]);
    setInputMessage('');
  };

  const testAnonymousAuth = () => {
    if (!socket || !wsConnected) return;

    socket.send(JSON.stringify({
      type: 'authenticate',
      anonymous: true,
      messageId: Date.now().toString()
    }));
    
    setMessages(prev => [...prev, `🔄 Testing anonymous authentication...`]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🔐 Clerk Authentication Integration Demo
        </h1>

        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          
          {isSignedIn ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={user?.imageUrl} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-gray-600">{user?.emailAddresses[0]?.emailAddress}</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <SignOutButton>
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Please sign in to test the integration</p>
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700">
                  Sign In with Clerk
                </button>
              </SignInButton>
            </div>
          )}
        </div>

        {/* WebSocket Status */}
        {isSignedIn && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">WebSocket Connection</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>Connection: {wsConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${wsAuthenticated ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span>Auth: {wsAuthenticated ? 'Authenticated' : 'Pending'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${wsConnected && wsAuthenticated ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span>Ready: {wsConnected && wsAuthenticated ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={testAnonymousAuth}
                disabled={!wsConnected}
                className="bg-yellow-600 text-white px-4 py-2 rounded disabled:bg-gray-400 hover:bg-yellow-700"
              >
                Test Anonymous Auth
              </button>
            </div>
          </div>
        )}

        {/* Message Testing */}
        {isSignedIn && wsConnected && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Send Test Message</h2>
            
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message to test..."
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!wsAuthenticated}
              />
              <button
                onClick={sendMessage}
                disabled={!wsAuthenticated || !inputMessage.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400 hover:bg-blue-700"
              >
                Send
              </button>
            </div>

            {!wsAuthenticated && wsConnected && (
              <p className="text-yellow-600 text-sm">
                ⏳ Waiting for authentication to complete...
              </p>
            )}
          </div>
        )}

        {/* Message Log */}
        {messages.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
            
            <div className="bg-gray-50 rounded p-4 max-h-64 overflow-y-auto">
              {messages.map((message, index) => (
                <div key={index} className="text-sm mb-1 font-mono">
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {message}
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setMessages([])}
              className="mt-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Log
            </button>
          </div>
        )}

        {/* Documentation Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            📖 Check out the{' '}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">
              docs/clerk-integration-guide.md
            </span>{' '}
            for complete implementation details
          </p>
        </div>
      </div>
    </div>
  );
}