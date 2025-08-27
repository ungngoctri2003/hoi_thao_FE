"use client"

import { useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { QRCheckinSystem } from "@/components/checkin/qr-checkin-system"

export default function CheckinPage() {
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as "admin" | "staff" | "attendee") || "admin"
  const name = searchParams.get("name") || "Admin"

  return (
    <MainLayout userRole={role} userName={name}>
      <QRCheckinSystem />
    </MainLayout>
  )
}
