"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useNotification } from '@/hooks/use-notification';
import { apiClient } from '@/lib/api';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  mode?: "login" | "register"; // Thêm prop để phân biệt login/register
}

export function GoogleSignInButton({ 
  onSuccess, 
  onError, 
  variant = "outline",
  size = "default",
  className = "",
  children,
  mode = "login" // Mặc định là login
}: GoogleSignInButtonProps) {
  const { signInWithGoogle, loading } = useFirebaseAuth();
  const { showSuccess, showError } = useNotification();

  const handleGoogleSignIn = async () => {
    try {
      // With redirect flow, this will redirect the user to Google
      // The actual authentication will be handled when they return
      await signInWithGoogle(mode);
      
      // This code won't execute because of the redirect
      // The authentication will be handled in the useEffect when the user returns
    } catch (error: any) {
      console.error('Google authentication error:', error);
      const errorMessage = mode === "login" 
        ? "Không thể đăng nhập với Google." 
        : "Không thể đăng ký với Google.";
      showError("Lỗi xác thực", error.message || errorMessage);
      onError?.(error.message || "Authentication failed");
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={`w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-primary hover:text-primary-foreground ${className}`}
      onClick={handleGoogleSignIn}
      disabled={loading}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          Đang xử lý...
        </div>
      ) : (
        children || (
          <div className="flex items-center gap-2 ">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
{mode === "login" ? "Đăng nhập với Google" : "Đăng ký với Google"}
          </div>
        )
      )}
    </Button>
  );
}
