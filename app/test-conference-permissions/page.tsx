"use client"

import { useAuth } from "@/hooks/use-auth"
import { useConferencePermissions } from "@/hooks/use-conference-permissions"
import { usePermissions } from "@/hooks/use-permissions"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, Shield, Users, Calendar, QrCode, Network, MapPin, Video, Award, BarChart3, Smartphone, FileText, Settings } from "lucide-react"
import { ConferenceSelector } from "@/components/layout/conference-selector"

export default function TestConferencePermissionsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { 
    conferencePermissions, 
    currentConferenceId, 
    getCurrentConferencePermissions,
    getAvailableConferences,
    hasConferencePermission,
    hasAnyConferencePermission,
    hasAllConferencePermission,
    getConferenceName,
    switchConference
  } = useConferencePermissions()
  const { hasPermission, permissions } = usePermissions()

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
          <p className="text-muted-foreground">Vui lòng đăng nhập để test hệ thống phân quyền</p>
        </div>
      </div>
    )
  }

  const currentPermissions = getCurrentConferencePermissions()
  const availableConferences = getAvailableConferences()

  const permissionTests = [
    { code: 'conferences.view', name: 'Xem hội nghị', icon: Calendar },
    { code: 'conferences.create', name: 'Tạo hội nghị', icon: Calendar },
    { code: 'conferences.update', name: 'Cập nhật hội nghị', icon: Calendar },
    { code: 'conferences.delete', name: 'Xóa hội nghị', icon: Calendar },
    { code: 'attendees.view', name: 'Xem người tham dự', icon: Users },
    { code: 'attendees.manage', name: 'Quản lý người tham dự', icon: Users },
    { code: 'checkin.manage', name: 'Quản lý check-in', icon: QrCode },
    { code: 'networking.view', name: 'Xem kết nối mạng', icon: Network },
    { code: 'venue.view', name: 'Xem bản đồ', icon: MapPin },
    { code: 'sessions.view', name: 'Xem phiên trực tiếp', icon: Video },
    { code: 'badges.view', name: 'Xem huy hiệu', icon: Award },
    { code: 'analytics.view', name: 'Xem phân tích', icon: BarChart3 },
    { code: 'mobile.view', name: 'Xem ứng dụng di động', icon: Smartphone },
    { code: 'audit.view', name: 'Xem nhật ký', icon: FileText },
    { code: 'settings.manage', name: 'Quản lý cài đặt', icon: Settings },
  ]

  return (
    <MainLayout userRole={user?.role as "admin" | "staff" | "attendee"} userName={user?.name || "User"}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Test Hệ thống Phân quyền Hội nghị</h1>
            <p className="text-muted-foreground mt-2">
              Kiểm tra quyền truy cập dựa trên hội nghị được phân quyền
            </p>
          </div>
          <ConferenceSelector variant="select" showPermissions={true} />
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Thông tin người dùng</span>
            </CardTitle>
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

        {/* Conference Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Phân quyền hội nghị</span>
            </CardTitle>
            <CardDescription>
              Danh sách các hội nghị bạn được phân quyền và quyền tương ứng
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conferencePermissions.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Bạn chưa được phân quyền cho hội nghị nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {conferencePermissions.map((conference) => (
                  <div 
                    key={conference.conferenceId}
                    className={`p-4 border rounded-lg ${
                      conference.conferenceId === currentConferenceId 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <h3 className="font-medium">{conference.conferenceName}</h3>
                        {conference.conferenceId === currentConferenceId && (
                          <Badge variant="default">Hiện tại</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={conference.isActive ? "default" : "secondary"}>
                          {conference.isActive ? "Hoạt động" : "Không hoạt động"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => switchConference(conference.conferenceId)}
                        >
                          Chọn
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(conference.permissions).map(([permission, hasAccess]) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            hasAccess ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className={`text-sm ${
                            hasAccess ? 'text-green-700' : 'text-gray-500'
                          }`}>
                            {permission}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permission Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Kiểm tra quyền truy cập</CardTitle>
            <CardDescription>
              Test các quyền cho hội nghị hiện tại: {currentConferenceId ? getConferenceName(currentConferenceId) : 'Chưa chọn'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissionTests.map((permission) => {
                const hasBasicPermission = hasPermission(permission.code)
                const hasConferenceAccess = hasConferencePermission(permission.code)
                const hasAnyAccess = hasAnyConferencePermission(permission.code)
                const Icon = permission.icon

                return (
                  <div 
                    key={permission.code}
                    className={`p-4 border rounded-lg ${
                      hasConferenceAccess ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{permission.name}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          hasBasicPermission ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <span className="text-xs text-gray-600">
                          Role: {hasBasicPermission ? 'Có' : 'Không'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          hasConferenceAccess ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <span className="text-xs text-gray-600">
                          Conference: {hasConferenceAccess ? 'Có' : 'Không'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          hasAnyAccess ? 'bg-orange-500' : 'bg-gray-300'
                        }`} />
                        <span className="text-xs text-gray-600">
                          Any: {hasAnyAccess ? 'Có' : 'Không'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Conference Permissions */}
        {currentConferenceId && (
          <Card>
            <CardHeader>
              <CardTitle>Quyền hội nghị hiện tại</CardTitle>
              <CardDescription>
                Chi tiết quyền cho hội nghị: {getConferenceName(currentConferenceId)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(currentPermissions).map(([permission, hasAccess]) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      hasAccess ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className={`text-sm ${
                      hasAccess ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {permission}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Available Conferences:</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(availableConferences, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">Current Conference ID:</h4>
                <p className="text-sm">{currentConferenceId || 'None'}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">All Conference Permissions:</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(conferencePermissions, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
