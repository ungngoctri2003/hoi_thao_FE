"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  CheckCheck, 
  Trash2, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Clock,
  Bell,
  Archive
} from "lucide-react";
import { useNotificationStore, Notification } from "@/lib/notification-service";

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Info className="h-4 w-4 text-blue-600" />;
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'border-l-green-500 bg-green-50 dark:bg-green-950';
    case 'warning':
      return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950';
    case 'error':
      return 'border-l-red-500 bg-red-50 dark:bg-red-950';
    default:
      return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
  }
};

function NotificationItem({ notification }: { notification: Notification }) {
  const { markAsRead, removeNotification, archiveNotification } = useNotificationStore();

  const handleMarkAsRead = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  const handleRemove = async () => {
    await removeNotification(notification.id);
  };

  const handleArchive = async () => {
    await archiveNotification(notification.id);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  return (
    <div 
      className={`p-3 border-l-4 ${getNotificationColor(notification.type)} ${
        !notification.read ? 'font-medium' : 'opacity-75'
      } hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {notification.title}
            </h4>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(notification.timestamp)}
              </span>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {notification.message}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            {!notification.read && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMarkAsRead}
                className="h-6 px-2 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Đã đọc
              </Button>
            )}
            {!notification.is_archived && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleArchive}
                className="h-6 px-2 text-xs text-yellow-600 hover:text-yellow-700"
              >
                <Archive className="h-3 w-3 mr-1" />
                Lưu trữ
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemove}
              className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Xóa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationPanel() {
  const { notifications, unreadCount, markAllAsRead, clearAll, isLoading } = useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'archived') return notification.is_archived;
    return !notification.is_archived; // Show non-archived by default
  });

  return (
    <Card className="absolute right-0 top-10 w-80 z-50 shadow-lg border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Thông báo
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={markAllAsRead}
                className="h-6 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Đọc tất cả
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={clearAll}
              className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'ghost'}
            onClick={() => setFilter('all')}
            className="h-6 px-2 text-xs"
          >
            Tất cả
          </Button>
          <Button
            size="sm"
            variant={filter === 'unread' ? 'default' : 'ghost'}
            onClick={() => setFilter('unread')}
            className="h-6 px-2 text-xs"
          >
            Chưa đọc ({unreadCount})
          </Button>
          <Button
            size="sm"
            variant={filter === 'archived' ? 'default' : 'ghost'}
            onClick={() => setFilter('archived')}
            className="h-6 px-2 text-xs"
          >
            Đã lưu trữ
          </Button>
        </div>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm">Đang tải thông báo...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {filter === 'unread' 
                  ? 'Không có thông báo chưa đọc' 
                  : filter === 'archived'
                  ? 'Không có thông báo đã lưu trữ'
                  : 'Không có thông báo nào'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredNotifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
