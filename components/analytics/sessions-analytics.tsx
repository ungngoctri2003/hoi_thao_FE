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
  Calendar,
  Users,
  Eye,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";

interface Session {
  id: number;
  title: string;
  attendees: number;
  engagement: number;
  satisfaction: number;
  startTime: string;
  endTime: string;
  status: string;
  description?: string;
  speaker?: string;
  room?: string;
  capacity?: number;
}

interface SessionsAnalyticsProps {
  sessions: Session[];
  isLoading?: boolean;
  onSessionClick?: (session: Session) => void;
}

export function SessionsAnalytics({
  sessions,
  isLoading = false,
  onSessionClick,
}: SessionsAnalyticsProps) {
  const [sortBy, setSortBy] = useState<
    "attendees" | "engagement" | "satisfaction" | "time"
  >("attendees");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "ongoing":
        return "bg-green-100 text-green-800 border-green-200";
      case "upcoming":
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
      case "finished":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrendIcon = (value: number, average: number) => {
    if (value > average) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (value < average) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return timeString;
    }
  };

  const formatDuration = (startTime: string, endTime: string) => {
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m`;
      } else {
        return `${diffMinutes}m`;
      }
    } catch (error) {
      return "N/A";
    }
  };

  // Calculate averages
  const avgAttendees =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.attendees, 0) / sessions.length
      : 0;
  const avgEngagement =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.engagement, 0) / sessions.length
      : 0;
  const avgSatisfaction =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.satisfaction, 0) / sessions.length
      : 0;

  // Filter and sort sessions
  const filteredSessions = sessions
    .filter(
      (session) =>
        filterStatus === "all" ||
        session.status.toLowerCase() === filterStatus.toLowerCase()
    )
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "attendees":
          aValue = a.attendees;
          bValue = b.attendees;
          break;
        case "engagement":
          aValue = a.engagement;
          bValue = b.engagement;
          break;
        case "satisfaction":
          aValue = a.satisfaction;
          bValue = b.satisfaction;
          break;
        case "time":
          aValue = new Date(a.startTime).getTime();
          bValue = new Date(b.startTime).getTime();
          break;
        default:
          return 0;
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "upcoming", label: "Sắp diễn ra" },
    { value: "active", label: "Đang diễn ra" },
    { value: "completed", label: "Đã hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  if (isLoading) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-2">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mt-2"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-2">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Chi tiết các phiên hội nghị
              </CardTitle>
              <CardDescription className="text-base">
                Thống kê chi tiết từng phiên trong hội nghị
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="rounded-full bg-gray-200 p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Chưa có phiên hội nghị
              </h3>
              <p className="text-gray-500">
                Dữ liệu các phiên hội nghị sẽ được hiển thị ở đây
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-2">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Chi tiết các phiên hội nghị
              </CardTitle>
              <CardDescription className="text-base">
                Thống kê chi tiết từng phiên trong hội nghị ({sessions.length}{" "}
                phiên)
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Lọc theo trạng thái:
              </span>
              <div className="flex gap-1">
                {statusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      filterStatus === option.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setFilterStatus(option.value)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Sắp xếp theo:
              </span>
              <div className="flex gap-1">
                {[
                  { value: "attendees", label: "Tham dự" },
                  { value: "engagement", label: "Tương tác" },
                  { value: "satisfaction", label: "Hài lòng" },
                  { value: "time", label: "Thời gian" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (sortBy === option.value) {
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      } else {
                        setSortBy(option.value as any);
                        setSortOrder("desc");
                      }
                    }}
                    className="text-xs"
                  >
                    {option.label}
                    {sortBy === option.value && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            {filteredSessions.map((session, index) => (
              <div
                key={session.id}
                className="group relative overflow-hidden rounded-xl border-0 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {session.title}
                        </h3>
                        <Badge
                          className={`${getStatusColor(
                            session.status
                          )} text-xs`}
                        >
                          {session.status}
                        </Badge>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                      </div>

                      {session.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {session.description}
                        </p>
                      )}

                      {session.speaker && (
                        <p className="text-sm text-gray-500 mb-2">
                          <span className="font-medium">Diễn giả:</span>{" "}
                          {session.speaker}
                        </p>
                      )}

                      {session.room && (
                        <p className="text-sm text-gray-500 mb-2">
                          <span className="font-medium">Phòng:</span>{" "}
                          {session.room}
                        </p>
                      )}
                    </div>

                    {onSessionClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSessionClick(session)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Tham dự
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-blue-900">
                          {session.attendees || 0}
                        </span>
                        {session.capacity && (
                          <span className="text-xs text-blue-600">
                            /{session.capacity}
                          </span>
                        )}
                        {getTrendIcon(session.attendees, avgAttendees)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Tương tác
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-green-900">
                          {(session.engagement || 0).toFixed(1)}%
                        </span>
                        {getTrendIcon(session.engagement, avgEngagement)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-800">
                          Hài lòng
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-purple-900">
                          {(session.satisfaction || 0).toFixed(1)}/5
                        </span>
                        {getTrendIcon(session.satisfaction, avgSatisfaction)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">
                          Thời gian
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-orange-900">
                          {formatTime(session.startTime)} -{" "}
                          {formatTime(session.endTime)}
                        </div>
                        <div className="text-xs text-orange-600">
                          {formatDuration(session.startTime, session.endTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">
                  {avgAttendees.toFixed(0)}
                </div>
                <div className="text-sm text-blue-600">Tham dự trung bình</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-900">
                  {avgEngagement.toFixed(1)}%
                </div>
                <div className="text-sm text-green-600">
                  Tương tác trung bình
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-900">
                  {avgSatisfaction.toFixed(1)}/5
                </div>
                <div className="text-sm text-purple-600">
                  Hài lòng trung bình
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
