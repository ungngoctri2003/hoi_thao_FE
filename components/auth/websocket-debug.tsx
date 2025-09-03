"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { websocketService } from '@/lib/websocket';
import { useAuth } from '@/hooks/use-auth';

export function WebSocketDebug() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const { user } = useAuth();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    const checkStatus = () => {
      const connected = websocketService.isSocketConnected();
      setIsConnected(connected);
      
      if (connected) {
        setLastError(null);
      }
    };

    // Check status every 2 seconds
    const interval = setInterval(checkStatus, 2000);
    
    // Initial check
    checkStatus();
    addLog('WebSocket debug component initialized');

    return () => clearInterval(interval);
  }, []);

  const handleConnect = () => {
    addLog('Attempting to connect WebSocket...');
    setConnectionAttempts(prev => prev + 1);
    websocketService.connect();
  };

  const handleDisconnect = () => {
    addLog('Disconnecting WebSocket...');
    websocketService.disconnect();
    setIsConnected(false);
  };

  const handleTestConnection = async () => {
    try {
      addLog('Testing backend connection...');
      const response = await fetch('http://localhost:4000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        addLog('✅ Backend API is accessible');
      } else {
        addLog(`❌ Backend API error: ${response.status}`);
      }
    } catch (error) {
      addLog(`❌ Backend connection failed: ${error}`);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          WebSocket Debug Panel
        </CardTitle>
        <CardDescription>
          Debug WebSocket connection and real-time features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Connection Status:</span>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Attempts: {connectionAttempts}
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <strong>User ID:</strong> {user.id} | 
              <strong> Email:</strong> {user.email} | 
              <strong> Role:</strong> {user.role}
            </div>
          </div>
        )}

        {/* Error Display */}
        {lastError && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="text-sm text-destructive">
              <strong>Last Error:</strong> {lastError}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={handleConnect} 
            disabled={isConnected}
            size="sm"
          >
            <Wifi className="h-4 w-4 mr-2" />
            Connect
          </Button>
          <Button 
            onClick={handleDisconnect} 
            disabled={!isConnected}
            variant="outline"
            size="sm"
          >
            <WifiOff className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
          <Button 
            onClick={handleTestConnection}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Test Backend
          </Button>
          <Button 
            onClick={clearLogs}
            variant="ghost"
            size="sm"
          >
            Clear Logs
          </Button>
        </div>

        {/* Logs */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Debug Logs:</div>
          <div className="bg-muted p-3 rounded-lg max-h-48 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-sm text-muted-foreground">No logs yet...</div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-xs font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Connection Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div><strong>WebSocket URL:</strong> ws://localhost:4000/ws</div>
          <div><strong>Expected Room:</strong> user:{user?.id || 'unknown'}</div>
          <div><strong>Transport:</strong> websocket, polling</div>
        </div>
      </CardContent>
    </Card>
  );
}
