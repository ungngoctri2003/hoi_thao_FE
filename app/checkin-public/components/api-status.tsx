"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface APIStatusProps {
  onRetry?: () => void;
}

export function APIStatus({ onRetry }: APIStatusProps) {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline' | 'error'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkAPIStatus = async () => {
    setStatus('checking');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/public/conferences`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkAPIStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkAPIStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: CheckCircle,
          label: 'API Online',
          color: 'bg-green-100 text-green-800',
          iconColor: 'text-green-600'
        };
      case 'offline':
        return {
          icon: WifiOff,
          label: 'API Offline',
          color: 'bg-yellow-100 text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      case 'error':
        return {
          icon: XCircle,
          label: 'API Error',
          color: 'bg-red-100 text-red-800',
          iconColor: 'text-red-600'
        };
      case 'checking':
        return {
          icon: RefreshCw,
          label: 'Checking...',
          color: 'bg-blue-100 text-blue-800',
          iconColor: 'text-blue-600'
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <Card className="mb-4">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">API Status:</span>
            </div>
            <Badge className={config.color}>
              <IconComponent className={`h-3 w-3 mr-1 ${config.iconColor} ${status === 'checking' ? 'animate-spin' : ''}`} />
              {config.label}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {lastCheck && (
              <span className="text-xs text-muted-foreground">
                Last check: {lastCheck.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={checkAPIStatus}
              disabled={status === 'checking'}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${status === 'checking' ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {onRetry && status !== 'online' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
              >
                Retry
              </Button>
            )}
          </div>
        </div>
        
        {status !== 'online' && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <strong>Note:</strong> API is not available. The system is running in mock mode with sample data.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
