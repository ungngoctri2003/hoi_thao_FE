"use client";

import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Suspense } from "react";
import VenueMap from "@/components/venue/venue-map";

export default function VenuePage() {
  const searchParams = useSearchParams();
  const role =
    (searchParams.get("role") as "admin" | "staff" | "attendee") || "admin";
  const name = searchParams.get("name") || "Admin";
  return (
    <MainLayout userRole={role} userName={name}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bản đồ địa điểm
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Khám phá địa điểm hội nghị với bản đồ tương tác và thông tin thời
            gian thực
          </p>
        </div>

        <Suspense fallback={<div>Đang tải bản đồ...</div>}>
          <VenueMap />
        </Suspense>
      </div>
    </MainLayout>
  );
}
