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
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Brain,
  Zap,
} from "lucide-react";

interface AIConnectionStatusProps {
  isConnected: boolean;
  isAnalyzing: boolean;
  lastAnalysisTime?: Date;
  onRetry?: () => void;
  className?: string;
}

export function AIConnectionStatus({
  isConnected,
  isAnalyzing,
  lastAnalysisTime,
  onRetry,
  className = "",
}: AIConnectionStatusProps) {
  const getStatusColor = () => {
    if (isAnalyzing) return "text-blue-600";
    if (isConnected) return "text-green-600";
    return "text-red-600";
  };

  const getStatusIcon = () => {
    if (isAnalyzing) return <RefreshCw className="h-5 w-5 animate-spin" />;
    if (isConnected) return <CheckCircle className="h-5 w-5" />;
    return <WifiOff className="h-5 w-5" />;
  };

  const getStatusText = () => {
    if (isAnalyzing) return "Đang phân tích";
    if (isConnected) return "Kết nối AI";
    return "Mất kết nối";
  };

  const getStatusDescription = () => {
    if (isAnalyzing) return "AI đang xử lý dữ liệu hội nghị...";
    if (isConnected) return "AI sẵn sàng phân tích dữ liệu";
    return "Không thể kết nối với dịch vụ AI";
  };

  const formatLastAnalysis = (date: Date) => {
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

  return (
    <Card
      className={`border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden ${className}`}
    >
      <div
        className={`absolute inset-0 ${
          isAnalyzing
            ? "bg-gradient-to-r from-blue-600/5 to-cyan-600/5"
            : isConnected
            ? "bg-gradient-to-r from-green-600/5 to-emerald-600/5"
            : "bg-gradient-to-r from-red-600/5 to-pink-600/5"
        }`}
      ></div>

      <CardHeader className="pb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`rounded-xl p-2 shadow-md ${
                isAnalyzing
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                  : isConnected
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-red-500 to-pink-500"
              }`}
            >
              {isAnalyzing ? (
                <Brain className="h-6 w-6 text-white" />
              ) : (
                <Wifi className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900">
                Trạng thái AI
              </CardTitle>
              <CardDescription className="text-gray-600">
                Kết nối và hoạt động của hệ thống AI
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={`${
                isAnalyzing
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : isConnected
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="space-y-4">
          {/* Status Description */}
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                isAnalyzing
                  ? "bg-blue-100"
                  : isConnected
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
            >
              {getStatusIcon()}
            </div>
            <div>
              <p className={`font-medium ${getStatusColor()}`}>
                {getStatusDescription()}
              </p>
            </div>
          </div>

          {/* Last Analysis Time */}
          {lastAnalysisTime && !isAnalyzing && (
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Phân tích lần cuối:{" "}
                  <span className="font-medium">
                    {formatLastAnalysis(lastAnalysisTime)}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* AI Service Info */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Zap className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Dịch vụ:{" "}
                <span className="font-medium text-purple-700">
                  AI miễn phí (Hugging Face)
                </span>
              </p>
            </div>
          </div>

          {/* Action Button */}
          {!isConnected && onRetry && (
            <div className="pt-2">
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="w-full bg-white/80 hover:bg-white border-gray-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử kết nối lại
              </Button>
            </div>
          )}

          {/* Analyzing Progress */}
          {isAnalyzing && (
            <div className="pt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full animate-pulse"></div>
                </div>
                <span className="text-xs text-gray-500">Đang xử lý...</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
