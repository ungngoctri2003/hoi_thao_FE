"use client";

import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Suspense } from "react";
import LiveSessions from "@/components/sessions/live-sessions";

export default function SessionsPage() {
  const searchParams = useSearchParams();
  const role =
    (searchParams.get("role") as "admin" | "staff" | "attendee") || "admin";
  const name = searchParams.get("name") || "Admin";

  return (
    <MainLayout userRole={role} userName={name}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Phiên họp trực tiếp
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tham gia tương tác với các phiên họp đang diễn ra
          </p>
        </div>

        <Suspense fallback={<div>Đang tải phiên họp...</div>}>
          <LiveSessions />
        </Suspense>
      </div>
    </MainLayout>
  );
}
