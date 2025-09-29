"use client";

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Key, AlertTriangle, CheckCircle } from "lucide-react";
import { apiClient } from '@/lib/api';
import { toast } from "sonner";
import { useAuth } from '@/hooks/use-auth';

interface AccountDisabledNoticeProps {
  email?: string;
  onFixed?: () => void;
}

export function AccountDisabledNotice({ email, onFixed }: AccountDisabledNoticeProps) {
  const { isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [disabledAccounts, setDisabledAccounts] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const checkDisabledAccounts = async () => {
    setIsChecking(true);
    try {
      const response = await apiClient.getUsers(1, 100);
      const disabled = response.data.filter((user: any) => user.status !== 'active');
      setDisabledAccounts(disabled);
    } catch (error) {
      console.error('Error checking disabled accounts:', error);
      // Don't show error toast for authentication issues to avoid spam
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('Phiên đăng nhập đã hết hạn') && 
          !errorMessage.includes('Token refresh failed')) {
        toast.error('Không thể kiểm tra trạng thái tài khoản');
      }
    } finally {
      setIsChecking(false);
    }
  };

  const fixAllDisabledAccounts = async () => {
    setIsFixing(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const user of disabledAccounts) {
        try {
          await apiClient.updateUser(Number(user.id), {
            name: user.name,
            email: user.email,
            status: 'active',
          });
          successCount++;
        } catch (error) {
          console.error(`Error fixing user ${user.email}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Đã mở khóa ${successCount} tài khoản thành công`);
        setDisabledAccounts([]);
        onFixed?.();
      }

      if (errorCount > 0) {
        toast.error(`Không thể mở khóa ${errorCount} tài khoản`);
      }
    } catch (error) {
      console.error('Error fixing disabled accounts:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('Phiên đăng nhập đã hết hạn') && 
          !errorMessage.includes('Token refresh failed')) {
        toast.error('Lỗi khi mở khóa tài khoản');
      }
    } finally {
      setIsFixing(false);
    }
  };

  const fixSpecificAccount = async (userEmail: string) => {
    const user = disabledAccounts.find(u => u.email === userEmail);
    if (!user) return;

    try {
      await apiClient.updateUser(Number(user.id), {
        name: user.name,
        email: user.email,
        status: 'active',
      });
      
      toast.success(`Đã mở khóa tài khoản ${user.name}`);
      setDisabledAccounts(prev => prev.filter(u => u.id !== user.id));
      
      if (user.email === email) {
        onFixed?.();
      }
    } catch (error) {
      console.error('Error fixing specific account:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes('Phiên đăng nhập đã hết hạn') && 
          !errorMessage.includes('Token refresh failed')) {
        toast.error('Không thể mở khóa tài khoản này');
      }
    }
  };

  useEffect(() => {
    // Only check for disabled accounts if user is authenticated
    if (isAuthenticated) {
      checkDisabledAccounts();
    }
  }, [isAuthenticated]);

  if (disabledAccounts.length === 0) {
    return null;
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">
        Có {disabledAccounts.length} tài khoản bị khóa
      </AlertTitle>
      <AlertDescription className="text-yellow-700">
        <div className="space-y-3">
          <p>
            Những tài khoản này không thể đăng nhập do trạng thái bị khóa. 
            Đây có thể là nguyên nhân gây lỗi "Account is disabled".
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={fixAllDisabledAccounts}
              disabled={isFixing}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isFixing ? 'Đang mở khóa...' : 'Mở khóa tất cả'}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              disabled={isChecking}
            >
              <Key className="mr-2 h-4 w-4" />
              {isChecking ? 'Đang kiểm tra...' : showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
            </Button>
          </div>

          {showDetails && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium">Danh sách tài khoản bị khóa:</p>
              <div className="space-y-1">
                {disabledAccounts.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-white p-2 rounded border">
                    <div>
                      <span className="font-medium">{user.name}</span>
                      <span className="text-gray-500 ml-2">({user.email})</span>
                      <span className="ml-2 text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                        {user.status}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fixSpecificAccount(user.email)}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      Mở khóa
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
