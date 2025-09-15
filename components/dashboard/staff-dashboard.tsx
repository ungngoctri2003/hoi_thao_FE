"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CheckCircle,
  Clock,
  QrCode,
  TrendingUp,
  AlertTriangle,
  Calendar,
  MapPin,
  Activity,
  BarChart3,
  RefreshCw,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RealtimeChart } from "@/components/charts/realtime-chart";
import { RegistrationChart } from "@/components/charts/registration-chart";
import { RealtimeNotifications } from "@/components/dashboard/realtime-notifications";
import { RealtimeStatus } from "@/components/dashboard/realtime-status";
import { CheckInTable } from "@/components/dashboard/checkin-table";
import { MobileCheckIn } from "@/components/dashboard/mobile-checkin";
import { useAuth } from "@/hooks/use-auth";
import { RoleInfoPanel } from "@/components/layout/role-info-panel";
import { apiClient } from "@/lib/api";
import { useEffect, useState } from "react";

export function StaffDashboard() {
  const { user } = useAuth();
  const [todayStats, setTodayStats] = useState([
    {
      title: "Cần check-in hôm nay",
      value: "0",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Đã check-in",
      value: "0",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900",
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Chưa check-in",
      value: "0",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900",
      change: "-5%",
      changeType: "negative" as const,
    },
    {
      title: "Tỷ lệ tham dự",
      value: "0%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      change: "+3%",
      changeType: "positive" as const,
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [overview, realtime, upcomingEvents, alerts] = await Promise.all([
          apiClient.getDashboardOverview(),
          apiClient.getRealtimeData(),
          apiClient.getUpcomingEvents(),
          apiClient.getSystemAlerts(),
        ]);

        // Calculate today's stats
        const totalRegistrations = overview.totalAttendees || 0;
        const checkInsToday = realtime.checkInsToday || 0;
        const remainingCheckIns = Math.max(
          0,
          totalRegistrations - checkInsToday
        );
        const completionRate =
          totalRegistrations > 0
            ? Math.round((checkInsToday / totalRegistrations) * 100)
            : 0;

        setTodayStats([
          {
            title: "Cần check-in hôm nay",
            value: totalRegistrations.toLocaleString(),
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100 dark:bg-blue-900",
            change: "+12%",
            changeType: "positive" as const,
          },
          {
            title: "Đã check-in",
            value: checkInsToday.toLocaleString(),
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-100 dark:bg-green-900",
            change: "+8%",
            changeType: "positive" as const,
          },
          {
            title: "Chưa check-in",
            value: remainingCheckIns.toLocaleString(),
            icon: Clock,
            color: "text-orange-600",
            bgColor: "bg-orange-100 dark:bg-orange-900",
            change: "-5%",
            changeType: "negative" as const,
          },
          {
            title: "Tỷ lệ tham dự",
            value: `${completionRate}%`,
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-100 dark:bg-purple-900",
            change: "+3%",
            changeType: "positive" as const,
          },
        ]);

        // Set current event (first upcoming event)
        if (upcomingEvents && upcomingEvents.length > 0) {
          setCurrentEvent(upcomingEvents[0]);
        }

        // Set system alerts
        setSystemAlerts(alerts || []);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Error fetching staff data:", err);
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchStaffData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold">
            Chào mừng, {user?.name || "Nhân viên"}!
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Quản lý check-in và hỗ trợ người tham dự
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-2">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Cập nhật lần cuối: </span>
              <span className="sm:hidden">Cập nhật: </span>
              <span>{lastUpdated.toLocaleTimeString("vi-VN")}</span>
            </div>
            <Badge variant="outline" className="text-xs w-fit">
              <Activity className="h-3 w-3 mr-1" />
              Đang hoạt động
            </Badge>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
          <Button className="w-full sm:w-auto">
            <QrCode className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Bắt đầu check-in</span>
            <span className="sm:hidden">Check-in</span>
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
              Cảnh báo hệ thống
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {systemAlerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {todayStats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
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
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant={
                    stat.changeType === "positive" ? "default" : "destructive"
                  }
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  so với hôm qua
                </span>
              </div>
            </CardContent>
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-black/5 rounded-bl-full" />
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Check-in theo thời gian
            </CardTitle>
            <CardDescription>Biểu đồ check-in trong 24 giờ qua</CardDescription>
          </CardHeader>
          <CardContent>
            <RealtimeChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Xu hướng đăng ký
            </CardTitle>
            <CardDescription>Biểu đồ đăng ký trong 30 ngày qua</CardDescription>
          </CardHeader>
          <CardContent>
            <RegistrationChart />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
            <CardDescription>Các chức năng thường dùng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <QrCode className="mr-2 h-4 w-4" />
              Quét mã QR check-in
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm người tham dự
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Check-in thủ công
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-transparent"
            >
              <Filter className="mr-2 h-4 w-4" />
              Lọc và báo cáo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>Cập nhật real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status & Notifications */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <RealtimeStatus />
        <RealtimeNotifications />
      </div>

      {/* Check-in Management */}
      <div className="space-y-6">
        {/* Mobile Check-in - Only visible on mobile */}
        <div className="block md:hidden">
          <MobileCheckIn />
        </div>

        {/* Desktop Check-in Table - Hidden on mobile */}
        <div className="hidden md:block">
          <CheckInTable />
        </div>
      </div>

      {/* Current Event Status */}
      {currentEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Sự kiện hiện tại
            </CardTitle>
            <CardDescription className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {currentEvent.location || "Địa điểm chưa xác định"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                <div className="text-2xl font-bold text-blue-600">
                  {todayStats[0]?.value || "0"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Tổng đăng ký
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                <div className="text-2xl font-bold text-green-600">
                  {todayStats[1]?.value || "0"}
                </div>
                <div className="text-sm text-muted-foreground">Đã check-in</div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-orange-50 dark:bg-orange-950">
                <div className="text-2xl font-bold text-orange-600">
                  {todayStats[2]?.value || "0"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Chưa check-in
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
                <div className="text-2xl font-bold text-purple-600">
                  {todayStats[3]?.value || "0%"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Tỷ lệ tham dự
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">{currentEvent.name}</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {currentEvent.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>
                  Bắt đầu:{" "}
                  {new Date(currentEvent.startDate).toLocaleString("vi-VN")}
                </span>
                <span>
                  Kết thúc:{" "}
                  {new Date(currentEvent.endDate).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Info Panel */}
      <RoleInfoPanel />
    </div>
  );
}
