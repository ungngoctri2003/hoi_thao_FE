"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  Clock,
  AlertTriangle,
  BarChart3,
  Activity,
} from "lucide-react";
import { RealtimeChart } from "@/components/charts/realtime-chart";
import { RegistrationChart } from "@/components/charts/registration-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { useAuth } from "@/hooks/use-auth";
import { RoleInfoPanel } from "@/components/layout/role-info-panel";
import { apiClient } from "@/lib/api";
import { useEffect, useState } from "react";
import { DashboardExports } from "@/lib/export-utils";
import { RealtimeStatus } from "@/components/dashboard/realtime-status";
import { RealtimeNotifications } from "@/components/dashboard/realtime-notifications";
import { AdminAnalytics } from "@/components/dashboard/admin-analytics";

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const statusLabels = {
  active: "Đang diễn ra",
  upcoming: "Sắp tới",
  completed: "Đã kết thúc",
};

interface DashboardData {
  totalConferences: number;
  totalAttendees: number;
  totalCheckIns: number;
  attendanceRate: number;
  recentActivity: any[];
  upcomingEvents: any[];
}

interface RealtimeData {
  checkInsToday: number;
  checkInsLast24h: any[];
  activeUsers: number;
  systemAlerts: any[];
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [realtimeData, setRealtimeData] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [overview, realtime] = await Promise.all([
          apiClient.getDashboardOverview(),
          apiClient.getRealtimeData(),
        ]);

        setDashboardData(overview);
        setRealtimeData(realtime);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border p-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Lỗi tải dữ liệu
            </h3>
            <p className="text-red-500 mb-4">{error}</p>
          </div>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()}>
              Tải lại trang
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
            >
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: "Tổng số hội nghị",
      value: dashboardData?.totalConferences?.toString() || "0",
      change: "+2 từ tháng trước",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Tổng người tham dự",
      value: dashboardData?.totalAttendees?.toLocaleString() || "0",
      change: "+18% từ tháng trước",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Đã check-in hôm nay",
      value: realtimeData?.checkInsToday?.toLocaleString() || "0",
      change: `${
        dashboardData?.attendanceRate?.toFixed(1) || 0
      }% tổng số đăng ký`,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Tỷ lệ tham dự",
      value: `${dashboardData?.attendanceRate?.toFixed(1) || 0}%`,
      change: "+5.2% so với trung bình",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
    },
  ];

  const upcomingEvents =
    dashboardData?.upcomingEvents?.map((event) => ({
      name: event.NAME || event.name,
      date: new Date(event.START_DATE || event.startDate).toLocaleDateString(
        "vi-VN"
      ),
      attendees: event.totalRegistrations || event.attendees || 0,
      status:
        event.STATUS === "active"
          ? "active"
          : event.STATUS === "upcoming"
          ? "upcoming"
          : "completed",
    })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold">
            Chào mừng, {user?.name || "Quản trị viên"}!
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Theo dõi và quản lý toàn bộ hoạt động hội nghị
          </p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                setError(null);
                window.location.reload();
              }}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <Clock className="mr-2 h-4 w-4" />
              {loading ? "Đang tải..." : "Làm mới"}
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              onClick={() => {
                if (dashboardData?.upcomingEvents) {
                  DashboardExports.exportConferenceStats(
                    dashboardData.upcomingEvents
                  );
                }
              }}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Xuất báo cáo</span>
              <span className="sm:hidden">Xuất</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}

        {/* Role Info Panel */}
        <RoleInfoPanel />
      </div>

      {/* Real-time Status & Notifications */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <RealtimeStatus />
        <RealtimeNotifications />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Real-time Check-in Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Check-in theo thời gian thực</span>
            </CardTitle>
            <CardDescription>
              Số lượng check-in trong 24 giờ qua
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RealtimeChart />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Hoạt động gần đây</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Sự kiện</TabsTrigger>
          <TabsTrigger value="registrations">Đăng ký</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sự kiện sắp tới</CardTitle>
              <CardDescription>
                Danh sách các hội nghị và sự kiện trong thời gian tới
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">{event.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {event.date}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {event.attendees} người
                        </p>
                        <p className="text-xs text-muted-foreground">
                          đã đăng ký
                        </p>
                      </div>
                      <Badge
                        className={
                          statusColors[
                            event.status as keyof typeof statusColors
                          ]
                        }
                      >
                        {
                          statusLabels[
                            event.status as keyof typeof statusLabels
                          ]
                        }
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê đăng ký</CardTitle>
              <CardDescription>
                Xu hướng đăng ký trong 30 ngày qua
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegistrationChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AdminAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
