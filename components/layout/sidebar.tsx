"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { SidebarTooltip } from "./sidebar-tooltip";
import {
  LayoutDashboard,
  Users,
  Calendar,
  QrCode,
  Settings,
  Shield,
  FileText,
  Menu,
  X,
  Network,
  MapPin,
  Video,
  Award,
  BarChart3,
  Smartphone,
  UserCheck,
  Building,
} from "lucide-react";

interface SidebarProps {
  userRole: "admin" | "staff" | "attendee";
}

// Define all possible navigation items with their permission requirements
const allNavigationItems = [
  { 
    href: "/dashboard", 
    icon: LayoutDashboard, 
    label: "Tổng quan", 
    requiredPermissions: ["dashboard.view"],
    description: "Trang chủ và tổng quan hệ thống"
  },
  { 
    href: "/conferences", 
    icon: Calendar, 
    label: "Quản lý hội nghị", 
    requiredPermissions: ["conferences.view"],
    description: "Quản lý các hội nghị và sự kiện"
  },
  { 
    href: "/attendees", 
    icon: Users, 
    label: "Danh sách tham dự", 
    requiredPermissions: ["attendees.view"],
    description: "Quản lý danh sách người tham dự"
  },
  { 
    href: "/checkin", 
    icon: QrCode, 
    label: "Check-in QR", 
    requiredPermissions: ["checkin.manage"],
    description: "Quét QR code để check-in"
  },
  { 
    href: "/networking", 
    icon: Network, 
    label: "Kết nối mạng", 
    requiredPermissions: ["networking.view"],
    description: "Kết nối và giao lưu với người tham dự"
  },
  { 
    href: "/venue", 
    icon: MapPin, 
    label: "Bản đồ địa điểm", 
    requiredPermissions: ["venue.view"],
    description: "Xem bản đồ và thông tin địa điểm"
  },
  { 
    href: "/sessions", 
    icon: Video, 
    label: "Phiên trực tiếp", 
    requiredPermissions: ["sessions.view"],
    description: "Xem các phiên họp trực tiếp"
  },
  { 
    href: "/badges", 
    icon: Award, 
    label: "Huy hiệu số", 
    requiredPermissions: ["badges.view"],
    description: "Quản lý và xem huy hiệu"
  },
  { 
    href: "/analytics", 
    icon: BarChart3, 
    label: "Phân tích AI", 
    requiredPermissions: ["analytics.view"],
    description: "Phân tích dữ liệu với AI"
  },
  { 
    href: "/mobile", 
    icon: Smartphone, 
    label: "Ứng dụng di động", 
    requiredPermissions: ["mobile.view"],
    description: "Tải ứng dụng di động"
  },
  { 
    href: "/roles", 
    icon: Shield, 
    label: "Phân quyền", 
    requiredPermissions: ["roles.manage"],
    description: "Quản lý quyền và vai trò người dùng"
  },
  { 
    href: "/audit", 
    icon: FileText, 
    label: "Nhật ký hệ thống", 
    requiredPermissions: ["audit.view"],
    description: "Xem nhật ký hoạt động hệ thống"
  },
  { 
    href: "/settings", 
    icon: Settings, 
    label: "Cài đặt", 
    requiredPermissions: ["settings.manage"],
    description: "Cài đặt hệ thống"
  },
  { 
    href: "/my-events", 
    icon: Calendar, 
    label: "Sự kiện của tôi", 
    requiredPermissions: ["my-events.view"],
    description: "Xem các sự kiện đã đăng ký"
  },
  { 
    href: "/profile", 
    icon: UserCheck, 
    label: "Thông tin cá nhân", 
    requiredPermissions: ["profile.view"],
    description: "Xem và chỉnh sửa thông tin cá nhân"
  },
];

// Function to get navigation items based on user permissions
const getNavigationItems = (hasPermission: (code: string) => boolean) => {
  return allNavigationItems.filter(item => 
    item.requiredPermissions.every(permission => hasPermission(permission))
  );
};

