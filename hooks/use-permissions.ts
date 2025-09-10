"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";
import { apiClient } from "@/lib/api";

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
        console.log("API User Info:", userInfo);

        // Use permissions from backend if available, otherwise fallback to role-based
        if (userInfo.permissions && userInfo.permissions.length > 0) {
          // Convert permission codes to Permission objects
          const permissionObjects = userInfo.permissions.map((code, index) => ({
            id: index + 1,
            code: code,
            name: getPermissionName(code),
            description: getPermissionDescription(code),
          }));
          console.log("Using API permissions:", permissionObjects);
          setPermissions(permissionObjects);
        } else {
          // Fallback to role-based permissions
          const roleBasedPermissions = getRoleBasedPermissions(
            user.role as "admin" | "staff" | "attendee"
          );
          console.log("Using role-based permissions:", roleBasedPermissions);
          setPermissions(roleBasedPermissions);
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        // Fallback to role-based permissions
        const roleBasedPermissions = getRoleBasedPermissions(
          user.role as "admin" | "staff" | "attendee"
        );
        console.log("Using fallback permissions:", roleBasedPermissions);
        setPermissions(roleBasedPermissions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();

    // Listen for permission changes
    const handlePermissionChange = () => {
      fetchPermissions();
    };

    window.addEventListener("permissions-changed", handlePermissionChange);

    return () => {
      window.removeEventListener("permissions-changed", handlePermissionChange);
    };
  }, [user, isAuthenticated]);

  const hasPermission = (permissionCode: string): boolean => {
    const hasPermission = permissions.some(
      (permission) => permission.code === permissionCode
    );
    return hasPermission;
  };

  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    return permissionCodes.some((code) => hasPermission(code));
  };

  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    return permissionCodes.every((code) => hasPermission(code));
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
        const roleBasedPermissions = getRoleBasedPermissions(
          user.role as "admin" | "staff" | "attendee"
        );
        setPermissions(roleBasedPermissions);
      } catch (error) {
        console.error("Failed to refresh permissions:", error);
      }
    },
  };
}

// Helper functions to convert permission codes to names and descriptions
function getPermissionName(code: string): string {
  const permissionNames: Record<string, string> = {
    "dashboard.view": "Xem Dashboard",
    "profile.view": "Xem Profile",
    "conferences.view": "Xem Hội nghị",
    "conferences.create": "Tạo Hội nghị",
    "conferences.edit": "Chỉnh sửa Hội nghị",
    "conferences.update": "Cập nhật Hội nghị",
    "conferences.delete": "Xóa Hội nghị",
    "conferences.manage": "Quản lý Hội nghị",
    "conferences.export": "Xuất dữ liệu Hội nghị",
    "attendees.view": "Xem Người tham dự",
    "attendees.read": "Đọc Người tham dự",
    "attendees.write": "Ghi Người tham dự",
    "attendees.manage": "Quản lý Người tham dự",
    "checkin.manage": "Quản lý Check-in",
    "roles.manage": "Quản lý Phân quyền",
    "audit.view": "Xem Nhật ký",
    "settings.manage": "Quản lý Cài đặt",
    "analytics.view": "Xem Phân tích",
    "networking.view": "Xem Kết nối mạng",
    "messaging.view": "Xem Tin nhắn",
    "venue.view": "Xem Bản đồ",
    "sessions.view": "Xem Phiên trực tiếp",
    "badges.view": "Xem Huy hiệu",
    "mobile.view": "Xem Ứng dụng di động",
    "my-events.view": "Xem Sự kiện của tôi",
  };
  return permissionNames[code] || code;
}

function getPermissionDescription(code: string): string {
  const permissionDescriptions: Record<string, string> = {
    "dashboard.view": "Truy cập trang tổng quan",
    "profile.view": "Xem thông tin cá nhân",
    "conferences.view": "Xem danh sách hội nghị",
    "conferences.create": "Tạo hội nghị mới",
    "conferences.edit": "Chỉnh sửa thông tin hội nghị",
    "conferences.update": "Cập nhật thông tin hội nghị",
    "conferences.delete": "Xóa hội nghị",
    "conferences.manage": "Quản lý toàn bộ hệ thống hội nghị",
    "conferences.export": "Xuất dữ liệu hội nghị ra file CSV",
    "attendees.view": "Xem danh sách người tham dự",
    "attendees.read": "Đọc thông tin người tham dự",
    "attendees.write": "Ghi thông tin người tham dự",
    "attendees.manage": "Quản lý người tham dự",
    "checkin.manage": "Quản lý check-in",
    "roles.manage": "Quản lý phân quyền",
    "audit.view": "Xem nhật ký hệ thống",
    "settings.manage": "Quản lý cài đặt",
    "analytics.view": "Xem báo cáo phân tích",
    "networking.view": "Xem kết nối mạng",
    "messaging.view": "Xem tin nhắn",
    "venue.view": "Xem bản đồ địa điểm",
    "sessions.view": "Xem phiên trực tiếp",
    "badges.view": "Xem huy hiệu",
    "mobile.view": "Xem ứng dụng di động",
    "my-events.view": "Xem sự kiện của tôi",
  };
  return permissionDescriptions[code] || "";
}

