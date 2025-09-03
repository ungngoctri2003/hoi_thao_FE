"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useNotification } from '@/hooks/use-notification';
import { authService } from '@/lib/auth';

export function GoogleAuthRedirectHandler() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('Đang xử lý đăng nhập...');
  const { user, loading } = useFirebaseAuth();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  // Check if we're coming from a Google redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasRedirectParams = urlParams.has('code') || urlParams.has('state') || 
                             window.location.hash.includes('access_token') ||
                             document.referrer.includes('accounts.google.com');
    
    if (hasRedirectParams) {
      console.log('🔄 Google redirect detected, starting processing...');
      setIsProcessing(true);
    }
  }, []);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        console.log('🔄 Handling redirect result...', { loading, user: !!user });
        
        // Wait for Firebase auth to process the redirect
        if (!loading && user) {
          console.log('✅ Firebase user authenticated:', user.email);
          setMessage('Đăng nhập thành công! Đang chuyển hướng...');
          
          // Check if we have tokens (backend authentication was successful)
          const accessToken = localStorage.getItem('accessToken');
          const refreshToken = localStorage.getItem('refreshToken');
          const hasAccessTokenCookie = document.cookie.includes('accessToken=');
          
          console.log('🔍 Token check:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken, 
            hasAccessTokenCookie,
            cookies: document.cookie 
          });
          
          if (accessToken || hasAccessTokenCookie) {
            console.log('✅ Backend tokens found, redirecting to dashboard...');
            showSuccess("Đăng nhập thành công!", "Chào mừng bạn đến với hệ thống quản lý hội nghị.");
            
            // Redirect immediately without waiting for auth service reinitialize
            setTimeout(() => {
              console.log('🚀 Redirecting to dashboard...');
              router.push('/dashboard');
            }, 500); // Reduced timeout for faster redirect
          } else if (user && user.email) {
            // Fallback: If Firebase user exists but no backend tokens, still redirect
            console.log('⚠️ Firebase user exists but no backend tokens, redirecting anyway...');
            showSuccess("Đăng nhập thành công!", "Chào mừng bạn đến với hệ thống quản lý hội nghị.");
            
            setTimeout(() => {
              console.log('🚀 Fallback redirect to dashboard...');
              router.push('/dashboard');
            }, 1000);
          } else {
            console.log('❌ No backend tokens found, but Firebase auth succeeded');
            setMessage('Đăng nhập Firebase thành công nhưng backend thất bại. Đang chuyển hướng...');
            showError("Đăng nhập thất bại", "Không thể xác thực với backend.");
            
            setTimeout(() => {
              router.push('/login');
            }, 1000);
          }
        } else if (!loading && !user) {
          console.log('❌ No Firebase user found');
          setMessage('Đăng nhập thất bại. Đang chuyển hướng...');
          showError("Đăng nhập thất bại", "Không thể đăng nhập với Google.");
          
          setTimeout(() => {
            router.push('/login');
          }, 1000);
        } else {
          console.log('⏳ Still loading or waiting for user...');
        }
      } catch (error) {
        console.error('❌ Error handling redirect:', error);
        setMessage('Có lỗi xảy ra. Đang chuyển hướng...');
        showError("Lỗi xác thực", "Có lỗi xảy ra trong quá trình đăng nhập.");
        
        setTimeout(() => {
          router.push('/login');
        }, 1000);
      } finally {
        setIsProcessing(false);
      }
    };

    // Only run if we're still processing and haven't redirected yet
    if (isProcessing) {
      // Add a small delay to ensure Firebase auth state is properly set
      const timer = setTimeout(() => {
        handleRedirectResult();
      }, 500); // Reduced delay for faster processing

      return () => clearTimeout(timer);
    }
  }, [user, loading, isProcessing, router, showSuccess, showError]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Xử lý đăng nhập
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Đang xác thực với Google...</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span>Đang lưu thông tin người dùng...</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <span>Đang chuyển hướng...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
