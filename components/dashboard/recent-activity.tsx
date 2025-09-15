"use client";
import { CheckCircle, UserPlus, Calendar, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

interface Activity {
  type: string;
  message: string;
  time: string;
  icon: any;
  color: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const recentActivity = await apiClient.getRecentActivity(10);

        const formattedActivities = recentActivity.map((activity: any) => ({
          type: activity.type || "general",
          message: activity.message || activity.description || "Hoạt động mới",
          time: formatTimeAgo(activity.timestamp || activity.createdAt),
          icon: getActivityIcon(activity.type || "general"),
          color: getActivityColor(activity.type || "general"),
        }));

        setActivities(formattedActivities);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        // Fallback to static data
        setActivities([
          {
            type: "checkin",
            message: "Nguyễn Văn A đã check-in",
            time: "2 phút trước",
            icon: CheckCircle,
            color: "text-green-600",
          },
          {
            type: "registration",
            message: "Trần Thị B đăng ký Workshop AI",
            time: "5 phút trước",
            icon: UserPlus,
            color: "text-blue-600",
          },
          {
            type: "event",
            message: "Hội nghị Công nghệ bắt đầu",
            time: "1 giờ trước",
            icon: Calendar,
            color: "text-purple-600",
          },
          {
            type: "alert",
            message: "Sự kiện sắp đầy chỗ",
            time: "2 giờ trước",
            icon: AlertCircle,
            color: "text-orange-600",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return "Vừa xong";

    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ngày trước`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "checkin":
        return CheckCircle;
      case "registration":
        return UserPlus;
      case "event":
        return Calendar;
      case "alert":
        return AlertCircle;
      default:
        return CheckCircle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "checkin":
        return "text-green-600";
      case "registration":
        return "text-blue-600";
      case "event":
        return "text-purple-600";
      case "alert":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="p-1 rounded-full bg-muted animate-pulse">
              <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`p-1 rounded-full bg-muted`}>
              <activity.icon className={`h-3 w-3 ${activity.color}`} />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{activity.message}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-muted-foreground py-4">
          Không có hoạt động gần đây
        </div>
      )}
    </div>
  );
}
