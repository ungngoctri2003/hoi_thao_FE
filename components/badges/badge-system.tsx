"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Trophy, Star, Target } from "lucide-react"
import BadgeCard from "./badge-card"
import CertificateGenerator from "./certificate-generator"
import AchievementTracker from "./achievement-tracker"

interface UserBadge {
  id: string
  name: string
  description: string
  icon: string
  category: "participation" | "engagement" | "networking" | "learning" | "special"
  rarity: "common" | "rare" | "epic" | "legendary"
  earnedAt?: Date
  progress?: number
  maxProgress?: number
  requirements: string[]
  points: number
}

interface UserStats {
  totalBadges: number
  totalPoints: number
  level: number
  nextLevelPoints: number
  currentLevelPoints: number
  rank: number
  totalUsers: number
}

export default function BadgeSystem() {
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showEarnedOnly, setShowEarnedOnly] = useState(false)

  useEffect(() => {
    // Simulate badge data
    const mockBadges: UserBadge[] = [
      {
        id: "early-bird",
        name: "Người đến sớm",
        description: "Đăng ký tham dự hội nghị trong 24 giờ đầu",
        icon: "🐦",
        category: "participation",
        rarity: "common",
        earnedAt: new Date(Date.now() - 86400000 * 5),
        requirements: ["Đăng ký trong 24 giờ đầu"],
        points: 50,
      },
      {
        id: "session-master",
        name: "Bậc thầy phiên họp",
        description: "Tham dự ít nhất 10 phiên họp",
        icon: "🎯",
        category: "participation",
        rarity: "rare",
        earnedAt: new Date(Date.now() - 86400000 * 2),
        requirements: ["Tham dự 10 phiên họp"],
        points: 150,
      },
      {
        id: "networking-pro",
        name: "Chuyên gia kết nối",
        description: "Kết nối với 25 người tham dự khác",
        icon: "🤝",
        category: "networking",
        rarity: "rare",
        progress: 18,
        maxProgress: 25,
        requirements: ["Kết nối với 25 người"],
        points: 200,
      },
      {
        id: "qa-champion",
        name: "Nhà vô địch Q&A",
        description: "Đặt 5 câu hỏi được upvote nhiều nhất",
        icon: "❓",
        category: "engagement",
        rarity: "epic",
        progress: 3,
        maxProgress: 5,
        requirements: ["5 câu hỏi top upvote"],
        points: 300,
      },
      {
        id: "poll-participant",
        name: "Người tham gia bình chọn",
        description: "Tham gia 15 cuộc bình chọn trực tiếp",
        icon: "📊",
        category: "engagement",
        rarity: "common",
        earnedAt: new Date(Date.now() - 86400000 * 1),
        requirements: ["Tham gia 15 cuộc bình chọn"],
        points: 75,
      },
      {
        id: "feedback-guru",
        name: "Guru phản hồi",
        description: "Đánh giá 20 phiên họp với nhận xét chi tiết",
        icon: "⭐",
        category: "engagement",
        rarity: "rare",
        progress: 12,
        maxProgress: 20,
        requirements: ["Đánh giá 20 phiên họp"],
        points: 180,
      },
      {
        id: "knowledge-seeker",
        name: "Người tìm kiếm tri thức",
        description: "Hoàn thành 5 workshop hands-on",
        icon: "📚",
        category: "learning",
        rarity: "epic",
        progress: 2,
        maxProgress: 5,
        requirements: ["Hoàn thành 5 workshop"],
        points: 250,
      },
      {
        id: "conference-legend",
        name: "Huyền thoại hội nghị",
        description: "Đạt tất cả huy hiệu khác và tham gia đầy đủ",
        icon: "👑",
        category: "special",
        rarity: "legendary",
        progress: 6,
        maxProgress: 10,
        requirements: ["Đạt tất cả huy hiệu khác", "Tham gia đầy đủ 3 ngày"],
        points: 1000,
      },
    ]

    setBadges(mockBadges)

    // Calculate user stats
    const earnedBadges = mockBadges.filter((b) => b.earnedAt)
    const totalPoints = earnedBadges.reduce((sum, badge) => sum + badge.points, 0)
    const level = Math.floor(totalPoints / 500) + 1
    const currentLevelPoints = totalPoints % 500
    const nextLevelPoints = 500

    setUserStats({
      totalBadges: earnedBadges.length,
      totalPoints,
      level,
      nextLevelPoints,
      currentLevelPoints,
      rank: 23,
      totalUsers: 1247,
    })
  }, [])

  const filteredBadges = badges.filter((badge) => {
    const categoryMatch = selectedCategory === "all" || badge.category === selectedCategory
    const earnedMatch = !showEarnedOnly || badge.earnedAt
    return categoryMatch && earnedMatch
  })

  const categories = [
    { value: "all", label: "Tất cả", icon: "🏆" },
    { value: "participation", label: "Tham gia", icon: "🎯" },
    { value: "engagement", label: "Tương tác", icon: "💬" },
    { value: "networking", label: "Kết nối", icon: "🤝" },
    { value: "learning", label: "Học tập", icon: "📚" },
    { value: "special", label: "Đặc biệt", icon: "⭐" },
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-600 dark:text-gray-400"
      case "rare":
        return "text-blue-600 dark:text-blue-400"
      case "epic":
        return "text-purple-600 dark:text-purple-400"
      case "legendary":
        return "text-yellow-600 dark:text-yellow-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 dark:bg-gray-800"
      case "rare":
        return "bg-blue-100 dark:bg-blue-900/20"
      case "epic":
        return "bg-purple-100 dark:bg-purple-900/20"
      case "legendary":
        return "bg-yellow-100 dark:bg-yellow-900/20"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  if (!userStats) {
    return <div>Đang tải...</div>
  }

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Huy hiệu đạt được</p>
                <p className="text-2xl font-bold">{userStats.totalBadges}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tổng điểm</p>
                <p className="text-2xl font-bold">{userStats.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cấp độ</p>
                <p className="text-2xl font-bold">{userStats.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Xếp hạng</p>
                <p className="text-2xl font-bold">
                  #{userStats.rank}/{userStats.totalUsers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Tiến độ cấp độ {userStats.level}</h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {userStats.currentLevelPoints}/{userStats.nextLevelPoints} điểm
            </span>
          </div>
          <Progress value={(userStats.currentLevelPoints / userStats.nextLevelPoints) * 100} className="h-3" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Còn {userStats.nextLevelPoints - userStats.currentLevelPoints} điểm để lên cấp {userStats.level + 1}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges">Huy hiệu</TabsTrigger>
          <TabsTrigger value="achievements">Thành tích</TabsTrigger>
          <TabsTrigger value="certificates">Chứng chỉ</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="flex items-center space-x-1"
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </Button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant={showEarnedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowEarnedOnly(!showEarnedOnly)}
              >
                Chỉ huy hiệu đã đạt
              </Button>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>

          {filteredBadges.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy huy hiệu</h3>
                <p className="text-gray-600 dark:text-gray-400">Thử thay đổi bộ lọc để xem thêm huy hiệu</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementTracker badges={badges} userStats={userStats} />
        </TabsContent>

        <TabsContent value="certificates">
          <CertificateGenerator badges={badges.filter((b) => b.earnedAt)} userStats={userStats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
