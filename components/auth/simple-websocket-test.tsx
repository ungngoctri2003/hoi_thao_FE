"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';

export function SimpleWebSocketTest() {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { user } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-4), `[${timestamp}] ${message}`]);
  };

  const connectWebSocket = () => {
    if (socket) {
      socket.disconnect();
    }

    addLog('Connecting to WebSocket...');
    
    // Import socket.io-client dynamically
    import('socket.io-client').then(({ io }) => {
      const newSocket = io('http://localhost:4000', {
        path: '/ws',
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        addLog('✅ Connected successfully!');
        setIsConnected(true);
        
        // Join user room
        if (user) {
          newSocket.emit('join', `user:${user.id}`);
          addLog(`Joined room: user:${user.id}`);
        }
      });

      newSocket.on('disconnect', () => {
        addLog('❌ Disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error: any) => {
        addLog(`❌ Connection error: ${error.message}`);
        setIsConnected(false);
      });

      newSocket.on('permission_change', (data: any) => {
        addLog(`🔔 Permission change: ${JSON.stringify(data)}`);
      });

      setSocket(newSocket);
    });
  };

  const disconnectWebSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      addLog('🔌 Manually disconnected');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    // Auto connect when user is available
    if (user && !socket) {
      connectWebSocket();
    }
  }, [user]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
          WebSocket Test
        </CardTitle>
        <CardDescription>
          Simple WebSocket connection test
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Status:</span>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        {user && (
          <div className="text-sm text-muted-foreground">
            User: {user.email} (ID: {user.id})
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={connectWebSocket} 
            disabled={isConnected}
            size="sm"
          >
            <Wifi className="h-4 w-4 mr-2" />
            Connect
          </Button>
          <Button 
            onClick={disconnectWebSocket} 
            disabled={!isConnected}
            variant="outline"
            size="sm"
          >
            <WifiOff className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
          <Button 
            onClick={clearLogs}
            variant="ghost"
            size="sm"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium">Logs:</div>
          <div className="bg-muted p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-muted-foreground">No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
