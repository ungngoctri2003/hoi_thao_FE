"use client";

import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Suspense } from "react";
import NetworkingHub from "@/components/networking/networking-hub";

export default function NetworkingPage() {
  const searchParams = useSearchParams();
  const role =
    (searchParams.get("role") as "admin" | "staff" | "attendee") || "admin";
  const name = searchParams.get("name") || "Admin";
  return (
    <MainLayout userRole={role} userName={name}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Kết nối mạng lưới
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Kết nối với những người tham dự khác và mở rộng mạng lưới chuyên
            nghiệp của bạn
          </p>
        </div>

        <Suspense fallback={<div>Đang tải...</div>}>
          <NetworkingHub />
        </Suspense>
      </div>
    </MainLayout>
  );
}
