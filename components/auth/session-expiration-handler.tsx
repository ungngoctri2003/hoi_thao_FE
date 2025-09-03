"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

export function SessionExpirationHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleSessionExpiration = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Session expiration detected:', customEvent.detail);
      
      // Show a more prominent notification
      toast({
        title: "Phiên đăng nhập đã hết hạn",
        description: "Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.",
        variant: "destructive",
        duration: 8000,
      });

      // Redirect to login page after a delay
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const loginUrl = currentPath === '/login' ? '/login' : `/login?redirect=${encodeURIComponent(currentPath)}`;
        router.push(loginUrl);
      }, 2000);
    };

    // Listen for session expiration events
    window.addEventListener('session-expired', handleSessionExpiration);

    // Cleanup
    return () => {
      window.removeEventListener('session-expired', handleSessionExpiration);
    };
  }, [router]);

  return null; // This component doesn't render anything
}
