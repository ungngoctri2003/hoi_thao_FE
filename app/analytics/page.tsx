"use client";

import { useState, useEffect } from "react";
import { useConferencePermissions } from "@/hooks/use-conference-permissions";
import { ConferencePermissionGuard } from "@/components/auth/conference-permission-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Target
} from "lucide-react";

interface AnalyticsData {
  totalAttendees: number;
  activeSessions: number;
  totalSessions: number;
  engagementRate: number;
  satisfactionScore: number;
  popularTopics: Array<{
    topic: string;
    mentions: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  attendanceByTime: Array<{
    time: string;
    count: number;
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
    type: 'trend' | 'recommendation' | 'alert';
    title: string;
    description: string;
    confidence: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export default function AnalyticsPage() {
  const { currentConferenceId, hasConferencePermission } = useConferencePermissions();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("today");

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockData: AnalyticsData = {
      totalAttendees: 156,
      activeSessions: 3,
      totalSessions: 12,
      engagementRate: 87.5,
      satisfactionScore: 4.6,
      popularTopics: [
        { topic: "Artificial Intelligence", mentions: 45, trend: 'up' },
        { topic: "Blockchain Technology", mentions: 32, trend: 'up' },
        { topic: "Cloud Computing", mentions: 28, trend: 'stable' },
        { topic: "Data Analytics", mentions: 24, trend: 'down' },
        { topic: "Machine Learning", mentions: 19, trend: 'up' }
      ],
      attendanceByTime: [
        { time: "09:00", count: 45 },
        { time: "10:00", count: 78 },
        { time: "11:00", count: 92 },
        { time: "12:00", count: 65 },
        { time: "13:00", count: 38 },
        { time: "14:00", count: 89 },
        { time: "15:00", count: 95 },
        { time: "16:00", count: 72 },
        { time: "17:00", count: 45 }
      ],
      demographics: {
        ageGroups: [
          { range: "18-25", count: 25, percentage: 16 },
          { range: "26-35", count: 68, percentage: 44 },
          { range: "36-45", count: 45, percentage: 29 },
          { range: "46-55", count: 15, percentage: 10 },
          { range: "55+", count: 3, percentage: 2 }
        ],
        industries: [
          { industry: "Technology", count: 45, percentage: 29 },
          { industry: "Finance", count: 32, percentage: 21 },
          { industry: "Healthcare", count: 28, percentage: 18 },
          { industry: "Education", count: 25, percentage: 16 },
          { industry: "Other", count: 26, percentage: 17 }
        ]
      },
      aiInsights: [
        {
          type: 'trend',
          title: 'Xu hướng tăng trưởng',
          description: 'Tỷ lệ tham dự tăng 15% so với phiên trước',
          confidence: 92,
          priority: 'high'
        },
        {
          type: 'recommendation',
          title: 'Gợi ý cải thiện',
          description: 'Nên tăng thời gian nghỉ giữa các phiên để tăng tương tác',
          confidence: 78,
          priority: 'medium'
        },
        {
          type: 'alert',
          title: 'Cảnh báo',
          description: 'Phiên 14:00 có tỷ lệ tham dự thấp, cần kiểm tra',
          confidence: 85,
          priority: 'high'
        }
      ]
    };

    setTimeout(() => {
      setAnalyticsData(mockData);
      setIsLoading(false);
    }, 1500);
  }, [currentConferenceId]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canView = hasConferencePermission("analytics.view");

  if (!canView) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Không có quyền truy cập</CardTitle>
            <CardDescription className="text-center">
              Bạn không có quyền xem phân tích dữ liệu
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <ConferencePermissionGuard 
      requiredPermissions={["analytics.view"]} 
      conferenceId={currentConferenceId ?? undefined}
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Phân tích AI</h1>
              <p className="text-muted-foreground">
                Phân tích dữ liệu hội nghị với trí tuệ nhân tạo
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Time Range Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Khoảng thời gian:</span>
              <div className="flex space-x-2">
                {[
                  { value: "today", label: "Hôm nay" },
                  { value: "week", label: "Tuần này" },
                  { value: "month", label: "Tháng này" },
                  { value: "all", label: "Tất cả" }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={selectedTimeRange === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeRange(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Tổng tham dự</p>
                  <p className="text-2xl font-bold">{analyticsData?.totalAttendees || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Phiên hoạt động</p>
                  <p className="text-2xl font-bold">{analyticsData?.activeSessions || 0}/{analyticsData?.totalSessions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Tỷ lệ tương tác</p>
                  <p className="text-2xl font-bold">{analyticsData?.engagementRate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Điểm hài lòng</p>
                  <p className="text-2xl font-bold">{analyticsData?.satisfactionScore || 0}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>Góc nhìn AI</span>
            </CardTitle>
            <CardDescription>
              Phân tích và gợi ý từ trí tuệ nhân tạo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {analyticsData?.aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      {insight.type === 'trend' && <TrendingUp className="h-5 w-5 text-blue-600" />}
                      {insight.type === 'recommendation' && <Zap className="h-5 w-5 text-yellow-600" />}
                      {insight.type === 'alert' && <Settings className="h-5 w-5 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline">
                          {insight.confidence}% tin cậy
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Topics */}
        <Card>
          <CardHeader>
            <CardTitle>Chủ đề phổ biến</CardTitle>
            <CardDescription>
              Các chủ đề được thảo luận nhiều nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {analyticsData?.popularTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                      <span className="font-medium">{topic.topic}</span>
                      <span className="text-sm text-muted-foreground">{topic.mentions} lượt đề cập</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(topic.trend)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Phân bố độ tuổi</CardTitle>
              <CardDescription>
                Thống kê tham dự viên theo độ tuổi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyticsData?.demographics.ageGroups.map((group, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{group.range} tuổi</span>
                        <span>{group.count} người ({group.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${group.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ngành nghề</CardTitle>
              <CardDescription>
                Phân bố tham dự viên theo lĩnh vực
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyticsData?.demographics.industries.map((industry, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{industry.industry}</span>
                        <span>{industry.count} người ({industry.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${industry.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attendance Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Biểu đồ tham dự theo thời gian</CardTitle>
            <CardDescription>
              Số lượng tham dự viên trong ngày
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Biểu đồ sẽ được hiển thị ở đây</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tích hợp với Chart.js hoặc Recharts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ConferencePermissionGuard>
  );
}