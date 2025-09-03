"use client";

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, LogOut } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface AccountDisabledAlertProps {
  email?: string;
  onDismiss?: () => void;
}

export function AccountDisabledAlert({ email, onDismiss }: AccountDisabledAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { clearAuthState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Listen for account disabled events
    const handleAccountDisabled = (event: CustomEvent) => {
      console.log('Account disabled event received in alert component:', event.detail);
      setIsVisible(true);
    };

    window.addEventListener('account-disabled', handleAccountDisabled as EventListener);
    
    return () => {
      window.removeEventListener('account-disabled', handleAccountDisabled as EventListener);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleLogout = () => {
    clearAuthState();
    setIsVisible(false);
    router.push('/login');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <Alert className="border-red-200 bg-red-50 m-0">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 text-lg">
            Tài khoản đã bị khóa
          </AlertTitle>
          <AlertDescription className="text-red-700 mt-3">
            <div className="space-y-4">
              <p>
                Tài khoản của bạn đã bị khóa và không thể truy cập hệ thống. 
                Điều này có thể do:
              </p>
              
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Vi phạm quy định sử dụng</li>
                <li>Bảo mật tài khoản</li>
                <li>Yêu cầu từ quản trị viên</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-yellow-800 text-sm">
                  <strong>Để được hỗ trợ:</strong> Vui lòng liên hệ quản trị viên hệ thống 
                  hoặc gửi email yêu cầu mở khóa tài khoản.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </Button>
                
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tải lại trang
                </Button>
                
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="w-full text-gray-600"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
