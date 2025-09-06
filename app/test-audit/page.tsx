"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { AuditTest } from "@/components/examples/audit-test"
import { useAuth } from "@/hooks/use-auth"
import { AuthStatus } from "@/components/auth/auth-status"

export default function TestAuditPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  const role = (user?.role as "admin" | "staff" | "attendee") || "attendee"
  const name = user?.name || "Test User"

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
    <MainLayout userRole={role} userName={name} userAvatar={user?.avatar}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Audit System Test</h1>
          <p className="text-muted-foreground">
            Test the audit logging system to ensure actions are being recorded.
          </p>
        </div>
        
        <AuditTest />
      </div>
    </MainLayout>
  )
}
