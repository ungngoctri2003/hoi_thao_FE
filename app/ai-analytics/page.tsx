"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { websocketService } from "@/lib/websocket";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import {
  BarChart3,
  Users,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Target,
  Building,
  Globe,
} from "lucide-react";
import { GlobalAIInsights } from "@/components/analytics/global-ai-insights";
import { GlobalTrends } from "@/components/analytics/global-trends";
import { TopConferences } from "@/components/analytics/top-conferences";
import { GlobalDemographics } from "@/components/analytics/global-demographics";

interface GlobalAnalyticsData {
  totalConferences: number;
  totalAttendees: number;
  totalSessions: number;
  totalInteractions: number;
  averageEngagement: number;
  averageSatisfaction: number;
  topPerformingConferences: Array<{
    id: number;
    name: string;
    attendees: number;
    engagement: number;
    satisfaction: number;
    trend: "up" | "down" | "stable";
  }>;
  globalTrends: Array<{
    metric: string;
    value: number;
    change: number;
    trend: "up" | "down" | "stable";
  }>;
  demographics: {
    ageGroups: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    industries: Array<{
      industry: string;
      count: number;
      percentage: number;
    }>;
  };
  aiInsights: Array<{
    type: "trend" | "recommendation" | "alert" | "prediction";
    title: string;
    description: string;
    confidence: number;
    priority: "high" | "medium" | "low";
    conferenceId?: number;
    conferenceName?: string;
  }>;
  monthlyStats: Array<{
    month: string;
    conferences: number;
    attendees: number;
    engagement: number;
  }>;
}

