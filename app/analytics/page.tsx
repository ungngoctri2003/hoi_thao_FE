"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
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
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { websocketService } from "@/lib/websocket";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Eye,
  Download,
  RefreshCw,
  Filter,
  Settings,
  Brain,
  Zap,
  Target,
  Building,
  Globe,
} from "lucide-react";
import { GlobalAIInsights } from "@/components/analytics/global-ai-insights";
import { GlobalTrends } from "@/components/analytics/global-trends";
import { TopConferences } from "@/components/analytics/top-conferences";
import { GlobalDemographics } from "@/components/analytics/global-demographics";
import { ChatGPTInsights } from "@/components/analytics/chatgpt-insights";
import { AIStatsCard } from "@/components/analytics/ai-stats-card";
import { AIConnectionStatus } from "@/components/analytics/ai-connection-status";
import { AILoadingSkeleton } from "@/components/analytics/ai-loading-skeleton";
import { ConferenceDetails } from "@/components/analytics/conference-details";
import { SessionsAnalytics } from "@/components/analytics/sessions-analytics";

interface ConferenceAnalyticsData {
  conferenceId: number;
  conferenceName: string;
  totalAttendees: number;
  totalSessions: number;
  totalInteractions: number;
  averageEngagement: number;
  averageSatisfaction: number;
  conferenceDetails: {
    startDate: string;
    endDate: string;
    location: string;
    status: string;
    description: string;
  };
  sessions: Array<{
    id: number;
    title: string;
    attendees: number;
    engagement: number;
    satisfaction: number;
    startTime: string;
    endTime: string;
    status: string;
  }>;
  trends: Array<{
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
    sessionId?: number;
    sessionName?: string;
  }>;
  chatGPTInsights?: {
    insights: Array<{
      type: "trend" | "recommendation" | "alert" | "prediction";
      title: string;
      description: string;
      confidence: number;
      priority: "high" | "medium" | "low";
      sessionId?: number;
      sessionName?: string;
    }>;
    summary: string;
    recommendations: string[];
  };
  hourlyStats: Array<{
    hour: string;
    attendees: number;
    engagement: number;
  }>;
}

