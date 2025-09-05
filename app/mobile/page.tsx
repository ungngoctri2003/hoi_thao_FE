"use client";

import { useState, useEffect } from "react";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { ConferencePermissionGuard } from "@/components/auth/conference-permission-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Apple, 
  Globe,
  Shield,
  Star,
  Users,
  Calendar,
  MapPin,
  MessageCircle,
  Camera,
  Bell
} from "lucide-react";

export default function MobilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentConferenceId, hasConferencePermission } = useConferencePermissions();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [currentConferenceId]);

  
  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary">        </div>
      </div>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">Chưa đăng nhập</CardTitle>
              <CardDescription className="text-center">
                Vui lòng đăng nhập để truy cập trang này
              </CardDescription>
            </CardHeader>
          </Card>
                </div>
      </div>
    );
  }

  // Get user info for MainLayout
  const userRole = (user.role as "admin" | "staff" | "attendee") || "attendee";
  const userName = user.name || "Người dùng";
  const userAvatar = user.avatar;
  const canView = hasConferencePermission("mobile.view");

  if (!canView) {
    return (
      <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Không có quyền truy cập</CardTitle>
              <CardDescription className="text-center">
                Bạn không có quyền xem ứng dụng di động
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
      <ConferencePermissionGuard 
        requiredPermissions={["mobile.view"]} 
        conferenceId={currentConferenceId ?? undefined}
      >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Smartphone className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Ứng dụng di động</h1>
              <p className="text-muted-foreground">
                Tải và sử dụng ứng dụng di động cho hội nghị
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              Xem web
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Tải ứng dụng
            </Button>
          </div>
        </div>

        {/* App Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Apple className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">iOS App</p>
                  <p className="text-lg font-bold">4.8★</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Android App</p>
                  <p className="text-lg font-bold">4.6★</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Tổng tải</p>
                  <p className="text-lg font-bold">2,230</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tải ứng dụng</CardTitle>
            <CardDescription>
              Tải ứng dụng di động để có trải nghiệm tốt nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* iOS Download */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <Apple className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">iOS App</h3>
                    <p className="text-sm text-muted-foreground">Phiên bản 2.1.0</p>
                  </div>
                </div>
                <Button className="w-full">
                  <Apple className="h-4 w-4 mr-2" />
                  Tải từ App Store
                </Button>
              </div>

              {/* Android Download */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Android App</h3>
                    <p className="text-sm text-muted-foreground">Phiên bản 2.1.0</p>
                  </div>
                </div>
                <Button className="w-full">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Tải từ Google Play
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
          </ConferencePermissionGuard>
    </MainLayout>
  );
}