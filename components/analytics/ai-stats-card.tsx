"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Zap,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Users,
  Calendar,
  Star,
} from "lucide-react";

interface AIStatsCardProps {
  totalInsights: number;
  highPriorityInsights: number;
  averageConfidence: number;
  lastUpdated: Date;
  isLoading?: boolean;
}

export function AIStatsCard({
  totalInsights,
  highPriorityInsights,
  averageConfidence,
  lastUpdated,
  isLoading = false,
}: AIStatsCardProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-50";
    if (confidence >= 75) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <CheckCircle className="h-4 w-4" />;
    if (confidence >= 75) return <Clock className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5"></div>
        <CardHeader className="pb-4 relative">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-2">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-indigo-900">
                Thống kê AI
              </CardTitle>
              <CardDescription className="text-indigo-700">
                Đang tải dữ liệu...
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
            <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
            <div className="h-4 bg-indigo-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5"></div>
      <CardHeader className="pb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-2 shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-indigo-900">
                Thống kê AI
              </CardTitle>
              <CardDescription className="text-indigo-700">
                Tổng quan hiệu suất phân tích AI
              </CardDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-white/80 text-indigo-700 border-indigo-200"
          >
            <Activity className="h-3 w-3 mr-1" />
            Hoạt động
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Insights */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-3 shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {totalInsights}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Tổng insights
            </div>
          </div>

          {/* High Priority */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl mb-3 shadow-lg">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {highPriorityInsights}
            </div>
            <div className="text-sm text-gray-600 font-medium">Ưu tiên cao</div>
          </div>

          {/* Average Confidence */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-3 shadow-lg">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {averageConfidence}%
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Độ tin cậy TB
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 pt-6 border-t border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span className="text-sm text-gray-600">Cập nhật lần cuối:</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatLastUpdated(lastUpdated)}
            </span>
          </div>
        </div>

        {/* Confidence Level Indicator */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Mức độ tin cậy
            </span>
            <Badge
              variant="outline"
              className={`${getConfidenceColor(
                averageConfidence
              )} flex items-center space-x-1`}
            >
              {getConfidenceIcon(averageConfidence)}
              <span>
                {averageConfidence >= 90
                  ? "Rất cao"
                  : averageConfidence >= 75
                  ? "Cao"
                  : "Trung bình"}
              </span>
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                averageConfidence >= 90
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : averageConfidence >= 75
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                  : "bg-gradient-to-r from-red-500 to-pink-500"
              }`}
              style={{ width: `${averageConfidence}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
