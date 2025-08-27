"use client";

import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Suspense } from "react";
import { MyEventsContent } from "@/components/events/my-events-content";

export default function MyEventsPage() {
  const searchParams = useSearchParams();
  const role =
    (searchParams.get("role") as "admin" | "staff" | "attendee") || "admin";
  const name = searchParams.get("name") || "attendee";

  return (
    <MainLayout userRole={role} userName={name}>
      <div className="container mx-auto p-6">
        <Suspense fallback={<div>Đang tải...</div>}>
          <MyEventsContent />
        </Suspense>
      </div>
    </MainLayout>
  );
}
