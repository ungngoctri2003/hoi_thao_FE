"use client"

import { useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { AttendeeManagement } from "@/components/attendees/attendee-management"

export default function AttendeesPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as "admin" | "staff" | "attendee") || "admin"
  const name = searchParams.get("name") || "Admin"

  return (
    <MainLayout userRole={role} userName={name}>
      <AttendeeManagement />
    </MainLayout>
  )
}
