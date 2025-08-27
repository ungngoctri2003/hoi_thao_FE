"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Calendar, Award } from "lucide-react"

interface UserBadge {
  id: string
  name: string
  category: string
  rarity: string
  earnedAt?: Date
  progress?: number
  maxProgress?: number
  points: number
}

interface UserStats {
  totalBadges: number
  totalPoints: number
  level: number
}

interface AchievementTrackerProps {
  badges: UserBadge[]
  userStats: UserStats
}

export default function AchievementTracker({ badges, userStats }: AchievementTrackerProps) {
  const earnedBadges = badges.filter((b) => b.earnedAt)
  const inProgressBadges = badges.filter((b) => !b.earnedAt && b.progress !== undefined)
  const lockedBadges = badges.filter((b) => !b.earnedAt && b.progress === undefined)

  // Calculate category progress
  const categories = ["participation", "engagement", "networking", "learning", "special"]
  const categoryStats = categories.map((category) => {
    const categoryBadges = badges.filter((b) => b.category === category)
    const earnedInCategory = categoryBadges.filter((b) => b.earnedAt).length
    const totalInCategory = categoryBadges.length

    return {
      name: category,
      displayName:
        category === "participation"
          ? "Tham gia"
          : category === "engagement"
            ? "Tương tác"
            : category === "networking"
              ? "Kết nối"
              : category === "learning"
                ? "Học tập"
                : "Đặc biệt",
      earned: earnedInCategory,
      total: totalInCategory,
      percentage: totalInCategory > 0 ? (earnedInCategory / totalInCategory) * 100 : 0,
    }
  })

  // Recent achievements
  const recentAchievements = earnedBadges
    .sort((a, b) => (b.earnedAt?.getTime() || 0) - (a.earnedAt?.getTime() || 0))
    .slice(0, 5)

  // Upcoming milestones
  const upcomingMilestones = [
    {
      title: "Cấp độ tiếp theo",
      description: `Đạt cấp ${userStats.level + 1}`,
      progress: ((userStats.totalPoints % 500) / 500) * 100,
      target: "500 điểm",
      current: userStats.totalPoints % 500,
    },
    {
      title: "Bộ sưu tập huy hiệu",
      description: "Đạt 15 huy hiệu",
      progress: (userStats.totalBadges / 15) * 100,
      target: "15 huy hiệu",
      current: userStats.totalBadges,
    },
    {
      title: "Chuyên gia kết nối",
      description: "Hoàn thành tất cả huy hiệu networking",
      progress: categoryStats.find((c) => c.name === "networking")?.percentage || 0,
      target: "100%",
      current: categoryStats.find((c) => c.name === "networking")?.earned || 0,
    },
  ]

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đã đạt được</p>
                <p className="text-2xl font-bold">{earnedBadges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Đang tiến hành</p>
                <p className="text-2xl font-bold">{inProgressBadges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chưa mở khóa</p>
                <p className="text-2xl font-bold">{lockedBadges.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tiến độ theo danh mục</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categoryStats.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{category.displayName}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {category.earned}/{category.total}
                </span>
              </div>
              <Progress value={category.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Thành tích gần đây
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAchievements.length > 0 ? (
            recentAchievements.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <div className="text-2xl">
                  {badge.id === "early-bird"
                    ? "🐦"
                    : badge.id === "session-master"
                      ? "🎯"
                      : badge.id === "poll-participant"
                        ? "📊"
                        : "🏆"}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{badge.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Đạt được vào {badge.earnedAt ? formatDate(badge.earnedAt) : ""}
                  </p>
                </div>
                <Badge variant="secondary">+{badge.points} điểm</Badge>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">Chưa có thành tích nào</p>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Mục tiêu sắp tới
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingMilestones.map((milestone, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{milestone.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>
                </div>
                <span className="text-sm font-medium">
                  {milestone.current}/{milestone.target}
                </span>
              </div>
              <Progress value={Math.min(milestone.progress, 100)} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* In Progress Badges */}
      {inProgressBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Huy hiệu đang tiến hành</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inProgressBadges.map((badge) => (
              <div key={badge.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="text-2xl">
                  {badge.id === "networking-pro"
                    ? "🤝"
                    : badge.id === "qa-champion"
                      ? "❓"
                      : badge.id === "feedback-guru"
                        ? "⭐"
                        : badge.id === "knowledge-seeker"
                          ? "📚"
                          : badge.id === "conference-legend"
                            ? "👑"
                            : "🏆"}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{badge.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress value={((badge.progress || 0) / (badge.maxProgress || 1)) * 100} className="flex-1 h-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {badge.progress}/{badge.maxProgress}
                    </span>
                  </div>
                </div>
                <Badge variant="outline">+{badge.points} điểm</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
