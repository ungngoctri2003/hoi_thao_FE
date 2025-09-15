"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Users,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  Server,
  Database,
} from "lucide-react";

interface SystemStatus {
  online: boolean;
  lastPing: Date;
  activeUsers: number;
  checkInsPerMinute: number;
  systemLoad: number;
  databaseStatus: "online" | "offline" | "slow";
}

export function RealtimeStatus() {
  const [status, setStatus] = useState<SystemStatus>({
    online: true,
    lastPing: new Date(),
    activeUsers: 0,
    checkInsPerMinute: 0,
    systemLoad: 0,
    databaseStatus: "online",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateStatus = async () => {
      try {
        setLoading(true);

        // Simulate real-time data updates
        const mockStatus: SystemStatus = {
          online: true,
          lastPing: new Date(),
          activeUsers: Math.floor(Math.random() * 50) + 20,
          checkInsPerMinute: Math.floor(Math.random() * 10) + 1,
          systemLoad: Math.floor(Math.random() * 30) + 10,
          databaseStatus: Math.random() > 0.1 ? "online" : "slow",
        };

        setStatus(mockStatus);
      } catch (error) {
        console.error("Error updating status:", error);
        setStatus((prev) => ({ ...prev, online: false }));
      } finally {
        setLoading(false);
      }
    };

    updateStatus();

    // Update every 10 seconds
    const interval = setInterval(updateStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600 bg-green-100 dark:bg-green-900";
      case "slow":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900";
      case "offline":
        return "text-red-600 bg-red-100 dark:bg-red-900";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900";
    }
  };

  const getSystemLoadColor = (load: number) => {
    if (load < 30) return "text-green-600";
    if (load < 70) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Trạng thái hệ thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Trạng thái hệ thống
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {status.online ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">Kết nối</span>
            </div>
            <Badge
              variant={status.online ? "default" : "destructive"}
              className="text-xs"
            >
              {status.online ? "Trực tuyến" : "Ngoại tuyến"}
            </Badge>
          </div>

          {/* Database Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Cơ sở dữ liệu</span>
            </div>
            <Badge
              variant={
                status.databaseStatus === "online" ? "default" : "destructive"
              }
              className="text-xs"
            >
              {status.databaseStatus === "online"
                ? "Hoạt động"
                : status.databaseStatus === "slow"
                ? "Chậm"
                : "Lỗi"}
            </Badge>
          </div>

          {/* Active Users */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Người dùng hoạt động</span>
            </div>
            <span className="text-sm font-bold text-blue-600">
              {status.activeUsers}
            </span>
          </div>

          {/* Check-ins per minute */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Check-in/phút</span>
            </div>
            <span className="text-sm font-bold text-green-600">
              {status.checkInsPerMinute}
            </span>
          </div>

          {/* System Load */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span className="text-sm font-medium">Tải hệ thống</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    status.systemLoad < 30
                      ? "bg-green-500"
                      : status.systemLoad < 70
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${status.systemLoad}%` }}
                />
              </div>
              <span
                className={`text-sm font-bold ${getSystemLoadColor(
                  status.systemLoad
                )}`}
              >
                {status.systemLoad}%
              </span>
            </div>
          </div>

          {/* Last Update */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Cập nhật lần cuối:</span>
              <span>{status.lastPing.toLocaleTimeString("vi-VN")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
