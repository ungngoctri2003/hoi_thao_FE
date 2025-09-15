"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  RefreshCw,
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // Mock data for now - replace with actual API call
        const mockNotifications: Notification[] = [
          {
            id: "1",
            type: "success",
            title: "Check-in thành công",
            message: "Nguyễn Văn A đã check-in vào lúc 09:30",
            timestamp: new Date().toISOString(),
            read: false,
          },
          {
            id: "2",
            type: "warning",
            title: "Sự kiện sắp đầy",
            message: "Workshop AI chỉ còn 5 chỗ trống",
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            read: false,
          },
          {
            id: "3",
            type: "info",
            title: "Cập nhật hệ thống",
            message: "Hệ thống đã được cập nhật lên phiên bản mới",
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            read: true,
          },
        ];

        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter((n) => !n.read).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "error":
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-100 dark:bg-green-900";
      case "warning":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900";
      case "error":
        return "text-red-600 bg-red-100 dark:bg-red-900";
      default:
        return "text-blue-600 bg-blue-100 dark:bg-blue-900";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Thông báo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 border rounded-lg"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Thông báo
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Đánh dấu đã đọc
              </Button>
            )}
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              return (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 border rounded-lg transition-colors ${
                    !notification.read
                      ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                      : ""
                  }`}
                >
                  <div
                    className={`p-1 rounded-full ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNotification(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không có thông báo mới</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
