"use client";

import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";
import { websocketService } from '@/lib/websocket';

export function WebSocketStatus() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      setIsConnected(websocketService.isSocketConnected());
    };

    // Check status every 2 seconds
    const interval = setInterval(checkStatus, 2000);
    
    // Initial check
    checkStatus();

    return () => clearInterval(interval);
  }, []);

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"}
      className="flex items-center gap-1 text-xs"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          Real-time
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      )}
    </Badge>
  );
}
