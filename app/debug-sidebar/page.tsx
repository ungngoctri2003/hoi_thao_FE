"use client"

import { useAuth } from "@/hooks/use-auth"
import { usePermissions } from "@/hooks/use-permissions"
import { useConferencePermissions } from "@/hooks/use-conference-permissions"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/components/layout/sidebar"
import { Building, Shield, Users, Calendar, QrCode, Network, MapPin, Video, Award, BarChart3, Smartphone, FileText, Settings, UserCheck } from "lucide-react"

export default function DebugSidebarPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { hasPermission, permissions, isLoading: permissionsLoading } = usePermissions()
  const { 
    conferencePermissions, 
    currentConferenceId, 
    hasConferencePermission,
    hasAnyConferencePermission,
    isLoading: conferencePermissionsLoading 
  } = useConferencePermissions()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Cần đăng nhập</h1>
          <p className="text-muted-foreground">Vui lòng đăng nhập để debug sidebar</p>
        </div>
      </div>
    )
  }

  // Define all possible navigation items with their permission requirements
  const allNavigationItems = [
    { 
      href: "/dashboard", 
      icon: Calendar, 
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
  ]

  // Test the same logic as sidebar
  const getNavigationItems = (
    hasPermission: (code: string) => boolean, 
    hasConferencePermission: (code: string) => boolean,
    userRole: string
  ) => {
    return allNavigationItems.filter(item => {
      // Check if user has basic role-based permission
      const hasBasicPermission = item.requiredPermissions.every(permission => hasPermission(permission));
      
      // For admin and staff, show all basic permissions even without conference assignments
      if (userRole === 'admin' || userRole === 'staff') {
        // For conference-specific features, check if user has basic permission OR conference permission
        const conferenceSpecificFeatures = [
          '/conferences', '/attendees', '/checkin', '/networking', 
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
        '/conferences', '/attendees', '/checkin', '/networking', 
        '/venue', '/sessions', '/badges', '/analytics', '/my-events'
      ];
      
      if (conferenceSpecificFeatures.includes(item.href)) {
        return hasBasicPermission && item.requiredPermissions.some(permission => hasConferencePermission(permission));
      }
      
      return hasBasicPermission;
    });
  }

  const currentRole = user?.role as "admin" | "staff" | "attendee" || "attendee"
  const items = getNavigationItems(hasPermission, hasConferencePermission, currentRole)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar userRole={currentRole} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Debug Sidebar</h1>
              <p className="text-muted-foreground mt-2">
                Kiểm tra logic hiển thị menu trong sidebar
              </p>
            </div>

            {/* User Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin người dùng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tên</p>
                    <p className="text-lg">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-lg">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vai trò</p>
                    <Badge variant="outline" className="text-lg">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading States */}
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái loading</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${permissionsLoading ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <span>Permissions Loading: {permissionsLoading ? 'Đang tải' : 'Hoàn thành'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${conferencePermissionsLoading ? 'bg-yellow-500' : 'bg-green-500'}`} />
                    <span>Conference Permissions Loading: {conferencePermissionsLoading ? 'Đang tải' : 'Hoàn thành'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Quyền cơ bản (Role-based)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {permissions.map((permission) => (
                    <div key={permission.code} className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">{permission.code}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conference Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Quyền hội nghị</CardTitle>
              </CardHeader>
              <CardContent>
                {conferencePermissions.length === 0 ? (
                  <p className="text-muted-foreground">Không có hội nghị được phân quyền</p>
                ) : (
                  <div className="space-y-4">
                    {conferencePermissions.map((conference) => (
                      <div key={conference.conferenceId} className="p-4 border rounded-lg">
                        <h3 className="font-medium">{conference.conferenceName}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                          {Object.entries(conference.permissions).map(([permission, hasAccess]) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${hasAccess ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className="text-sm">{permission}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Items Test */}
            <Card>
              <CardHeader>
                <CardTitle>Kiểm tra menu hiển thị</CardTitle>
                <CardDescription>
                  Tổng số menu sẽ hiển thị: {items.length} / {allNavigationItems.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allNavigationItems.map((item) => {
                    const hasBasicPermission = item.requiredPermissions.every(permission => hasPermission(permission))
                    const hasConferenceAccess = item.requiredPermissions.some(permission => hasConferencePermission(permission))
                    const willShow = items.some(i => i.href === item.href)
                    
                    return (
                      <div 
                        key={item.href}
                        className={`p-4 border rounded-lg ${
                          willShow ? 'border-green-200 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <item.icon className="h-4 w-4" />
                            <span className="font-medium">{item.label}</span>
                            <span className="text-sm text-muted-foreground">({item.href})</span>
                          </div>
                          <Badge variant={willShow ? "default" : "secondary"}>
                            {willShow ? "Hiển thị" : "Ẩn"}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${hasBasicPermission ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm">Basic Permission: {hasBasicPermission ? 'Có' : 'Không'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${hasConferenceAccess ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="text-sm">Conference Permission: {hasConferenceAccess ? 'Có' : 'Không'}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Required: {item.requiredPermissions.join(', ')}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Debug Info */}
            <Card>
              <CardHeader>
                <CardTitle>Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Current Conference ID:</h4>
                    <p className="text-sm">{currentConferenceId || 'None'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Conference Permissions Count:</h4>
                    <p className="text-sm">{conferencePermissions.length}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">User Role:</h4>
                    <p className="text-sm">{currentRole}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
