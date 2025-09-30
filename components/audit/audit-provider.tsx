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
    // Main pages
    "/": "Trang chủ",
    "/dashboard": "Bảng điều khiển",
    
    // Management pages
    "/attendees": "Quản lý người tham dự",
    "/conferences": "Quản lý hội nghị",
    "/sessions": "Quản lý phiên họp",
    "/sessions-management": "Quản lý phiên họp",
    "/sessions-public": "Phiên họp công khai",
    "/registrations": "Quản lý đăng ký",
    "/roles": "Quản lý vai trò",
    "/permissions": "Quản lý quyền",
    "/venue": "Quản lý địa điểm",
    "/venue-management": "Quản lý địa điểm",
    "/venue-public": "Địa điểm công khai",
    "/rooms-management": "Quản lý phòng họp",
    
    // Check-in pages
    "/checkin": "Check-in",
    "/checkin-public": "Check-in công khai",
    
    // Analytics and reporting
    "/analytics": "Phân tích",
    "/ai-analytics": "Phân tích AI",
    
    // User management
    "/users": "Quản lý người dùng",
    "/profile": "Hồ sơ cá nhân",
    "/settings": "Cài đặt",
    
    // Communication
    "/notifications": "Thông báo",
    "/messages": "Tin nhắn",
    "/messaging": "Tin nhắn",
    "/networking": "Kết nối mạng",
    "/matches": "Kết nối",
    
    // Badges and certificates
    "/badges": "Huy hiệu",
    "/certificates": "Chứng chỉ",
    
    // Events and registration
    "/my-events": "Sự kiện của tôi",
    "/register": "Đăng ký",
    "/register-attendee": "Đăng ký người tham dự",
    "/register-simple": "Đăng ký đơn giản",
    
    // Authentication
    "/login": "Đăng nhập",
    "/auth": "Xác thực",
    "/forgot-password": "Quên mật khẩu",
    "/reset-password": "Đặt lại mật khẩu",
    
    // Audit and system
    "/audit": "Nhật ký hệ thống",
    
    // Mobile
    "/mobile": "Phiên bản di động",
    "/mobile-public": "Phiên bản di động công khai",
    
    // Attendee details
    "/attendee": "Chi tiết người tham dự",
    
    // Conference details
    "/conference-management": "Quản lý hội nghị",
    
    // Test and debug pages
    "/debug-qr": "Debug QR",
    "/test-": "Trang kiểm tra",
    "/demo-": "Trang demo",
  };

  // Special handling for dynamic routes (check these FIRST)
  if (pathname.startsWith("/conferences/") && pathname.includes("/manage")) {
    return "Quản lý hội nghị chi tiết";
  }
  if (pathname.startsWith("/conferences/")) {
    return "Chi tiết hội nghị";
  }
  if (pathname.startsWith("/attendee/")) {
    return "Chi tiết người tham dự";
  }
  if (pathname.startsWith("/test-")) {
    return "Trang kiểm tra";
  }
  if (pathname.startsWith("/demo-")) {
    return "Trang demo";
  }

  // Find matching page - check for exact matches first, then prefix matches
  for (const [route, pageName] of Object.entries(pageMap)) {
    if (pathname === route) {
      return pageName;
    }
  }
  
  // Check for prefix matches (for dynamic routes like /conferences/[id])
  for (const [route, pageName] of Object.entries(pageMap)) {
    if (pathname.startsWith(route) && route !== "/") {
      return pageName;
    }
  }

  // Fallback: convert pathname to a more readable format
  const cleanPath = pathname.replace(/^\//, '').replace(/-/g, ' ');
  return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
}