// Fallback function to get permissions based on role
function getRoleBasedPermissions(
  role: "admin" | "staff" | "attendee"
): Permission[] {
  const basePermissions: Record<string, Permission> = {
    "dashboard.view": { id: 1, code: "dashboard.view", name: "Xem Dashboard" },
    "profile.view": { id: 2, code: "profile.view", name: "Xem Profile" },
    "conferences.view": {
      id: 3,
      code: "conferences.view",
      name: "Xem Hội nghị",
    },
    "conferences.create": {
      id: 4,
      code: "conferences.create",
      name: "Tạo Hội nghị",
    },
    "conferences.edit": {
      id: 5,
      code: "conferences.edit",
      name: "Chỉnh sửa Hội nghị",
    },
    "conferences.update": {
      id: 6,
      code: "conferences.update",
      name: "Cập nhật Hội nghị",
    },
    "conferences.delete": {
      id: 7,
      code: "conferences.delete",
      name: "Xóa Hội nghị",
    },
    "conferences.manage": {
      id: 8,
      code: "conferences.manage",
      name: "Quản lý Hội nghị",
    },
    "conferences.export": {
      id: 9,
      code: "conferences.export",
      name: "Xuất dữ liệu Hội nghị",
    },
    "attendees.view": {
      id: 10,
      code: "attendees.view",
      name: "Xem Người tham dự",
    },
    "attendees.read": {
      id: 11,
      code: "attendees.read",
      name: "Đọc Người tham dự",
    },
    "attendees.write": {
      id: 12,
      code: "attendees.write",
      name: "Ghi Người tham dự",
    },
    "attendees.manage": {
      id: 13,
      code: "attendees.manage",
      name: "Quản lý Người tham dự",
    },
    "checkin.manage": {
      id: 14,
      code: "checkin.manage",
      name: "Quản lý Check-in",
    },
    "roles.manage": {
      id: 15,
      code: "roles.manage",
      name: "Quản lý Phân quyền",
    },
    "audit.view": { id: 16, code: "audit.view", name: "Xem Nhật ký" },
    "settings.manage": {
      id: 17,
      code: "settings.manage",
      name: "Quản lý Cài đặt",
    },
    "analytics.view": { id: 18, code: "analytics.view", name: "Xem Phân tích" },
    "networking.view": {
      id: 19,
      code: "networking.view",
      name: "Xem Kết nối mạng",
    },
    "messaging.view": { id: 20, code: "messaging.view", name: "Xem Tin nhắn" },
    "venue.view": { id: 21, code: "venue.view", name: "Xem Bản đồ" },
    "sessions.view": {
      id: 22,
      code: "sessions.view",
      name: "Xem Phiên trực tiếp",
    },
    "badges.view": { id: 23, code: "badges.view", name: "Xem Huy hiệu" },
    "mobile.view": {
      id: 24,
      code: "mobile.view",
      name: "Xem Ứng dụng di động",
    },
    "my-events.view": {
      id: 25,
      code: "my-events.view",
      name: "Xem Sự kiện của tôi",
    },
  };

  switch (role) {
    case "admin":
      return Object.values(basePermissions);
    case "staff":
      return [
        basePermissions["dashboard.view"],
        basePermissions["profile.view"],
        basePermissions["conferences.view"],
        basePermissions["conferences.create"],
        basePermissions["conferences.update"],
        basePermissions["conferences.export"],
        basePermissions["attendees.view"],
        basePermissions["attendees.read"],
        basePermissions["attendees.write"],
        basePermissions["attendees.manage"],
        basePermissions["checkin.manage"],
        basePermissions["networking.view"],
        basePermissions["messaging.view"],
        basePermissions["venue.view"],
        basePermissions["sessions.view"],
        basePermissions["badges.view"],
        basePermissions["mobile.view"],
      ];
    case "attendee":
      return [
        basePermissions["dashboard.view"],
        basePermissions["profile.view"],
        basePermissions["conferences.view"],
        basePermissions["conferences.export"],
        basePermissions["networking.view"],
        basePermissions["messaging.view"],
        basePermissions["venue.view"],
        basePermissions["sessions.view"],
        basePermissions["badges.view"],
        basePermissions["mobile.view"],
        basePermissions["my-events.view"],
      ];
    default:
      return [];
  }
}
