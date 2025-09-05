"use client";

import { Suspense } from "react";
import { PermissionsDebug } from "@/components/debug/permissions-debug";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useSearchParams } from "next/navigation";

function DebugPermissionsContent() {
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
        <div className="max-w-md w-full text-center">
          <h2 className="text-lg font-semibold mb-2">Cần đăng nhập</h2>
          <p className="text-muted-foreground mb-4">
            Bạn cần đăng nhập để truy cập trang debug này.
          </p>
          <a 
            href="/login" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <MainLayout userRole={role} userName={name} userAvatar={user?.avatar}>
      <PermissionsDebug />
    </MainLayout>
  );
}

export default function DebugPermissionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <DebugPermissionsContent />
    </Suspense>
  );
}
