"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, User, Mail, Shield } from 'lucide-react';

interface GoogleAuthInfoProps {
  className?: string;
}

export function GoogleAuthInfo({ className = "" }: GoogleAuthInfoProps) {
  const { user: firebaseUser, logout: firebaseLogout } = useFirebaseAuth();
  const { user: appUser, logout: appLogout } = useAuth();

  const handleLogout = async () => {
    try {
      // Logout from both Firebase and app
      await Promise.all([
        firebaseLogout(),
        appLogout()
      ]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!firebaseUser) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          Thông tin đăng nhập Google
        </CardTitle>
        <CardDescription>
          Tài khoản được liên kết với Google
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Avatar and Basic Info */}
        <div className="flex items-center gap-4">
          {firebaseUser.photoURL ? (
            <img
              src={firebaseUser.photoURL}
              alt={firebaseUser.displayName || 'User'}
              className="w-16 h-16 rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-500" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {firebaseUser.displayName || 'Người dùng Google'}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {firebaseUser.email}
            </p>
          </div>
        </div>

        {/* Account Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trạng thái tài khoản:</span>
            <Badge variant={firebaseUser.emailVerified ? "default" : "secondary"}>
              {firebaseUser.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
            </Badge>
          </div>
          
          {appUser && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Vai trò trong hệ thống:</span>
              <Badge variant="outline">
                {appUser.role === 'admin' ? 'Quản trị viên' : 
                 appUser.role === 'staff' ? 'Nhân viên' : 'Người tham dự'}
              </Badge>
            </div>
          )}
        </div>

        {/* Firebase UID */}
        <div className="space-y-1">
          <span className="text-sm font-medium">Firebase UID:</span>
          <p className="text-xs text-muted-foreground font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
            {firebaseUser.uid}
          </p>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Đăng xuất khỏi Google
        </Button>
      </CardContent>
    </Card>
  );
}