const roleLabels = {
  admin: "Quản trị viên",
  staff: "Nhân viên",
  attendee: "Tham dự",
};

const roleColors = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  staff: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  attendee: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export function Sidebar({ userRole }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  
  // Use role from auth state if available, fallback to prop
  const currentRole = (user?.role as "admin" | "staff" | "attendee") || userRole || "attendee";
  
  // Get navigation items based on user permissions
  const items = getNavigationItems(hasPermission);
  
  // Group items by category for better organization
  const groupedItems = {
    main: items.filter(item => 
      ["/dashboard", "/profile"].includes(item.href)
    ),
    management: items.filter(item => 
      ["/conferences", "/attendees", "/checkin", "/roles", "/audit", "/settings"].includes(item.href)
    ),
    features: items.filter(item => 
      ["/networking", "/venue", "/sessions", "/badges", "/analytics", "/mobile", "/my-events"].includes(item.href)
    ),
  };

  // Show loading state while permissions are being fetched
  if (permissionsLoading) {
    return (
      <div
        className={cn(
          "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex flex-col">
            <h1 className="font-serif font-bold text-lg text-sidebar-foreground">
              ConferenceMS
            </h1>
            <Badge className={cn("text-xs mt-1 w-fit", roleColors[currentRole])}>
              {roleLabels[currentRole]}
            </Badge>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {/* Main Items */}
        {groupedItems.main.length > 0 && (
          <>
            {groupedItems.main.map((item) => {
              const isActive = pathname === item.href;
              const button = (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                      isCollapsed && "px-2",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                    {!isCollapsed && item.label}
                  </Button>
                </Link>
              );

              return isCollapsed ? (
                <SidebarTooltip
                  key={item.href}
                  content={item.label}
                  description={item.description}
                  role={currentRole}
                >
                  {button}
                </SidebarTooltip>
              ) : button;
            })}
            {!isCollapsed && (groupedItems.management.length > 0 || groupedItems.features.length > 0) && (
              <div className="border-t border-sidebar-border my-2"></div>
            )}
          </>
        )}

        {/* Management Items */}
        {groupedItems.management.length > 0 && (
          <>
            {!isCollapsed && (
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                  Quản lý
                </p>
              </div>
            )}
            {groupedItems.management.map((item) => {
              const isActive = pathname === item.href;
              const button = (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                      isCollapsed && "px-2",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                    {!isCollapsed && item.label}
                  </Button>
                </Link>
              );

              return isCollapsed ? (
                <SidebarTooltip
                  key={item.href}
                  content={item.label}
                  description={item.description}
                  role={currentRole}
                >
                  {button}
                </SidebarTooltip>
              ) : button;
            })}
            {!isCollapsed && groupedItems.features.length > 0 && (
              <div className="border-t border-sidebar-border my-2"></div>
            )}
          </>
        )}

        {/* Feature Items */}
        {groupedItems.features.length > 0 && (
          <>
            {!isCollapsed && (
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                  Tính năng
                </p>
              </div>
            )}
            {groupedItems.features.map((item) => {
              const isActive = pathname === item.href;
              const button = (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent",
                      isCollapsed && "px-2",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                    {!isCollapsed && item.label}
                  </Button>
                </Link>
              );

              return isCollapsed ? (
                <SidebarTooltip
                  key={item.href}
                  content={item.label}
                  description={item.description}
                  role={currentRole}
                >
                  {button}
                </SidebarTooltip>
              ) : button;
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-sidebar-foreground/60">Phiên bản 1.0.0</p>
            <Badge 
              variant="outline" 
              className={cn("text-xs", roleColors[currentRole])}
            >
              {currentRole}
            </Badge>
          </div>
          <p className="text-xs text-sidebar-foreground/40">
            {items.length} tính năng có sẵn
          </p>
        </div>
      )}
    </div>
  );
}
