"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { apiClient } from '@/lib/api';

export interface Permission {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!isAuthenticated || !user) {
        setPermissions([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Get user's current permissions from the API
        const userInfo = await apiClient.getCurrentUser();
        
        // Determine permissions based on role
        const roleBasedPermissions = getRoleBasedPermissions(user.role as "admin" | "staff" | "attendee");
        setPermissions(roleBasedPermissions);
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
        // Fallback to role-based permissions
        const roleBasedPermissions = getRoleBasedPermissions(user.role as "admin" | "staff" | "attendee");
        setPermissions(roleBasedPermissions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [user, isAuthenticated]);

  const hasPermission = (permissionCode: string): boolean => {
    return permissions.some(permission => permission.code === permissionCode);
  };

  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    return permissionCodes.some(code => hasPermission(code));
  };

  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    return permissionCodes.every(code => hasPermission(code));
  };

  return {
    permissions,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions: async () => {
      if (!user) return;
      try {
        const userInfo = await apiClient.refreshPermissions();
        // Determine permissions based on role
        const roleBasedPermissions = getRoleBasedPermissions(user.role as "admin" | "staff" | "attendee");
        setPermissions(roleBasedPermissions);
      } catch (error) {
        console.error('Failed to refresh permissions:', error);
      }
    }
  };
}

// Fallback function to get permissions based on role
function getRoleBasedPermissions(role: "admin" | "staff" | "attendee"): Permission[] {
  const basePermissions: Record<string, Permission> = {
    'dashboard.view': { id: 1, code: 'dashboard.view', name: 'Xem Dashboard' },
    'profile.view': { id: 2, code: 'profile.view', name: 'Xem Profile' },
    'conferences.view': { id: 3, code: 'conferences.view', name: 'Xem Hội nghị' },
    'conferences.create': { id: 4, code: 'conferences.create', name: 'Tạo Hội nghị' },
    'conferences.update': { id: 5, code: 'conferences.update', name: 'Cập nhật Hội nghị' },
    'conferences.delete': { id: 6, code: 'conferences.delete', name: 'Xóa Hội nghị' },
    'attendees.view': { id: 7, code: 'attendees.view', name: 'Xem Người tham dự' },
    'attendees.read': { id: 8, code: 'attendees.read', name: 'Đọc Người tham dự' },
    'attendees.write': { id: 9, code: 'attendees.write', name: 'Ghi Người tham dự' },
    'attendees.manage': { id: 10, code: 'attendees.manage', name: 'Quản lý Người tham dự' },
    'checkin.manage': { id: 11, code: 'checkin.manage', name: 'Quản lý Check-in' },
    'roles.manage': { id: 12, code: 'roles.manage', name: 'Quản lý Phân quyền' },
    'audit.view': { id: 13, code: 'audit.view', name: 'Xem Nhật ký' },
    'settings.manage': { id: 14, code: 'settings.manage', name: 'Quản lý Cài đặt' },
    'analytics.view': { id: 15, code: 'analytics.view', name: 'Xem Phân tích' },
    'networking.view': { id: 16, code: 'networking.view', name: 'Xem Kết nối mạng' },
    'venue.view': { id: 17, code: 'venue.view', name: 'Xem Bản đồ' },
    'sessions.view': { id: 18, code: 'sessions.view', name: 'Xem Phiên trực tiếp' },
    'badges.view': { id: 19, code: 'badges.view', name: 'Xem Huy hiệu' },
    'mobile.view': { id: 20, code: 'mobile.view', name: 'Xem Ứng dụng di động' },
    'my-events.view': { id: 21, code: 'my-events.view', name: 'Xem Sự kiện của tôi' },
  };

  switch (role) {
    case 'admin':
      return Object.values(basePermissions);
    case 'staff':
      return [
        basePermissions['dashboard.view'],
        basePermissions['profile.view'],
        basePermissions['conferences.view'],
        basePermissions['conferences.create'],
        basePermissions['conferences.update'],
        basePermissions['attendees.view'],
        basePermissions['attendees.read'],
        basePermissions['attendees.write'],
        basePermissions['attendees.manage'],
        basePermissions['checkin.manage'],
        basePermissions['networking.view'],
        basePermissions['venue.view'],
        basePermissions['sessions.view'],
        basePermissions['badges.view'],
        basePermissions['mobile.view'],
      ];
    case 'attendee':
      return [
        basePermissions['dashboard.view'],
        basePermissions['profile.view'],
        basePermissions['networking.view'],
        basePermissions['venue.view'],
        basePermissions['sessions.view'],
        basePermissions['badges.view'],
        basePermissions['mobile.view'],
        basePermissions['my-events.view'],
      ];
    default:
      return [];
  }
}
