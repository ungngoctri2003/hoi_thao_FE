"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface GlobalTrend {
  metric: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
}

interface GlobalTrendsProps {
  trends: GlobalTrend[];
  isLoading: boolean;
}

export function GlobalTrends({ trends, isLoading }: GlobalTrendsProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "down":
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "from-green-50 to-green-100 border-green-200";
      case "down":
        return "from-red-50 to-red-100 border-red-200";
      default:
        return "from-gray-50 to-gray-100 border-gray-200";
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 p-2">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Xu hướng toàn cầu</CardTitle>
            <CardDescription className="text-base">
              Các chỉ số quan trọng trên toàn bộ hệ thống
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trends.map((trend, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-xl border-2 bg-gradient-to-br ${getTrendColor(
                  trend.trend
                )} p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="absolute top-0 right-0 h-16 w-16 bg-white/30 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {trend.metric}
                    </h4>
                    <div className="p-2 bg-white/50 rounded-lg">
                      {getTrendIcon(trend.trend)}
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2 text-gray-900">
                    {typeof trend.value === "number" && trend.value > 1000
                      ? trend.value.toLocaleString()
                      : trend.metric.includes("Điểm")
                      ? trend.value.toFixed(2)
                      : trend.value}
                    {trend.metric.includes("Tỷ lệ") ||
                    trend.metric.includes("Điểm")
                      ? trend.metric.includes("Điểm")
                        ? "/5"
                        : "%"
                      : ""}
                  </div>
                  <div
                    className={`text-sm flex items-center space-x-2 font-medium ${
                      trend.trend === "up"
                        ? "text-green-700"
                        : trend.trend === "down"
                        ? "text-red-700"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="px-2 py-1 bg-white/60 rounded-full text-xs">
                      {trend.trend === "up"
                        ? "+"
                        : trend.trend === "down"
                        ? "-"
                        : ""}
                      {Math.abs(trend.change)}%
                    </span>
                    <span className="text-xs">so với kỳ trước</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
