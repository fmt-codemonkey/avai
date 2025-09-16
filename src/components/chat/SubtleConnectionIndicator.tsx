"use client";

import { useWebSocket } from '@/hooks/use-websocket';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionDotProps {
  isConnected: boolean;
  reconnectAttempts: number;
}

const ConnectionDot = ({ isConnected, reconnectAttempts }: ConnectionDotProps) => {
  const getConnectionStatus = () => {
    if (isConnected) {
      return 'excellent';
    } else if (reconnectAttempts > 0 && reconnectAttempts < 3) {
      return 'poor';
    } else if (reconnectAttempts >= 3) {
      return 'offline';
    }
    return 'good';
  };

  const status = getConnectionStatus();
  
  const colorClass = {
    excellent: 'bg-green-500',
    good: 'bg-yellow-500', 
    poor: 'bg-orange-500',
    offline: 'bg-red-500'
  }[status] || 'bg-gray-500';

  return (
    <div className={cn(
      "w-2 h-2 rounded-full",
      colorClass,
      !isConnected && "animate-pulse"
    )} />
  );
};

const getConnectionText = (isConnected: boolean, reconnectAttempts: number) => {
  if (isConnected && reconnectAttempts === 0) {
    return null; // Hide when fully connected
  } else if (isConnected && reconnectAttempts > 0) {
    return "Connection restored";
  } else if (reconnectAttempts > 3) {
    return "Connection issues - Click to retry";
  } else if (!isConnected) {
    return "Reconnecting...";
  }
  return null;
};

export function SubtleConnectionIndicator() {
  const { isConnected, reconnectAttempts, connect } = useWebSocket();
  
  const connectionText = getConnectionText(isConnected, reconnectAttempts);
  
  // Only show when there are connection issues or during reconnection
  if (isConnected && reconnectAttempts === 0) {
    return null;
  }

  const handleRefresh = () => {
    if (connect) {
      connect();
    }
  };

  return (
    <div className="flex items-center justify-center py-2 border-b border-border/30 bg-muted/20">
      <div className="flex items-center text-xs text-muted-foreground">
        <ConnectionDot isConnected={isConnected} reconnectAttempts={reconnectAttempts} />
        {connectionText && (
          <span className="ml-2">
            {connectionText}
          </span>
        )}
        {!isConnected && reconnectAttempts > 2 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2 h-6 px-2 text-xs hover:bg-muted/50" 
            onClick={handleRefresh}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}