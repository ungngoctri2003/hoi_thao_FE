"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'staff' | 'attendee')[];
  fallbackPath?: string;
  showToast?: boolean;
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = '/dashboard',
  showToast = true 
}: RoleGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && !allowedRoles.includes(user.role as any)) {
      if (showToast) {
        toast.error("Bạn không có quyền truy cập trang này", {
          description: `Trang này chỉ dành cho: ${allowedRoles.join(', ')}`,
          duration: 5000,
        });
      }
      router.push(fallbackPath);
    }
  }, [user, isAuthenticated, isLoading, allowedRoles, fallbackPath, router, showToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user && !allowedRoles.includes(user.role as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Không có quyền truy cập
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-4">
              Bạn không có quyền truy cập trang này. Trang này chỉ dành cho: {allowedRoles.join(', ')}
            </p>
            <button
              onClick={() => router.push(fallbackPath)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience components for common role checks
export function AdminOnly({ children, fallbackPath = '/dashboard' }: { children: React.ReactNode; fallbackPath?: string }) {
  return (
    <RoleGuard allowedRoles={['admin']} fallbackPath={fallbackPath}>
      {children}
    </RoleGuard>
  );
}

export function StaffAndAdmin({ children, fallbackPath = '/dashboard' }: { children: React.ReactNode; fallbackPath?: string }) {
  return (
    <RoleGuard allowedRoles={['admin', 'staff']} fallbackPath={fallbackPath}>
      {children}
    </RoleGuard>
  );
}

export function AllRoles({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin', 'staff', 'attendee']}>
      {children}
    </RoleGuard>
  );
}





