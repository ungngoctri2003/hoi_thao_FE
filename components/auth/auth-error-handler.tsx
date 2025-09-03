"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

interface AuthErrorHandlerProps {
  error: string;
  onRetry?: () => void;
  onLogin?: () => void;
  showRetry?: boolean;
  showLogin?: boolean;
}

export function AuthErrorHandler({ 
  error, 
  onRetry, 
  onLogin, 
  showRetry = true, 
  showLogin = true 
}: AuthErrorHandlerProps) {
  const isAuthError = error.includes('401') || error.includes('Unauthorized') || error.includes('quyền truy cập');
  const isPermissionError = error.includes('403') || error.includes('Forbidden');
  const isExpiredError = error.includes('hết hạn') || error.includes('expired');

  const getErrorInfo = () => {
    if (isExpiredError) {
      return {
        title: "Phiên đăng nhập đã hết hạn",
        description: "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng.",
        icon: <AlertTriangle className="h-12 w-12 text-orange-500" />,
        actionText: "Đăng nhập lại",
        actionIcon: <LogIn className="mr-2 h-4 w-4" />
      };
    } else if (isAuthError) {
      return {
        title: "Cần đăng nhập",
        description: "Bạn cần đăng nhập để truy cập tính năng này. Vui lòng đăng nhập và thử lại.",
        icon: <AlertTriangle className="h-12 w-12 text-blue-500" />,
        actionText: "Đăng nhập",
        actionIcon: <LogIn className="mr-2 h-4 w-4" />
      };
    } else if (isPermissionError) {
      return {
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền truy cập tính năng này. Vui lòng liên hệ quản trị viên để được cấp quyền.",
        icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
        actionText: "Thử lại",
        actionIcon: <RefreshCw className="mr-2 h-4 w-4" />
      };
    } else {
      return {
        title: "Có lỗi xảy ra",
        description: error,
        icon: <AlertTriangle className="h-12 w-12 text-gray-500" />,
        actionText: "Thử lại",
        actionIcon: <RefreshCw className="mr-2 h-4 w-4" />
      };
    }
  };

  const errorInfo = getErrorInfo();

  const handleAction = () => {
    if (isAuthError || isExpiredError) {
      if (onLogin) {
        onLogin();
      } else {
        window.location.href = '/login';
      }
    } else if (onRetry) {
      onRetry();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4">
          {errorInfo.icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{errorInfo.title}</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {errorInfo.description}
        </p>
        <div className="flex gap-2">
          {(showRetry || showLogin) && (
            <Button onClick={handleAction} variant={isAuthError || isExpiredError ? "default" : "outline"}>
              {errorInfo.actionIcon}
              {errorInfo.actionText}
            </Button>
          )}
          {showRetry && !isAuthError && !isExpiredError && (
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
