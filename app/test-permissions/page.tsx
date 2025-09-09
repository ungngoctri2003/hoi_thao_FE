"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TestPermissionsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasPermission, permissions, isLoading: permissionsLoading } = usePermissions();

  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Chưa đăng nhập
          </div>
        </div>
      </div>
    );
  }

  const userRole = (user.role as "admin" | "staff" | "attendee") || "attendee";
  const userName = user.name || "Người dùng";
  const userAvatar = user.avatar;

  // Test permissions for messaging
  const messagingPermission = hasPermission('messaging.view');
  const allPermissions = permissions.map(p => p.code);

  return (
    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Test Permissions</h1>
        
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Role:</strong> <Badge variant="outline">{userRole}</Badge></p>
              <p><strong>Name:</strong> {userName}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Messaging Permission Test */}
        <Card>
          <CardHeader>
            <CardTitle>Kiểm tra quyền Messaging</CardTitle>
            <CardDescription>
              Kiểm tra xem user có quyền truy cập trang tin nhắn không
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium">messaging.view:</span>
                <Badge variant={messagingPermission ? "default" : "destructive"}>
                  {messagingPermission ? "Có quyền" : "Không có quyền"}
                </Badge>
              </div>
              
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-medium mb-2">Tất cả permissions:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {allPermissions.map((permission, index) => (
                    <div key={index} className="text-sm">
                      <Badge 
                        variant={permission === 'messaging.view' ? "default" : "outline"}
                        className="text-xs"
                      >
                        {permission}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-based Permission Check */}
        <Card>
          <CardHeader>
            <CardTitle>Kiểm tra quyền theo Role</CardTitle>
            <CardDescription>
              So sánh quyền thực tế với quyền được định nghĩa cho từng role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Admin */}
                <div className="border rounded p-4">
                  <h4 className="font-medium mb-2">Admin</h4>
                  <p className="text-sm text-gray-600 mb-2">Có tất cả permissions</p>
                  <Badge variant="default">messaging.view ✓</Badge>
                </div>

                {/* Staff */}
                <div className="border rounded p-4">
                  <h4 className="font-medium mb-2">Staff</h4>
                  <p className="text-sm text-gray-600 mb-2">Có messaging.view</p>
                  <Badge variant="default">messaging.view ✓</Badge>
                </div>

                {/* Attendee */}
                <div className="border rounded p-4">
                  <h4 className="font-medium mb-2">Attendee</h4>
                  <p className="text-sm text-gray-600 mb-2">Có messaging.view</p>
                  <Badge variant="default">messaging.view ✓</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current User Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái hiện tại</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Role hiện tại:</strong> {userRole}</p>
              <p><strong>Có quyền messaging:</strong> {messagingPermission ? "Có" : "Không"}</p>
              <p><strong>Tổng số permissions:</strong> {allPermissions.length}</p>
              <p><strong>Permissions loading:</strong> {permissionsLoading ? "Đang tải" : "Hoàn thành"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
