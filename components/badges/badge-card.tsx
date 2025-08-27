"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Lock, CheckCircle, Clock } from "lucide-react"

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

interface BadgeCardProps {
  badge: UserBadge
}

export default function BadgeCard({ badge }: BadgeCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-300 dark:border-gray-600"
      case "rare":
        return "border-blue-400 dark:border-blue-500"
      case "epic":
        return "border-purple-400 dark:border-purple-500"
      case "legendary":
        return "border-yellow-400 dark:border-yellow-500"
      default:
        return "border-gray-300 dark:border-gray-600"
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-50 dark:bg-gray-800/50"
      case "rare":
        return "bg-blue-50 dark:bg-blue-900/20"
      case "epic":
        return "bg-purple-50 dark:bg-purple-900/20"
      case "legendary":
        return "bg-yellow-50 dark:bg-yellow-900/20"
      default:
        return "bg-gray-50 dark:bg-gray-800/50"
    }
  }

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "Phổ thông"
      case "rare":
        return "Hiếm"
      case "epic":
        return "Sử thi"
      case "legendary":
        return "Huyền thoại"
      default:
        return rarity
    }
  }

  const isEarned = !!badge.earnedAt
  const isInProgress = !isEarned && badge.progress !== undefined && badge.maxProgress !== undefined
  const progressPercentage = isInProgress ? (badge.progress! / badge.maxProgress!) * 100 : 0

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${getRarityColor(badge.rarity)} ${
        isEarned ? "border-2" : "border opacity-60"
      }`}
    >
      <div className={`absolute inset-0 ${getRarityBg(badge.rarity)} opacity-20`}></div>

      <CardContent className="relative p-4 space-y-3">
        {/* Badge Icon and Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`text-4xl p-2 rounded-full ${
                isEarned ? "bg-white dark:bg-gray-800 shadow-md" : "bg-gray-200 dark:bg-gray-700 grayscale"
              }`}
            >
              {badge.icon}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${isEarned ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                {badge.name}
              </h3>
              <Badge variant="outline" className="text-xs mt-1">
                {getRarityText(badge.rarity)}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-1">
            {isEarned ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : isInProgress ? (
              <Clock className="h-5 w-5 text-blue-500" />
            ) : (
              <Lock className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{badge.points} điểm</span>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm ${isEarned ? "text-gray-700 dark:text-gray-300" : "text-gray-500"}`}>
          {badge.description}
        </p>

        {/* Progress Bar (for in-progress badges) */}
        {isInProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Tiến độ</span>
              <span>
                {badge.progress}/{badge.maxProgress}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Requirements */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400">Yêu cầu:</h4>
          <ul className="space-y-1">
            {badge.requirements.map((req, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full ${isEarned ? "bg-green-500" : "bg-gray-400"}`}></div>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Earned Date */}
        {isEarned && badge.earnedAt && (
          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
            <p className="text-xs text-green-700 dark:text-green-300">Đạt được vào {formatDate(badge.earnedAt)}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {isEarned ? (
            <Button size="sm" variant="outline" className="w-full bg-transparent">
              Xem chi tiết
            </Button>
          ) : isInProgress ? (
            <Button size="sm" variant="default" className="w-full">
              Tiếp tục ({Math.round(progressPercentage)}%)
            </Button>
          ) : (
            <Button size="sm" variant="ghost" className="w-full" disabled>
              Chưa mở khóa
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
