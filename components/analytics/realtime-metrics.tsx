"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Activity, Users, Clock } from "lucide-react"

interface RealtimeMetricsProps {
  stats: any
  timeRange: string
}

export default function RealtimeMetrics({ stats, timeRange }: RealtimeMetricsProps) {
  const [realtimeData, setRealtimeData] = useState<any[]>([])
  const [sessionData, setSessionData] = useState<any[]>([])
  const [deviceData, setDeviceData] = useState<any[]>([])

  useEffect(() => {
    // Generate real-time attendance data
    const generateRealtimeData = () => {
      const now = new Date()
      const data = []

      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        data.push({
          time: time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          attendance: Math.floor(Math.random() * 200) + 300,
          engagement: Math.floor(Math.random() * 30) + 60,
          interactions: Math.floor(Math.random() * 50) + 20,
        })
      }
      return data
    }

    // Generate session popularity data
    const generateSessionData = () => [
      { name: "AI & Machine Learning", attendance: 387, engagement: 89, satisfaction: 4.5 },
      { name: "Blockchain & Fintech", attendance: 342, engagement: 82, satisfaction: 4.2 },
      { name: "React Development", attendance: 298, engagement: 85, satisfaction: 4.4 },
      { name: "UX Design", attendance: 267, engagement: 78, satisfaction: 4.1 },
      { name: "Data Science", attendance: 234, engagement: 81, satisfaction: 4.3 },
      { name: "Cloud Computing", attendance: 198, engagement: 76, satisfaction: 4.0 },
    ]

    // Generate device/platform data
    const generateDeviceData = () => [
      { name: "Desktop", value: 45, color: "#3B82F6" },
      { name: "Mobile", value: 35, color: "#10B981" },
      { name: "Tablet", value: 20, color: "#F59E0B" },
    ]

    setRealtimeData(generateRealtimeData())
    setSessionData(generateSessionData())
    setDeviceData(generateDeviceData())

    // Update real-time data every 30 seconds
    const interval = setInterval(() => {
      setRealtimeData((prev) => {
        const newData = [...prev.slice(1)]
        const now = new Date()
        newData.push({
          time: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
          attendance: Math.floor(Math.random() * 200) + 300,
          engagement: Math.floor(Math.random() * 30) + 60,
          interactions: Math.floor(Math.random() * 50) + 20,
        })
        return newData
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [timeRange])

  const currentTrend =
    realtimeData.length > 1
      ? realtimeData[realtimeData.length - 1].attendance - realtimeData[realtimeData.length - 2].attendance
      : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Real-time Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Tham dự theo thời gian thực
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Số người tham dự</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className={`h-4 w-4 ${currentTrend >= 0 ? "text-green-500" : "text-red-500"}`} />
                <span className={`text-sm ${currentTrend >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {currentTrend >= 0 ? "+" : ""}
                  {currentTrend}
                </span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="attendance" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Mức độ tương tác
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Tương tác (%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Số lượng tương tác</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={realtimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="engagement" stroke="#10B981" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="interactions" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Session Popularity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Phiên họp phổ biến nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sessionData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="attendance" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Device Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Phân bố thiết bị
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {deviceData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm">
                  {item.name}: {item.value}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