export default function ConferenceAnalyticsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentConferenceId, hasConferencePermission } =
    useConferencePermissions();
  const searchParams = useSearchParams();
  const conferenceId = searchParams.get("conferenceId") || currentConferenceId;

  const [analyticsData, setAnalyticsData] =
    useState<ConferenceAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRealTimeUpdating, setIsRealTimeUpdating] = useState(false);
  const [websocketStatus, setWebsocketStatus] = useState<{
    connected: boolean;
    socketId?: string;
    reconnectAttempts: number;
  }>({ connected: false, reconnectAttempts: 0 });

  // Debounce refs
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);

  // Memoized helper function to get access token
  const getAccessToken = useCallback((): string | null => {
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
  }, []);

  // Memoized fetch data from API with debouncing
  const fetchAnalyticsData = useCallback(
    async (timeRange?: string, confId?: number | string | null) => {
      // Prevent duplicate calls
      if (isFetchingRef.current) {
        console.log("⏸️ Already fetching, skipping duplicate call");
        return;
      }

      // Clear any existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }

      // Debounce rapid requests (minimum 300ms between requests)
      const now = Date.now();
      if (now - lastFetchTimeRef.current < 300) {
        fetchTimeoutRef.current = setTimeout(() => {
          fetchAnalyticsData(timeRange, confId);
        }, 300 - (now - lastFetchTimeRef.current));
        return;
      }

      lastFetchTimeRef.current = now;
      isFetchingRef.current = true;

      try {
        setIsLoading(true);
        setError(null);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
        const token = getAccessToken();

        if (!token) {
          console.error("❌ No token found");
          throw new Error(
            "Không tìm thấy token xác thực. Vui lòng đăng nhập lại để truy cập trang này."
          );
        }

        if (!confId) {
          throw new Error(
            "Không tìm thấy ID hội nghị. Vui lòng chọn hội nghị để xem phân tích."
          );
        }

        // Build URL with time range and conference parameters
        const url = new URL(`${apiUrl}/analytics/conference-ai`);
        url.searchParams.append("conferenceId", confId.toString());
        if (timeRange && timeRange !== "all") {
          url.searchParams.append("timeRange", timeRange);
        }

        console.log("🌐 Final API URL:", url.toString());
        console.log(
          "📊 Parameters - timeRange:",
          timeRange,
          "conferenceId:",
          confId
        );

        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("❌ API Error:", response.status, response.statusText);
          if (response.status === 401) {
            throw new Error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          } else if (response.status === 403) {
            throw new Error(
              "Bạn không có quyền truy cập dữ liệu hội nghị này."
            );
          } else if (response.status === 404) {
            throw new Error(
              "Không tìm thấy dữ liệu hội nghị. Vui lòng kiểm tra lại ID hội nghị."
            );
          } else if (response.status >= 500) {
            throw new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
          } else {
            throw new Error(
              `Không thể tải dữ liệu: ${response.status} ${response.statusText}`
            );
          }
        }

        const result = await response.json();
        console.log("✅ Conference analytics data received:", result);
        console.log("📊 TimeRange used:", timeRange || "all");

        if (result.data) {
          console.log("📈 Setting conference analytics data...");
          setAnalyticsData(result.data);
          setLastUpdated(new Date());
          console.log("✅ Conference analytics data updated successfully");
        } else {
          console.error("❌ No data in API response:", result);
          throw new Error("Định dạng dữ liệu không hợp lệ từ API");
        }
      } catch (error) {
        console.error("❌ Error fetching conference analytics data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tải dữ liệu"
        );
        setAnalyticsData(null);
      } finally {
        console.log("🏁 API request completed, setting loading to false");
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [getAccessToken]
  );

  // Memoized WebSocket event handlers
  const handleWebSocketConnect = useCallback(() => {
    console.log("WebSocket connected in conference analytics page");
    const status = websocketService.getConnectionStatus();
    setWebsocketStatus(status);
  }, []);

  const handleWebSocketDisconnect = useCallback(() => {
    console.log("WebSocket disconnected in conference analytics page");
    const status = websocketService.getConnectionStatus();
    setWebsocketStatus(status);
  }, []);

  const handleWebSocketError = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    console.error(
      "WebSocket error in conference analytics page:",
      customEvent.detail
    );
    const status = websocketService.getConnectionStatus();
    setWebsocketStatus(status);
  }, []);

  const handleAnalyticsUpdate = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log(
        "Conference analytics data updated via WebSocket:",
        customEvent.detail
      );

      // Refresh analytics data when updates are received
      if (
        customEvent.detail?.type === "analytics_update" &&
        customEvent.detail?.conferenceId === conferenceId
      ) {
        setIsRealTimeUpdating(true);
        fetchAnalyticsData(selectedTimeRange, conferenceId).finally(() => {
          setIsRealTimeUpdating(false);
        });
      }
    },
    [fetchAnalyticsData, selectedTimeRange, conferenceId]
  );

  const handleConferenceUpdate = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log(
        "Conference updated, refreshing analytics:",
        customEvent.detail
      );

      // Refresh analytics data when conference data changes
      if (
        (customEvent.detail?.type === "conference_update" ||
          customEvent.detail?.type === "registration_update" ||
          customEvent.detail?.type === "checkin_update") &&
        customEvent.detail?.conferenceId === conferenceId
      ) {
        setIsRealTimeUpdating(true);
        fetchAnalyticsData(selectedTimeRange, conferenceId).finally(() => {
          setIsRealTimeUpdating(false);
        });
      }
    },
    [fetchAnalyticsData, selectedTimeRange, conferenceId]
  );

  // Initial data fetch effect
  useEffect(() => {
    if (!isInitializedRef.current && conferenceId) {
      console.log(
        "🎯 useEffect triggered - calling fetchAnalyticsData for conference:",
        conferenceId
      );
      isInitializedRef.current = true;
      fetchAnalyticsData(selectedTimeRange, conferenceId);
    }

    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      // Reset fetching flag
      isFetchingRef.current = false;
    };
  }, [conferenceId]); // Only run when conferenceId changes

  // Effect to refetch data when selectedTimeRange changes
  useEffect(() => {
    if (isInitializedRef.current && conferenceId) {
      console.log(
        "📅 selectedTimeRange changed, refetching data:",
        selectedTimeRange
      );
      fetchAnalyticsData(selectedTimeRange, conferenceId);
    }
  }, [selectedTimeRange, fetchAnalyticsData, conferenceId]);

  // WebSocket setup effect
  useEffect(() => {
    // Check WebSocket connection status
    const checkWebSocketStatus = () => {
      const status = websocketService.getConnectionStatus();
      setWebsocketStatus(status);
    };

    // Initial check
    checkWebSocketStatus();

    // Set up periodic status checks (reduced frequency)
    const statusInterval = setInterval(checkWebSocketStatus, 10000);

    // Add event listeners
    window.addEventListener("websocket-connected", handleWebSocketConnect);
    window.addEventListener(
      "websocket-disconnected",
      handleWebSocketDisconnect
    );
    window.addEventListener("websocket-error", handleWebSocketError);
    window.addEventListener("analytics-update", handleAnalyticsUpdate);
    window.addEventListener("conference-update", handleConferenceUpdate);

    return () => {
      clearInterval(statusInterval);
      window.removeEventListener("websocket-connected", handleWebSocketConnect);
      window.removeEventListener(
        "websocket-disconnected",
        handleWebSocketDisconnect
      );
      window.removeEventListener("websocket-error", handleWebSocketError);
      window.removeEventListener("analytics-update", handleAnalyticsUpdate);
      window.removeEventListener("conference-update", handleConferenceUpdate);
    };
  }, [
    handleWebSocketConnect,
    handleWebSocketDisconnect,
    handleWebSocketError,
    handleAnalyticsUpdate,
    handleConferenceUpdate,
  ]);

  // Memoized export report function
  const exportReport = useCallback(() => {
    if (!analyticsData) {
      alert("Không có dữ liệu để xuất báo cáo");
      return;
    }

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // 1. Tổng quan hội nghị
      const overviewData = [
        ["Phân tích AI Hội nghị"],
        ["Tên hội nghị", analyticsData.conferenceName],
        ["ID hội nghị", analyticsData.conferenceId],
        ["Thời gian xuất báo cáo", new Date().toLocaleString("vi-VN")],
        [
          "Khoảng thời gian",
          selectedTimeRange === "all" ? "Tất cả" : selectedTimeRange,
        ],
        ["Tổng số tham dự viên", analyticsData.totalAttendees],
        ["Tổng số phiên", analyticsData.totalSessions],
        ["Tổng số tương tác", analyticsData.totalInteractions],
        ["Tỷ lệ tương tác trung bình", `${analyticsData.averageEngagement}%`],
        [
          "Mức độ hài lòng trung bình",
          `${analyticsData.averageSatisfaction?.toFixed(2) || 0}/5`,
        ],
      ];

      const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(workbook, overviewSheet, "Tổng quan");

      // 2. Chi tiết phiên
      if (analyticsData.sessions?.length > 0) {
        const sessionsData = [
          [
            "ID",
            "Tên phiên",
            "Số tham dự viên",
            "Tỷ lệ tương tác (%)",
            "Mức độ hài lòng (/5)",
            "Thời gian bắt đầu",
            "Thời gian kết thúc",
            "Trạng thái",
          ],
          ...analyticsData.sessions.map((session) => [
            session.id,
            session.title,
            session.attendees,
            session.engagement,
            session.satisfaction?.toFixed(2) || 0,
            session.startTime,
            session.endTime,
            session.status,
          ]),
        ];

        const sessionsSheet = XLSX.utils.aoa_to_sheet(sessionsData);
        XLSX.utils.book_append_sheet(workbook, sessionsSheet, "Chi tiết phiên");
      }

      // 3. Xu hướng hội nghị
      if (analyticsData.trends?.length > 0) {
        const trendsData = [
          ["Chỉ số", "Giá trị", "Thay đổi (%)", "Xu hướng"],
          ...analyticsData.trends.map((trend) => [
            trend.metric,
            trend.value,
            trend.change,
            trend.trend === "up"
              ? "Tăng"
              : trend.trend === "down"
              ? "Giảm"
              : "Ổn định",
          ]),
        ];

        const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
        XLSX.utils.book_append_sheet(workbook, trendsSheet, "Xu hướng");
      }

      // 4. Nhân khẩu học
      if (analyticsData.demographics) {
        // Nhóm tuổi
        const ageGroupsData = [
          ["Nhóm tuổi", "Số lượng", "Tỷ lệ (%)"],
          ...analyticsData.demographics.ageGroups.map((age) => [
            age.range,
            age.count,
            age.percentage,
          ]),
        ];

        const ageGroupsSheet = XLSX.utils.aoa_to_sheet(ageGroupsData);
        XLSX.utils.book_append_sheet(workbook, ageGroupsSheet, "Nhóm tuổi");

        // Ngành nghề
        const industriesData = [
          ["Ngành nghề", "Số lượng", "Tỷ lệ (%)"],
          ...analyticsData.demographics.industries.map((industry) => [
            industry.industry,
            industry.count,
            industry.percentage,
          ]),
        ];

        const industriesSheet = XLSX.utils.aoa_to_sheet(industriesData);
        XLSX.utils.book_append_sheet(workbook, industriesSheet, "Ngành nghề");
      }

      // 5. AI Insights
      if (analyticsData.aiInsights?.length > 0) {
        const insightsData = [
          ["Loại", "Tiêu đề", "Mô tả", "Độ tin cậy (%)", "Ưu tiên"],
          ...analyticsData.aiInsights.map((insight) => [
            insight.type === "trend"
              ? "Xu hướng"
              : insight.type === "recommendation"
              ? "Khuyến nghị"
              : insight.type === "alert"
              ? "Cảnh báo"
              : "Dự đoán",
            insight.title,
            insight.description,
            insight.confidence,
            insight.priority === "high"
              ? "Cao"
              : insight.priority === "medium"
              ? "Trung bình"
              : "Thấp",
          ]),
        ];

        const insightsSheet = XLSX.utils.aoa_to_sheet(insightsData);
        XLSX.utils.book_append_sheet(workbook, insightsSheet, "AI Insights");
      }

      // Export file
      const fileName = `conference-analytics-${analyticsData.conferenceId}-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Lỗi khi xuất báo cáo Excel:", error);
      alert("Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử lại.");
    }
  }, [analyticsData, selectedTimeRange]);

  // Memoized user data - MUST be called before any conditional returns
  const userRole = useMemo(
    () => (user?.role as "admin" | "staff" | "attendee") || "attendee",
    [user?.role]
  );
  const userName = useMemo(() => user?.name || "Người dùng", [user?.name]);
  const userAvatar = useMemo(() => user?.avatar, [user?.avatar]);

  // Memoized average confidence calculation
  const averageConfidence = useMemo(() => {
    if (!analyticsData) return 0;
    const allInsights = [
      ...(analyticsData.aiInsights || []),
      ...(analyticsData.chatGPTInsights?.insights || []),
    ];
    if (allInsights.length === 0) return 0;
    const totalConfidence = allInsights.reduce(
      (sum, insight) => sum + insight.confidence,
      0
    );
    return Math.round(totalConfidence / allInsights.length);
  }, [analyticsData?.aiInsights, analyticsData?.chatGPTInsights?.insights]);

  // Memoized time range options to prevent re-creation
  const timeRangeOptions = useMemo(
    () => [
      { value: "today", label: "Hôm nay", icon: "📅" },
      { value: "week", label: "Tuần này", icon: "📊" },
      { value: "month", label: "Tháng này", icon: "📈" },
      { value: "quarter", label: "Quý này", icon: "🗓️" },
      { value: "year", label: "Năm này", icon: "🌐" },
      { value: "all", label: "Tất cả", icon: "🌍" },
    ],
    []
  );

  // Show loading state while auth is loading
  if (authLoading) {
    console.log("🔄 Auth loading...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated || !user) {
    console.log("❌ Not authenticated or no user");
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

  // Check if conferenceId is available
  if (!conferenceId) {
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
                Không tìm thấy hội nghị
              </CardTitle>
              <CardDescription className="text-center">
                Vui lòng chọn hội nghị để xem phân tích AI
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => (window.location.href = "/conferences")}
                className="mt-4"
              >
                Chọn hội nghị
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const canView = hasConferencePermission("analytics.view");

  if (!canView) {
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
                Bạn không có quyền xem phân tích dữ liệu hội nghị này
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
                  onClick={() => (window.location.href = "/conferences")}
                  className="mt-2"
                >
                  Chọn hội nghị khác
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
      <ConferencePermissionGuard
        requiredPermissions={["analytics.view"]}
        conferenceId={
          conferenceId ? parseInt(conferenceId.toString()) : undefined
        }
      >
        <div
          className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6"
          style={{
            minHeight: "100vh",
            overflowY: "auto",
            position: "relative",
          }}
        >
          <div className="space-y-8">
            {/* Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                      <Building className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold tracking-tight">
                        Phân tích AI Hội nghị
                      </h1>
                      <p className="mt-2 text-xl text-blue-100">
                        {analyticsData?.conferenceName ||
                          `Hội nghị #${conferenceId}`}
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
                        {isRealTimeUpdating && (
                          <div className="flex items-center space-x-2 rounded-full bg-blue-500/20 px-4 py-2 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400"></div>
                            <span className="text-sm font-medium text-blue-100">
                              Đang cập nhật real-time...
                            </span>
                          </div>
                        )}
                        {lastUpdated && (
                          <div className="text-xs text-blue-100/80">
                            Cập nhật lần cuối:{" "}
                            {lastUpdated.toLocaleTimeString("vi-VN")}
                          </div>
                        )}
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
                      disabled={isLoading || !analyticsData}
                      onClick={exportReport}
                      className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/30"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Xuất báo cáo
                    </Button>
                    <Button
                      onClick={() =>
                        fetchAnalyticsData(selectedTimeRange, conferenceId)
                      }
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

            {/* Loading State */}
            {isLoading && <AILoadingSkeleton />}

            {/* Show data only when not loading and data is available */}
            {!isLoading && analyticsData && (
              <>
                {/* Time Range Selector */}
                <Card className="border-0 shadow-lg bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="rounded-lg bg-blue-100 p-2">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            Khoảng thời gian
                          </h3>
                          <p className="text-sm text-gray-600">
                            Chọn khoảng thời gian để xem dữ liệu
                          </p>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {isLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                                  Đang tải...
                                </>
                              ) : (
                                <>
                                  Hiện tại:{" "}
                                  {selectedTimeRange === "all"
                                    ? "Tất cả"
                                    : selectedTimeRange === "today"
                                    ? "Hôm nay"
                                    : selectedTimeRange === "week"
                                    ? "Tuần này"
                                    : selectedTimeRange === "month"
                                    ? "Tháng này"
                                    : selectedTimeRange === "quarter"
                                    ? "Quý này"
                                    : selectedTimeRange === "year"
                                    ? "Năm này"
                                    : selectedTimeRange}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className="flex flex-wrap gap-2"
                        style={{ position: "relative", zIndex: 10 }}
                      >
                        {timeRangeOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={
                              selectedTimeRange === option.value
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (isLoading) return;
                              setSelectedTimeRange(option.value);
                              fetchAnalyticsData(option.value, conferenceId);
                            }}
                            className={`transition-all duration-200 ${
                              selectedTimeRange === option.value
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                                : "hover:bg-blue-50 hover:border-blue-300"
                            } ${
                              isLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            style={{
                              pointerEvents: "auto",
                              position: "relative",
                              zIndex: 1000,
                              cursor: "pointer",
                            }}
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
                            Tổng tham dự
                          </p>
                          <p className="text-3xl font-bold text-blue-900">
                            {analyticsData.totalAttendees?.toLocaleString() ||
                              0}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Tham dự viên
                          </p>
                        </div>
                        <div className="rounded-2xl bg-blue-500 p-4 group-hover:scale-110 transition-transform duration-300">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-700 mb-1">
                            Tổng phiên
                          </p>
                          <p className="text-3xl font-bold text-green-900">
                            {analyticsData.totalSessions || 0}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Phiên hội nghị
                          </p>
                        </div>
                        <div className="rounded-2xl bg-green-500 p-4 group-hover:scale-110 transition-transform duration-300">
                          <Calendar className="h-8 w-8 text-white" />
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
                            {(analyticsData.averageSatisfaction || 0).toFixed(
                              2
                            )}
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

                {/* Conference Details */}
                <ConferenceDetails
                  conference={{
                    id: analyticsData.conferenceId,
                    name: analyticsData.conferenceName,
                    startDate: analyticsData.conferenceDetails?.startDate || "",
                    endDate: analyticsData.conferenceDetails?.endDate || "",
                    location: analyticsData.conferenceDetails?.location || "",
                    status:
                      analyticsData.conferenceDetails?.status || "unknown",
                    description:
                      analyticsData.conferenceDetails?.description || "",
                    totalAttendees: analyticsData.totalAttendees,
                    totalSessions: analyticsData.totalSessions,
                  }}
                  isLoading={false}
                />

                {/* Conference Trends */}
                <GlobalTrends
                  trends={analyticsData.trends || []}
                  isLoading={false}
                />

                {/* AI Connection Status */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <AIStatsCard
                      totalInsights={
                        (analyticsData.aiInsights || []).length +
                        (analyticsData.chatGPTInsights?.insights || []).length
                      }
                      highPriorityInsights={
                        (analyticsData.aiInsights || []).filter(
                          (insight) => insight.priority === "high"
                        ).length +
                        (analyticsData.chatGPTInsights?.insights || []).filter(
                          (insight) => insight.priority === "high"
                        ).length
                      }
                      averageConfidence={averageConfidence}
                      lastUpdated={lastUpdated || new Date()}
                      isLoading={false}
                    />
                  </div>
                  <div>
                    <AIConnectionStatus
                      isConnected={true}
                      isAnalyzing={isLoading}
                      lastAnalysisTime={lastUpdated || undefined}
                      onRetry={() =>
                        fetchAnalyticsData(selectedTimeRange, conferenceId)
                      }
                    />
                  </div>
                </div>

                {/* AI Insights */}
                <GlobalAIInsights
                  insights={analyticsData.aiInsights || []}
                  isLoading={false}
                />

                {/* ChatGPT Insights */}
                {analyticsData.chatGPTInsights && (
                  <ChatGPTInsights
                    insights={analyticsData.chatGPTInsights.insights || []}
                    summary={analyticsData.chatGPTInsights.summary || ""}
                    recommendations={
                      analyticsData.chatGPTInsights.recommendations || []
                    }
                    isLoading={false}
                    onRefresh={() =>
                      fetchAnalyticsData(selectedTimeRange, conferenceId)
                    }
                  />
                )}

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

                {/* Sessions Analytics */}
                <SessionsAnalytics
                  sessions={analyticsData.sessions || []}
                  isLoading={false}
                  onSessionClick={(session) => {
                    console.log("Session clicked:", session);
                    // TODO: Implement session detail modal or navigation
                  }}
                />
              </>
            )}
          </div>
        </div>
      </ConferencePermissionGuard>
    </MainLayout>
  );
}
