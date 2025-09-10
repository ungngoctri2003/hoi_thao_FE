"use client";

import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { useConferenceId } from "@/hooks/use-conference-id";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

function DebugSidebarLinksContent() {
  const {
    conferencePermissions,
    currentConferenceId,
    getAvailableConferences,
    getConferencePermissions,
    hasConferencePermission,
    isLoading,
  } = useConferencePermissions();

  const urlConferenceId = useConferenceId();
  const searchParams = useSearchParams();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const availableConferences = getAvailableConferences();

  // Category configuration (same as sidebar)
  const categoryConfig = {
    conferences: {
      icon: "📅",
      label: "Quản lý hội nghị",
      href: "/conferences",
    },
    attendees: { icon: "👥", label: "Danh sách tham dự", href: "/attendees" },
    checkin: { icon: "📱", label: "Check-in QR", href: "/checkin" },
    networking: { icon: "🌐", label: "Kết nối mạng", href: "/networking" },
    venue: { icon: "📍", label: "Bản đồ địa điểm", href: "/venue" },
    sessions: { icon: "📹", label: "Phiên trực tiếp", href: "/sessions" },
    badges: { icon: "🏆", label: "Huy hiệu số", href: "/badges" },
    analytics: { icon: "📊", label: "Phân tích AI", href: "/analytics" },
    mobile: { icon: "📱", label: "Ứng dụng di động", href: "/mobile" },
  };

  // Get conference categories based on permissions
  const getConferenceCategories = (conferenceId: number) => {
    const permissions = getConferencePermissions(conferenceId);
    return Object.entries(categoryConfig)
      .filter(([key, config]) => {
        const permissionKey =
          key === "conferences" ? "conferences.view" : `${key}.view`;
        return permissions[permissionKey] === true;
      })
      .map(([key, config]) => ({
        key,
        config: {
          ...config,
          href:
            key === "conferences"
              ? `/conferences/${conferenceId}`
              : `/${key}?conferenceId=${conferenceId}`,
        },
      }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Sidebar Links</CardTitle>
          <CardDescription>
            Kiểm tra trạng thái của sidebar và các link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current State */}
          <div>
            <h3 className="font-semibold mb-2">Current State:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Current Conference ID:</strong>{" "}
                {currentConferenceId || "null"}
              </div>
              <div>
                <strong>URL Conference ID:</strong>{" "}
                {urlConferenceId?.conferenceId || "null"}
              </div>
              <div>
                <strong>Search Params:</strong>{" "}
                {searchParams.toString() || "empty"}
              </div>
              <div>
                <strong>Available Conferences:</strong>{" "}
                {availableConferences.length.toString()}
              </div>
            </div>
          </div>

          {/* Available Conferences */}
          <div>
            <h3 className="font-semibold mb-2">Available Conferences:</h3>
            <div className="space-y-2">
              {availableConferences.map((conference) => {
                const categories = getConferenceCategories(
                  conference.conferenceId
                );
                return (
                  <Card key={conference.conferenceId} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {conference.conferenceName}
                      </h4>
                      <Badge variant="outline">
                        ID: {conference.conferenceId}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Categories ({categories.length}):
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map(({ key, config }) => (
                          <div
                            key={key}
                            className="flex items-center space-x-2 p-2 border rounded"
                          >
                            <span>{config.icon}</span>
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {config.label}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {config.href}
                              </div>
                            </div>
                            <Link href={config.href}>
                              <Button size="sm" variant="outline">
                                Test
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Test Links */}
          <div>
            <h3 className="font-semibold mb-2">Test Links:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/attendees?conferenceId=1">
                <Button variant="outline" className="w-full">
                  Test Attendees (Conference 1)
                </Button>
              </Link>
              <Link href="/conferences/1">
                <Button variant="outline" className="w-full">
                  Test Conference Page (Conference 1)
                </Button>
              </Link>
              <Link href="/attendees?conferenceId=3">
                <Button variant="outline" className="w-full">
                  Test Attendees (Conference 3)
                </Button>
              </Link>
              <Link href="/conferences/3">
                <Button variant="outline" className="w-full">
                  Test Conference Page (Conference 3)
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DebugSidebarLinksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <DebugSidebarLinksContent />
    </Suspense>
  );
}
