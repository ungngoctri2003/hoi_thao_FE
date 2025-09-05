"use client"

import { useAuth } from "@/hooks/use-auth"
import { usePermissions } from "@/hooks/use-permissions"
import { useConferencePermissions } from "@/hooks/use-conference-permissions"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TestPermissionsSimplePage() {
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
          <p className="text-muted-foreground">Vui lòng đăng nhập để test permissions</p>
        </div>
      </div>
    )
  }

  const currentRole = user?.role as "admin" | "staff" | "attendee" || "attendee"

  // Test specific permissions
  const testPermissions = [
    'dashboard.view',
    'conferences.view',
    'attendees.view',
    'checkin.manage',
    'roles.manage',
    'settings.manage'
  ]

  return (
    <MainLayout userRole={currentRole} userName={user?.name || "User"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Test Permissions Simple</h1>
          <p className="text-muted-foreground mt-2">
            Kiểm tra quyền cơ bản và quyền hội nghị
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

        {/* Permission Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Kiểm tra quyền</CardTitle>
            <CardDescription>
              Test các quyền cơ bản và quyền hội nghị
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testPermissions.map((permission) => {
                const hasBasicPermission = hasPermission(permission)
                const hasConferenceAccess = hasConferencePermission(permission)
                const hasAnyAccess = hasAnyConferencePermission(permission)

                return (
                  <div key={permission} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{permission}</h3>
                      <div className="flex space-x-2">
                        <Badge variant={hasBasicPermission ? "default" : "secondary"}>
                          Basic: {hasBasicPermission ? 'Có' : 'Không'}
                        </Badge>
                        <Badge variant={hasConferenceAccess ? "default" : "secondary"}>
                          Conference: {hasConferenceAccess ? 'Có' : 'Không'}
                        </Badge>
                        <Badge variant={hasAnyAccess ? "default" : "secondary"}>
                          Any: {hasAnyAccess ? 'Có' : 'Không'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Basic Permission: {hasBasicPermission ? '✅' : '❌'}</p>
                      <p>Conference Permission: {hasConferenceAccess ? '✅' : '❌'}</p>
                      <p>Any Conference Permission: {hasAnyAccess ? '✅' : '❌'}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Conference Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin hội nghị</CardTitle>
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
                <h4 className="font-medium mb-2">Available Conferences:</h4>
                {conferencePermissions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Không có hội nghị nào</p>
                ) : (
                  <div className="space-y-2">
                    {conferencePermissions.map((conference) => (
                      <div key={conference.conferenceId} className="p-2 border rounded">
                        <p className="text-sm font-medium">{conference.conferenceName}</p>
                        <p className="text-xs text-muted-foreground">
                          Active: {conference.isActive ? 'Yes' : 'No'} | 
                          Permissions: {Object.keys(conference.permissions).length}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Raw Data */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Basic Permissions:</h4>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(permissions, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">Conference Permissions:</h4>
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
