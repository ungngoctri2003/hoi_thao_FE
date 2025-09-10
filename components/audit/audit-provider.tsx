"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFrontendAudit } from "@/hooks/use-frontend-audit";
import { usePathname } from "next/navigation";

interface AuditContextType {
  logAction: (action: string, page?: string, details?: string) => Promise<void>;
  actions: {
    navigate: (page: string) => Promise<void>;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    create: (itemType: string, page?: string) => Promise<void>;
    read: (itemType: string, page?: string) => Promise<void>;
    update: (itemType: string, page?: string) => Promise<void>;
    delete: (itemType: string, page?: string) => Promise<void>;
    register: (conferenceName?: string) => Promise<void>;
    unregister: (conferenceName?: string) => Promise<void>;
    checkin: (conferenceName?: string) => Promise<void>;
    checkout: (conferenceName?: string) => Promise<void>;
    export: (dataType: string, page?: string) => Promise<void>;
    import: (dataType: string, page?: string) => Promise<void>;
    search: (searchTerm: string, page?: string) => Promise<void>;
    filter: (filterType: string, page?: string) => Promise<void>;
    settingsChange: (settingType: string) => Promise<void>;
    profileUpdate: () => Promise<void>;
    upload: (fileType: string, page?: string) => Promise<void>;
    download: (fileType: string, page?: string) => Promise<void>;
    custom: (action: string, page?: string, details?: string) => Promise<void>;
  };
}

const AuditContext = createContext<AuditContextType | null>(null);

export function useAudit() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error("useAudit must be used within an AuditProvider");
  }
  return context;
}

interface AuditProviderProps {
  children: React.ReactNode;
}

export function AuditProvider({ children }: AuditProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const { logAction, actions } = useFrontendAudit();
  const pathname = usePathname();
  const lastLoggedPathname = useRef<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-log page navigation with debounce
  useEffect(() => {
    if (isAuthenticated && user && pathname) {
      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Only log if pathname actually changed
      if (lastLoggedPathname.current !== pathname) {
        debounceTimeoutRef.current = setTimeout(() => {
          const pageName = getPageName(pathname);
          actions.navigate(pageName);
          lastLoggedPathname.current = pathname;
        }, 500); // 500ms debounce
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [pathname, isAuthenticated, user, actions]);

  // Auto-log login
  useEffect(() => {
    if (isAuthenticated && user) {
      // Only log login if this is a fresh login (not page refresh)
      const lastLoginTime = localStorage.getItem("lastLoginTime");
      const now = Date.now();

      if (!lastLoginTime || now - parseInt(lastLoginTime) > 30000) {
        // 30 seconds threshold
        actions.login();
        localStorage.setItem("lastLoginTime", now.toString());
      }
    }
  }, [isAuthenticated, user, actions]);

  // Auto-log logout
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      // Only log logout if this is a fresh logout
      const lastLogoutTime = localStorage.getItem("lastLogoutTime");
      const now = Date.now();

      if (!lastLogoutTime || now - parseInt(lastLogoutTime) > 30000) {
        // 30 seconds threshold
        actions.logout();
        localStorage.setItem("lastLogoutTime", now.toString());
      }
    }
  }, [isAuthenticated, user, actions]);

  const contextValue: AuditContextType = {
    logAction,
    actions,
  };

  return (
    <AuditContext.Provider value={contextValue}>
      {children}
    </AuditContext.Provider>
  );
}

function getPageName(pathname: string): string {
  const pageMap: Record<string, string> = {
    "/": "Trang chủ",
    "/dashboard": "Bảng điều khiển",
    "/attendees": "Quản lý người tham dự",
    "/conferences": "Quản lý hội nghị",
    "/sessions": "Quản lý phiên họp",
    "/registrations": "Quản lý đăng ký",
    "/checkin": "Check-in",
    "/analytics": "Phân tích",
    "/audit": "Nhật ký hệ thống",
    "/profile": "Hồ sơ cá nhân",
    "/settings": "Cài đặt",
    "/users": "Quản lý người dùng",
    "/roles": "Quản lý vai trò",
    "/permissions": "Quản lý quyền",
    "/notifications": "Thông báo",
    "/messages": "Tin nhắn",
    "/matches": "Kết nối",
    "/badges": "Huy hiệu",
    "/certificates": "Chứng chỉ",
    "/venue": "Địa điểm",
  };

  // Find matching page
  for (const [route, pageName] of Object.entries(pageMap)) {
    if (pathname.startsWith(route)) {
      return pageName;
    }
  }

  // Fallback to path
  return pathname;
}