export default function GlobalAIAnalyticsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [analyticsData, setAnalyticsData] =
    useState<GlobalAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [selectedConference, setSelectedConference] = useState<number | null>(
    null
  );
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [websocketStatus, setWebsocketStatus] = useState<{
    connected: boolean;
    socketId?: string;
    reconnectAttempts: number;
  }>({ connected: false, reconnectAttempts: 0 });

  // Export report function
  const exportReport = () => {
    if (!analyticsData) {
      alert("Không có dữ liệu để xuất báo cáo");
      return;
    }

    const reportData = {
      timestamp: new Date().toISOString(),
      timeRange: selectedTimeRange,
      data: analyticsData,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `ai-analytics-report-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper function to get access token
  const getAccessToken = (): string | null => {
    if (typeof window === "undefined") return null;

    // Try multiple sources for token
    const sources = [
      // 1. Try cookies first
      () => {
        const cookies = document.cookie.split(";");
        const tokenCookie = cookies.find((cookie) =>
          cookie.trim().startsWith("accessToken=")
        );
        if (tokenCookie) {
          return tokenCookie.split("=")[1];
        }
        return null;
      },
      // 2. Try localStorage accessToken
      () => localStorage.getItem("accessToken"),
      // 3. Try localStorage token (legacy)
      () => localStorage.getItem("token"),
      // 4. Try sessionStorage
      () => sessionStorage.getItem("accessToken"),
      () => sessionStorage.getItem("token"),
    ];

    for (const source of sources) {
      try {
        const token = source();
        if (token && token.trim() !== "") {
          console.log("Token found from source:", source.name || "unknown");
          return token;
        }
      } catch (error) {
        console.warn("Error accessing token source:", error);
      }
    }

    console.log("No valid token found in any source");
    return null;
  };

  // Fetch data from API
  const fetchAnalyticsData = async (timeRange?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const token = getAccessToken();
      console.log(
        "Token retrieved:",
        token ? `${token.substring(0, 20)}...` : "null"
      );

      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại để truy cập trang này."
        );
      }

      // Build URL with time range parameter
      const url = new URL(`${apiUrl}/analytics/global-ai`);
      if (timeRange && timeRange !== "all") {
        url.searchParams.append("timeRange", timeRange);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          );
        } else if (response.status === 403) {
          throw new Error("Bạn không có quyền truy cập trang này.");
        } else if (response.status >= 500) {
          throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else {
          throw new Error(
            `Không thể tải dữ liệu: ${response.status} ${response.statusText}`
          );
        }
      }

      const result = await response.json();
      console.log("Analytics data received:", result);

      if (result.data) {
        setAnalyticsData(result.data);
      } else {
        throw new Error("Định dạng dữ liệu không hợp lệ từ API");
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi tải dữ liệu"
      );
      setAnalyticsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();

    // Check WebSocket connection status
    const checkWebSocketStatus = () => {
      const status = websocketService.getConnectionStatus();
      setWebsocketStatus(status);
    };

    // Initial check
    checkWebSocketStatus();

    // Set up periodic status checks
    const statusInterval = setInterval(checkWebSocketStatus, 5000);

    // Listen for WebSocket events
    const handleWebSocketConnect = () => {
      console.log("WebSocket connected in AI analytics page");
      checkWebSocketStatus();
    };

    const handleWebSocketDisconnect = () => {
      console.log("WebSocket disconnected in AI analytics page");
      checkWebSocketStatus();
    };

    const handleWebSocketError = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.error(
        "WebSocket error in AI analytics page:",
        customEvent.detail
      );
      checkWebSocketStatus();
    };

    // Add event listeners
    window.addEventListener("websocket-connected", handleWebSocketConnect);
    window.addEventListener(
      "websocket-disconnected",
      handleWebSocketDisconnect
    );
    window.addEventListener("websocket-error", handleWebSocketError);

    return () => {
      clearInterval(statusInterval);
      window.removeEventListener("websocket-connected", handleWebSocketConnect);
      window.removeEventListener(
        "websocket-disconnected",
        handleWebSocketDisconnect
      );
      window.removeEventListener("websocket-error", handleWebSocketError);
    };
  }, []);

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">
                Chưa đăng nhập
              </CardTitle>
              <CardDescription className="text-center">
                Vui lòng đăng nhập để truy cập trang này
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user is admin
  const userRole = (user.role as "admin" | "staff" | "attendee") || "attendee";
  const userName = user.name || "Người dùng";
  const userAvatar = user.avatar;

  if (userRole !== "admin") {
    return (
      <MainLayout
        userRole={userRole}
        userName={userName}
        userAvatar={userAvatar}
      >
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">
                Không có quyền truy cập
              </CardTitle>
              <CardDescription className="text-center">
                Chỉ quản trị viên mới có quyền xem phân tích AI tổng quan
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (error && !isLoading) {
    return (
      <MainLayout
        userRole={userRole}
        userName={userName}
        userAvatar={userAvatar}
      >
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">
                Lỗi tải dữ liệu
              </CardTitle>
              <CardDescription className="text-center">{error}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Thử lại
                </Button>
                <div className="text-sm text-muted-foreground">Hoặc</div>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = "/login")}
                  className="mt-2"
                >
                  Đăng nhập lại
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole={userRole} userName={userName} userAvatar={userAvatar}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="space-y-8 p-6">
          {/* Header with Gradient */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                    <Globe className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                      Phân tích AI tổng quan
                    </h1>
                    <p className="mt-2 text-xl text-blue-100">
                      Phân tích dữ liệu từ tất cả hội nghị với trí tuệ nhân tạo
                    </p>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            websocketStatus.connected
                              ? "bg-green-400 animate-pulse"
                              : "bg-red-400"
                          }`}
                        ></div>
                        <span className="text-sm font-medium">
                          {websocketStatus.connected
                            ? "Kết nối WebSocket"
                            : "Mất kết nối WebSocket"}
                        </span>
                      </div>
                      {!websocketStatus.connected && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => websocketService.forceReconnect()}
                          className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                        >
                          Kết nối lại
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    disabled={isLoading}
                    onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                    className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/30"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    {showAdvancedFilter ? "Ẩn bộ lọc" : "Bộ lọc"}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={isLoading || !analyticsData}
                    onClick={exportReport}
                    className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/30"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Xuất báo cáo
                  </Button>
                  <Button
                    onClick={() => fetchAnalyticsData(selectedTimeRange)}
                    disabled={isLoading}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    {isLoading ? "Đang tải..." : "Làm mới"}
                  </Button>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5"></div>
          </div>

          {/* Advanced Filter Panel */}
          {showAdvancedFilter && (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <span>Bộ lọc nâng cao</span>
                </CardTitle>
                <CardDescription>
                  Tùy chỉnh các tham số để lọc dữ liệu phân tích
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Khoảng thời gian
                    </label>
                    <select
                      value={selectedTimeRange}
                      onChange={(e) => {
                        setSelectedTimeRange(e.target.value);
                        fetchAnalyticsData(e.target.value);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">Tất cả thời gian</option>
                      <option value="week">Tuần này</option>
                      <option value="month">Tháng này</option>
                      <option value="quarter">Quý này</option>
                      <option value="year">Năm này</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Hội nghị cụ thể
                    </label>
                    <select
                      value={selectedConference || ""}
                      onChange={(e) =>
                        setSelectedConference(
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tất cả hội nghị</option>
                      {analyticsData?.topPerformingConferences?.map((conf) => (
                        <option key={conf.id} value={conf.id}>
                          {conf.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        setSelectedTimeRange("all");
                        setSelectedConference(null);
                        fetchAnalyticsData("all");
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Đặt lại
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Đang phân tích dữ liệu AI
                      </h3>
                      <p className="text-gray-600">
                        Hệ thống đang xử lý và phân tích dữ liệu từ các hội
                        nghị...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skeleton Loaders */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card
                    key={i}
                    className="border-0 shadow-lg bg-white/60 backdrop-blur-sm"
                  >
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-20"></div>
                            <div className="h-6 bg-gray-300 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Show data only when not loading and data is available */}
          {!isLoading && analyticsData && (
            <>
              {/* Time Range Selector */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Filter className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          Khoảng thời gian
                        </h3>
                        <p className="text-sm text-gray-600">
                          Chọn khoảng thời gian để xem dữ liệu
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {[
                        { value: "week", label: "Tuần này", icon: "📅" },
                        { value: "month", label: "Tháng này", icon: "📊" },
                        { value: "quarter", label: "Quý này", icon: "📈" },
                        { value: "all", label: "Tất cả", icon: "🌐" },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          variant={
                            selectedTimeRange === option.value
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setSelectedTimeRange(option.value);
                            fetchAnalyticsData(option.value);
                          }}
                          className={`transition-all duration-200 ${
                            selectedTimeRange === option.value
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                              : "hover:bg-blue-50 hover:border-blue-300"
                          }`}
                        >
                          <span className="mr-2">{option.icon}</span>
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700 mb-1">
                          Tổng hội nghị
                        </p>
                        <p className="text-3xl font-bold text-blue-900">
                          {analyticsData.totalConferences}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Hội nghị đã tổ chức
                        </p>
                      </div>
                      <div className="rounded-2xl bg-blue-500 p-4 group-hover:scale-110 transition-transform duration-300">
                        <Building className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-1">
                          Tổng tham dự
                        </p>
                        <p className="text-3xl font-bold text-green-900">
                          {analyticsData.totalAttendees?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Tham dự viên
                        </p>
                      </div>
                      <div className="rounded-2xl bg-green-500 p-4 group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700 mb-1">
                          Tỷ lệ tương tác
                        </p>
                        <p className="text-3xl font-bold text-purple-900">
                          {analyticsData.averageEngagement || 0}%
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          Trung bình
                        </p>
                      </div>
                      <div className="rounded-2xl bg-purple-500 p-4 group-hover:scale-110 transition-transform duration-300">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-orange-700 mb-1">
                          Điểm hài lòng
                        </p>
                        <p className="text-3xl font-bold text-orange-900">
                          {(analyticsData.averageSatisfaction || 0).toFixed(2)}
                          /5
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          Trung bình
                        </p>
                      </div>
                      <div className="rounded-2xl bg-orange-500 p-4 group-hover:scale-110 transition-transform duration-300">
                        <Target className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Global Trends */}
              <GlobalTrends
                trends={analyticsData.globalTrends || []}
                isLoading={false}
              />

              {/* AI Insights */}
              <GlobalAIInsights
                insights={analyticsData.aiInsights || []}
                isLoading={false}
              />

              {/* Top Performing Conferences */}
              <TopConferences
                conferences={analyticsData.topPerformingConferences || []}
                isLoading={false}
              />

              {/* Demographics */}
              <GlobalDemographics
                demographics={
                  analyticsData.demographics || {
                    ageGroups: [],
                    industries: [],
                  }
                }
                isLoading={false}
              />

              {/* Monthly Statistics Chart */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-2">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Biểu đồ thống kê theo tháng
                      </CardTitle>
                      <CardDescription className="text-base">
                        Xu hướng số lượng hội nghị và tham dự viên theo thời
                        gian
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {analyticsData.monthlyStats &&
                  analyticsData.monthlyStats.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {analyticsData.monthlyStats
                          .slice(0, 6)
                          .map((stat, index) => (
                            <div
                              key={stat.month}
                              className="group relative overflow-hidden rounded-xl border-0 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                            >
                              <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-10 translate-x-10"></div>
                              <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="text-sm font-semibold text-gray-600">
                                    {new Date(
                                      stat.month + "-01"
                                    ).toLocaleDateString("vi-VN", {
                                      year: "numeric",
                                      month: "long",
                                    })}
                                  </div>
                                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    #{index + 1}
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <Building className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm font-medium text-blue-800">
                                        Hội nghị
                                      </span>
                                    </div>
                                    <span className="text-lg font-bold text-blue-900">
                                      {stat.conferences}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <Users className="h-4 w-4 text-green-600" />
                                      <span className="text-sm font-medium text-green-800">
                                        Tham dự viên
                                      </span>
                                    </div>
                                    <span className="text-lg font-bold text-green-900">
                                      {stat.attendees}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                      <Eye className="h-4 w-4 text-purple-600" />
                                      <span className="text-sm font-medium text-purple-800">
                                        Tương tác
                                      </span>
                                    </div>
                                    <span className="text-lg font-bold text-purple-900">
                                      {stat.engagement}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                      {analyticsData.monthlyStats.length > 6 && (
                        <div className="text-center">
                          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full">
                            <span className="text-sm text-gray-600">
                              Và {analyticsData.monthlyStats.length - 6} tháng
                              khác...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <div className="rounded-full bg-gray-200 p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                          <BarChart3 className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                          Chưa có dữ liệu thống kê
                        </h3>
                        <p className="text-gray-500">
                          Dữ liệu thống kê theo tháng sẽ được hiển thị ở đây
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
