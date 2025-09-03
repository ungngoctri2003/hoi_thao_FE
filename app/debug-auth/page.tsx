"use client";

import { AuthDebug } from "@/components/debug/auth-debug";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";

export default function DebugAuthPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Use role from user object, fallback to default
  const role = (user?.role as "admin" | "staff" | "attendee") || "attendee";
  const name = user?.name || "Debug User";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <MainLayout userRole={role} userName={name} userAvatar={user?.avatar}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold">Authentication Debug</h1>
          <p className="text-muted-foreground">Debug authentication state and permissions</p>
        </div>
        
        <AuthDebug />
      </div>
    </MainLayout>
  );
}
