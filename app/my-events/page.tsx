"use client";

import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Suspense } from "react";
import { MyEventsContent } from "@/components/events/my-events-content";
import { useAuth } from "@/hooks/use-auth";
import { AuthStatus } from "@/components/auth/auth-status";

export default function MyEventsPage() {
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
        <Suspense fallback={<div>Đang tải...</div>}>
          <MyEventsContent />
        </Suspense>
      </div>
    </MainLayout>
  );
}
