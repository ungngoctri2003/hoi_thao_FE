"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { MainLayout } from "@/components/layout/main-layout";
import { AuthStatus } from "@/components/auth/auth-status";
import { SessionsSystem } from "@/components/sessions/sessions-system";
import { GlobalLoading } from "@/components/ui/global-loading";

export default function SessionsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();
  const {
    hasConferencePermission,
    isLoading: conferencePermissionsLoading,
    getConferenceName,
  } = useConferencePermissions();
  const searchParams = useSearchParams();
  const conferenceId = searchParams.get("conferenceId");

  if (isLoading || permissionsLoading || conferencePermissionsLoading) {
    return (
      <div className="min-h-screen">
        <GlobalLoading
          message="Đang tải trang quản lý phiên..."
          variant="fullscreen"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <AuthStatus />
        </div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // If no conferenceId provided, show error
  if (!conferenceId) {
    return (
      <MainLayout
        userRole={(user?.role as "admin" | "staff" | "attendee") || "attendee"}
        userName={user?.name || "Người dùng"}
        userAvatar={user?.avatar}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Lỗi truy cập
            </h1>
            <p className="text-muted-foreground">
              Không tìm thấy thông tin hội nghị. Vui lòng truy cập từ sidebar.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const conferenceIdNum = parseInt(conferenceId);
  const conferenceName =
    getConferenceName(conferenceIdNum) || `Hội nghị ${conferenceId}`;

  // Check permissions
  const hasSessionsPermission =
    isAdmin || hasConferencePermission("sessions.view");
  const hasSessionsManagePermission =
    isAdmin || hasConferencePermission("sessions.manage");

  if (!hasSessionsPermission) {
    return (
      <MainLayout
        userRole={(user?.role as "admin" | "staff" | "attendee") || "attendee"}
        userName={user?.name || "Người dùng"}
        userAvatar={user?.avatar}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Không có quyền truy cập
            </h1>
            <p className="text-muted-foreground">
              Bạn không có quyền xem phiên của hội nghị này.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const userRole = (user?.role as "admin" | "staff" | "attendee") || "attendee";
  const userName = user?.name || "Người dùng";
  const userAvatar = user?.avatar;

  return (
    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
      <SessionsSystem
        conferenceId={conferenceIdNum}
        conferenceName={conferenceName}
      />
    </MainLayout>
  );
}
