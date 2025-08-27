"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Star, ThumbsUp, MessageSquare, BarChart3, Send } from "lucide-react"

interface FeedbackData {
  averageRating: number
  totalRatings: number
  ratingDistribution: { [key: number]: number }
  comments: Array<{
    id: string
    author: string
    rating: number
    comment: string
    timestamp: Date
    helpful: number
  }>
}

interface SessionFeedbackProps {
  sessionId: string
}

export default function SessionFeedback({ sessionId }: SessionFeedbackProps) {
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null)
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState("")
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  useEffect(() => {
    // Simulate feedback data
    const mockFeedback: FeedbackData = {
      averageRating: 4.3,
      totalRatings: 156,
      ratingDistribution: {
        5: 78,
        4: 45,
        3: 23,
        2: 7,
        1: 3,
      },
      comments: [
        {
          id: "1",
          author: "Nguyễn Văn An",
          rating: 5,
          comment: "Presentation rất hay và dễ hiểu. Diễn giả trình bày rất tốt!",
          timestamp: new Date(Date.now() - 300000),
          helpful: 12,
        },
        {
          id: "2",
          author: "Trần Thị Bình",
          rating: 4,
          comment: "Nội dung chất lượng, nhưng có thể cần thêm ví dụ thực tế.",
          timestamp: new Date(Date.now() - 240000),
          helpful: 8,
        },
        {
          id: "3",
          author: "Lê Minh Cường",
          rating: 5,
          comment: "Rất hữu ích cho công việc của tôi. Cảm ơn diễn giả!",
          timestamp: new Date(Date.now() - 180000),
          helpful: 15,
        },
      ],
    }

    setFeedbackData(mockFeedback)
  }, [sessionId])

  const handleSubmitFeedback = () => {
    if (userRating === 0) return

    const newComment = {
      id: Date.now().toString(),
      author: "Bạn",
      rating: userRating,
      comment: userComment,
      timestamp: new Date(),
      helpful: 0,
    }

    setFeedbackData((prev) => {
      if (!prev) return null

      return {
        ...prev,
        totalRatings: prev.totalRatings + 1,
        averageRating: (prev.averageRating * prev.totalRatings + userRating) / (prev.totalRatings + 1),
        ratingDistribution: {
          ...prev.ratingDistribution,
          [userRating]: (prev.ratingDistribution[userRating] || 0) + 1,
        },
        comments: [newComment, ...prev.comments],
      }
    })

    setHasSubmitted(true)
    setUserRating(0)
    setUserComment("")
  }

  const renderStars = (rating: number, interactive = false, size = "h-5 w-5") => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} cursor-pointer transition-colors ${
              star <= (interactive ? hoveredStar || userRating : rating)
                ? "text-yellow-500 fill-current"
                : "text-gray-300 dark:text-gray-600"
            }`}
            onClick={interactive ? () => setUserRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
          />
        ))}
      </div>
    )
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Vừa xong"
    if (minutes < 60) return `${minutes} phút trước`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} giờ trước`
    return date.toLocaleDateString("vi-VN")
  }

  if (!feedbackData) {
    return <div>Đang tải...</div>
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Đánh giá tổng quan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">{feedbackData.averageRating.toFixed(1)}</div>
                <div className="flex items-center justify-center mt-1">{renderStars(feedbackData.averageRating)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {feedbackData.totalRatings} đánh giá
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-md space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = feedbackData.ratingDistribution[rating] || 0
                const percentage = feedbackData.totalRatings > 0 ? (count / feedbackData.totalRatings) * 100 : 0

                return (
                  <div key={rating} className="flex items-center space-x-2 text-sm">
                    <span className="w-8">{rating}★</span>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="w-8 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Feedback */}
      {!hasSubmitted && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Đánh giá phiên họp này</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Đánh giá của bạn</label>
              <div className="flex items-center space-x-2">
                {renderStars(userRating, true, "h-8 w-8")}
                {userRating > 0 && (
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    {userRating === 1
                      ? "Rất tệ"
                      : userRating === 2
                        ? "Tệ"
                        : userRating === 3
                          ? "Bình thường"
                          : userRating === 4
                            ? "Tốt"
                            : "Rất tốt"}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nhận xét (tùy chọn)</label>
              <Textarea
                placeholder="Chia sẻ ý kiến của bạn về phiên họp..."
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleSubmitFeedback} disabled={userRating === 0}>
              <Send className="h-4 w-4 mr-2" />
              Gửi đánh giá
            </Button>
          </CardContent>
        </Card>
      )}

      {hasSubmitted && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
              <ThumbsUp className="h-5 w-5" />
              <span className="font-medium">Cảm ơn bạn đã đánh giá!</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Phản hồi của bạn giúp chúng tôi cải thiện chất lượng các phiên họp.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Nhận xét từ người tham dự
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedbackData.comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{comment.author}</span>
                  {renderStars(comment.rating, false, "h-4 w-4")}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(comment.timestamp)}</span>
              </div>

              {comment.comment && <p className="text-gray-700 dark:text-gray-300 mb-2">{comment.comment}</p>}

              <div className="flex items-center space-x-4">
                <Button size="sm" variant="ghost" className="text-xs">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Hữu ích ({comment.helpful})
                </Button>
              </div>
            </div>
          ))}

          {feedbackData.comments.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">Chưa có nhận xét nào</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
