"use client";

import type React from "react";

import { SidebarWrapper } from "./sidebar-wrapper";
import { Header } from "./header";
import { SessionExpirationHandler } from "@/components/auth/session-expiration-handler";
import { AccountDisabledAlert } from "@/components/auth/account-disabled-alert";
import { RoleChangeNotification } from "@/components/auth/role-change-notification";
import { AuditProvider } from "@/components/audit/audit-provider";

interface MainLayoutProps {
  children: React.ReactNode;
  userRole: "admin" | "staff" | "attendee";
  userName: string;
  userAvatar?: string;
}

export function MainLayout({
  children,
  userRole,
  userName,
  userAvatar,
}: MainLayoutProps) {
  return (
    <AuditProvider>
      <div className="flex min-h-screen bg-background">
        <SessionExpirationHandler />
        <AccountDisabledAlert />
        <RoleChangeNotification />
        <SidebarWrapper userRole={userRole} />
        <div className="flex-1 flex flex-col">
          <Header
            userName={userName}
            userRole={userRole}
            userAvatar={userAvatar}
          />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuditProvider>
  );
}
