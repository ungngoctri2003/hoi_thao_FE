"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, BarChart3 } from "lucide-react"

interface AIInsightsProps {
  stats: any
  timeRange: string
}

interface Insight {
  id: string
  type: "trend" | "prediction" | "recommendation" | "alert"
  title: string
  description: string
  confidence: number
  impact: "high" | "medium" | "low"
  category: string
  actionable: boolean
  data?: any
}

export default function AIInsights({ stats, timeRange }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [predictions, setPredictions] = useState<any[]>([])

  useEffect(() => {
    // Generate AI insights
    const generateInsights = (): Insight[] => [
      {
        id: "1",
        type: "trend",
        title: "Mức độ tham gia tăng mạnh vào buổi sáng",
        description:
          "Phân tích cho thấy tỷ lệ tương tác cao nhất từ 9-11h sáng (89% so với 67% trung bình). Đề xuất lên lịch các phiên quan trọng vào khung giờ này.",
        confidence: 94,
        impact: "high",
        category: "engagement",
        actionable: true,
      },
      {
        id: "2",
        type: "prediction",
        title: "Dự báo tăng 23% đăng ký tuần tới",
        description:
          "Dựa trên xu hướng hiện tại và hoạt động marketing, hệ thống dự đoán sẽ có thêm 156 đăng ký mới trong 7 ngày tới.",
        confidence: 87,
        impact: "high",
        category: "registration",
        actionable: true,
      },
      {
        id: "3",
        type: "recommendation",
        title: "Tối ưu hóa phân bổ phòng họp",
        description:
          "Phòng A thường xuyên quá tải (120% công suất) trong khi phòng C chỉ sử dụng 45%. Đề xuất điều chỉnh lịch trình để cân bằng tải.",
        confidence: 91,
        impact: "medium",
        category: "venue",
        actionable: true,
      },
      {
        id: "4",
        type: "alert",
        title: "Cảnh báo: Tỷ lệ hủy đăng ký tăng",
        description:
          "Tỷ lệ hủy đăng ký tăng 15% so với tuần trước. Nguyên nhân chính: xung đột lịch trình (67%) và vấn đề kỹ thuật (23%).",
        confidence: 96,
        impact: "high",
        category: "registration",
        actionable: true,
      },
      {
        id: "5",
        type: "trend",
        title: "Networking hiệu quả nhất qua chat",
        description:
          "85% kết nối thành công bắt đầu từ tính năng chat, cao hơn 3x so với gặp mặt trực tiếp. Đầu tư thêm vào tính năng chat sẽ tăng hiệu quả networking.",
        confidence: 89,
        impact: "medium",
        category: "networking",
        actionable: true,
      },
      {
        id: "6",
        type: "prediction",
        title: "Dự báo nhu cầu catering cao điểm",
        description:
          "Phân tích pattern cho thấy nhu cầu đồ ăn nhẹ sẽ tăng 40% vào 15:30-16:00. Chuẩn bị thêm 200 suất để tránh thiếu hụt.",
        confidence: 82,
        impact: "medium",
        category: "catering",
        actionable: true,
      },
    ]

    const generatePredictions = () => [
      {
        metric: "Tổng số đăng ký",
        current: 1247,
        predicted: 1534,
        change: "+23%",
        confidence: 87,
      },
      {
        metric: "Tỷ lệ tham dự",
        current: 78,
        predicted: 82,
        change: "+5%",
        confidence: 91,
      },
      {
        metric: "Điểm hài lòng",
        current: 4.2,
        predicted: 4.5,
        change: "+7%",
        confidence: 85,
      },
      {
        metric: "Kết nối networking",
        current: 892,
        predicted: 1156,
        change: "+30%",
        confidence: 79,
      },
    ]

    setInsights(generateInsights())
    setPredictions(generatePredictions())
  }, [stats, timeRange])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "trend":
        return <TrendingUp className="h-4 w-4" />
      case "prediction":
        return <BarChart3 className="h-4 w-4" />
      case "recommendation":
        return <Lightbulb className="h-4 w-4" />
      case "alert":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const filteredInsights =
    selectedCategory === "all" ? insights : insights.filter((insight) => insight.category === selectedCategory)

  const categories = ["all", "engagement", "registration", "venue", "networking", "catering"]
  const categoryLabels: Record<string, string> = {
    all: "Tất cả",
    engagement: "Tương tác",
    registration: "Đăng ký",
    venue: "Địa điểm",
    networking: "Kết nối",
    catering: "Catering",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Thông tin chi tiết AI</h2>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Phân tích thông minh</TabsTrigger>
          <TabsTrigger value="predictions">Dự báo</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {categoryLabels[category]}
              </Button>
            ))}
          </div>

          <div className="grid gap-4">
            {filteredInsights.map((insight) => (
              <Card key={insight.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <CardTitle className="text-base">{insight.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getImpactColor(insight.impact)}>
                        {insight.impact === "high" ? "Cao" : insight.impact === "medium" ? "Trung bình" : "Thấp"}
                      </Badge>
                      <Badge variant="outline">{insight.confidence}% tin cậy</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Progress value={insight.confidence} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground">Độ tin cậy: {insight.confidence}%</span>
                    </div>
                    {insight.actionable && (
                      <Button size="sm" variant="outline">
                        <Target className="h-3 w-3 mr-1" />
                        Hành động
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{prediction.metric}</CardTitle>
                  <CardDescription>Dự báo cho 7 ngày tới</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-2xl font-bold">{prediction.predicted}</div>
                      <div className="text-sm text-muted-foreground">Hiện tại: {prediction.current}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">{prediction.change}</div>
                      <div className="text-xs text-muted-foreground">{prediction.confidence}% tin cậy</div>
                    </div>
                  </div>
                  <Progress value={prediction.confidence} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
