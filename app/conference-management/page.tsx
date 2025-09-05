"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { MainLayout } from "@/components/layout/main-layout";
import { ConferenceManagementSystem } from "@/components/conferences/conference-management-system";
import { AuthStatus } from "@/components/auth/auth-status";

export default function ConferenceManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { hasPermission, isLoading: permissionsLoading } = usePermissions();

  if (isLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  if (!isAdmin) {
    return (
      <MainLayout 
        userRole={(user?.role as "admin" | "staff" | "attendee") || "attendee"} 
        userName={user?.name || "Người dùng"} 
        userAvatar={user?.avatar}
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
            <p className="text-muted-foreground">
              Chỉ quản trị viên mới có quyền truy cập trang quản lý hội nghị.
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
      <ConferenceManagementSystem />
    </MainLayout>
  );
}
