"use client"

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, User, Shield } from 'lucide-react';

export function AuthDebugPanel() {
  const { user, isAuthenticated, isLoading, clearAuthState } = useAuth();

  const handleClearAuth = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu xác thực? Điều này sẽ đăng xuất bạn khỏi hệ thống.')) {
      clearAuthState();
      window.location.reload();
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <Card className="w-full max-w-md mx-auto mb-4 border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Auth Debug Panel
        </CardTitle>
        <CardDescription className="text-xs">
          Chỉ hiển thị trong môi trường development
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3" />
            <span className="text-xs font-medium">Trạng thái:</span>
            <Badge variant={isAuthenticated ? "default" : "secondary"} className="text-xs">
              {isLoading ? "Đang tải..." : isAuthenticated ? "Đã đăng nhập" : "Chưa đăng nhập"}
            </Badge>
          </div>
          
          {user && (
            <div className="text-xs space-y-1">
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Tên:</strong> {user.name}</div>
              <div><strong>Role:</strong> {user.role}</div>
              <div><strong>ID:</strong> {user.id}</div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleClearAuth}
            variant="destructive"
            size="sm"
            className="text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear Auth
          </Button>
          
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
