"use client";

import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Suspense } from "react";
import LiveSessions from "@/components/sessions/live-sessions";
import { useAuth } from "@/hooks/use-auth";
import { AuthStatus } from "@/components/auth/auth-status";

export default function SessionsPage() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Use role from user object, fallback to URL params for backward compatibility
  const role = (user?.role as "admin" | "staff" | "attendee") || (searchParams.get("role") as "admin" | "staff" | "attendee") || "attendee";
  const name = user?.name || searchParams.get("name") || "Người dùng";

  if (isLoading) {
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

  return (
    <MainLayout userRole={role} userName={name} userAvatar={user?.avatar}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Phiên họp trực tiếp
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tham gia tương tác với các phiên họp đang diễn ra
          </p>
        </div>

        <Suspense fallback={<div>Đang tải phiên họp...</div>}>
          <LiveSessions />
        </Suspense>
      </div>
    </MainLayout>
  );
}
