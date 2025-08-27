"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { MessageCircle, ThumbsUp, Eye, Star, BarChart3, Target } from "lucide-react"

interface EngagementMetricsProps {
  stats: any
  timeRange: string
}

export default function EngagementMetrics({ stats, timeRange }: EngagementMetricsProps) {
  const [engagementData, setEngagementData] = useState<any[]>([])
  const [sessionEngagement, setSessionEngagement] = useState<any[]>([])
  const [interactionTypes, setInteractionTypes] = useState<any[]>([])
  const [satisfactionData, setSatisfactionData] = useState<any[]>([])

  useEffect(() => {
    // Generate engagement trend data
    const generateEngagementData = () => {
      const data = []
      const hours = timeRange === "1h" ? 12 : 24

      for (let i = 0; i < hours; i++) {
        data.push({
          time: timeRange === "1h" ? `${i * 5}m` : `${i}:00`,
          polls: Math.floor(Math.random() * 50) + 20,
          questions: Math.floor(Math.random() * 30) + 10,
          chat: Math.floor(Math.random() * 100) + 50,
          reactions: Math.floor(Math.random() * 80) + 40,
          engagement: Math.floor(Math.random() * 20) + 70,
        })
      }
      return data
    }

    // Generate session engagement data
    const generateSessionEngagement = () => [
      { name: "AI & ML", polls: 45, questions: 23, feedback: 4.5, participation: 89 },
      { name: "Blockchain", polls: 32, questions: 18, feedback: 4.2, participation: 82 },
      { name: "React Dev", polls: 38, questions: 25, feedback: 4.4, participation: 85 },
      { name: "UX Design", polls: 28, questions: 15, feedback: 4.1, participation: 78 },
      { name: "Data Science", polls: 35, questions: 20, feedback: 4.3, participation: 81 },
    ]

    // Generate interaction types data
    const generateInteractionTypes = () => [
      { type: "Bình chọn", count: 156, percentage: 35 },
      { type: "Câu hỏi Q&A", count: 89, percentage: 20 },
      { type: "Chat tin nhắn", count: 234, percentage: 25 },
      { type: "Phản hồi", count: 67, percentage: 15 },
      { type: "Kết nối mạng", count: 45, percentage: 5 },
    ]

    // Generate satisfaction radar data
    const generateSatisfactionData = () => [
      { subject: "Nội dung", A: 85, fullMark: 100 },
      { subject: "Diễn giả", A: 92, fullMark: 100 },
      { subject: "Tương tác", A: 78, fullMark: 100 },
      { subject: "Công nghệ", A: 88, fullMark: 100 },
      { subject: "Tổ chức", A: 90, fullMark: 100 },
      { subject: "Mạng lưới", A: 82, fullMark: 100 },
    ]

    setEngagementData(generateEngagementData())
    setSessionEngagement(generateSessionEngagement())
    setInteractionTypes(generateInteractionTypes())
    setSatisfactionData(generateSatisfactionData())
  }, [timeRange])

  const totalInteractions = interactionTypes.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="space-y-6">
      {/* Engagement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng tương tác</p>
                <p className="text-2xl font-bold">{totalInteractions}</p>
                <p className="text-xs text-green-600 dark:text-green-400">+23% so với hôm qua</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tỷ lệ tham gia</p>
                <p className="text-2xl font-bold">78.5%</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">Cao hơn 15% so với TB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Thời gian xem TB</p>
                <p className="text-2xl font-bold">42m</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">+8 phút so với dự kiến</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Điểm hài lòng</p>
                <p className="text-2xl font-bold">4.3/5</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Xuất sắc</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Xu hướng tương tác
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Bình chọn</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Câu hỏi</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Chat</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Reactions</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="polls" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="questions" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="chat" stroke="#8B5CF6" strokeWidth={2} />
              <Line type="monotone" dataKey="reactions" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tương tác theo phiên</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sessionEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="participation" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {sessionEngagement.map((session, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{session.name}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{session.participation}%</Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{session.feedback}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Satisfaction Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Phân tích hài lòng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={satisfactionData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Điểm hài lòng" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {satisfactionData.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.subject}:</span>
                  <span className="font-medium">{item.A}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interaction Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Phân loại tương tác</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {interactionTypes.map((type, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{type.type}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{type.count}</span>
                  <Badge variant="outline">{type.percentage}%</Badge>
                </div>
              </div>
              <Progress value={type.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
