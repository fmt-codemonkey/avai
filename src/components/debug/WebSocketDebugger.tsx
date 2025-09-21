"use client";

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/use-websocket';
import { useWebSocketStore } from '@/stores/websocket-store';

export function WebSocketDebugger() {
  const { 
    isConnected, 
    isConnecting, 
    lastError, 
    reconnectAttempts,
    connect,
    disconnect 
  } = useWebSocket();
  
  const { messageHistory } = useWebSocketStore();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 19)]);
  };

  useEffect(() => {
    if (isConnected) {
      addLog('✅ WebSocket connected successfully');
    } else if (isConnecting) {
      addLog('🔄 Attempting to connect...');
    } else if (lastError) {
      addLog(`❌ Error: ${lastError}`);
    }
  }, [isConnected, isConnecting, lastError]);

  const testConnection = () => {
    addLog('Starting connection test...');
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://avai-backend.onrender.com/ws';
    addLog(`Using WebSocket URL: ${wsUrl}`);
    connect();
  };

  const getStatusColor = () => {
    if (isConnected) return 'text-green-600';
    if (isConnecting) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusText = () => {
    if (isConnected) return 'Connected';
    if (isConnecting) return 'Connecting...';
    return 'Disconnected';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">WebSocket Connection Debugger</h2>
        
        {/* Status */}
        <div className="mb-4 p-4 border rounded">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Status:</strong> <span className={getStatusColor()}>{getStatusText()}</span>
            </div>
            <div>
              <strong>Reconnect Attempts:</strong> {reconnectAttempts}
            </div>
            <div className="col-span-2">
              <strong>WebSocket URL:</strong> {process.env.NEXT_PUBLIC_WS_URL || 'Using fallback URL'}
            </div>
            {lastError && (
              <div className="col-span-2">
                <strong>Last Error:</strong> <span className="text-red-600">{lastError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="mb-4 space-x-2">
          <button 
            onClick={testConnection}
            disabled={isConnecting}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Test Connection'}
          </button>
          <button 
            onClick={disconnect}
            disabled={!isConnected}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Disconnect
          </button>
          <button 
            onClick={() => setLogs([])}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Debug Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Logs */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Connection Logs</h3>
          <div className="bg-gray-100 p-3 rounded h-64 overflow-y-auto text-sm font-mono">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            ) : (
              <div className="text-gray-500">No logs yet...</div>
            )}
          </div>
        </div>

        {/* Message History */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Message History</h3>
          <div className="bg-gray-100 p-3 rounded h-64 overflow-y-auto text-sm">
            {messageHistory.length > 0 ? (
              messageHistory.slice(-10).reverse().map((msg, index) => (
                <div key={index} className="mb-2 p-2 bg-white rounded">
                  <div className="font-semibold">{msg.type}</div>
                  <div className="text-xs text-gray-500">{msg.timestamp}</div>
                  {msg.message && <div className="text-sm">{msg.message}</div>}
                </div>
              ))
            ) : (
              <div className="text-gray-500">No messages received yet...</div>
            )}
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold mb-2">Environment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
          <div><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</div>
          <div><strong>WebSocket Support:</strong> {typeof WebSocket !== 'undefined' ? 'Yes ✅' : 'No ❌'}</div>
          <div><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
}