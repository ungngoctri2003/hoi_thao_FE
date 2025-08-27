"use client"

import { useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { StaffDashboard } from "@/components/dashboard/staff-dashboard"
import { AttendeeDashboard } from "@/components/dashboard/attendee-dashboard"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as "admin" | "staff" | "attendee") || "attendee"
  const name = searchParams.get("name") || "Người dùng"

  const renderDashboard = () => {
    switch (role) {
      case "admin":
        return <AdminDashboard />
      case "staff":
        return <StaffDashboard />
      case "attendee":
        return <AttendeeDashboard />
      default:
        return <AttendeeDashboard />
    }
  }

  return (
    <MainLayout userRole={role} userName={name}>
      {renderDashboard()}
    </MainLayout>
  )
}
