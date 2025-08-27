"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Users, TrendingUp, Clock, MapPin } from "lucide-react"

interface AttendanceAnalyticsProps {
  stats: any
  timeRange: string
}

export default function AttendanceAnalytics({ stats, timeRange }: AttendanceAnalyticsProps) {
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [roomData, setRoomData] = useState<any[]>([])
  const [peakHours, setPeakHours] = useState<any[]>([])

  useEffect(() => {
    // Generate attendance trend data
    const generateAttendanceData = () => {
      const data = []
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 1

      for (let i = 0; i < (days === 1 ? 24 : days); i++) {
        if (days === 1) {
          // Hourly data for 24h view
          data.push({
            time: `${i.toString().padStart(2, "0")}:00`,
            attendance: Math.floor(Math.random() * 300) + 200,
            checkins: Math.floor(Math.random() * 50) + 20,
            checkouts: Math.floor(Math.random() * 30) + 10,
          })
        } else {
          // Daily data for 7d/30d view
          const date = new Date()
          date.setDate(date.getDate() - (days - 1 - i))
          data.push({
            time: date.toLocaleDateString("vi-VN", { month: "short", day: "numeric" }),
            attendance: Math.floor(Math.random() * 400) + 800,
            checkins: Math.floor(Math.random() * 100) + 150,
            checkouts: Math.floor(Math.random() * 80) + 120,
          })
        }
      }
      return data
    }

    // Generate room occupancy data
    const generateRoomData = () => [
      { name: "Hội trường chính", capacity: 500, current: 387, peak: 456, utilization: 77 },
      { name: "Phòng Workshop A", capacity: 100, current: 78, peak: 95, utilization: 95 },
      { name: "Phòng Workshop B", capacity: 80, current: 67, peak: 80, utilization: 100 },
      { name: "Phòng hội nghị B1", capacity: 150, current: 142, peak: 150, utilization: 100 },
      { name: "Phòng hội nghị B2", capacity: 120, current: 0, peak: 118, utilization: 98 },
      { name: "Khu triển lãm", capacity: 300, current: 156, peak: 278, utilization: 93 },
    ]

    // Generate peak hours analysis
    const generatePeakHours = () => [
      { hour: "09:00-10:00", attendance: 456, percentage: 91 },
      { hour: "10:00-11:00", attendance: 423, percentage: 85 },
      { hour: "14:00-15:00", attendance: 398, percentage: 80 },
      { hour: "11:00-12:00", attendance: 367, percentage: 73 },
      { hour: "15:00-16:00", attendance: 334, percentage: 67 },
    ]

    setAttendanceData(generateAttendanceData())
    setRoomData(generateRoomData())
    setPeakHours(generatePeakHours())
  }, [timeRange])

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-red-600 dark:text-red-400"
    if (utilization >= 70) return "text-yellow-600 dark:text-yellow-400"
    return "text-green-600 dark:text-green-400"
  }

  const getUtilizationBg = (utilization: number) => {
    if (utilization >= 90) return "bg-red-100 dark:bg-red-900/20"
    if (utilization >= 70) return "bg-yellow-100 dark:bg-yellow-900/20"
    return "bg-green-100 dark:bg-green-900/20"
  }

  return (
    <div className="space-y-6">
      {/* Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tham dự trung bình</p>
                <p className="text-2xl font-bold">387</p>
                <p className="text-xs text-green-600 dark:text-green-400">+8% so với hôm qua</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cao điểm</p>
                <p className="text-2xl font-bold">456</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Lúc 9:30 AM</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Thời gian tham dự TB</p>
                <p className="text-2xl font-bold">4.2h</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">+15 phút so với dự kiến</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Xu hướng tham dự</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Số người tham dự</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Check-in</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Check-out</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="attendance"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
              <Area type="monotone" dataKey="checkins" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Area type="monotone" dataKey="checkouts" stackId="3" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Occupancy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Tình trạng phòng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomData.map((room, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm">{room.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {room.current}/{room.capacity}
                    </span>
                    <Badge className={getUtilizationBg(room.utilization)}>
                      <span className={getUtilizationColor(room.utilization)}>{room.utilization}%</span>
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      room.utilization >= 90 ? "bg-red-500" : room.utilization >= 70 ? "bg-yellow-500" : "bg-green-500"
                    }`}
                    style={{ width: `${(room.current / room.capacity) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Hiện tại: {room.current}</span>
                  <span>Cao điểm: {room.peak}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Peak Hours Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Giờ cao điểm</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="attendance" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {peakHours.slice(0, 3).map((hour, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{hour.hour}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{hour.attendance} người</span>
                    <Badge variant="outline">{hour.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
