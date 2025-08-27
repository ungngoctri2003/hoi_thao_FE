"use client"

import { useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { RoleManagement } from "@/components/roles/role-management"

export default function RolesPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as "admin" | "staff" | "attendee") || "admin"
  const name = searchParams.get("name") || "Admin"

  return (
    <MainLayout userRole={role} userName={name}>
      <RoleManagement />
    </MainLayout>
  )
}
