"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import { toast } from "sonner";

interface RefreshPermissionsButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

export function RefreshPermissionsButton({ 
  className = "", 
  variant = "outline",
  size = "default"
}: RefreshPermissionsButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const { refreshPermissions, user } = useAuth();
  const { refreshPermissions: refreshPermissionsHook } = usePermissions();

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const oldRole = user?.role;
      // Refresh both auth state and permissions
      await Promise.all([
        refreshPermissions(),
        refreshPermissionsHook()
      ]);
      setLastRefreshTime(new Date());
      
      // Show success message with role change info
      toast.success("Quyền đã được cập nhật thành công!", {
        description: oldRole !== user?.role ? `Role đã thay đổi từ ${oldRole} thành ${user?.role}` : "Thông tin quyền đã được làm mới",
        duration: 5000,
      });
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
      toast.error("Không thể cập nhật quyền. Vui lòng thử lại.", {
        description: "Có thể do lỗi kết nối hoặc phiên đăng nhập đã hết hạn",
        duration: 5000,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) {
    return null;
  }

  // Show a subtle indicator if permissions were recently refreshed
  const showRecentRefresh = lastRefreshTime && (Date.now() - lastRefreshTime.getTime()) < 10000; // 10 seconds

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant={variant}
      size={size}
      className={`${className} ${isRefreshing ? 'opacity-50' : ''} ${showRecentRefresh ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}
      title="Cập nhật quyền của bạn (sử dụng khi role đã được thay đổi bởi admin)"
    >
      {isRefreshing ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Đang cập nhật...
        </>
      ) : showRecentRefresh ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
          Đã cập nhật
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Cập nhật quyền
        </>
      )}
    </Button>
  );
}
