"use client";

import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Suspense } from "react";
import VenueMap from "@/components/venue/venue-map";
import { useAuth } from "@/hooks/use-auth";
import { AuthStatus } from "@/components/auth/auth-status";

export default function VenuePage() {
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
            Bản đồ địa điểm
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Khám phá địa điểm hội nghị với bản đồ tương tác và thông tin thời
            gian thực
          </p>
        </div>

        <Suspense fallback={<div>Đang tải bản đồ...</div>}>
          <VenueMap />
        </Suspense>
      </div>
    </MainLayout>
  );
}
