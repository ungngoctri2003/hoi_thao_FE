"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Users, MessageCircle, Heart, Zap, Network, TrendingUp } from "lucide-react"

interface NetworkingInsightsProps {
  stats: any
  timeRange: string
}

export default function NetworkingInsights({ stats, timeRange }: NetworkingInsightsProps) {
  const [connectionData, setConnectionData] = useState<any[]>([])
  const [topConnectors, setTopConnectors] = useState<any[]>([])
  const [networkingHours, setNetworkingHours] = useState<any[]>([])
  const [connectionTypes, setConnectionTypes] = useState<any[]>([])

  useEffect(() => {
    // Generate connection trend data
    const generateConnectionData = () => {
      const data = []
      const hours = 24

      for (let i = 0; i < hours; i++) {
        data.push({
          time: `${i.toString().padStart(2, "0")}:00`,
          newConnections: Math.floor(Math.random() * 30) + 10,
          messages: Math.floor(Math.random() * 80) + 20,
          matches: Math.floor(Math.random() * 15) + 5,
          activeUsers: Math.floor(Math.random() * 100) + 150,
        })
      }
      return data
    }

    // Generate top connectors data
    const generateTopConnectors = () => [
      { name: "Nguyễn Văn An", connections: 45, messages: 123, industry: "Technology", score: 95 },
      { name: "Trần Thị Bình", connections: 38, messages: 98, industry: "Finance", score: 89 },
      { name: "Lê Minh Cường", connections: 42, messages: 87, industry: "Healthcare", score: 87 },
      { name: "Phạm Thị Dung", connections: 35, messages: 76, industry: "Education", score: 82 },
      { name: "Hoàng Minh Tuấn", connections: 33, messages: 65, industry: "Marketing", score: 78 },
    ]

    // Generate networking hours analysis
    const generateNetworkingHours = () => [
      { hour: "08:00-09:00", connections: 23, efficiency: 65 },
      { hour: "09:00-10:00", connections: 45, efficiency: 78 },
      { hour: "10:00-11:00", connections: 67, efficiency: 85 },
      { hour: "11:00-12:00", connections: 89, efficiency: 92 },
      { hour: "12:00-13:00", connections: 156, efficiency: 95 },
      { hour: "13:00-14:00", connections: 134, efficiency: 88 },
      { hour: "14:00-15:00", connections: 98, efficiency: 82 },
      { hour: "15:00-16:00", connections: 76, efficiency: 79 },
      { hour: "16:00-17:00", connections: 54, efficiency: 75 },
      { hour: "17:00-18:00", connections: 32, efficiency: 68 },
    ]

    // Generate connection types data
    const generateConnectionTypes = () => [
      { type: "Cùng ngành", count: 156, percentage: 45, quality: 4.2 },
      { type: "Khác ngành", count: 98, percentage: 28, quality: 3.8 },
      { type: "Cùng vị trí", count: 67, percentage: 19, quality: 4.0 },
      { type: "Mentor-Mentee", count: 28, percentage: 8, quality: 4.6 },
    ]

    setConnectionData(generateConnectionData())
    setTopConnectors(generateTopConnectors())
    setNetworkingHours(generateNetworkingHours())
    setConnectionTypes(generateConnectionTypes())
  }, [timeRange])

  const totalConnections = connectionData.reduce((sum, item) => sum + item.newConnections, 0)
  const totalMessages = connectionData.reduce((sum, item) => sum + item.messages, 0)

  const getIndustryColor = (industry: string) => {
    const colors: { [key: string]: string } = {
      Technology: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      Finance: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      Healthcare: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      Education: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      Marketing: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
    }
    return colors[industry] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
  }

  return (
    <div className="space-y-6">
      {/* Networking Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng kết nối</p>
                <p className="text-2xl font-bold">{totalConnections}</p>
                <p className="text-xs text-green-600 dark:text-green-400">+18% so với hôm qua</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tin nhắn</p>
                <p className="text-2xl font-bold">{totalMessages}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Trung bình 3.2/kết nối</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tỷ lệ phù hợp</p>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-xs text-red-600 dark:text-red-400">AI matching</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Người dùng hoạt động</p>
                <p className="text-2xl font-bold">234</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Đang online</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Network className="h-5 w-5 mr-2" />
            Xu hướng kết nối
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Kết nối mới</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Tin nhắn</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Gợi ý phù hợp</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={connectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="newConnections" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="messages" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="matches" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Connectors */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Top người kết nối
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topConnectors.map((connector, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{connector.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getIndustryColor(connector.industry)} variant="secondary">
                        {connector.industry}
                      </Badge>
                      <span className="text-xs text-gray-500">Điểm: {connector.score}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{connector.connections}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{connector.messages}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Networking Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Giờ kết nối hiệu quả</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={networkingHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="connections" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Giờ vàng kết nối:</p>
              <div className="flex flex-wrap gap-2">
                {networkingHours
                  .filter((hour) => hour.efficiency >= 90)
                  .map((hour, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      {hour.hour}
                    </Badge>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Types Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Phân tích loại kết nối</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionTypes.map((type, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{type.type}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{type.count} kết nối</span>
                  <Badge variant="outline">{type.percentage}%</Badge>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3 text-red-500" />
                    <span className="text-sm">{type.quality}</span>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${type.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
