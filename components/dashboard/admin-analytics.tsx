"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface AnalyticsData {
  totalConferences: number;
  totalAttendees: number;
  totalCheckIns: number;
  attendanceRate: number;
  growthRate: number;
  topConferences: Array<{
    name: string;
    attendees: number;
    checkIns: number;
    attendanceRate: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    conferences: number;
    attendees: number;
    checkIns: number;
  }>;
}

export function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock data for now - replace with actual API call
        const mockData: AnalyticsData = {
          totalConferences: 12,
          totalAttendees: 2450,
          totalCheckIns: 1980,
          attendanceRate: 80.8,
          growthRate: 15.2,
          topConferences: [
            {
              name: "Hội nghị Công nghệ 2024",
              attendees: 450,
              checkIns: 387,
              attendanceRate: 86.0,
            },
            {
              name: "Workshop AI & Machine Learning",
              attendees: 320,
              checkIns: 298,
              attendanceRate: 93.1,
            },
            {
              name: "Seminar Blockchain",
              attendees: 280,
              checkIns: 245,
              attendanceRate: 87.5,
            },
          ],
          monthlyTrends: [
            { month: "Tháng 1", conferences: 2, attendees: 450, checkIns: 380 },
            { month: "Tháng 2", conferences: 3, attendees: 680, checkIns: 590 },
            { month: "Tháng 3", conferences: 4, attendees: 920, checkIns: 780 },
            { month: "Tháng 4", conferences: 3, attendees: 400, checkIns: 230 },
          ],
        };

        setAnalyticsData(mockData);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Không thể tải dữ liệu phân tích");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </CardContent>
      </Card>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hội nghị</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalConferences}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                +{analyticsData.growthRate}%
              </span>{" "}
              so với quý trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng người tham dự
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalAttendees.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> so với quý trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã check-in</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalCheckIns.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8.3%</span> so với quý trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ tham dự</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.attendanceRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> so với quý trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Conferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Hội nghị hàng đầu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topConferences.map((conference, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{conference.name}</h4>
                  <Badge variant="outline">
                    {conference.attendanceRate}% tham dự
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {conference.checkIns} / {conference.attendees} người
                    </span>
                    <span>{conference.attendanceRate}%</span>
                  </div>
                  <Progress value={conference.attendanceRate} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Xu hướng hàng tháng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.monthlyTrends.map((trend, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{trend.month}</h4>
                  <p className="text-sm text-muted-foreground">
                    {trend.conferences} hội nghị
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {trend.attendees.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {trend.checkIns.toLocaleString()} check-in
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
