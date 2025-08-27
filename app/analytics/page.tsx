"use client";

import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Suspense } from "react";
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const role =
    (searchParams.get("role") as "admin" | "staff" | "attendee") || "admin";
  const name = searchParams.get("name") || "Admin";

  return (
    <MainLayout userRole={role} userName={name}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Phân tích & Báo cáo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Thông tin chi tiết về hiệu suất hội nghị và hành vi người tham dự
          </p>
        </div>

        <Suspense fallback={<div>Đang tải dữ liệu phân tích...</div>}>
          <AnalyticsDashboard />
        </Suspense>
      </div>
    </MainLayout>
  );
}
