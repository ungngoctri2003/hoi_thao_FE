"use client";

import { Suspense } from "react";
import { Sidebar } from "./sidebar";

interface SidebarWrapperProps {
  userRole: "admin" | "staff" | "attendee";
}

export function SidebarWrapper({ userRole }: SidebarWrapperProps) {
  return (
    <Suspense fallback={<div className="w-64 bg-gray-100 animate-pulse" />}>
      <Sidebar userRole={userRole} />
    </Suspense>
  );
}
