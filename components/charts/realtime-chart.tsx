"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

interface ChartData {
  time: string;
  checkins: number;
}

export function RealtimeChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRealtimeData = async () => {
    try {
      setError(null);
      const realtimeData = await apiClient.getRealtimeData();

      // Format the data for the chart
      const chartData =
        realtimeData.checkInsLast24h?.map((item: any) => ({
          time: new Date(item.timestamp || item.time).toLocaleTimeString(
            "vi-VN",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
          checkins: item.count || item.checkins || 0,
        })) || [];

      // If no data from API, use default data
      if (chartData.length === 0) {
        setData([
          { time: "00:00", checkins: 0 },
          { time: "02:00", checkins: 2 },
          { time: "04:00", checkins: 1 },
          { time: "06:00", checkins: 5 },
          { time: "08:00", checkins: 45 },
          { time: "10:00", checkins: 89 },
          { time: "12:00", checkins: 67 },
          { time: "14:00", checkins: 123 },
          { time: "16:00", checkins: 98 },
          { time: "18:00", checkins: 34 },
          { time: "20:00", checkins: 12 },
          { time: "22:00", checkins: 3 },
        ]);
      } else {
        setData(chartData);
      }
    } catch (error) {
      console.error("Error fetching realtime data:", error);
      setError("Không thể tải dữ liệu biểu đồ");
      // Fallback to default data
      setData([
        { time: "00:00", checkins: 0 },
        { time: "02:00", checkins: 2 },
        { time: "04:00", checkins: 1 },
        { time: "06:00", checkins: 5 },
        { time: "08:00", checkins: 45 },
        { time: "10:00", checkins: 89 },
        { time: "12:00", checkins: 67 },
        { time: "14:00", checkins: 123 },
        { time: "16:00", checkins: 98 },
        { time: "18:00", checkins: 34 },
        { time: "20:00", checkins: 12 },
        { time: "22:00", checkins: 3 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealtimeData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchRealtimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            onClick={fetchRealtimeData}
            className="text-sm text-primary hover:underline"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip
            labelFormatter={(value) => `Thời gian: ${value}`}
            formatter={(value) => [`${value} người`, "Check-in"]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "6px",
            }}
          />
          <Line
            type="monotone"
            dataKey="checkins"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={{
              fill: "hsl(var(--primary))",
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              r: 6,
              stroke: "hsl(var(--primary))",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
