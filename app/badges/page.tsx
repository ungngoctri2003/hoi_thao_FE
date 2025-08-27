"use client";

import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Suspense } from "react";
import BadgeSystem from "@/components/badges/badge-system";

export default function BadgesPage() {
  const searchParams = useSearchParams();
  const role =
    (searchParams.get("role") as "admin" | "staff" | "attendee") || "admin";
  const name = searchParams.get("name") || "Admin";

  return (
    <MainLayout userRole={role} userName={name}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Hệ thống huy hiệu
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Theo dõi thành tích và nhận huy hiệu cho các hoạt động tham gia hội
            nghị
          </p>
        </div>

        <Suspense fallback={<div>Đang tải huy hiệu...</div>}>
          <BadgeSystem />
        </Suspense>
      </div>
    </MainLayout>
  );
}
