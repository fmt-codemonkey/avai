'use client';

import { Badge } from '@/components/ui/badge';
import { useWebSocketStore } from '@/stores/websocket-store';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

const statusConfig = {
  connected: {
    icon: Wifi,
    text: 'Connected',
    variant: 'default' as const,
    className: 'text-green-600 dark:text-green-400'
  },
  connecting: {
    icon: AlertCircle,
    text: 'Connecting...',
    variant: 'secondary' as const,
    className: 'text-yellow-600 dark:text-yellow-400'
  },
  disconnected: {
    icon: WifiOff,
    text: 'Disconnected',
    variant: 'destructive' as const,
    className: 'text-red-600 dark:text-red-400'
  }
};

interface ConnectionStatusProps {
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
}

export default function ConnectionStatus({ 
  showIcon = true, 
  showText = true,
  className = ''
}: ConnectionStatusProps) {
  const { isConnected, isConnecting } = useWebSocketStore();
  
  const connectionState = isConnected ? 'connected' 
    : isConnecting ? 'connecting' 
    : 'disconnected';
    
  const config = statusConfig[connectionState];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1.5 ${className}`}
    >
      {showIcon && (
        <Icon className={`h-3 w-3 ${config.className}`} />
      )}
      {showText && (
        <span className="text-xs font-medium">
          {config.text}
        </span>
      )}
    </Badge>
  );
}