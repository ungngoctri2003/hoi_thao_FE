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
import {
  Brain,
  TrendingUp,
  Zap,
  Settings,
  Activity,
  RefreshCw,
  Sparkles,
  Lightbulb,
  Target,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Users,
  Calendar,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useState, memo, useCallback } from "react";

interface ChatGPTInsight {
  type: "trend" | "recommendation" | "alert" | "prediction";
  title: string;
  description: string;
  confidence: number;
  priority: "high" | "medium" | "low";
  conferenceId?: number;
  conferenceName?: string;
}

interface ChatGPTInsightsProps {
  insights: ChatGPTInsight[];
  summary: string;
  recommendations: string[];
  isLoading: boolean;
  onRefresh?: () => void;
}

const ChatGPTInsights = memo(function ChatGPTInsights({
  insights,
  summary,
  recommendations,
  isLoading,
  onRefresh,
}: ChatGPTInsightsProps) {
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
    }
  }, []);

  const getInsightIcon = useCallback((type: string) => {
    switch (type) {
      case "trend":
        return <TrendingUp className="h-6 w-6 text-blue-600" />;
      case "recommendation":
        return <Zap className="h-6 w-6 text-yellow-600" />;
      case "alert":
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case "prediction":
        return <Brain className="h-6 w-6 text-purple-600" />;
      default:
        return <Activity className="h-6 w-6 text-gray-600" />;
    }
  }, []);

  const getConfidenceColor = useCallback((confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-50";
    if (confidence >= 75) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  }, []);

  const getPriorityIcon = useCallback((priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Clock className="h-4 w-4" />;
      case "low":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  }, []);

  const getTypeLabel = useCallback((type: string) => {
    switch (type) {
      case "trend":
        return "Xu hướng";
      case "recommendation":
        return "Gợi ý";
      case "alert":
        return "Cảnh báo";
      case "prediction":
        return "Dự đoán";
      default:
        return "Thông tin";
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Summary Card - Enhanced */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-indigo-600/5"></div>
        <CardHeader className="pb-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 p-3 shadow-lg">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <CardTitle className="text-2xl text-purple-900 font-bold">
                  Tóm tắt AI
                </CardTitle>
                <CardDescription className="text-purple-700 text-base">
                  Phân tích thông minh về tình hình hội nghị với AI miễn phí
                </CardDescription>
              </div>
            </div>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="bg-white/80 hover:bg-white border-purple-200 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Làm mới
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="bg-white/80 rounded-xl p-6 backdrop-blur-sm border border-white/50 shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-800 leading-relaxed text-base">
                  {summary}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights - Enhanced */}
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5"></div>
        <CardHeader className="pb-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 p-3 shadow-lg">
                  <Brain className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-900 font-bold">
                  Insights từ AI
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Phân tích sâu sắc và gợi ý thông minh từ AI miễn phí
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                <Activity className="h-3 w-3 mr-1" />
                {insights.length} insights
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Đang phân tích dữ liệu AI
                </h3>
                <p className="text-gray-500">
                  Hệ thống đang xử lý và tạo insights thông minh...
                </p>
              </div>
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-12">
              <div className="rounded-full bg-gray-100 p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Brain className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Chưa có insights
              </h3>
              <p className="text-gray-500">
                Dữ liệu hội nghị đang được phân tích để tạo insights
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-2xl border-2 bg-gradient-to-br p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
                    insight.priority === "high"
                      ? "from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-200"
                      : insight.priority === "medium"
                      ? "from-yellow-50 to-yellow-100 border-yellow-200 hover:from-yellow-100 hover:to-yellow-200"
                      : "from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200"
                  }`}
                >
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 h-20 w-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 h-16 w-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-white/60 rounded-xl shadow-md">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-bold text-gray-900 text-xl">
                              {insight.title}
                            </h4>
                            <Badge
                              variant="outline"
                              className="bg-white/80 text-gray-700 border-gray-300"
                            >
                              {getTypeLabel(insight.type)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-3 flex-wrap">
                            <Badge
                              className={`${getPriorityColor(
                                insight.priority
                              )} flex items-center space-x-1`}
                            >
                              {getPriorityIcon(insight.priority)}
                              <span className="capitalize">
                                {insight.priority}
                              </span>
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`${getConfidenceColor(
                                insight.confidence
                              )} flex items-center space-x-1`}
                            >
                              <Star className="h-3 w-3" />
                              <span>{insight.confidence}% tin cậy</span>
                            </Badge>
                            {insight.conferenceName && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-100 text-blue-800"
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                {insight.conferenceName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedInsight(
                            expandedInsight === index ? null : index
                          )
                        }
                        className="text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg p-2 transition-all duration-200"
                      >
                        {expandedInsight === index ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="bg-white/40 rounded-xl p-4 backdrop-blur-sm">
                      <p className="text-gray-800 leading-relaxed text-base">
                        {expandedInsight === index ||
                        insight.description.length <= 200
                          ? insight.description
                          : `${insight.description.substring(0, 200)}...`}
                      </p>
                      {insight.description.length > 200 && (
                        <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                          <span>
                            {expandedInsight === index ? "Thu gọn" : "Xem thêm"}
                          </span>
                          <ArrowRight className="h-3 w-3 ml-1 transform transition-transform duration-200" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations - Enhanced */}
      {recommendations.length > 0 && (
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5"></div>
          <CardHeader className="pb-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-3 shadow-lg">
                    <Lightbulb className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900 font-bold">
                    Gợi ý cải thiện
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Các đề xuất thực tế để nâng cao hiệu quả hội nghị
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <Target className="h-3 w-3 mr-1" />
                  {recommendations.length} gợi ý
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 h-16 w-16 bg-green-100/50 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="relative z-10 flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Target className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          Gợi ý #{index + 1}
                        </span>
                        <div className="h-1 w-1 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-green-600">Thực tế</span>
                      </div>
                      <p className="text-gray-800 leading-relaxed text-base">
                        {recommendation}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ArrowRight className="h-4 w-4 text-green-500 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

export { ChatGPTInsights };
