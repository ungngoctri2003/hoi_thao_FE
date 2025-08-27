"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Heart, X, Star, Zap, Users, Target } from "lucide-react"

interface MatchSuggestion {
  id: string
  name: string
  title: string
  company: string
  avatar: string
  matchScore: number
  commonInterests: string[]
  mutualConnections: number
  reason: string
  isOnline: boolean
}

export default function MatchingSystem() {
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dailyMatches, setDailyMatches] = useState(0)
  const [totalConnections, setTotalConnections] = useState(0)

  useEffect(() => {
    // Simulate AI-powered matching suggestions
    const mockSuggestions: MatchSuggestion[] = [
      {
        id: "1",
        name: "Phạm Thị Dung",
        title: "AI Research Engineer",
        company: "VinAI Research",
        avatar: "/placeholder-cypf8.png",
        matchScore: 96,
        commonInterests: ["Machine Learning", "Computer Vision", "Deep Learning"],
        mutualConnections: 5,
        reason: "Cùng chuyên môn về AI và có 5 bạn chung",
        isOnline: true,
      },
      {
        id: "2",
        name: "Hoàng Minh Tuấn",
        title: "Blockchain Developer",
        company: "Crypto Solutions",
        avatar: "/blockchain-developer.png",
        matchScore: 89,
        commonInterests: ["Blockchain", "Smart Contracts", "DeFi"],
        mutualConnections: 3,
        reason: "Quan tâm đến công nghệ blockchain và fintech",
        isOnline: false,
      },
      {
        id: "3",
        name: "Lý Thị Mai",
        title: "UX Designer",
        company: "Design Studio",
        avatar: "/ux-designer-woman.png",
        matchScore: 85,
        commonInterests: ["User Experience", "Design Systems", "Prototyping"],
        mutualConnections: 7,
        reason: "Cùng quan tâm đến thiết kế trải nghiệm người dùng",
        isOnline: true,
      },
    ]
    setSuggestions(mockSuggestions)
    setDailyMatches(12)
    setTotalConnections(47)
  }, [])

  const handleLike = () => {
    // Simulate liking a suggestion
    if (currentIndex < suggestions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setDailyMatches((prev) => prev + 1)
    }
  }

  const handlePass = () => {
    // Simulate passing on a suggestion
    if (currentIndex < suggestions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const currentSuggestion = suggestions[currentIndex]

  if (!currentSuggestion) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Hết gợi ý kết nối</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Bạn đã xem hết tất cả gợi ý kết nối cho hôm nay. Hãy quay lại vào ngày mai!
          </p>
          <Button>Khám phá thêm người tham dự</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gợi ý hôm nay</p>
                <p className="text-2xl font-bold">{dailyMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng kết nối</p>
                <p className="text-2xl font-bold">{totalConnections}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Điểm phù hợp TB</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matching Card */}
      <div className="max-w-md mx-auto">
        <Card className="overflow-hidden">
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Avatar className="h-32 w-32 border-4 border-white">
                <AvatarImage src={currentSuggestion.avatar || "/placeholder.svg"} alt={currentSuggestion.name} />
                <AvatarFallback className="text-2xl">{currentSuggestion.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>

            {currentSuggestion.isOnline && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                Đang hoạt động
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg">{currentSuggestion.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold">{currentSuggestion.matchScore}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{currentSuggestion.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{currentSuggestion.company}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-4 space-y-4">
            {/* Match Score */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Độ phù hợp</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{currentSuggestion.matchScore}%</span>
              </div>
              <Progress value={currentSuggestion.matchScore} className="h-2" />
            </div>

            {/* Reason */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <strong>Lý do gợi ý:</strong> {currentSuggestion.reason}
              </p>
            </div>

            {/* Common Interests */}
            <div>
              <p className="text-sm font-medium mb-2">Sở thích chung</p>
              <div className="flex flex-wrap gap-1">
                {currentSuggestion.commonInterests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Mutual Connections */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span>{currentSuggestion.mutualConnections} bạn chung</span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <Button variant="outline" size="lg" className="flex-1 bg-transparent" onClick={handlePass}>
                <X className="h-5 w-5 mr-2" />
                Bỏ qua
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                onClick={handleLike}
              >
                <Heart className="h-5 w-5 mr-2" />
                Kết nối
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentIndex + 1} / {suggestions.length} gợi ý
          </p>
        </div>
      </div>
    </div>
  )
}
