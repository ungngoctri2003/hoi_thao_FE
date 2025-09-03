"use client"

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User } from 'lucide-react';

export function AuthStatus() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { logout: firebaseLogout } = useFirebaseAuth();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm text-muted-foreground">Đang tải...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Chưa đăng nhập</span>
          </CardTitle>
          <CardDescription>
            Vui lòng đăng nhập để truy cập đầy đủ tính năng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <a href="/login">Đăng nhập</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/register-simple">Đăng ký</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Đã đăng nhập</span>
        </CardTitle>
        <CardDescription>
          Chào mừng bạn quay trở lại
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button 
          onClick={async () => {
            try {
              // Use Firebase logout which includes redirect logic
              await firebaseLogout();
            } catch (error) {
              console.error('Logout failed:', error);
              // Fallback: if Firebase logout fails, use app logout
              try {
                await logout();
              } catch (appLogoutError) {
                console.error('App logout also failed:', appLogoutError);
              }
            }
          }} 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </Button>
      </CardContent>
    </Card>
  );
}
