"use client";

import { useParams } from "next/navigation";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { ConferencePermissionGuard } from "@/components/auth/conference-permission-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  QrCode,
  BarChart3,
  Building,
  Settings,
  Shield,
} from "lucide-react";
import Link from "next/link";

// Category configuration with icons and descriptions
const categoryConfig = {
  attendees: {
    icon: Users,
    title: "Danh sách tham dự",
    description: "Quản lý danh sách người tham dự hội nghị",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    features: [
      { name: "Xem danh sách tham dự", permission: "attendees.view" },
      { name: "Quản lý tham dự", permission: "attendees.manage" },
    ],
  },
  checkin: {
    icon: QrCode,
    title: "Check-in QR",
    description: "Hệ thống check-in bằng QR code",
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    features: [{ name: "Quản lý check-in", permission: "checkin.manage" }],
  },
  analytics: {
    icon: BarChart3,
    title: "Phân tích AI",
    description: "Phân tích dữ liệu với AI",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    features: [{ name: "Xem phân tích", permission: "analytics.view" }],
  },
  roles: {
    icon: Shield,
    title: "Phân quyền",
    description: "Quản lý quyền và vai trò người dùng",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200",
    features: [{ name: "Quản lý phân quyền", permission: "roles.manage" }],
  },
};

export default function ConferencePage() {
  const params = useParams();
  const conferenceId = parseInt(params.id as string);
  const {
    getConferenceName,
    getConferencePermissions,
    hasConferenceAccess,
    isLoading,
  } = useConferencePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasConferenceAccess(conferenceId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Không có quyền truy cập
            </CardTitle>
            <CardDescription className="text-center">
              Bạn không có quyền truy cập hội nghị này
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const conferenceName = getConferenceName(conferenceId);
  const permissions = getConferencePermissions(conferenceId);

  // Get available categories based on permissions
  const availableCategories = Object.entries(categoryConfig).filter(
    ([key, config]) => {
      return config.features.some(
        (feature) => permissions[feature.permission] === true
      );
    }
  );

  return (
    <ConferencePermissionGuard
      requiredPermissions={["conferences.view"]}
      conferenceId={conferenceId}
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Building className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{conferenceName}</h1>
              <p className="text-muted-foreground">
                Xem và sử dụng các tính năng của hội nghị
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">
            {Object.values(permissions).filter(Boolean).length} quyền
          </Badge>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableCategories.map(([categoryKey, config]) => {
            const IconComponent = config.icon;
            const availableFeatures = config.features.filter(
              (feature) => permissions[feature.permission] === true
            );

            return (
              <Card
                key={categoryKey}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.title}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Available Features */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Tính năng có sẵn:
                    </h4>
                    <div className="space-y-1">
                      {availableFeatures.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{feature.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <Link href={`/${categoryKey}`}>
                      <Button className="w-full">
                        Truy cập {config.title}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Hành động nhanh</CardTitle>
            <CardDescription>Các tính năng thường sử dụng nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableCategories.slice(0, 4).map(([categoryKey, config]) => {
                const IconComponent = config.icon;
                return (
                  <Link key={categoryKey} href={`/${categoryKey}`}>
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col space-y-2"
                    >
                      <IconComponent className="h-6 w-6" />
                      <span className="text-sm">{config.title}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </ConferencePermissionGuard>
  );
}


