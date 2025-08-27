"use client";

import { useSearchParams } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import ProfileDetails from "@/components/Profile/Profile";
export default function ProfilePage() {
  const searchParams = useSearchParams();
  const role =
    (searchParams.get("role") as "admin" | "staff" | "attendee") || "admin";
  const name = searchParams.get("name") || "Admin";

  return (
    <MainLayout userRole={role} userName={name}>
      <ProfileDetails />
    </MainLayout>
  );
}
