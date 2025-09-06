"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
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
  ChevronRight,
  ChevronDown,
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
    href: "/conference-management", 
    icon: Building, 
    label: "Quản lý hội nghị", 
    requiredPermissions: ["conferences.manage", "conferences.create", "conferences.edit", "conferences.delete"],
    description: "Tạo, chỉnh sửa và quản lý các hội nghị"
  },
  { 
    href: "/attendees", 
    icon: Users, 
    label: "Danh sách tham dự", 
    requiredPermissions: ["attendees.manage"],
    description: "Quản lý danh sách người tham dự toàn bộ hội nghị",
    adminOnly: true
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

// Function to get navigation items based on user permissions and conference permissions
const getNavigationItems = (
  hasPermission: (code: string) => boolean, 
  hasConferencePermission: (code: string) => boolean,
  userRole: string
) => {
  return allNavigationItems.filter(item => {
    // Special handling for conference management - only show to admin
    if (item.href === '/conference-management') {
      return userRole === 'admin';
    }
    
    // Special handling for global attendees management - only show to admin
    if (item.href === '/attendees' && item.adminOnly) {
      return userRole === 'admin';
    }
    
    // Admin always has access to attendees management regardless of permissions
    if (item.href === '/attendees' && userRole === 'admin') {
      return true;
    }
    
    // Check if user has basic role-based permission
    const hasBasicPermission = item.requiredPermissions.every(permission => hasPermission(permission));
    
    // For admin and staff, show all basic permissions even without conference assignments
    if (userRole === 'admin' || userRole === 'staff') {
      // For conference-specific features, check if user has basic permission OR conference permission
      const conferenceSpecificFeatures = [
        '/checkin', '/networking', 
        '/venue', '/sessions', '/badges', '/analytics', '/my-events'
      ];
      
      if (conferenceSpecificFeatures.includes(item.href)) {
        // Admin/staff can access if they have basic permission OR conference permission
        return hasBasicPermission || item.requiredPermissions.some(permission => hasConferencePermission(permission));
      }
      
      return hasBasicPermission;
    }
    
    // For attendees, require both basic and conference permissions for conference features
    const conferenceSpecificFeatures = [
      '/checkin', '/networking', 
      '/venue', '/sessions', '/badges', '/analytics', '/my-events'
    ];
    
    if (conferenceSpecificFeatures.includes(item.href)) {
      return hasBasicPermission && item.requiredPermissions.some(permission => hasConferencePermission(permission));
    }
    
    return hasBasicPermission;
  });
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
  const [expandedConferences, setExpandedConferences] = useState<Set<number>>(new Set());
  const pathname = usePathname();
  const { user } = useAuth();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const { 
    hasConferencePermission, 
    isLoading: conferencePermissionsLoading,
    getAvailableConferences,
    getConferencePermissions,
    getConferenceName
  } = useConferencePermissions();
  
  // Use role from auth state if available, fallback to prop
  const currentRole = (user?.role as "admin" | "staff" | "attendee") || userRole || "attendee";
  
  // Get navigation items based on user permissions and conference permissions
  const items = getNavigationItems(hasPermission, hasConferencePermission, currentRole);
  
  // Debug logs for attendees management
  console.log('🔍 Sidebar Debug:', {
    currentRole,
    userRole: user?.role,
    hasAttendeesPermission: hasPermission('attendees.manage'),
    itemsCount: items.length,
    hasAttendeesItem: items.some(item => item.href === '/attendees'),
    showAttendeesAsSeparateItem: currentRole === 'admin',
    allItems: allNavigationItems.filter(item => item.href === '/attendees')
  });
  
  // Get available conferences - admin sees all conferences, staff/attendees see only assigned ones
  const availableConferences = getAvailableConferences();
  
  // Category configuration
  const categoryConfig = {
    attendees: { icon: Users, label: "Danh sách tham dự", href: "/attendees" },
    checkin: { icon: QrCode, label: "Check-in QR", href: "/checkin" },
    networking: { icon: Network, label: "Kết nối mạng", href: "/networking" },
    venue: { icon: MapPin, label: "Bản đồ địa điểm", href: "/venue" },
    sessions: { icon: Video, label: "Phiên trực tiếp", href: "/sessions" },
    badges: { icon: Award, label: "Huy hiệu số", href: "/badges" },
    analytics: { icon: BarChart3, label: "Phân tích AI", href: "/analytics" },
    mobile: { icon: Smartphone, label: "Ứng dụng di động", href: "/mobile" },
  };

  // Toggle conference expansion
  const toggleConference = (conferenceId: number) => {
    const newExpanded = new Set(expandedConferences);
    if (newExpanded.has(conferenceId)) {
      newExpanded.delete(conferenceId);
    } else {
      newExpanded.add(conferenceId);
    }
    setExpandedConferences(newExpanded);
  };

  // Get conference categories based on permissions
  const getConferenceCategories = (conferenceId: number) => {
    const permissions = getConferencePermissions(conferenceId);
    return Object.entries(categoryConfig).filter(([key, config]) => {
      const permissionKey = `${key}.view`;
      return permissions[permissionKey] === true;
    }).map(([key, config]) => ({
      key,
      config: { 
        ...config, 
        href: `/${key}?conferenceId=${conferenceId}` 
      }
    }));
  };
  
  // Group items by category for better organization
  const groupedItems = {
    main: items.filter(item => 
      ["/dashboard", "/profile"].includes(item.href)
    ),
    management: items.filter(item => 
      ["/conference-management", "/attendees", "/roles", "/audit", "/settings"].includes(item.href)
    ),
    features: items.filter(item => 
      ["/my-events"].includes(item.href)
    ),
  };

  // Show loading state while permissions are being fetched
  if (permissionsLoading || conferencePermissionsLoading) {
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
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 relative z-10",
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
        {/* Conferences Section */}
        {availableConferences.length > 0 && (
          <>
            {!isCollapsed && (
              <div className="px-2 py-1">
                <p className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                  Hội nghị
                </p>
              </div>
            )}
            {availableConferences.map((conference) => {
              const isExpanded = expandedConferences.has(conference.conferenceId);
              const categories = getConferenceCategories(conference.conferenceId);
              
              return (
                <div key={conference.conferenceId} className="space-y-1">
                  {/* Conference Header */}
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent p-3 h-auto min-h-[3rem] group",
                      isCollapsed && "px-2 min-h-[2.5rem]"
                    )}
                    onClick={() => toggleConference(conference.conferenceId)}
                  >
                    <Building className={cn("h-4 w-4 flex-shrink-0", !isCollapsed && "mr-3")} />
                    {isCollapsed ? (
                      <SidebarTooltip
                        content={conference.conferenceName}
                        description={`${categories.length} tính năng có sẵn`}
                        role={currentRole}
                      >
                        <div className="w-full h-8 flex items-center justify-center">
                          <Building className="h-4 w-4" />
                        </div>
                      </SidebarTooltip>
                    ) : (
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <SidebarTooltip
                            content={conference.conferenceName}
                            description={`${categories.length} tính năng có sẵn`}
                            role={currentRole}
                          >
                            <div className="text-sm font-medium text-left leading-tight break-words cursor-pointer line-clamp-2 group-hover:text-sidebar-accent-foreground transition-colors">
                              {conference.conferenceName}
                            </div>
                          </SidebarTooltip>
                        </div>
                        <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs whitespace-nowrap",
                              categories.length > 5 && "bg-primary/10 text-primary border-primary/20"
                            )}
                          >
                            {categories.length}
                          </Badge>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    )}
                  </Button>

                  {/* Conference Categories */}
                  {!isCollapsed && isExpanded && categories.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {categories.map(({ key: categoryKey, config }) => {
                        const isActive = pathname === config.href;
                        const IconComponent = config.icon;
                        
                        return (
                          <Link key={categoryKey} href={config.href}>
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent p-2 h-auto",
                                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                              )}
                            >
                              <IconComponent className="h-4 w-4 mr-3" />
                              <span className="flex-1 text-left">{config.label}</span>
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {!isCollapsed && (groupedItems.main.length > 0 || groupedItems.management.length > 0 || groupedItems.features.length > 0) && (
              <div className="border-t border-sidebar-border my-2"></div>
            )}
          </>
        )}

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
            {availableConferences.length} hội nghị • {items.length} tính năng
          </p>
        </div>
      )}
    </div>
  );
}
