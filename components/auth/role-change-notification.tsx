"use client";

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info, X, Wifi, WifiOff } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { websocketService } from '../../lib/websocket'; // WebSocket service for real-time notifications
import { toast } from "sonner";

export function RoleChangeNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const { refreshPermissions, user } = useAuth();

  useEffect(() => {
    // Check WebSocket connection status
    const checkWebSocketStatus = () => {
      setIsWebSocketConnected(websocketService.isSocketConnected());
    };

    // Check if user needs to refresh permissions (fallback for when WebSocket is not connected)
    const checkForRoleChanges = () => {
      // Only show manual notification if WebSocket is not connected
      if (!websocketService.isSocketConnected()) {
        const hasBeenOnPage = sessionStorage.getItem('pageLoadTime');
        if (!hasBeenOnPage) {
          sessionStorage.setItem('pageLoadTime', Date.now().toString());
        } else {
          const timeOnPage = Date.now() - parseInt(hasBeenOnPage);
          // Show notification after 30 seconds to remind users to refresh if needed
          if (timeOnPage > 30000 && !sessionStorage.getItem('roleNotificationShown')) {
            setShowNotification(true);
          }
        }
      }
    };

    // Check WebSocket status every 5 seconds
    const wsInterval = setInterval(checkWebSocketStatus, 5000);
    
    // Check for role changes every 10 seconds (fallback)
    const roleInterval = setInterval(checkForRoleChanges, 10000);
    
    // Initial check
    checkWebSocketStatus();
    checkForRoleChanges();

    return () => {
      clearInterval(wsInterval);
      clearInterval(roleInterval);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPermissions();
      setShowNotification(false);
      sessionStorage.setItem('roleNotificationShown', 'true');
      toast.success("Quyền đã được cập nhật thành công!");
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
      toast.error("Không thể cập nhật quyền. Vui lòng thử lại.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    sessionStorage.setItem('roleNotificationShown', 'true');
  };

  // Show WebSocket status indicator
  if (!user) {
    return null;
  }

  // Show manual refresh notification only if WebSocket is not connected
  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium mb-1">Cập nhật quyền</p>
              <p className="text-sm">
                Nếu quyền của bạn đã được thay đổi bởi admin, hãy cập nhật để xem giao diện mới.
              </p>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-blue-600 border-blue-300 hover:bg-blue-100 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900"
              >
                {isRefreshing ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 p-1"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
