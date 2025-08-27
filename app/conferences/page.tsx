"use client"

import { useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { ConferenceManagement } from "@/components/conferences/conference-management"

export default function ConferencesPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as "admin" | "staff" | "attendee") || "admin"
  const name = searchParams.get("name") || "Admin"

  return (
    <MainLayout userRole={role} userName={name}>
      <ConferenceManagement />
    </MainLayout>
  )
}
