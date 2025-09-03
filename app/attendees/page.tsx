"use client"

import { useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { AttendeeManagement } from "@/components/attendees/attendee-management"
import { useAuth } from "@/hooks/use-auth"
import { AuthStatus } from "@/components/auth/auth-status"
import { StaffAndAdmin } from "@/components/auth/role-guard"

export default function AttendeesPage() {
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading } = useAuth()
  
  // Use role from user object, fallback to URL params for backward compatibility
  const role = (user?.role as "admin" | "staff" | "attendee") || (searchParams.get("role") as "admin" | "staff" | "attendee") || "attendee"
  const name = user?.name || searchParams.get("name") || "Người dùng"

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
        <div className="max-w-md w-full">
          <AuthStatus />
        </div>
      </div>
    )
  }

  return (
    <StaffAndAdmin>
      <MainLayout userRole={role} userName={name} userAvatar={user?.avatar}>
        <AttendeeManagement />
      </MainLayout>
    </StaffAndAdmin>
  )
}
