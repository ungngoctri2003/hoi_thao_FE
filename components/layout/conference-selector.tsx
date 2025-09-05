"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Building, 
  ChevronDown, 
  ChevronRight,
  Check, 
  Shield, 
  Users, 
  Calendar, 
  QrCode, 
  Network, 
  MapPin, 
  Video, 
  Award, 
  BarChart3, 
  Smartphone,
  Eye,
  Plus,
  Edit,
  Trash2,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConferenceSelectorProps {
  className?: string;
  variant?: "select" | "dropdown";
  showPermissions?: boolean;
}

// Permission mapping with icons and labels
const permissionMap: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  'conferences.view': { icon: Eye, label: 'Xem hội nghị', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  'conferences.create': { icon: Plus, label: 'Tạo hội nghị', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  'conferences.update': { icon: Edit, label: 'Sửa hội nghị', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  'conferences.delete': { icon: Trash2, label: 'Xóa hội nghị', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  'attendees.view': { icon: Users, label: 'Xem tham dự', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  'attendees.manage': { icon: UserCheck, label: 'Quản lý tham dự', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  'checkin.manage': { icon: QrCode, label: 'Check-in', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  'networking.view': { icon: Network, label: 'Kết nối mạng', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' },
  'venue.view': { icon: MapPin, label: 'Địa điểm', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
  'sessions.view': { icon: Video, label: 'Phiên họp', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
  'badges.view': { icon: Award, label: 'Huy hiệu', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  'analytics.view': { icon: BarChart3, label: 'Phân tích', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  'my-events.view': { icon: Calendar, label: 'Sự kiện của tôi', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200' },
  'roles.manage': { icon: Shield, label: 'Phân quyền', color: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200' },
  'mobile.view': { icon: Smartphone, label: 'Ứng dụng di động', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' },
};

// Category icons mapping
const categoryIcons: Record<string, any> = {
  conferences: Calendar,
  attendees: Users,
  checkin: QrCode,
  networking: Network,
  venue: MapPin,
  sessions: Video,
  badges: Award,
  analytics: BarChart3,
  roles: Shield,
  mobile: Smartphone,
  myEvents: Calendar,
};

// Helper function to get permission details
const getPermissionDetails = (permissionCode: string) => {
  return permissionMap[permissionCode] || { 
    icon: Shield, 
    label: permissionCode, 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' 
  };
};

// Helper function to get active permissions with details
const getActivePermissions = (permissions: Record<string, boolean>) => {
  return Object.entries(permissions)
    .filter(([_, isActive]) => isActive)
    .map(([permissionCode, _]) => ({
      code: permissionCode,
      ...getPermissionDetails(permissionCode)
    }));
};

// Category to route mapping
const categoryRoutes: Record<string, string> = {
  conferences: '/conferences',
  attendees: '/attendees',
  checkin: '/checkin',
  networking: '/networking',
  venue: '/venue',
  sessions: '/sessions',
  badges: '/badges',
  analytics: '/analytics',
  roles: '/roles',
  mobile: '/mobile',
  myEvents: '/my-events',
};

// Category descriptions for better UX
const categoryDescriptions: Record<string, string> = {
  conferences: 'Quản lý hội nghị và sự kiện',
  attendees: 'Danh sách và quản lý tham dự viên',
  checkin: 'Hệ thống check-in QR code',
  networking: 'Kết nối và giao lưu',
  venue: 'Bản đồ và thông tin địa điểm',
  sessions: 'Phiên họp trực tiếp',
  badges: 'Huy hiệu kỹ thuật số',
  analytics: 'Phân tích dữ liệu AI',
  roles: 'Phân quyền và vai trò',
  mobile: 'Ứng dụng di động',
  myEvents: 'Sự kiện cá nhân',
};

// Group permissions by category
const groupPermissionsByCategory = (permissions: Record<string, boolean>) => {
  const activePermissions = getActivePermissions(permissions);
  
  const categories = {
    conferences: activePermissions.filter(p => p.code.startsWith('conferences.')),
    attendees: activePermissions.filter(p => p.code.startsWith('attendees.')),
    checkin: activePermissions.filter(p => p.code.startsWith('checkin.')),
    networking: activePermissions.filter(p => p.code.startsWith('networking.')),
    venue: activePermissions.filter(p => p.code.startsWith('venue.')),
    sessions: activePermissions.filter(p => p.code.startsWith('sessions.')),
    badges: activePermissions.filter(p => p.code.startsWith('badges.')),
    analytics: activePermissions.filter(p => p.code.startsWith('analytics.')),
    roles: activePermissions.filter(p => p.code.startsWith('roles.')),
    mobile: activePermissions.filter(p => p.code.startsWith('mobile.')),
    myEvents: activePermissions.filter(p => p.code.startsWith('my-events.')),
  };

  return Object.entries(categories).filter(([_, perms]) => perms.length > 0);
};

// New sidebar-style conference selector component
export function ConferenceSelectorSidebar({ 
  className, 
  isCollapsed = false 
}: { 
  className?: string; 
  isCollapsed?: boolean; 
}) {
  const { 
    currentConferenceId, 
    getAvailableConferences, 
    getConferenceName,
    switchConference,
    getCurrentConferencePermissions,
    isLoading 
  } = useConferencePermissions();

  const [isExpanded, setIsExpanded] = useState(false);

  const availableConferences = getAvailableConferences();
  const currentConferenceName = currentConferenceId ? getConferenceName(currentConferenceId) : "Chọn hội nghị";
  const currentPermissions = getCurrentConferencePermissions();
  const permissionCategories = groupPermissionsByCategory(currentPermissions);

  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-2 p-2", className)}>
        <div className="animate-pulse bg-gray-200 rounded-md h-8 w-32"></div>
      </div>
    );
  }

  if (availableConferences.length === 0) {
    return (
      <div className={cn("flex items-center space-x-2 p-2", className)}>
        <Building className="h-4 w-4 text-muted-foreground" />
        {!isCollapsed && <span className="text-sm text-muted-foreground">Không có hội nghị</span>}
      </div>
    );
  }

  if (availableConferences.length === 1) {
    const conference = availableConferences[0];
    return (
      <div className={cn("space-y-1", className)}>
        {/* Main conference item */}
        <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-sidebar-accent">
          <Building className="h-4 w-4 text-primary" />
          {!isCollapsed && (
            <>
              <span className="text-sm font-medium flex-1 truncate">{conference.conferenceName}</span>
              <Badge variant="outline" className="text-xs w-20">
                {Object.values(conference.permissions).filter(Boolean).length} quyền
              </Badge>
            </>
          )}
        </div>

        {/* Permission categories */}
        {!isCollapsed && permissionCategories.length > 0 && (
          <div className="ml-6 space-y-1">
            {permissionCategories.map(([category, permissions]) => {
              const route = categoryRoutes[category];
              const IconComponent = categoryIcons[category] || Building;
              
              return route ? (
                <Link key={category} href={route}>
                  <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-sidebar-accent cursor-pointer group">
                    <IconComponent className="h-4 w-4 text-sidebar-foreground group-hover:text-primary transition-colors" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm capitalize block">{category}</span>
                      <span className="text-xs text-sidebar-foreground/60 truncate block">
                        {categoryDescriptions[category] || ''}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs px-1 py-0 flex-shrink-0">
                      {permissions.length}
                    </Badge>
                  </div>
                </Link>
              ) : (
                <div key={category} className="flex items-center space-x-2 p-1 text-xs text-sidebar-foreground/60">
                  <span className="font-medium capitalize">{category}</span>
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {permissions.length}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {/* Conference selector button */}
      <Button
        variant="ghost"
        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent p-2 h-auto"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Building className="h-4 w-4 mr-3" />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left truncate">{currentConferenceName}</span>
            <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
          </>
        )}
      </Button>

      {/* Conference list */}
      {!isCollapsed && isExpanded && (
        <div className="ml-6 space-y-1">
          {availableConferences.map((conference) => {
            const isSelected = currentConferenceId === conference.conferenceId;
            const conferencePermissions = groupPermissionsByCategory(conference.permissions);
            
            return (
              <div key={conference.conferenceId} className="space-y-1">
                <Button
                  variant={isSelected ? "secondary" : "ghost"}
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent p-2 h-auto"
                  onClick={() => switchConference(conference.conferenceId)}
                >
                  <Building className="h-4 w-4 mr-3" />
                  <span className="flex-1 text-left truncate">{conference.conferenceName}</span>
                  <Badge variant="outline" className="text-xs w-20">
                    {Object.values(conference.permissions).filter(Boolean).length} quyền
                  </Badge>
                  {isSelected && <Check className="h-4 w-4 ml-2" />}
                </Button>

                {/* Permission categories for selected conference */}
                {isSelected && conferencePermissions.length > 0 && (
                  <div className="ml-6 space-y-1">
                    {conferencePermissions.map(([category, permissions]) => {
                      const route = categoryRoutes[category];
                      const IconComponent = categoryIcons[category] || Building;
                      
                      return route ? (
                        <Link key={category} href={route}>
                          <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-sidebar-accent cursor-pointer group">
                            <IconComponent className="h-4 w-4 text-sidebar-foreground group-hover:text-primary transition-colors" />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm capitalize block">{category}</span>
                              <span className="text-xs text-sidebar-foreground/60 truncate block">
                                {categoryDescriptions[category] || ''}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-xs px-1 py-0 flex-shrink-0">
                              {permissions.length}
                            </Badge>
                          </div>
                        </Link>
                      ) : (
                        <div key={category} className="flex items-center space-x-2 p-1 text-xs text-sidebar-foreground/60">
                          <span className="font-medium capitalize">{category}</span>
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {permissions.length}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ConferenceSelector({ 
  className, 
  variant = "dropdown",
  showPermissions = false 
}: ConferenceSelectorProps) {
  const { 
    currentConferenceId, 
    getAvailableConferences, 
    getConferenceName,
    switchConference,
    getCurrentConferencePermissions,
    isLoading 
  } = useConferencePermissions();

  const [isOpen, setIsOpen] = useState(false);

  const availableConferences = getAvailableConferences();
  const currentConferenceName = currentConferenceId ? getConferenceName(currentConferenceId) : "Chọn hội nghị";
  const currentPermissions = getCurrentConferencePermissions();

  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <div className="animate-pulse bg-gray-200 rounded-md h-8 w-32"></div>
      </div>
    );
  }

  if (availableConferences.length === 0) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Building className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Không có hội nghị</span>
      </div>
    );
  }

  if (availableConferences.length === 1) {
    const conference = availableConferences[0];
    const activePermissions = getActivePermissions(conference.permissions);
    
    return (
      <div className={cn("flex flex-col space-y-2", className)}>
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{conference.conferenceName}</span>
          {showPermissions && (
            <Badge variant="outline" className="text-xs w-20">
              {activePermissions.length} quyền
            </Badge>
          )}
        </div>
        
        {showPermissions && activePermissions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {activePermissions.slice(0, 6).map((permission) => {
              const IconComponent = permission.icon;
              return (
                <Badge
                  key={permission.code}
                  variant="secondary"
                  className={cn("text-xs px-2 py-1 flex items-center space-x-1", permission.color)}
                >
                  <IconComponent className="h-3 w-3" />
                  <span className="truncate max-w-16">{permission.label}</span>
                </Badge>
              );
            })}
            {activePermissions.length > 6 && (
              <Badge variant="outline" className="text-xs px-2 py-1">
                +{activePermissions.length - 6} khác
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  }

  const handleConferenceChange = (conferenceId: number) => {
    switchConference(conferenceId);
    setIsOpen(false);
  };

  if (variant === "select") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Building className="h-4 w-4 text-primary" />
        <Select 
          value={currentConferenceId?.toString() || ""} 
          onValueChange={(value) => handleConferenceChange(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn hội nghị" />
          </SelectTrigger>
          <SelectContent>
            {availableConferences.map((conference) => {
              const activePermissions = getActivePermissions(conference.permissions);
              return (
                <SelectItem key={conference.conferenceId} value={conference.conferenceId.toString()}>
                  <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between w-full">
                      <span>{conference.conferenceName}</span>
                      {showPermissions && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {activePermissions.length} quyền
                        </Badge>
                      )}
                    </div>
                    {showPermissions && activePermissions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activePermissions.slice(0, 3).map((permission) => {
                          const IconComponent = permission.icon;
                          return (
                            <Badge
                              key={permission.code}
                              variant="secondary"
                              className={cn("text-xs px-1 py-0.5 flex items-center space-x-1", permission.color)}
                            >
                              <IconComponent className="h-2 w-2" />
                              <span className="truncate max-w-12">{permission.label}</span>
                            </Badge>
                          );
                        })}
                        {activePermissions.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1 py-0.5">
                            +{activePermissions.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Building className="h-4 w-4 text-primary" />
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="justify-between w-full"
          >
            <span className="truncate">{currentConferenceName}</span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full max-w-sm" align="start">
          {availableConferences.map((conference, index) => {
            const activePermissions = getActivePermissions(conference.permissions);
            const isSelected = currentConferenceId === conference.conferenceId;
            
            return (
              <div key={conference.conferenceId}>
                <DropdownMenuItem
                  onClick={() => handleConferenceChange(conference.conferenceId)}
                  className={cn(
                    "flex flex-col items-start p-3 cursor-pointer",
                    isSelected && "bg-accent"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm truncate">{conference.conferenceName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {showPermissions && (
                        <Badge variant="outline" className="text-xs">
                          {activePermissions.length} quyền
                        </Badge>
                      )}
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                  
                  {showPermissions && activePermissions.length > 0 && (
                    <div className="w-full">
                      <div className="flex flex-wrap gap-1">
                        {activePermissions.slice(0, 4).map((permission) => {
                          const IconComponent = permission.icon;
                          return (
                            <Badge
                              key={permission.code}
                              variant="secondary"
                              className={cn("text-xs px-2 py-1 flex items-center space-x-1", permission.color)}
                            >
                              <IconComponent className="h-3 w-3" />
                              <span className="truncate max-w-20">{permission.label}</span>
                            </Badge>
                          );
                        })}
                        {activePermissions.length > 4 && (
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            +{activePermissions.length - 4} khác
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </DropdownMenuItem>
                {index < availableConferences.length - 1 && <DropdownMenuSeparator />}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Compact version for header
export function ConferenceSelectorCompact({ className }: { className?: string }) {
  const { 
    currentConferenceId, 
    getAvailableConferences, 
    getConferenceName,
    switchConference,
    getCurrentConferencePermissions,
    isLoading 
  } = useConferencePermissions();

  const [isOpen, setIsOpen] = useState(false);
  const availableConferences = getAvailableConferences();
  const currentConferenceName = currentConferenceId ? getConferenceName(currentConferenceId) : "Chọn hội nghị";
  const currentPermissions = getCurrentConferencePermissions();
  const activePermissionsCount = Object.values(currentPermissions).filter(Boolean).length;

  // Debug log
  console.log('ConferenceSelectorCompact - availableConferences:', availableConferences);
  console.log('ConferenceSelectorCompact - currentConferenceId:', currentConferenceId);
  console.log('ConferenceSelectorCompact - currentPermissions:', currentPermissions);
  console.log('ConferenceSelectorCompact - activePermissionsCount:', activePermissionsCount);
  console.log('ConferenceSelectorCompact - isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className={cn("flex items-center space-x-1 min-w-0", className)}>
        <div className="animate-pulse bg-gray-200 rounded-md h-6 w-24"></div>
      </div>
    );
  }

  if (availableConferences.length === 0) {
    return (
      <div className={cn("flex items-center space-x-1 min-w-0", className)}>
        <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm text-muted-foreground">Không có hội nghị</span>
          <span className="text-xs text-muted-foreground/60">Liên hệ admin để được phân quyền</span>
        </div>
      </div>
    );
  }

  if (availableConferences.length === 1) {
    const conference = availableConferences[0];
    return (
      <div className={cn("flex items-center space-x-2 min-w-0", className)}>
        <Building className="h-4 w-4 text-primary flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-foreground truncate max-w-48">
            {conference.conferenceName}
          </span>
          <span className="text-xs text-muted-foreground">
            {activePermissionsCount} quyền
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-1 min-w-0", className)}>
      <Building className="h-4 w-4 text-primary flex-shrink-0" />
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-auto p-1 text-sm font-medium hover:bg-accent min-w-0 max-w-48"
          >
            <div className="flex flex-col items-start min-w-0">
              <span className="truncate">{currentConferenceName}</span>
              <span className="text-xs text-muted-foreground">
                {activePermissionsCount} quyền
              </span>
            </div>
            <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="start">
          <div className="px-3 py-2">
            <h4 className="font-medium text-sm">Chọn hội nghị</h4>
            <p className="text-xs text-muted-foreground">
              Chuyển đổi giữa các hội nghị bạn có quyền truy cập
            </p>
          </div>
          <DropdownMenuSeparator />
          {availableConferences.map((conference, index) => {
            const isSelected = currentConferenceId === conference.conferenceId;
            const conferencePermissions = getActivePermissions(conference.permissions);
            const permissionCategories = groupPermissionsByCategory(conference.permissions);
            
            return (
              <div key={conference.conferenceId}>
                <DropdownMenuItem
                  onClick={() => {
                    switchConference(conference.conferenceId);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-start p-3 cursor-pointer",
                    isSelected && "bg-accent"
                  )}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm truncate">{conference.conferenceName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {conferencePermissions.length} quyền
                      </Badge>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                  
                  {/* Show permission categories */}
                  {permissionCategories.length > 0 && (
                    <div className="w-full">
                      <div className="flex flex-wrap gap-1">
                        {permissionCategories.slice(0, 4).map(([category, permissions]) => {
                          const IconComponent = categoryIcons[category] || Building;
                          return (
                            <Badge
                              key={category}
                              variant="secondary"
                              className="text-xs px-2 py-1 flex items-center space-x-1"
                            >
                              <IconComponent className="h-3 w-3" />
                              <span className="truncate max-w-16">{category}</span>
                            </Badge>
                          );
                        })}
                        {permissionCategories.length > 4 && (
                          <Badge variant="outline" className="text-xs px-2 py-1">
                            +{permissionCategories.length - 4} khác
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </DropdownMenuItem>
                {index < availableConferences.length - 1 && <DropdownMenuSeparator />}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
