"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Eye, MessageCircle, Download, Calendar, BarChart3, Brain } from "lucide-react"
import AttendanceAnalytics from "./attendance-analytics"
import EngagementMetrics from "./engagement-metrics"
import NetworkingInsights from "./networking-insights"
import AIInsights from "./ai-insights"
import RealtimeMetrics from "./realtime-metrics"

interface DashboardStats {
  totalAttendees: number
  activeNow: number
  totalSessions: number
  avgEngagement: number
  networkingConnections: number
  feedbackScore: number
  peakAttendance: number
  totalInteractions: number
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h")
  const [selectedMetric, setSelectedMetric] = useState("overview")

  useEffect(() => {
    // Simulate analytics data
    const mockStats: DashboardStats = {
      totalAttendees: 1247,
      activeNow: 342,
      totalSessions: 45,
      avgEngagement: 78.5,
      networkingConnections: 2156,
      feedbackScore: 4.3,
      peakAttendance: 987,
      totalInteractions: 15420,
    }

    setStats(mockStats)
  }, [])

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (stats) {
        setStats((prev) => ({
          ...prev!,
          activeNow: Math.max(200, Math.min(500, prev!.activeNow + Math.floor(Math.random() * 20 - 10))),
          totalInteractions: prev!.totalInteractions + Math.floor(Math.random() * 5),
        }))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [stats])

  const handleExportReport = () => {
    // Simulate report export
    const link = document.createElement("a")
    link.href = "/reports/conference-analytics.pdf"
    link.download = `conference-report-${new Date().toISOString().split("T")[0]}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!stats) {
    return <div>Đang tải...</div>
  }

  const getEngagementColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getEngagementBg = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/20"
    if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/20"
    return "bg-red-100 dark:bg-red-900/20"
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Khoảng thời gian:</span>
          </div>
          <div className="flex space-x-1">
            {(["1h", "24h", "7d", "30d"] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === "1h" ? "1 giờ" : range === "24h" ? "24 giờ" : range === "7d" ? "7 ngày" : "30 ngày"}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Cập nhật thời gian thực</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng người tham dự</p>
                <p className="text-2xl font-bold">{stats.totalAttendees.toLocaleString()}</p>
                <p className="text-xs text-green-600 dark:text-green-400">+12% so với dự kiến</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đang hoạt động</p>
                <p className="text-2xl font-bold">{stats.activeNow}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Cao điểm: {stats.peakAttendance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mức độ tương tác</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{stats.avgEngagement}%</p>
                  <Badge className={getEngagementBg(stats.avgEngagement)}>
                    <span className={getEngagementColor(stats.avgEngagement)}>
                      {stats.avgEngagement >= 80 ? "Cao" : stats.avgEngagement >= 60 ? "Trung bình" : "Thấp"}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tương tác</p>
                <p className="text-2xl font-bold">{stats.totalInteractions.toLocaleString()}</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">{stats.networkingConnections} kết nối</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Banner */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Thông tin từ AI</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Mức độ tham gia cao nhất vào buổi sáng (9-11h). Phiên AI & Machine Learning có tỷ lệ tương tác cao nhất
                (89%). Dự đoán: Tham dự sẽ tăng 15% vào ngày mai.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedMetric("ai-insights")}>
              Xem chi tiết
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="attendance">Tham dự</TabsTrigger>
          <TabsTrigger value="engagement">Tương tác</TabsTrigger>
          <TabsTrigger value="networking">Kết nối</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <RealtimeMetrics stats={stats} timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <AttendanceAnalytics stats={stats} timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <EngagementMetrics stats={stats} timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="networking" className="space-y-4">
          <NetworkingInsights stats={stats} timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <AIInsights stats={stats} timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
