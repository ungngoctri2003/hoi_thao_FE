"use client";

import { useConferencePermissions } from '@/hooks/use-conference-permissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Building } from 'lucide-react';

interface ConferencePermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: string[];
  conferenceId?: number;
  fallbackPath?: string;
  showToast?: boolean;
  requireAllPermissions?: boolean;
}

export function ConferencePermissionGuard({ 
  children, 
  requiredPermissions,
  conferenceId,
  fallbackPath = '/dashboard',
  showToast = true,
  requireAllPermissions = false
}: ConferencePermissionGuardProps) {
  const { 
    hasConferencePermission, 
    hasAnyConferencePermission, 
    hasAllConferencePermission,
    getAvailableConferences,
    getConferenceName,
    isLoading,
    currentConferenceId
  } = useConferencePermissions();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check if user has required permissions
    let hasPermission = false;
    
    // Use currentConferenceId if conferenceId is not provided
    const targetConferenceId = conferenceId || currentConferenceId;
    
    if (requireAllPermissions) {
      hasPermission = targetConferenceId 
        ? hasAllConferencePermission(requiredPermissions[0]) // For single permission check
        : requiredPermissions.every(permission => 
            hasAllConferencePermission(permission)
          );
    } else {
      hasPermission = targetConferenceId 
        ? requiredPermissions.some(permission => 
            hasConferencePermission(permission, targetConferenceId)
          )
        : requiredPermissions.some(permission => 
            hasAnyConferencePermission(permission)
          );
    }

    if (!hasPermission) {
      if (showToast) {
        const conferenceName = targetConferenceId ? getConferenceName(targetConferenceId) : 'hội nghị hiện tại';
        toast.error("Bạn không có quyền truy cập", {
          description: `Bạn cần quyền ${requiredPermissions.join(', ')} cho ${conferenceName}`,
          duration: 5000,
        });
      }
      router.push(fallbackPath);
    }
  }, [isLoading, requiredPermissions, conferenceId, currentConferenceId, hasConferencePermission, hasAnyConferencePermission, hasAllConferencePermission, getConferenceName, fallbackPath, router, showToast, requireAllPermissions]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Check permissions again for render
  let hasPermission = false;
  
  // Use currentConferenceId if conferenceId is not provided
  const targetConferenceId = conferenceId || currentConferenceId;
  
  if (requireAllPermissions) {
    hasPermission = targetConferenceId 
      ? hasAllConferencePermission(requiredPermissions[0])
      : requiredPermissions.every(permission => 
          hasAllConferencePermission(permission)
        );
  } else {
    hasPermission = targetConferenceId 
      ? requiredPermissions.some(permission => 
          hasConferencePermission(permission, targetConferenceId)
        )
      : requiredPermissions.some(permission => 
          hasAnyConferencePermission(permission)
        );
  }

  if (!hasPermission) {
    const availableConferences = getAvailableConferences();
    const conferenceName = targetConferenceId ? getConferenceName(targetConferenceId) : 'hội nghị hiện tại';

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 dark:bg-red-900 rounded-full p-3">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Không có quyền truy cập
            </h2>
            
            <p className="text-red-600 dark:text-red-400 mb-4">
              Bạn không có quyền <strong>{requiredPermissions.join(', ')}</strong> cho {conferenceName}.
            </p>

            {availableConferences.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                  Các hội nghị bạn có quyền truy cập:
                </p>
                <div className="space-y-1">
                  {availableConferences.map((conference) => (
                    <div key={conference.conferenceId} className="flex items-center justify-center space-x-2">
                      <Building className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700 dark:text-red-300">
                        {conference.conferenceName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

// Convenience components for common permission checks
export function ConferenceViewGuard({ 
  children, 
  conferenceId, 
  fallbackPath = '/dashboard' 
}: { 
  children: React.ReactNode; 
  conferenceId?: number; 
  fallbackPath?: string; 
}) {
  return (
    <ConferencePermissionGuard 
      requiredPermissions={['conferences.view']} 
      conferenceId={conferenceId}
      fallbackPath={fallbackPath}
    >
      {children}
    </ConferencePermissionGuard>
  );
}

export function ConferenceManageGuard({ 
  children, 
  conferenceId, 
  fallbackPath = '/dashboard' 
}: { 
  children: React.ReactNode; 
  conferenceId?: number; 
  fallbackPath?: string; 
}) {
  return (
    <ConferencePermissionGuard 
      requiredPermissions={['conferences.create', 'conferences.update', 'conferences.delete']} 
      conferenceId={conferenceId}
      fallbackPath={fallbackPath}
    >
      {children}
    </ConferencePermissionGuard>
  );
}

export function AttendeeManageGuard({ 
  children, 
  conferenceId, 
  fallbackPath = '/dashboard' 
}: { 
  children: React.ReactNode; 
  conferenceId?: number; 
  fallbackPath?: string; 
}) {
  return (
    <ConferencePermissionGuard 
      requiredPermissions={['attendees.manage']} 
      conferenceId={conferenceId}
      fallbackPath={fallbackPath}
    >
      {children}
    </ConferencePermissionGuard>
  );
}

export function CheckinManageGuard({ 
  children, 
  conferenceId, 
  fallbackPath = '/dashboard' 
}: { 
  children: React.ReactNode; 
  conferenceId?: number; 
  fallbackPath?: string; 
}) {
  return (
    <ConferencePermissionGuard 
      requiredPermissions={['checkin.manage']} 
      conferenceId={conferenceId}
      fallbackPath={fallbackPath}
    >
      {children}
    </ConferencePermissionGuard>
  );
}
