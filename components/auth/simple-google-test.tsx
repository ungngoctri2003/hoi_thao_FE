"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { LogIn, UserPlus, LogOut, RefreshCw, AlertTriangle } from 'lucide-react';

export function SimpleGoogleTest() {
  const { user, isAuthenticated, clearAuthState } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleClearAll = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu xác thực?')) {
      clearAuthState();
      // Clear localStorage and cookies manually
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('authState');
      
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      window.location.reload();
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleStopLoop = () => {
    if (confirm('Dừng tất cả các vòng lặp authentication và reset?')) {
      // Clear all timers
      for (let i = 1; i < 99999; i++) {
        window.clearTimeout(i);
        window.clearInterval(i);
      }
      
      // Clear all auth data
      localStorage.clear();
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Redirect to login
      window.location.href = '/login';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          Emergency Auth Control
        </CardTitle>
        <CardDescription className="text-red-600">
          Sử dụng khi Google authentication bị lỗi vòng lặp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current State */}
        <div className="space-y-2">
          <h3 className="font-medium">Current Auth State</h3>
          <div className="p-3 bg-white rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </div>
            {user && (
              <div className="text-sm space-y-1">
                <div><strong>ID:</strong> {user.id}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Name:</strong> {user.name}</div>
                <div><strong>Role:</strong> {user.role}</div>
              </div>
            )}
          </div>
        </div>

        {/* Token Info */}
        <div className="space-y-2">
          <h3 className="font-medium">Token Information</h3>
          <div className="p-3 bg-white rounded-lg space-y-2">
            <div className="text-sm">
              <div><strong>Access Token:</strong> {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}</div>
              <div><strong>Refresh Token:</strong> {localStorage.getItem('refreshToken') ? 'Present' : 'Missing'}</div>
              <div><strong>Cookies:</strong> {document.cookie.includes('accessToken=') ? 'Present' : 'Missing'}</div>
            </div>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="space-y-2">
          <h3 className="font-medium text-red-700">Emergency Actions</h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleClearAll}
              variant="destructive"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Clear Auth Data
            </Button>
            
            <Button
              onClick={handleStopLoop}
              variant="destructive"
              size="sm"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Stop All Loops
            </Button>
            
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <h3 className="font-medium">Instructions</h3>
          <div className="p-3 bg-yellow-50 rounded-lg text-sm">
            <p><strong>Nếu Google auth bị lỗi vòng lặp:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Click "Stop All Loops" để dừng tất cả vòng lặp</li>
              <li>Click "Clear Auth Data" để xóa dữ liệu auth</li>
              <li>Refresh trang hoặc chuyển đến /login</li>
              <li>Thử đăng nhập lại với tài khoản thường</li>
            </ol>
          </div>
        </div>

        {/* Safe Navigation */}
        <div className="space-y-2">
          <h3 className="font-medium">Safe Navigation</h3>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => window.location.href = '/login'}
              variant="outline"
              size="sm"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Go to Login
            </Button>
            
            <Button
              onClick={() => window.location.href = '/register'}
              variant="outline"
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Go to Register
            </Button>
            
            <Button
              onClick={() => window.location.href = '/test-auth'}
              variant="outline"
              size="sm"
            >
              Go to Auth Test
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
